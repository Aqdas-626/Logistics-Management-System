<?php

namespace App\Http\Controllers\Country;

use App\Http\Controllers\Controller;
use App\Http\Requests\Country\StoreCountryRequest;
use App\Http\Requests\Country\UpdateCountryRequest;
use App\Models\Company;
use App\Models\Country;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CountryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $countries = Country::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'like', '%'.$search.'%')
                        ->orWhere('iso_alpha2', 'like', '%'.$search.'%')
                        ->orWhere('iso_alpha3', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Country/Index', [
            'countries' => $countries,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Country/Create', [
            'country' => [
                'name' => '',
                'iso_alpha2' => '',
                'iso_alpha3' => '',
                'phone_code' => '',
                'currency_code' => '',
                'is_active' => true,
            ],
        ]);
    }

    public function store(StoreCountryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $request->has('is_active')
            ? $request->boolean('is_active')
            : true;

        Country::query()->create($data);

        return redirect()
            ->route('countries.index')
            ->with('success', 'Country created successfully.');
    }

    public function show(Country $country): Response
    {
        $country->loadCount('companies');

        return Inertia::render('Country/Show', [
            'country' => $country,
        ]);
    }

    public function edit(Country $country): Response
    {
        return Inertia::render('Country/Edit', [
            'country' => $country,
        ]);
    }

    public function update(UpdateCountryRequest $request, Country $country): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $request->has('is_active')
            ? $request->boolean('is_active')
            : $country->is_active;

        $country->update($data);

        return redirect()
            ->route('countries.index')
            ->with('success', 'Country updated successfully.');
    }

    public function destroy(Country $country): RedirectResponse
    {
        if (Company::withTrashed()->where('country_id', $country->id)->exists()) {
            return redirect()
                ->back()
                ->with('error', 'Cannot delete country while companies are linked to it.');
        }

        $country->delete();

        return redirect()
            ->route('countries.index')
            ->with('success', 'Country deleted successfully.');
    }
}
