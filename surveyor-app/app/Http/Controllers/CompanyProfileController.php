<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyProfileController extends Controller
{
    public function show()
    {
        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        return Inertia::render('CompanyProfile', [
            'company' => $company ? [
                'id' => $company->id,
                'name' => $company->name,
                'legalName' => $company->legal_name,
                'code' => $company->code,
                'npwp' => $company->npwp,
                'businessType' => $company->business_type,
                'address' => $company->address,
                'city' => $company->city,
                'province' => $company->province,
                'postalCode' => $company->postal_code,
                'phone' => $company->phone,
                'email' => $company->email,
                'website' => $company->website,
                'description' => $company->description,
            ] : null,
            'pic' => [
                'name' => $pic->name,
                'phone' => $pic->phone,
                'email' => $pic->email,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $pic = Auth::guard('pic')->user();
        $company = $pic->company;

        if (!$company) {
            return back()->withErrors(['company' => 'Perusahaan tidak ditemukan']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'legalName' => 'nullable|string|max:255',
            'npwp' => 'nullable|string|max:50',
            'businessType' => 'nullable|string|max:50',
            'province' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'postalCode' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:1000',
        ]);

        $company->update([
            'name' => $validated['name'],
            'legal_name' => $validated['legalName'] ?? null,
            'npwp' => $validated['npwp'] ?? null,
            'business_type' => $validated['businessType'] ?? null,
            'province' => $validated['province'] ?? null,
            'city' => $validated['city'] ?? null,
            'postal_code' => $validated['postalCode'] ?? null,
            'address' => $validated['address'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Profil perusahaan berhasil disimpan');
    }
}
