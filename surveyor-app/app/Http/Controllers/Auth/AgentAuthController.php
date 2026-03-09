<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AgentAuthController extends Controller
{
    /**
     * Show agent login page
     */
    public function showLogin()
    {
        return Inertia::render('Agent/Login');
    }

    /**
     * Handle agent login
     */
    public function login(Request $request)
    {
        // Block if PIC is already logged in on this session (same browser)
        if (Auth::guard('pic')->check()) {
            throw ValidationException::withMessages([
                'phone' => 'Anda sudah login sebagai PIC di browser ini. Gunakan browser/perangkat lain untuk login sebagai agen.',
            ]);
        }

        $validated = $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ], [
            'phone.required' => 'Nomor telepon wajib diisi',
            'password.required' => 'Password wajib diisi',
        ]);

        // Find agent by phone
        $agent = Agent::where('phone', $validated['phone'])->first();

        if (!$agent || !Hash::check($validated['password'], $agent->password)) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor telepon atau password salah',
            ]);
        }

        // Check if agent is active
        if ($agent->status !== 'active') {
            throw ValidationException::withMessages([
                'phone' => 'Akun Anda tidak aktif. Hubungi PIC perusahaan.',
            ]);
        }

        // Login the agent
        Auth::guard('agent')->login($agent);

        // Update last login
        $agent->update(['last_login_at' => now()]);

        $request->session()->regenerate();

        return redirect()->intended('/agent');
    }

    /**
     * Handle agent logout
     */
    public function logout(Request $request)
    {
        Auth::guard('agent')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('agent.login');
    }
}
