<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Survey extends Model
{
    protected $fillable = [
        'agent_id',
        'merchant_id',
        'license_id',
        'category',
        'report_type',
        'venue_name',
        'venue_address',
        'venue_contact',
        'venue_phone',
        'actual_visitors',
        'actual_visitors_category_id',
        'capacity_limit',
        'capacity_category_id',
        'description',
        'photos',
        'latitude',
        'longitude',
        'status',
        'admin_notes',
        'reviewed_at',
        'reviewed_by',
        // PIC edits
        'pic_venue_contact',
        'pic_venue_phone',
        'pic_category',
        'pic_capacity_limit',
        'pic_capacity_category_id',
        'pic_description',
        'pic_edited_by',
        'pic_edited_at',
        'is_locked',
    ];

    protected $casts = [
        'photos' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'reviewed_at' => 'datetime',
        'pic_edited_at' => 'datetime',
        'is_locked' => 'boolean',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function picEditor(): BelongsTo
    {
        return $this->belongsTo(Pic::class, 'pic_edited_by');
    }

    public function capacityCategory(): BelongsTo
    {
        return $this->belongsTo(CapacityCategory::class);
    }

    public function picCapacityCategory(): BelongsTo
    {
        return $this->belongsTo(CapacityCategory::class, 'pic_capacity_category_id');
    }

    public function actualVisitorsCategory(): BelongsTo
    {
        return $this->belongsTo(CapacityCategory::class, 'actual_visitors_category_id');
    }

    public function bill(): HasOne
    {
        return $this->hasOne(SurveyBill::class);
    }

    public function hasBill(): bool
    {
        return $this->bill()->exists();
    }

    public function canBeBilled(): bool
    {
        return $this->status === 'approved' 
            && $this->report_type === 'violation_capacity'
            && !$this->hasBill();
    }

    /**
     * Check if PIC has edited this survey
     */
    public function hasPicEdits(): bool
    {
        return $this->pic_edited_at !== null;
    }

    /**
     * Get effective value (PIC version if exists, otherwise agent version)
     */
    public function getEffectiveContact(): ?string
    {
        return $this->pic_venue_contact ?? $this->venue_contact;
    }

    public function getEffectivePhone(): ?string
    {
        return $this->pic_venue_phone ?? $this->venue_phone;
    }

    public function getEffectiveCategory(): ?string
    {
        return $this->pic_category ?? $this->category;
    }

    public function getEffectiveCapacity(): ?int
    {
        return $this->pic_capacity_limit ?? $this->capacity_limit;
    }

    public function getEffectiveCapacityCategory(): ?CapacityCategory
    {
        if ($this->pic_capacity_category_id) {
            return $this->picCapacityCategory;
        }
        return $this->capacityCategory;
    }

    public function getEffectiveCapacityCategoryId(): ?int
    {
        return $this->pic_capacity_category_id ?? $this->capacity_category_id;
    }

    public function getEffectiveDescription(): ?string
    {
        return $this->pic_description ?? $this->description;
    }

    /**
     * Check if this is a violation report
     */
    public function isViolation(): bool
    {
        return str_starts_with($this->report_type, 'violation_');
    }

    /**
     * Check if this is a non-commercial report
     */
    public function isNonCommercial(): bool
    {
        return $this->category === 'non_commercial';
    }
}
