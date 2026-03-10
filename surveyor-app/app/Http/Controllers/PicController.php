<?php

namespace App\Http\Controllers;

use App\Models\PicActivityLog;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PicController extends Controller
{
    public function activities()
    {
        $pic = Auth::guard('pic')->user();

        $activities = PicActivityLog::where('pic_id', $pic->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'activityType' => $log->type,
                    'description' => $log->description,
                    'targetType' => $log->target_type,
                    'targetId' => $log->target_id,
                    'ipAddress' => $log->ip_address ?? '-',
                    'userAgent' => $log->user_agent ?? '-',
                    'timestamp' => $log->created_at->toISOString(),
                ];
            });

        $stats = [
            'total' => $activities->count(),
            'logins' => $activities->where('activityType', 'login')->count(),
            'logouts' => $activities->where('activityType', 'logout')->count(),
            'approvals' => $activities->where('activityType', 'approve_survey')->count(),
            'rejections' => $activities->where('activityType', 'reject_survey')->count(),
            'edits' => $activities->whereIn('activityType', ['edit_survey', 'edit_agent'])->count(),
        ];

        return Inertia::render('PIC/Activities', [
            'activities' => $activities->values(),
            'stats' => $stats,
        ]);
    }
}
