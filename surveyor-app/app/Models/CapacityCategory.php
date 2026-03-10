<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CapacityCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'label',
        'min_capacity',
        'max_capacity',
        'price',
        'sort_order',
    ];

    protected $casts = [
        'min_capacity' => 'integer',
        'max_capacity' => 'integer',
        'price' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function surveys()
    {
        return $this->hasMany(Survey::class);
    }

    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public function getDisplayLabelAttribute()
    {
        return "{$this->code} ({$this->label}) - {$this->formatted_price}";
    }

    public static function findByCapacity($capacity)
    {
        return self::where('min_capacity', '<=', $capacity)
            ->where(function ($q) use ($capacity) {
                $q->where('max_capacity', '>=', $capacity)
                  ->orWhereNull('max_capacity');
            })
            ->orderBy('sort_order')
            ->first();
    }
}
