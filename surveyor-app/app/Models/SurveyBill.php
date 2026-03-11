<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyBill extends Model
{
    const MARKUP = 10000000;
    const COMMISSION_RATE = 0.10;

    protected $fillable = [
        'survey_id',
        'company_id',
        'bill_number',
        'base_price',
        'markup',
        'amount',
        'ppn',
        'nett',
        'pic_commission',
        'status',
        'sent_at',
        'due_date',
        'paid_at',
        'merchant_name',
        'merchant_address',
        'merchant_phone',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'markup' => 'decimal:2',
        'amount' => 'decimal:2',
        'ppn' => 'decimal:2',
        'nett' => 'decimal:2',
        'pic_commission' => 'decimal:2',
        'sent_at' => 'datetime',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Pic::class, 'created_by');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    public function getFormattedCommissionAttribute(): string
    {
        return 'Rp ' . number_format($this->pic_commission, 0, ',', '.');
    }

    public static function generateBillNumber(): string
    {
        $year = date('Y');
        $lastBill = self::whereYear('created_at', $year)->orderBy('id', 'desc')->first();
        $sequence = $lastBill ? (int) substr($lastBill->bill_number, -4) + 1 : 1;
        return sprintf('INV-%s-%04d', $year, $sequence);
    }

    public static function createFromSurvey(Survey $survey, Pic $pic): self
    {
        $capacityCategory = $survey->getEffectiveCapacityCategory();
        $basePrice = $capacityCategory?->price ?? 0;
        $amount = $basePrice + self::MARKUP;
        $ppn = $amount / 1.11 * 0.11; // PPN 11%
        $nett = $amount - $ppn;
        $commission = $nett * self::COMMISSION_RATE;

        $bill = self::create([
            'survey_id' => $survey->id,
            'company_id' => $pic->company_id,
            'bill_number' => self::generateBillNumber(),
            'base_price' => $basePrice,
            'markup' => self::MARKUP,
            'amount' => $amount,
            'ppn' => $ppn,
            'nett' => $nett,
            'pic_commission' => $commission,
            'status' => 'sent',
            'sent_at' => now(),
            'due_date' => now()->addDays(14),
            'merchant_name' => $survey->venue_name,
            'merchant_address' => $survey->venue_address,
            'merchant_phone' => $survey->getEffectivePhone(),
            'created_by' => $pic->id,
        ]);

        $survey->update(['is_locked' => true]);

        return $bill;
    }

}
