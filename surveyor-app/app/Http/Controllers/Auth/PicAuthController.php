<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Pic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PicAuthController extends Controller
{
    // MOCK: Registration key - will be managed by admin in production
    const REGISTRATION_KEY = '123';

    /**
     * Show login page
     */
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Show register page
     */
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle PIC registration
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'kodeAkses' => 'required|string',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:pics,email',
            'phone' => 'required|string|max:20',
            'companyName' => 'required|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'kodeAkses.required' => 'Kode akses wajib diisi',
            'name.required' => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah terdaftar',
            'phone.required' => 'Nomor telepon wajib diisi',
            'companyName.required' => 'Nama perusahaan wajib diisi',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
        ]);

        // Validate registration key
        if ($validated['kodeAkses'] !== self::REGISTRATION_KEY) {
            throw ValidationException::withMessages([
                'kodeAkses' => 'Kode akses tidak valid',
            ]);
        }

        // Create or find company
        $companyCode = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', substr($validated['companyName'], 0, 10)));
        $company = Company::firstOrCreate(
            ['code' => $companyCode],
            [
                'name' => $validated['companyName'],
                'is_active' => true,
            ]
        );

        // Create PIC
        $pic = Pic::create([
            'company_id' => $company->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'status' => 'pending', // Requires admin approval
        ]);

        // Store email in session for pending approval page
        $request->session()->put('pending_pic_email', $validated['email']);

        // Redirect to pending approval page
        return redirect()->route('pic.pending-approval');
    }

    /**
     * Handle PIC login
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ], [
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'password.required' => 'Password wajib diisi',
        ]);

        $pic = Pic::where('email', $validated['email'])->first();

        if (!$pic || !Hash::check($validated['password'], $pic->password)) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah',
            ]);
        }

        // Check if account is pending
        if ($pic->isPending()) {
            $request->session()->put('pending_pic_email', $pic->email);
            return redirect()->route('pic.pending-approval');
        }

        // Check if account is inactive
        if (!$pic->isActive()) {
            throw ValidationException::withMessages([
                'email' => 'Akun Anda tidak aktif. Hubungi admin.',
            ]);
        }

        // Login the PIC
        Auth::guard('pic')->login($pic, $validated['remember'] ?? false);

        // Update last login
        $pic->update(['last_login_at' => now()]);

        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    /**
     * Handle PIC logout
     */
    public function logout(Request $request)
    {
        Auth::guard('pic')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('pic.login');
    }

    /**
     * Show pending approval page
     */
    public function pendingApproval(Request $request)
    {
        // Check if there's a pending PIC in session
        $picEmail = $request->session()->get('pending_pic_email');
        
        if ($picEmail) {
            $pic = Pic::where('email', $picEmail)->first();
            
            if ($pic && $pic->isActive()) {
                // PIC is now approved, log them in
                Auth::guard('pic')->login($pic);
                $pic->update(['last_login_at' => now()]);
                $request->session()->forget('pending_pic_email');
                $request->session()->regenerate();
                
                return redirect()->intended('/');
            }
            
            return Inertia::render('Auth/PendingApproval', [
                'email' => $picEmail,
            ]);
        }
        
        // No pending email in session, redirect to login
        return redirect()->route('pic.login');
    }

    /**
     * Logout from pending approval page (clear session)
     */
    public function logoutPending(Request $request)
    {
        $request->session()->forget('pending_pic_email');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('pic.login');
    }

    /**
     * Check approval status (AJAX)
     */
    public function checkStatus(Request $request)
    {
        $picEmail = $request->session()->get('pending_pic_email');
        
        if (!$picEmail) {
            return response()->json(['status' => 'no_session']);
        }
        
        $pic = Pic::where('email', $picEmail)->first();
        
        if (!$pic) {
            return response()->json(['status' => 'not_found']);
        }
        
        if ($pic->isActive()) {
            return response()->json(['status' => 'approved']);
        }
        
        return response()->json(['status' => $pic->status]);
    }
}
