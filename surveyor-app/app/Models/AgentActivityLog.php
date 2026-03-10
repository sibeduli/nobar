<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'type',
        'ip_address',
        'user_agent',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
