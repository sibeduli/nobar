<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\AgentActivityLog;
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

        // Log login activity
        AgentActivityLog::create([
            'agent_id' => $agent->id,
            'type' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $request->session()->regenerate();

        return redirect()->intended('/agent');
    }

    /**
     * Handle agent logout
     */
    public function logout(Request $request)
    {
        $agent = Auth::guard('agent')->user();

        // Log logout activity
        if ($agent) {
            AgentActivityLog::create([
                'agent_id' => $agent->id,
                'type' => 'logout',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        Auth::guard('agent')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('agent.login');
    }

    /**
     * Show agent profile
     */
    public function profile()
    {
        $agent = Auth::guard('agent')->user();
        $company = $agent->company;

        // Count surveys (placeholder - will be implemented when Survey model exists)
        $totalSurveys = 0;
        $approvedSurveys = 0;
        
        // Check if surveys relationship exists
        if (method_exists($agent, 'surveys')) {
            $totalSurveys = $agent->surveys()->count();
            $approvedSurveys = $agent->surveys()->where('status', 'approved')->count();
        }

        return Inertia::render('Agent/Profile', [
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'nik' => $agent->nik,
                'address' => $agent->address,
                'areas' => $agent->areas ?? [],
                'qr_code' => $agent->qr_code,
                'status' => $agent->status,
                'join_date' => $agent->created_at->format('Y-m-d'),
                'total_surveys' => $totalSurveys,
                'approved_surveys' => $approvedSurveys,
            ],
            'company' => [
                'name' => $company->name ?? 'Unknown',
                'code' => $company->code ?? '',
            ],
        ]);
    }
}
