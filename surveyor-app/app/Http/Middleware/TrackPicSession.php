<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TrackPicSession
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $sessionId = $request->session()->getId();
        if (!$sessionId) return;

        // Track PIC session
        $pic = Auth::guard('pic')->user();
        if ($pic) {
            DB::table('sessions')
                ->where('id', $sessionId)
                ->whereNull('pic_id')
                ->update(['pic_id' => $pic->id]);
        }

        // Track Agent session
        $agent = Auth::guard('agent')->user();
        if ($agent) {
            DB::table('sessions')
                ->where('id', $sessionId)
                ->whereNull('agent_id')
                ->update(['agent_id' => $agent->id]);
        }
    }
}
