<?php

namespace App\Http\Controllers\Fuel;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Fuel;
use App\Models\FuelTank;
use App\Models\FuelVendor;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FuelController extends Controller
{
    private function formData(): array
    {
        return [
            'vehicles' => Vehicle::orderBy('name')->get(['id', 'name', 'registration_no']),
            'drivers' => Driver::orderBy('name')->get(['id', 'name']),
            'fuelTanks' => FuelTank::where('is_active', true)->orderBy('name')->get(['id', 'name', 'current_stock']),
            'fuelVendors' => FuelVendor::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ];
    }

    private function filteredQuery(string $search)
    {
        $query = Fuel::with('vehicle', 'driver', 'fuelTank', 'fuelVendor')->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('fuel_type', 'like', '%'.$search.'%')
                    ->orWhere('source_type', 'like', '%'.$search.'%')
                    ->orWhereHas('vehicle', fn ($v) => $v->where('name', 'like', '%'.$search.'%'))
                    ->orWhereHas('driver', fn ($d) => $d->where('name', 'like', '%'.$search.'%'));
            });
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Fuel/Fuels/Index', [
            'fuels' => $this->filteredQuery($search)->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Fuel/Fuels/Create', $this->formData());
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
            'fuel_type' => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'fill_date' => ['required', 'date'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'odometer' => ['required', 'numeric', 'min:0'],
            'amount' => ['required', 'numeric', 'min:0'],
            'source_type' => ['required', 'in:tank,vendor'],
            'fuel_tank_id' => ['nullable', 'exists:fuel_tanks,id'],
            'fuel_vendor_id' => ['nullable', 'exists:fuel_vendors,id'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'comment' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('receipt')) {
            $validated['receipt'] = $request->file('receipt')->store('fuel/receipts', 'public');
        }

        $validated['created_by'] = auth()->id();

        // Deduct from tank if source is tank
        if ($validated['source_type'] === 'tank' && ! empty($validated['fuel_tank_id'])) {
            $tank = FuelTank::find($validated['fuel_tank_id']);
            if ($tank) {
                $tank->decrement('current_stock', $validated['quantity']);
            }
        }

        Fuel::create($validated);

        return redirect()
            ->route('fuels.index')
            ->with('success', 'Fuel entry added successfully.');
    }

    public function edit(Fuel $fuel): Response
    {
        return Inertia::render('Fuel/Fuels/Edit', array_merge(
            $this->formData(),
            ['fuel' => $fuel->load('vehicle', 'driver', 'fuelTank', 'fuelVendor')]
        ));
    }

    public function update(Request $request, Fuel $fuel): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'driver_id' => ['nullable', 'exists:drivers,id'],
            'fuel_type' => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'fill_date' => ['required', 'date'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'odometer' => ['required', 'numeric', 'min:0'],
            'amount' => ['required', 'numeric', 'min:0'],
            'source_type' => ['required', 'in:tank,vendor'],
            'fuel_tank_id' => ['nullable', 'exists:fuel_tanks,id'],
            'fuel_vendor_id' => ['nullable', 'exists:fuel_vendors,id'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'comment' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('receipt')) {
            if ($fuel->receipt) {
                Storage::disk('public')->delete($fuel->receipt);
            }
            $validated['receipt'] = $request->file('receipt')->store('fuel/receipts', 'public');
        }

        $fuel->update($validated);

        return redirect()
            ->route('fuels.index')
            ->with('success', 'Fuel entry updated successfully.');
    }

    public function destroy(Fuel $fuel): RedirectResponse
    {
        if ($fuel->receipt) {
            Storage::disk('public')->delete($fuel->receipt);
        }

        $fuel->delete();

        return redirect()
            ->route('fuels.index')
            ->with('success', 'Fuel entry deleted successfully.');
    }
}
