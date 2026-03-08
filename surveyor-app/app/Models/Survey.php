<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'capacity_limit',
        'description',
        'photos',
        'latitude',
        'longitude',
        'status',
        'admin_notes',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'photos' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'reviewed_at' => 'datetime',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
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
