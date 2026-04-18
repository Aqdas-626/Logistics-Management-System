<?php

namespace App\Http\Controllers\Fuel;

use App\Http\Controllers\Controller;
use App\Models\FuelTank;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FuelTankController extends Controller
{
    private function filteredQuery(string $search)
    {
        $query = FuelTank::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('fuel_type', 'like', '%'.$search.'%')
                    ->orWhere('unit', 'like', '%'.$search.'%');
            });
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Fuel/Tanks/Index', [
            'tanks' => $this->filteredQuery($search)->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Fuel/Tanks/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'fuel_type' => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'capacity' => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'note' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        FuelTank::create($validated);

        return redirect()
            ->route('fuel-tanks.index')
            ->with('success', 'Fuel tank created successfully.');
    }

    public function edit(FuelTank $fuelTank): Response
    {
        return Inertia::render('Fuel/Tanks/Edit', [
            'tank' => $fuelTank,
        ]);
    }

    public function update(Request $request, FuelTank $fuelTank): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'fuel_type' => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'capacity' => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'note' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $fuelTank->update($validated);

        return redirect()
            ->route('fuel-tanks.index')
            ->with('success', 'Fuel tank updated successfully.');
    }

    public function destroy(FuelTank $fuelTank): RedirectResponse
    {
        $fuelTank->delete();

        return redirect()
            ->route('fuel-tanks.index')
            ->with('success', 'Fuel tank deleted successfully.');
    }
}
