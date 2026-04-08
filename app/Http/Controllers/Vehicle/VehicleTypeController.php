<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\VehicleType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = VehicleType::query()->orderBy('name');

        if ($search !== '') {
            $query->where('name', 'like', '%' . $search . '%');
        }

        return Inertia::render('Vehicle/Types/Index', [
            'vehicleTypes' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vehicle/Types/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:vehicle_types,name'],
            'max_weight_kg' => ['nullable', 'numeric', 'min:0'],
            'max_volume_m3' => ['nullable', 'numeric', 'min:0'],
        ]);

        VehicleType::create($validated);

        return redirect()
            ->route('vehicle-types.index')
            ->with('success', 'Vehicle type created successfully.');
    }

    public function edit(VehicleType $vehicleType): Response
    {
        return Inertia::render('Vehicle/Types/Edit', [
            'vehicleType' => $vehicleType,
        ]);
    }

    public function update(Request $request, VehicleType $vehicleType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:vehicle_types,name,' . $vehicleType->id],
            'max_weight_kg' => ['nullable', 'numeric', 'min:0'],
            'max_volume_m3' => ['nullable', 'numeric', 'min:0'],
        ]);

        $vehicleType->update($validated);

        return redirect()
            ->route('vehicle-types.index')
            ->with('success', 'Vehicle type updated successfully.');
    }

    public function destroy(VehicleType $vehicleType): RedirectResponse
    {
        $vehicleType->delete();

        return redirect()
            ->route('vehicle-types.index')
            ->with('success', 'Vehicle type deleted successfully.');
    }
}

