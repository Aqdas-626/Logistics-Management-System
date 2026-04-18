<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\TyreManagement;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TyreManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = TyreManagement::query()
            ->with(['vehicle:id,name,registration_no'])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('serial_number', 'like', '%'.$search.'%')
                    ->orWhere('brand_model', 'like', '%'.$search.'%')
                    ->orWhere('position', 'like', '%'.$search.'%')
                    ->orWhereHas('vehicle', function ($vq) use ($search) {
                        $vq->where('registration_no', 'like', '%'.$search.'%')
                            ->orWhere('name', 'like', '%'.$search.'%');
                    });
            });
        }

        $vehicles = Vehicle::query()
            ->orderBy('registration_no')
            ->get(['id', 'name', 'registration_no']);

        return Inertia::render('MaintenanceManagement/Tyre/Index', [
            'tyres' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->input('install_odometer_km') === '' || $request->input('install_odometer_km') === null) {
            $request->merge(['install_odometer_km' => null]);
        }

        $validated = $request->validate([
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'position' => ['required', 'string', 'max:80'],
            'serial_number' => ['nullable', 'string', 'max:120', 'unique:tyre_management,serial_number'],
            'brand_model' => ['nullable', 'string', 'max:160'],
            'install_date' => ['nullable', 'date'],
            'install_odometer_km' => ['nullable', 'integer', 'min:0'],
        ]);

        TyreManagement::create($validated);

        return redirect()
            ->route('tyre-management.index')
            ->with('success', 'Tyre added successfully.');
    }

    public function destroy(TyreManagement $tyreManagement): RedirectResponse
    {
        $tyreManagement->delete();

        return redirect()
            ->route('tyre-management.index')
            ->with('success', 'Tyre removed successfully.');
    }
}
