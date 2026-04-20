<?php

namespace App\Http\Controllers\Fuel;

use App\Http\Controllers\Controller;
use App\Models\Fuel;
use App\Services\FuelService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FuelController extends Controller
{
    private FuelService $fuelService;

    public function __construct(FuelService $fuelService)
    {
        $this->fuelService = $fuelService;
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Fuel/Fuels/Index', [
            'fuels'   => $this->fuelService->getFilteredFuels($search)->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Fuel/Fuels/Create', $this->fuelService->getFormData());
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id'     => ['required', 'exists:vehicles,id'],
            'driver_id'      => ['nullable', 'exists:drivers,id'],
            'fuel_type'      => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'fill_date'      => ['required', 'date'],
            'quantity'       => ['required', 'numeric', 'min:0.01'],
            'odometer'       => ['required', 'numeric', 'min:0'],
            'amount'         => ['required', 'numeric', 'min:0'],
            'source_type'    => ['required', 'in:tank,vendor'],
            'fuel_tank_id'   => ['nullable', 'exists:fuel_tanks,id'],
            'fuel_vendor_id' => ['nullable', 'exists:fuel_vendors,id'],
            'receipt'        => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'comment'        => ['nullable', 'string'],
        ]);

        try {
            $this->fuelService->createFuel($validated);

            return redirect()
                ->route('fuels.index')
                ->with('success', 'Fuel entry added successfully.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit(Fuel $fuel): Response
    {
        return Inertia::render('Fuel/Fuels/Edit', array_merge(
            $this->fuelService->getFormData(),
            ['fuel' => $fuel->load('vehicle', 'driver', 'fuelTank', 'fuelVendor')]
        ));
    }

    public function update(Request $request, Fuel $fuel): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id'     => ['required', 'exists:vehicles,id'],
            'driver_id'      => ['nullable', 'exists:drivers,id'],
            'fuel_type'      => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'fill_date'      => ['required', 'date'],
            'quantity'       => ['required', 'numeric', 'min:0.01'],
            'odometer'       => ['required', 'numeric', 'min:0'],
            'amount'         => ['required', 'numeric', 'min:0'],
            'source_type'    => ['required', 'in:tank,vendor'],
            'fuel_tank_id'   => ['nullable', 'exists:fuel_tanks,id'],
            'fuel_vendor_id' => ['nullable', 'exists:fuel_vendors,id'],
            'receipt'        => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'comment'        => ['nullable', 'string'],
        ]);

        try {
            $this->fuelService->updateFuel($fuel, $validated);

            return redirect()
                ->route('fuels.index')
                ->with('success', 'Fuel entry updated successfully.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Fuel $fuel): RedirectResponse
    {
        try {
            $this->fuelService->deleteFuel($fuel);

            return redirect()
                ->route('fuels.index')
                ->with('success', 'Fuel entry deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
