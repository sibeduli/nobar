<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Read-only model for License table from merchant app
 * Do NOT create migrations for this - it's managed by the merchant app
 */
class License extends Model
{
    protected $table = 'License'; // Prisma uses PascalCase table names
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'tier' => 'integer',
        'price' => 'integer',
        'frozen' => 'boolean',
        'frozenAt' => 'datetime',
        'paidAt' => 'datetime',
        'transactionTime' => 'datetime',
        'createdAt' => 'datetime',
    ];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class, 'venueId', 'id');
    }

    /**
     * Check if license is valid (not frozen)
     */
    public function isValid(): bool
    {
        return !$this->frozen;
    }
}
