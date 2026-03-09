<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $pic = Auth::guard('pic')->user();
        $currentSessionId = $request->session()->getId();

        // Get all sessions for this PIC
        $sessions = DB::table('sessions')
            ->where('pic_id', $pic->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($session) use ($currentSessionId) {
                $agent = new Agent();
                $agent->setUserAgent($session->user_agent);
                
                $device = $agent->browser() . ' on ' . $agent->platform();
                if ($agent->isMobile()) {
                    $device = $agent->device() . ' (' . $agent->browser() . ')';
                }

                return [
                    'id' => $session->id,
                    'device' => $device ?: 'Unknown Device',
                    'ip' => $session->ip_address,
                    'lastActive' => date('Y-m-d\TH:i:s', $session->last_activity),
                    'current' => $session->id === $currentSessionId,
                ];
            });

        return Inertia::render('Settings/Index', [
            'user' => [
                'id' => $pic->id,
                'name' => $pic->name,
                'email' => $pic->email,
                'phone' => $pic->phone,
                'createdAt' => $pic->created_at?->format('Y-m-d'),
            ],
            'sessions' => $sessions,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $pic = Auth::guard('pic')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $pic->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
        ]);

        return back()->with('success', 'Profil berhasil disimpan');
    }

    public function updatePassword(Request $request)
    {
        $pic = Auth::guard('pic')->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi',
            'password.required' => 'Password baru wajib diisi',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'password.min' => 'Password minimal 8 karakter',
        ]);

        if (!Hash::check($validated['current_password'], $pic->password)) {
            return back()->withErrors(['current_password' => 'Password saat ini tidak valid']);
        }

        $pic->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password berhasil diubah');
    }

    public function revokeSession(Request $request, string $sessionId)
    {
        $pic = Auth::guard('pic')->user();
        $currentSessionId = $request->session()->getId();

        // Prevent revoking current session
        if ($sessionId === $currentSessionId) {
            return back()->withErrors(['session' => 'Tidak dapat menghapus sesi saat ini']);
        }

        // Delete the session
        DB::table('sessions')
            ->where('id', $sessionId)
            ->where('pic_id', $pic->id)
            ->delete();

        return back()->with('success', 'Sesi berhasil dihapus');
    }

    public function revokeAllSessions(Request $request)
    {
        $pic = Auth::guard('pic')->user();
        $currentSessionId = $request->session()->getId();

        // Delete all sessions except current
        DB::table('sessions')
            ->where('pic_id', $pic->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return back()->with('success', 'Semua sesi lain berhasil dihapus');
    }
}
