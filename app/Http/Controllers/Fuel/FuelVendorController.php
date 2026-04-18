<?php

namespace App\Http\Controllers\Fuel;

use App\Http\Controllers\Controller;
use App\Models\FuelVendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FuelVendorController extends Controller
{
    private function filteredQuery(string $search)
    {
        $query = FuelVendor::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('contact_person', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Fuel/Vendors/Index', [
            'vendors' => $this->filteredQuery($search)->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Fuel/Vendors/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        FuelVendor::create($validated);

        return redirect()
            ->route('fuel-vendors.index')
            ->with('success', 'Fuel vendor created successfully.');
    }

    public function edit(FuelVendor $fuelVendor): Response
    {
        return Inertia::render('Fuel/Vendors/Edit', [
            'vendor' => $fuelVendor,
        ]);
    }

    public function update(Request $request, FuelVendor $fuelVendor): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $fuelVendor->update($validated);

        return redirect()
            ->route('fuel-vendors.index')
            ->with('success', 'Fuel vendor updated successfully.');
    }

    public function destroy(FuelVendor $fuelVendor): RedirectResponse
    {
        $fuelVendor->delete();

        return redirect()
            ->route('fuel-vendors.index')
            ->with('success', 'Fuel vendor deleted successfully.');
    }
}
