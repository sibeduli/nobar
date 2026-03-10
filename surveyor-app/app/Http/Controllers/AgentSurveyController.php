<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\License;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AgentSurveyController extends Controller
{
    /**
     * Display the report page
     */
    public function index()
    {
        return Inertia::render('Agent/Report/Index');
    }

    /**
     * Validate a QR code and return venue data
     */
    public function validateQr(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        $qrCode = $request->qr_code;

        // Try to find license by QR code
        // QR format from merchant app: LICENSE-{id}-{venueId}
        $license = License::where('id', $qrCode)
            ->orWhere('id', 'LIKE', "%{$qrCode}%")
            ->first();

        if (!$license) {
            return response()->json([
                'valid' => false,
                'message' => 'QR Code tidak valid atau tidak terdaftar',
            ]);
        }

        // Check if license is frozen
        if ($license->frozen) {
            return response()->json([
                'valid' => false,
                'message' => 'Lisensi ini telah dibekukan',
            ]);
        }

        // Get merchant/venue data
        $merchant = $license->merchant;

        // Check if already handled today by any agent
        $alreadyHandled = Survey::where('license_id', $license->id)
            ->whereDate('created_at', today())
            ->exists();

        // Determine if commercial or non-commercial based on tier
        // Tier 1-3 = commercial, Tier 0 or special = non-commercial
        $isCommercial = $license->tier > 0;

        return response()->json([
            'valid' => true,
            'alreadyHandled' => $alreadyHandled,
            'handledDate' => $alreadyHandled ? today()->format('Y-m-d') : null,
            'venue' => [
                'id' => $merchant?->id,
                'name' => $merchant?->name ?? 'Unknown Venue',
                'address' => $merchant?->address ?? '',
                'type' => $isCommercial ? 'commercial' : 'non_commercial',
                'capacityLimit' => $this->getCapacityByTier($license->tier),
                'contactPerson' => $merchant?->picName ?? '',
                'phone' => $merchant?->picPhone ?? '',
                'licensePurchaseDate' => $license->paidAt?->format('Y-m-d'),
                'licenseId' => $license->id,
            ],
        ]);
    }

    /**
     * Store a new survey report
     */
    public function store(Request $request)
    {
        $agent = Auth::guard('agent')->user();

        $validated = $request->validate([
            'report_type' => 'required|string',
            'license_id' => 'nullable|string',
            'merchant_id' => 'nullable|string',
            'venue_name' => 'nullable|string|max:255',
            'venue_address' => 'nullable|string|max:500',
            'venue_contact' => 'nullable|string|max:255',
            'venue_phone' => 'nullable|string|max:20',
            'actual_visitors' => 'nullable|integer|min:0',
            'capacity_limit' => 'nullable|integer|min:0',
            'description' => 'nullable|string|max:2000',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'photos' => 'nullable|array|max:5',
            'photos.*' => 'string', // Base64 encoded images
        ]);

        // Determine category based on report type
        $category = $this->getCategoryFromReportType($validated['report_type']);

        // Handle photo uploads (convert base64 to files)
        $photoUrls = [];
        if (!empty($validated['photos'])) {
            foreach ($validated['photos'] as $index => $base64Photo) {
                $photoUrl = $this->saveBase64Photo($base64Photo, $agent->id, $index);
                if ($photoUrl) {
                    $photoUrls[] = $photoUrl;
                }
            }
        }

        // Create survey
        $survey = Survey::create([
            'agent_id' => $agent->id,
            'merchant_id' => $validated['merchant_id'] ?? null,
            'license_id' => $validated['license_id'] ?? null,
            'category' => $category,
            'report_type' => $validated['report_type'],
            'venue_name' => $validated['venue_name'] ?? null,
            'venue_address' => $validated['venue_address'] ?? null,
            'venue_contact' => $validated['venue_contact'] ?? null,
            'venue_phone' => $validated['venue_phone'] ?? null,
            'actual_visitors' => $validated['actual_visitors'] ?? null,
            'capacity_limit' => $validated['capacity_limit'] ?? null,
            'description' => $validated['description'] ?? null,
            'photos' => $photoUrls,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dikirim',
            'survey_id' => $survey->id,
        ]);
    }

    /**
     * Get agent's own surveys list
     */
    public function mySurveys()
    {
        $agent = Auth::guard('agent')->user();

        $surveys = Survey::where('agent_id', $agent->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($survey) {
                return [
                    'id' => $survey->id,
                    'venue_name' => $survey->venue_name ?? 'Unknown Venue',
                    'venue_address' => $survey->venue_address,
                    'report_type' => $survey->report_type,
                    'category' => $survey->category,
                    'status' => $survey->status,
                    'created_at' => $survey->created_at->format('Y-m-d H:i'),
                    'photos' => $survey->photos ?? [],
                    'description' => $survey->description,
                    'is_violation' => $survey->isViolation(),
                ];
            });

        // Stats
        $stats = [
            'total' => $surveys->count(),
            'pending' => $surveys->where('status', 'pending')->count(),
            'approved' => $surveys->where('status', 'approved')->count(),
            'rejected' => $surveys->where('status', 'rejected')->count(),
        ];

        return Inertia::render('Agent/Surveys/Index', [
            'surveys' => $surveys,
            'stats' => $stats,
        ]);
    }

    /**
     * Get single survey detail for agent
     */
    public function showSurvey($id)
    {
        $agent = Auth::guard('agent')->user();

        $survey = Survey::where('id', $id)
            ->where('agent_id', $agent->id)
            ->firstOrFail();

        return Inertia::render('Agent/Surveys/Show', [
            'survey' => [
                'id' => $survey->id,
                'venue_name' => $survey->venue_name ?? 'Unknown Venue',
                'venue_address' => $survey->venue_address,
                'venue_contact' => $survey->venue_contact,
                'venue_phone' => $survey->venue_phone,
                'report_type' => $survey->report_type,
                'category' => $survey->category,
                'status' => $survey->status,
                'actual_visitors' => $survey->actual_visitors,
                'capacity_limit' => $survey->capacity_limit,
                'description' => $survey->description,
                'photos' => $survey->photos ?? [],
                'latitude' => $survey->latitude,
                'longitude' => $survey->longitude,
                'admin_notes' => $survey->admin_notes,
                'reviewed_at' => $survey->reviewed_at?->format('Y-m-d H:i'),
                'reviewed_by' => $survey->reviewed_by,
                'created_at' => $survey->created_at->format('Y-m-d H:i'),
                'is_violation' => $survey->isViolation(),
                // PIC edits - for agent to see what PIC changed
                'has_pic_edits' => $survey->hasPicEdits(),
                'pic_venue_contact' => $survey->pic_venue_contact,
                'pic_venue_phone' => $survey->pic_venue_phone,
                'pic_category' => $survey->pic_category,
                'pic_capacity_limit' => $survey->pic_capacity_limit,
                'pic_description' => $survey->pic_description,
                'pic_edited_at' => $survey->pic_edited_at?->format('Y-m-d H:i'),
                'pic_edited_by' => $survey->picEditor?->name,
            ],
        ]);
    }

    /**
     * Get agent's survey history
     */
    public function history(Request $request)
    {
        $agent = Auth::guard('agent')->user();

        $surveys = Survey::where('agent_id', $agent->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Agent/Surveys/History', [
            'surveys' => $surveys,
        ]);
    }

    /**
     * Get capacity limit by license tier
     */
    private function getCapacityByTier(int $tier): int
    {
        return match ($tier) {
            1 => 50,
            2 => 100,
            3 => 200,
            default => 0,
        };
    }

    /**
     * Determine category from report type
     */
    private function getCategoryFromReportType(string $reportType): string
    {
        if (in_array($reportType, ['verified_non_commercial', 'documentation'])) {
            return 'non_commercial';
        }
        return 'commercial';
    }

    /**
     * Save base64 encoded photo to storage
     */
    private function saveBase64Photo(string $base64, int $agentId, int $index): ?string
    {
        try {
            // Remove data URL prefix if present
            if (str_contains($base64, ',')) {
                $base64 = explode(',', $base64)[1];
            }

            $imageData = base64_decode($base64);
            if (!$imageData) {
                return null;
            }

            $filename = "surveys/{$agentId}/" . now()->format('Y-m-d') . "_{$index}_" . uniqid() . '.jpg';
            Storage::disk('public')->put($filename, $imageData);

            return Storage::url($filename);
        } catch (\Exception $e) {
            return null;
        }
    }
}
