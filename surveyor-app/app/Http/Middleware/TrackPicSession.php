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
        $pic = Auth::guard('pic')->user();
        
        if ($pic && $request->session()->getId()) {
            DB::table('sessions')
                ->where('id', $request->session()->getId())
                ->whereNull('pic_id')
                ->update(['pic_id' => $pic->id]);
        }
    }
}
