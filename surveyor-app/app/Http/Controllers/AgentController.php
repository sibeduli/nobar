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
            ->withCount('surveys')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'email' => $agent->email,
                    'phone' => $agent->phone,
                    'nik' => $agent->nik,
                    'address' => $agent->address,
                    'areas' => $agent->areas ?? [],
                    'status' => $agent->status,
                    'ktp_photo' => $agent->ktp_photo ? '/storage/' . $agent->ktp_photo : null,
                    'notes' => $agent->notes,
                    'qr_code' => $agent->qr_code,
                    'surveys' => $agent->surveys_count,
                    'joinDate' => $agent->created_at?->format('Y-m-d'),
                ];
            });

        $stats = [
            'total' => $agents->count(),
            'active' => $agents->where('status', 'active')->count(),
            'inactive' => $agents->where('status', 'inactive')->count(),
            'totalSurveys' => $agents->sum('surveys'),
        ];

        return Inertia::render('Agents/Index', [
            'agents' => $agents->values(),
            'stats' => $stats,
            'company' => [
                'name' => $pic->company->name ?? 'Unknown',
                'code' => $pic->company->code ?? '',
            ],
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
            'status' => 'required|in:active,inactive',
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
            'ktp_photo' => $ktpPath,
            'address' => $validated['address'],
            'areas' => $validated['areas'],
            'qr_code' => $qrCode,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
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
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'email' => $agent->email,
                'phone' => $agent->phone,
                'nik' => $agent->nik,
                'address' => $agent->address,
                'areas' => $agent->areas ?? [],
                'status' => $agent->status,
                'notes' => $agent->notes,
            ],
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
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string|max:1000',
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

    public function resetPassword(Request $request, Agent $agent)
    {
        $this->authorizeAgent($agent);

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ], [
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 6 karakter',
        ]);

        $agent->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password agen berhasil direset');
    }

    public function forceLogout(Request $request, Agent $agent)
    {
        $this->authorizeAgent($agent);

        $currentSessionId = $request->session()->getId();

        // Delete all sessions for this agent EXCEPT the current session (to avoid logging out PIC in same browser)
        $deleted = \DB::table('sessions')
            ->where('agent_id', $agent->id)
            ->whereNotNull('agent_id')
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return back()->with('success', $deleted > 0 
            ? "Berhasil logout {$deleted} sesi agen" 
            : "Tidak ada sesi agen lain yang aktif");
    }

    private function authorizeAgent(Agent $agent): void
    {
        $pic = Auth::guard('pic')->user();
        
        if ($agent->company_id !== $pic->company_id) {
            abort(403, 'Unauthorized');
        }
    }

    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:agents,id',
            'status' => 'required|in:active,inactive',
        ]);

        $pic = Auth::guard('pic')->user();
        
        $updated = Agent::where('company_id', $pic->company_id)
            ->whereIn('id', $validated['ids'])
            ->update(['status' => $validated['status']]);

        $statusLabel = $validated['status'] === 'active' ? 'diaktifkan' : 'dinonaktifkan';
        
        return back()->with('success', "{$updated} agen berhasil {$statusLabel}");
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:agents,id',
        ]);

        $pic = Auth::guard('pic')->user();
        
        $deleted = Agent::where('company_id', $pic->company_id)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return back()->with('success', "{$deleted} agen berhasil dihapus");
    }

    public function export(Request $request)
    {
        $pic = Auth::guard('pic')->user();
        
        $ids = $request->input('ids', []);
        
        $query = Agent::where('company_id', $pic->company_id)
            ->withCount('surveys');
            
        if (!empty($ids)) {
            $query->whereIn('id', $ids);
        }
        
        $agents = $query->get();

        $csv = "Nama,Email,Telepon,NIK,Status,Area Tugas,Total Survei,Dibuat\n";
        
        foreach ($agents as $agent) {
            $areas = is_array($agent->areas) ? implode('; ', $agent->areas) : '';
            $csv .= sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\"\n",
                $agent->name,
                $agent->email ?? '',
                $agent->phone,
                $agent->nik ?? '',
                $agent->status === 'active' ? 'Aktif' : 'Nonaktif',
                $areas,
                $agent->surveys_count ?? 0,
                $agent->created_at->format('Y-m-d H:i')
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="agents-export-' . date('Y-m-d') . '.csv"');
    }
}
