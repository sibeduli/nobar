<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'name',
        'legal_name',
        'code',
        'npwp',
        'business_type',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'email',
        'website',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class);
    }

    public function pics(): HasMany
    {
        return $this->hasMany(Pic::class);
    }
}
