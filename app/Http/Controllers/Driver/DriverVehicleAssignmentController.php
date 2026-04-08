<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Driver;
use App\Models\DriverVehicleAssignment;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DriverVehicleAssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = DriverVehicleAssignment::query()
            ->with([
                'company:id,name',
                'driver:id,name,driver_code',
                'vehicle:id,registration_no',
            ])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereHas('driver', function ($driverQuery) use ($search) {
                    $driverQuery
                        ->where('name', 'like', '%' . $search . '%')
                        ->orWhere('driver_code', 'like', '%' . $search . '%');
                })->orWhereHas('vehicle', function ($vehicleQuery) use ($search) {
                    $vehicleQuery->where('registration_no', 'like', '%' . $search . '%');
                });
            });
        }

        return Inertia::render('Driver/Assignments/Index', [
            'assignments' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Driver/Assignments/Create', [
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'drivers' => Driver::query()->orderBy('name')->get(['id', 'name', 'driver_code', 'company_id']),
            'vehicles' => Vehicle::query()->orderBy('registration_no')->get(['id', 'registration_no', 'company_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'driver_id' => ['required', 'integer', 'exists:drivers,id'],
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'assigned_from' => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'date', 'after_or_equal:assigned_from'],
            'status' => ['required', 'string', 'max:30', Rule::in(['active', 'inactive'])],
        ]);

        DriverVehicleAssignment::create($validated);

        return redirect()
            ->route('driver-vehicle-assignments.index')
            ->with('success', 'Driver vehicle assignment created successfully.');
    }

    public function edit(DriverVehicleAssignment $driverVehicleAssignment): Response
    {
        return Inertia::render('Driver/Assignments/Edit', [
            'assignment' => $driverVehicleAssignment,
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'drivers' => Driver::query()->orderBy('name')->get(['id', 'name', 'driver_code', 'company_id']),
            'vehicles' => Vehicle::query()->orderBy('registration_no')->get(['id', 'registration_no', 'company_id']),
        ]);
    }

    public function update(Request $request, DriverVehicleAssignment $driverVehicleAssignment): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'driver_id' => ['required', 'integer', 'exists:drivers,id'],
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'assigned_from' => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'date', 'after_or_equal:assigned_from'],
            'status' => ['required', 'string', 'max:30', Rule::in(['active', 'inactive'])],
        ]);

        $driverVehicleAssignment->update($validated);

        return redirect()
            ->route('driver-vehicle-assignments.index')
            ->with('success', 'Driver vehicle assignment updated successfully.');
    }

    public function destroy(DriverVehicleAssignment $driverVehicleAssignment): RedirectResponse
    {
        $driverVehicleAssignment->delete();

        return redirect()
            ->route('driver-vehicle-assignments.index')
            ->with('success', 'Driver vehicle assignment deleted successfully.');
    }
}
