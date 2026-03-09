<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $pic = Auth::guard('pic')->user();

        return Inertia::render('Settings/Index', [
            'user' => [
                'id' => $pic->id,
                'name' => $pic->name,
                'email' => $pic->email,
                'phone' => $pic->phone,
                'createdAt' => $pic->created_at?->format('Y-m-d'),
            ],
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
}
