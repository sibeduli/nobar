<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Pic extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'company_id',
        'name',
        'email',
        'phone',
        'password',
        'status',
        'email_verified_at',
        'approved_at',
        'approved_by',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'approved_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Check if PIC is approved and active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if PIC is pending approval
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
