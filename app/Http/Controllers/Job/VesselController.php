<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\Vessel;
use App\Models\Country;
use App\Models\ShipType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VesselController extends Controller
{
    public function index(Request $request)
    {
        $query = Vessel::with(['country', 'shipType']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('imo_number', 'like', "%{$request->search}%");
        }

        $vessels = $query->paginate(10);
        $countries = Country::select('id', 'name')->get();
        $shipTypes = ShipType::select('id', 'name')->get();

        return Inertia::render('Vessels/Index', [
            'vessels' => $vessels,
            'countries' => $countries,
            'shipTypes' => $shipTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'country_id' => 'nullable|exists:countries,id',
            'ship_type_id' => 'nullable|exists:ship_types,id',
            'imo_number' => 'required|string|max:20|unique:vessels,imo_number',
            'mmsi' => 'nullable|string|max:20',
            'call_sign' => 'nullable|string|max:20',
            'built_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'status' => 'required|in:active,inactive',
        ]);

        try {
            Vessel::create($validated);

            return redirect()->route('vessels.index')
                            ->with('success', 'Vessel created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Vessel $vessel)
    {
        $vessel->load(['country', 'shipType']);

        return Inertia::render('Vessels/Show', [
            'vessel' => $vessel,
        ]);
    }

    public function update(Request $request, Vessel $vessel)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'country_id' => 'nullable|exists:countries,id',
            'ship_type_id' => 'nullable|exists:ship_types,id',
            'imo_number' => 'required|string|max:20|unique:vessels,imo_number,' . $vessel->id,
            'mmsi' => 'nullable|string|max:20',
            'call_sign' => 'nullable|string|max:20',
            'built_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'status' => 'required|in:active,inactive',
        ]);

        try {
            $vessel->update($validated);

            return redirect()->route('vessels.index')
                            ->with('success', 'Vessel updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Vessel $vessel)
    {
        try {
            $vessel->delete();
            return redirect()->route('vessels.index')
                            ->with('success', 'Vessel deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}

