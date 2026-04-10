<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Vehicle;
use App\Models\VehicleType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = Vehicle::query()
            ->with(['company:id,name', 'branch:id,name', 'vehicleType:id,name'])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('registration_no', 'like', '%'.$search.'%')
                    ->orWhere('vin', 'like', '%'.$search.'%')
                    ->orWhere('chassis_no', 'like', '%'.$search.'%')
                    ->orWhere('engine_no', 'like', '%'.$search.'%')
                    ->orWhere('color', 'like', '%'.$search.'%')
                    ->orWhere('fuel_type', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('Vehicle/Index', [
            'vehicles' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vehicle/Create', [
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name', 'company_id']),
            'vehicleTypes' => VehicleType::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'vehicle_type_id' => ['nullable', 'integer', 'exists:vehicle_types,id'],
            'registration_no' => [
                'required',
                'string',
                'max:60',
                Rule::unique('vehicles', 'registration_no')->where(function ($q) use ($request) {
                    return $q->where('company_id', $request->input('company_id'));
                }),
            ],
            'vin' => ['nullable', 'string', 'max:60'],
            'chassis_no' => ['nullable', 'string', 'max:60'],
            'engine_no' => ['nullable', 'string', 'max:60'],
            'color' => ['nullable', 'string', 'max:60'],
            'fuel_type' => ['nullable', Rule::in(['petrol', 'diesel', 'electric', 'hybrid'])],
            'fuel_capacity' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:30'],
            'odometer_km' => ['nullable', 'numeric', 'min:0'],
        ]);

        Vehicle::create($validated);

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehicle created successfully.');
    }

    public function edit(Vehicle $vehicle): Response
    {
        return Inertia::render('Vehicle/Edit', [
            'vehicle' => $vehicle,
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name', 'company_id']),
            'vehicleTypes' => VehicleType::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'vehicle_type_id' => ['nullable', 'integer', 'exists:vehicle_types,id'],
            'registration_no' => [
                'required',
                'string',
                'max:60',
                Rule::unique('vehicles', 'registration_no')
                    ->where(function ($q) use ($request) {
                        return $q->where('company_id', $request->input('company_id'));
                    })
                    ->ignore($vehicle->id),
            ],
            'vin' => ['nullable', 'string', 'max:60'],
            'chassis_no' => ['nullable', 'string', 'max:60'],
            'engine_no' => ['nullable', 'string', 'max:60'],
            'color' => ['nullable', 'string', 'max:60'],
            'fuel_type' => ['nullable', Rule::in(['petrol', 'diesel', 'electric', 'hybrid'])],
            'fuel_capacity' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:30'],
            'odometer_km' => ['nullable', 'numeric', 'min:0'],
        ]);

        $vehicle->update($validated);

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehicle updated successfully.');
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $vehicle->delete();

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehicle deleted successfully.');
    }
}
