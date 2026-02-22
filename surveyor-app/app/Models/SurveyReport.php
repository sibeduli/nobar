<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SurveyReport extends Model
{
    protected $fillable = [
        'surveyor_id',
        'license_id',
        'status',
        'notes',
        'photos',
        'latitude',
        'longitude',
        'inspected_at',
    ];

    protected $casts = [
        'photos' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'inspected_at' => 'datetime',
    ];

    public function surveyor()
    {
        return $this->belongsTo(Surveyor::class);
    }
}
