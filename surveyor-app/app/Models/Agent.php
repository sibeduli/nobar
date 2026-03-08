<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Agent extends Authenticatable
{
    protected $fillable = [
        'company_id',
        'name',
        'phone',
        'email',
        'password',
        'nik',
        'address',
        'areas',
        'qr_code',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'areas' => 'array',
        'last_login_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function surveys(): HasMany
    {
        return $this->hasMany(Survey::class);
    }

    /**
     * Generate a unique QR code for the agent
     */
    public static function generateQrCode(Company $company, string $name): string
    {
        $timestamp = now()->format('Y');
        $random = strtoupper(substr(md5(uniqid()), 0, 4));
        $nameSlug = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 8));
        
        return "AGENT-{$company->code}-{$timestamp}-{$random}-{$nameSlug}";
    }
}
