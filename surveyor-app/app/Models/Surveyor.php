<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Surveyor extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'hash_id',
        'phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Surveyor $surveyor) {
            $surveyor->hash_id = bin2hex(random_bytes(16));
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reports()
    {
        return $this->hasMany(SurveyReport::class);
    }
}
