<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Read-only model for Merchant table from merchant app
 * Do NOT create migrations for this - it's managed by the merchant app
 */
class Merchant extends Model
{
    protected $table = 'Merchant'; // Prisma uses PascalCase table names
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'capacity' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    public function license(): HasOne
    {
        return $this->hasOne(License::class, 'venueId', 'id');
    }
}
