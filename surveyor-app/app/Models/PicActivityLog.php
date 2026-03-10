<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PicActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'pic_id',
        'type',
        'description',
        'target_type',
        'target_id',
        'ip_address',
        'user_agent',
    ];

    public function pic()
    {
        return $this->belongsTo(Pic::class);
    }

    public static function log($picId, $type, $description = null, $targetType = null, $targetId = null)
    {
        return self::create([
            'pic_id' => $picId,
            'type' => $type,
            'description' => $description,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
