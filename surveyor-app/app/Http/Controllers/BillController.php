<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\SurveyBill;
use App\Models\CapacityCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BillController extends Controller
{
    public function index()
    {
        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        // Unbilled: approved capacity violations without bill
        $unbilledSurveys = Survey::with(['agent', 'capacityCategory', 'picCapacityCategory'])
            ->whereHas('agent', fn($q) => $q->where('company_id', $company->id))
            ->where('status', 'approved')
            ->where('report_type', 'violation_capacity')
            ->whereDoesntHave('bill')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => $this->transformUnbilled($s));

        // Bills: sent/paid
        $bills = SurveyBill::with(['survey.agent', 'creator'])
            ->where('company_id', $company->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($b) => $this->transformBill($b));

        // Mock referral data: 2 referrals for CAT 2 and CAT 3 (PPN 11% deducted)
        $cat2 = CapacityCategory::where('code', 'CAT 2')->first();
        $cat3 = CapacityCategory::where('code', 'CAT 3')->first();
        $cat2Nett = ($cat2?->price ?? 0) / 1.11; // Remove PPN 11%
        $cat3Nett = ($cat3?->price ?? 0) / 1.11;
        $mockReferralRevenue = $cat2Nett + $cat3Nett;
        $mockReferralCommission = $mockReferralRevenue * SurveyBill::COMMISSION_RATE;

        $billRevenue = SurveyBill::where('company_id', $company->id)->sum('amount');
        $billCommission = SurveyBill::where('company_id', $company->id)->sum('pic_commission');

        $stats = [
            'unbilled' => $unbilledSurveys->count(),
            'sent' => SurveyBill::where('company_id', $company->id)->count(),
            'referrals' => 2, // Mock: CAT 2 + CAT 3
            'total_revenue' => $billRevenue + $mockReferralRevenue,
            'total_commission' => $billCommission + $mockReferralCommission,
        ];

        return Inertia::render('PIC/Sales', [
            'unbilledSurveys' => $unbilledSurveys,
            'bills' => $bills,
            'stats' => $stats,
        ]);
    }

    public function send(Survey $survey)
    {
        $pic = Auth::guard('pic')->user();
        $this->authorizeSurvey($survey);

        if (!$survey->canBeBilled()) {
            return back()->with('error', 'Survey tidak dapat ditagih');
        }

        $bill = SurveyBill::createFromSurvey($survey, $pic);

        return back()->with('success', 'Tagihan ' . $bill->bill_number . ' berhasil dikirim');
    }

    private function transformUnbilled(Survey $survey): array
    {
        $cat = $survey->picCapacityCategory ?? $survey->capacityCategory;
        $basePrice = $cat?->price ?? 0;
        $amount = $basePrice + SurveyBill::MARKUP;
        $ppn = $amount / 1.11 * 0.11; // PPN 11%
        $nett = $amount - $ppn;
        $commission = $nett * SurveyBill::COMMISSION_RATE;

        return [
            'id' => $survey->id,
            'venue_name' => $survey->venue_name,
            'venue_address' => $survey->venue_address,
            'agent_name' => $survey->agent?->name,
            'created_at' => $survey->created_at->format('Y-m-d H:i'),
            'capacity_category' => $cat?->label,
            'formatted_amount' => 'Rp ' . number_format($amount, 0, ',', '.'),
            'formatted_ppn' => 'Rp ' . number_format($ppn, 0, ',', '.'),
            'formatted_nett' => 'Rp ' . number_format($nett, 0, ',', '.'),
            'formatted_commission' => 'Rp ' . number_format($commission, 0, ',', '.'),
        ];
    }

    private function transformBill(SurveyBill $bill): array
    {
        return [
            'id' => $bill->id,
            'survey_id' => $bill->survey_id,
            'bill_number' => $bill->bill_number,
            'status' => $bill->status,
            'merchant_name' => $bill->merchant_name,
            'merchant_address' => $bill->merchant_address,
            'formatted_amount' => $bill->formatted_amount,
            'formatted_ppn' => 'Rp ' . number_format($bill->ppn ?? 0, 0, ',', '.'),
            'formatted_nett' => 'Rp ' . number_format($bill->nett ?? 0, 0, ',', '.'),
            'formatted_commission' => $bill->formatted_commission,
            'sent_at' => $bill->sent_at?->format('Y-m-d H:i'),
            'due_date' => $bill->due_date?->format('Y-m-d'),
            'paid_at' => $bill->paid_at?->format('Y-m-d H:i'),
            'agent_name' => $bill->survey?->agent?->name,
            'created_at' => $bill->created_at->format('Y-m-d H:i'),
        ];
    }

    private function authorizeSurvey(Survey $survey): void
    {
        $pic = Auth::guard('pic')->user();
        if ($survey->agent?->company_id !== $pic->company_id) {
            abort(403);
        }
    }

}
