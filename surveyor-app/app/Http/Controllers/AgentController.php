<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index()
    {
        $pic = Auth::guard('pic')->user();
        $agents = Agent::where('company_id', $pic->company_id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Agents/Index', [
            'agents' => $agents,
        ]);
    }

    public function create()
    {
        return Inertia::render('Agents/Create');
    }

    public function store(Request $request)
    {
        $pic = Auth::guard('pic')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:agents,phone',
            'email' => 'nullable|email|max:255',
            'password' => 'required|string|min:6',
            'nik' => 'required|string|size:16',
            'address' => 'nullable|string|max:500',
            'areas' => 'required|array|min:1',
            'status' => 'required|in:active,inactive,pending',
            'notes' => 'nullable|string|max:1000',
            'ktpPhoto' => 'required|image|mimes:jpeg,jpg,png|max:5120',
        ], [
            'name.required' => 'Nama lengkap wajib diisi',
            'phone.required' => 'Nomor telepon wajib diisi',
            'phone.unique' => 'Nomor telepon sudah terdaftar',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 6 karakter',
            'nik.required' => 'NIK wajib diisi',
            'nik.size' => 'NIK harus 16 digit',
            'areas.required' => 'Minimal pilih 1 area tugas',
            'areas.min' => 'Minimal pilih 1 area tugas',
            'ktpPhoto.required' => 'Foto KTP wajib diunggah',
            'ktpPhoto.image' => 'File harus berupa gambar',
            'ktpPhoto.mimes' => 'Format file harus JPG atau PNG',
            'ktpPhoto.max' => 'Ukuran file maksimal 5MB',
        ]);

        // Handle KTP photo upload
        $ktpPath = null;
        if ($request->hasFile('ktpPhoto')) {
            $ktpPath = $request->file('ktpPhoto')->store('agents/ktp', 'public');
        }

        // Generate QR code
        $qrCode = Agent::generateQrCode($pic->company, $validated['name']);

        // Create agent
        $agent = Agent::create([
            'company_id' => $pic->company_id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'nik' => $validated['nik'],
            'address' => $validated['address'],
            'areas' => $validated['areas'],
            'qr_code' => $qrCode,
            'status' => $validated['status'],
        ]);

        return redirect()->route('pic.agents.index')->with('success', 'Agen berhasil didaftarkan');
    }

    public function show(Agent $agent)
    {
        $this->authorizeAgent($agent);

        return Inertia::render('Agents/Show', [
            'agent' => $agent,
        ]);
    }

    public function edit(Agent $agent)
    {
        $this->authorizeAgent($agent);

        return Inertia::render('Agents/Edit', [
            'agent' => $agent,
        ]);
    }

    public function update(Request $request, Agent $agent)
    {
        $this->authorizeAgent($agent);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:agents,phone,' . $agent->id,
            'email' => 'nullable|email|max:255',
            'nik' => 'required|string|size:16',
            'address' => 'nullable|string|max:500',
            'areas' => 'required|array|min:1',
            'status' => 'required|in:active,inactive,pending',
        ]);

        $agent->update($validated);

        return back()->with('success', 'Data agen berhasil diperbarui');
    }

    public function destroy(Agent $agent)
    {
        $this->authorizeAgent($agent);

        $agent->delete();

        return redirect()->route('pic.agents.index')->with('success', 'Agen berhasil dihapus');
    }

    private function authorizeAgent(Agent $agent): void
    {
        $pic = Auth::guard('pic')->user();
        
        if ($agent->company_id !== $pic->company_id) {
            abort(403, 'Unauthorized');
        }
    }
}
