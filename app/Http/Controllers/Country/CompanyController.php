<?php

namespace App\Http\Controllers\Country;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Country;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $countryId = $request->filled('country_id')
            ? (int) $request->input('country_id')
            : null;

        $companies = Company::query()
            ->with('country:id,name,iso_alpha2')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%')
                        ->orWhere('city', 'like', '%'.$search.'%');
                });
            })
            ->when($countryId, fn ($q) => $q->where('country_id', $countryId))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Company/Index', [
            'companies' => $companies,
            'countries' => Country::query()
                ->orderBy('name')
                ->get(['id', 'name', 'iso_alpha2']),
            'filters' => [
                'search' => $search,
                'country_id' => $countryId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Company/Create', [
            'countries' => Country::query()
                ->orderBy('name')
                ->get(['id', 'name', 'iso_alpha2']),
            'company' => [
                'country_id' => '',
                'name' => '',
                'email' => '',
                'phone' => '',
                'logo' => '',
                'website' => '',
                'address_line1' => '',
                'address_line2' => '',
                'city' => '',
                'state' => '',
                'postcode' => '',
                'country_code' => '',
                'timezone' => 'UTC',
                'base_currency' => 'NZD',
                'status' => 'active',
            ],
        ]);
    }

    public function store(StoreCompanyRequest $request): RedirectResponse
    {
        Company::query()->create($request->validated());

        return redirect()
            ->route('companies.index')
            ->with('success', 'Company created successfully.');
    }

    public function show(Company $company): Response
    {
        $company->load('country:id,name,iso_alpha2,iso_alpha3');
        $company->loadCount('branches');

        return Inertia::render('Company/Show', [
            'company' => $company,
        ]);
    }

    public function edit(Company $company): Response
    {
        return Inertia::render('Company/Edit', [
            'countries' => Country::query()
                ->orderBy('name')
                ->get(['id', 'name', 'iso_alpha2']),
            'company' => $company,
        ]);
    }

    public function update(UpdateCompanyRequest $request, Company $company): RedirectResponse
    {
        $company->update($request->validated());

        return redirect()
            ->route('companies.index')
            ->with('success', 'Company updated successfully.');
    }

    public function destroy(Company $company): RedirectResponse
    {
        if (Branch::withTrashed()->where('company_id', $company->id)->exists()) {
            return redirect()
                ->back()
                ->with('error', 'Cannot delete company while branches are linked to it.');
        }

        $company->delete();

        return redirect()
            ->route('companies.index')
            ->with('success', 'Company deleted successfully.');
    }
}
