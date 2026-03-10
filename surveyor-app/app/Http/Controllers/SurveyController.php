<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\PicActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SurveyController extends Controller
{
    /**
     * Display a listing of surveys for PIC dashboard
     */
    public function index(Request $request)
    {
        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        // Get surveys from agents belonging to this company
        $query = Survey::with('agent')
            ->whereHas('agent', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->orderBy('created_at', 'desc');

        // Get all surveys for stats
        $allSurveys = $query->get();

        // Calculate stats
        $stats = [
            'total' => $allSurveys->count(),
            'pending' => $allSurveys->where('status', 'pending')->count(),
            'approved' => $allSurveys->where('status', 'approved')->count(),
            'rejected' => $allSurveys->where('status', 'rejected')->count(),
        ];

        // Separate violations
        $violations = $allSurveys->filter(fn($s) => $s->isViolation());
        $violationStats = [
            'total' => $violations->count(),
            'open' => $violations->where('status', 'pending')->count(),
            'resolved' => $violations->whereIn('status', ['approved', 'rejected'])->count(),
        ];

        // Separate leads (penawaran)
        $leads = $allSurveys->filter(fn($s) => $s->report_type === 'lead');
        $leadStats = [
            'total' => $leads->count(),
            'open' => $leads->where('status', 'pending')->count(),
            'resolved' => $leads->whereIn('status', ['approved', 'rejected'])->count(),
        ];

        // Transform surveys for frontend
        $surveys = $allSurveys->map(function ($survey) {
            return $this->transformSurvey($survey);
        });

        return Inertia::render('Surveys/Index', [
            'surveys' => $surveys,
            'stats' => $stats,
            'violationStats' => $violationStats,
            'leadStats' => $leadStats,
        ]);
    }

    /**
     * Show a single survey
     */
    public function show(Survey $survey)
    {
        $this->authorizeSurvey($survey);

        return Inertia::render('Surveys/Show', [
            'survey' => $this->transformSurvey($survey->load('agent')),
        ]);
    }

    /**
     * Update survey status (approve/reject)
     */
    public function updateStatus(Request $request, Survey $survey)
    {
        $this->authorizeSurvey($survey);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,pending,needs_review',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $pic = Auth::guard('pic')->user();

        $survey->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $survey->admin_notes,
            'reviewed_at' => now(),
            'reviewed_by' => $pic->name,
        ]);

        // Log activity
        $activityType = $validated['status'] === 'approved' ? 'approve_survey' : ($validated['status'] === 'rejected' ? 'reject_survey' : 'update_survey');
        $description = $validated['status'] === 'approved' 
            ? "Menyetujui survey \"{$survey->venue_name}\""
            : ($validated['status'] === 'rejected' 
                ? "Menolak survey \"{$survey->venue_name}\""
                : "Mengubah status survey \"{$survey->venue_name}\"");
        PicActivityLog::log($pic->id, $activityType, $description, 'Survey', $survey->id);

        return back()->with('success', 'Status survey berhasil diperbarui');
    }

    /**
     * Bulk update survey status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:surveys,id',
            'status' => 'required|in:approved,rejected,pending,needs_review',
        ]);

        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        // Only update surveys from agents in this company
        $updated = Survey::whereIn('id', $validated['ids'])
            ->whereHas('agent', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->update([
                'status' => $validated['status'],
                'reviewed_at' => now(),
                'reviewed_by' => $pic->name,
            ]);

        return back()->with('success', "{$updated} survey berhasil diperbarui");
    }

    /**
     * PIC edit survey data
     */
    public function picEdit(Request $request, Survey $survey)
    {
        $this->authorizeSurvey($survey);

        $validated = $request->validate([
            'venue_contact' => 'nullable|string|max:255',
            'venue_phone' => 'nullable|string|max:50',
            'category' => 'nullable|in:commercial,non_commercial',
            'capacity_limit' => 'nullable|integer|min:1',
            'description' => 'nullable|string|max:2000',
        ]);

        $pic = Auth::guard('pic')->user();

        $updateData = [
            'pic_venue_contact' => $validated['venue_contact'] ?? null,
            'pic_venue_phone' => $validated['venue_phone'] ?? null,
            'pic_category' => $validated['category'] ?? null,
            'pic_capacity_limit' => $validated['capacity_limit'] ?? null,
            'pic_description' => $validated['description'] ?? null,
            'pic_edited_by' => $pic->id,
            'pic_edited_at' => now(),
        ];

        $violationResolved = false;
        $violationReactivated = false;

        // Handle capacity violations
        if ($survey->report_type === 'violation_capacity') {
            $newCapacity = $validated['capacity_limit'] ?? $survey->capacity_limit;
            $actualVisitors = $survey->actual_visitors ?? 0;
            
            if ($survey->status === 'pending' && $newCapacity >= $actualVisitors) {
                // Pending -> Resolved (new capacity fixes it)
                $updateData['status'] = 'approved';
                $updateData['reviewed_at'] = now();
                $updateData['reviewed_by'] = $pic->name;
                $violationResolved = true;
            } elseif ($survey->status === 'approved' && $newCapacity < $actualVisitors) {
                // Resolved -> Pending (new capacity makes it violate again)
                $updateData['status'] = 'pending';
                $updateData['reviewed_at'] = null;
                $updateData['reviewed_by'] = null;
                $violationReactivated = true;
            }
        }
        // For other violation types, auto-resolve when PIC edits (they're manually reviewing)
        elseif ($survey->isViolation() && $survey->status === 'pending') {
            $updateData['status'] = 'approved';
            $updateData['reviewed_at'] = now();
            $updateData['reviewed_by'] = $pic->name;
            $violationResolved = true;
        }

        $survey->update($updateData);

        // Log activity
        PicActivityLog::log($pic->id, 'edit_survey', "Mengedit data survey \"{$survey->venue_name}\"", 'Survey', $survey->id);

        if ($survey->isViolation()) {
            if ($violationResolved) {
                $message = 'Pelanggaran berhasil di-resolve oleh PIC';
            } elseif ($violationReactivated) {
                $message = 'Pelanggaran diaktifkan kembali (kapasitas kurang dari pengunjung)';
            } else {
                $message = 'Data pelanggaran diperbarui';
            }
        } else {
            $message = 'Data survey berhasil diperbarui oleh PIC';
        }

        return back()->with('success', $message);
    }

    /**
     * Revert PIC edits (clear all pic_* fields)
     */
    public function revertPicEdit(Survey $survey)
    {
        $this->authorizeSurvey($survey);

        $updateData = [
            'pic_venue_contact' => null,
            'pic_venue_phone' => null,
            'pic_category' => null,
            'pic_capacity_limit' => null,
            'pic_description' => null,
            'pic_edited_by' => null,
            'pic_edited_at' => null,
        ];

        $violationReactivated = false;

        // If this is a capacity violation, only reactivate if original data still violates
        if ($survey->report_type === 'violation_capacity' && $survey->status === 'approved') {
            $originalCapacity = $survey->capacity_limit ?? 0;
            $actualVisitors = $survey->actual_visitors ?? 0;
            
            if ($originalCapacity < $actualVisitors) {
                // Original data still violates - reactivate
                $updateData['status'] = 'pending';
                $updateData['reviewed_at'] = null;
                $updateData['reviewed_by'] = null;
                $violationReactivated = true;
            }
        }
        // For other violation types, reactivate when PIC reverts
        elseif ($survey->isViolation() && $survey->status === 'approved') {
            $updateData['status'] = 'pending';
            $updateData['reviewed_at'] = null;
            $updateData['reviewed_by'] = null;
            $violationReactivated = true;
        }

        $survey->update($updateData);

        if ($survey->isViolation()) {
            $message = $violationReactivated
                ? 'Pelanggaran diaktifkan kembali'
                : 'Data dikembalikan ke versi agent (kapasitas asli sudah memenuhi)';
        } else {
            $message = 'Perubahan PIC berhasil dikembalikan ke versi agent';
        }

        return back()->with('success', $message);
    }

    /**
     * Delete a survey
     */
    public function destroy(Survey $survey)
    {
        $this->authorizeSurvey($survey);

        $pic = Auth::guard('pic')->user();
        $venueName = $survey->venue_name;
        
        $survey->delete();

        // Log activity
        PicActivityLog::log($pic->id, 'delete_survey', "Menghapus survey \"{$venueName}\"", 'Survey', null);

        return back()->with('success', 'Survey berhasil dihapus');
    }

    /**
     * Bulk delete surveys
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:surveys,id',
        ]);

        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        // Only delete surveys from agents in this company
        $deleted = Survey::whereIn('id', $validated['ids'])
            ->whereHas('agent', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->delete();

        return back()->with('success', "{$deleted} survey berhasil dihapus");
    }

    /**
     * Export surveys to CSV
     */
    public function export(Request $request)
    {
        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        $surveys = Survey::with('agent')
            ->whereHas('agent', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'surveys_' . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($surveys) {
            $file = fopen('php://output', 'w');
            
            // Header row
            fputcsv($file, [
                'ID', 'Tanggal', 'Tipe Laporan', 'Kategori', 'Nama Venue', 'Alamat',
                'Kontak', 'Telepon', 'Pengunjung', 'Kapasitas', 'Deskripsi',
                'Latitude', 'Longitude', 'Status', 'Agent', 'Catatan Admin'
            ]);

            foreach ($surveys as $survey) {
                fputcsv($file, [
                    $survey->id,
                    $survey->created_at->format('Y-m-d H:i'),
                    $survey->report_type,
                    $survey->category,
                    $survey->venue_name,
                    $survey->venue_address,
                    $survey->venue_contact,
                    $survey->venue_phone,
                    $survey->actual_visitors,
                    $survey->capacity_limit,
                    $survey->description,
                    $survey->latitude,
                    $survey->longitude,
                    $survey->status,
                    $survey->agent?->name,
                    $survey->admin_notes,
                ]);
            }

            fclose($file);
        };

        // Log activity
        PicActivityLog::log($pic->id, 'export_data', "Export data survey ke CSV ({$surveys->count()} data)");

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Transform survey for frontend
     */
    private function transformSurvey(Survey $survey): array
    {
        return [
            'id' => $survey->id,
            'report_type' => $survey->report_type,
            'category' => $survey->category,
            'venue_name' => $survey->venue_name ?? 'Unknown Venue',
            'venue_address' => $survey->venue_address,
            'venue_contact' => $survey->venue_contact,
            'venue_phone' => $survey->venue_phone,
            'actual_visitors' => $survey->actual_visitors,
            'capacity_limit' => $survey->capacity_limit,
            'description' => $survey->description,
            'photos' => $survey->photos ?? [],
            'latitude' => $survey->latitude,
            'longitude' => $survey->longitude,
            'status' => $survey->status,
            'admin_notes' => $survey->admin_notes,
            'reviewed_at' => $survey->reviewed_at?->format('Y-m-d H:i'),
            'reviewed_by' => $survey->reviewed_by,
            'created_at' => $survey->created_at->format('Y-m-d H:i'),
            'agent_id' => $survey->agent_id,
            'agent_name' => $survey->agent?->name ?? 'Unknown',
            'license_id' => $survey->license_id,
            'merchant_id' => $survey->merchant_id,
            'is_violation' => $survey->isViolation(),
            // PIC edits
            'has_pic_edits' => $survey->hasPicEdits(),
            'pic_venue_contact' => $survey->pic_venue_contact,
            'pic_venue_phone' => $survey->pic_venue_phone,
            'pic_category' => $survey->pic_category,
            'pic_capacity_limit' => $survey->pic_capacity_limit,
            'pic_description' => $survey->pic_description,
            'pic_edited_at' => $survey->pic_edited_at?->format('Y-m-d H:i'),
            'pic_edited_by' => $survey->picEditor?->name,
            // Effective values (PIC version if exists, else agent version)
            'effective_contact' => $survey->getEffectiveContact(),
            'effective_phone' => $survey->getEffectivePhone(),
            'effective_category' => $survey->getEffectiveCategory(),
            'effective_capacity' => $survey->getEffectiveCapacity(),
            'effective_description' => $survey->getEffectiveDescription(),
        ];
    }

    /**
     * Authorize that the survey belongs to the PIC's company
     */
    private function authorizeSurvey(Survey $survey): void
    {
        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        if ($survey->agent?->company_id !== $company->id) {
            abort(403, 'Unauthorized');
        }
    }

    /**
     * Display venues map with real survey data
     */
    public function map()
    {
        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        // Get surveys with location data from agents belonging to this company
        $surveys = Survey::with('agent')
            ->whereHas('agent', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform surveys for map display
        $venues = $surveys->map(function ($survey) {
            return [
                'id' => $survey->id,
                'venueName' => $survey->venue_name ?? 'Unknown Venue',
                'venueType' => $this->getVenueTypeLabel($survey->report_type),
                'contactPerson' => $survey->getEffectiveContact(),
                'phone' => $survey->getEffectivePhone(),
                'address' => $survey->venue_address ?? '',
                'area' => $this->extractArea($survey->venue_address),
                'capacityTier' => $this->getCapacityTier($survey->getEffectiveCapacity()),
                'lat' => (float) $survey->latitude,
                'lng' => (float) $survey->longitude,
                'agentName' => $survey->agent?->name ?? 'Unknown',
                'surveyDate' => $survey->created_at->format('Y-m-d'),
                'status' => $survey->status,
                'reportType' => $survey->report_type,
                'isViolation' => $survey->isViolation(),
            ];
        });

        return Inertia::render('Venues/Map', [
            'venues' => $venues,
        ]);
    }

    /**
     * Get venue type label from report type
     */
    private function getVenueTypeLabel(string $reportType): string
    {
        return match ($reportType) {
            'verified' => 'Komersial Terverifikasi',
            'verified_non_commercial' => 'Non-Komersial',
            'violation_invalid_qr' => 'Pelanggaran QR',
            'violation_capacity' => 'Pelanggaran Kapasitas',
            'violation_ads' => 'Pelanggaran Iklan',
            'violation_no_license' => 'Tanpa Lisensi',
            'violation_venue' => 'Venue Tidak Sesuai',
            'lead' => 'Lead/Penawaran',
            'documentation' => 'Dokumentasi',
            default => 'Lainnya',
        };
    }

    /**
     * Extract area from address (simple implementation)
     */
    private function extractArea(?string $address): string
    {
        if (!$address) return 'Unknown';
        
        // Try to extract city/area from address
        $parts = explode(',', $address);
        if (count($parts) >= 2) {
            return trim($parts[count($parts) - 1]);
        }
        return 'Unknown';
    }

    /**
     * Get capacity tier label
     */
    private function getCapacityTier(?int $capacity): string
    {
        if (!$capacity) return 'N/A';
        if ($capacity <= 50) return '≤50';
        if ($capacity <= 100) return '51-100';
        if ($capacity <= 250) return '101-250';
        if ($capacity <= 500) return '251-500';
        return '501-1000';
    }
}
