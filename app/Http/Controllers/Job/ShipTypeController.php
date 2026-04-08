<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\ShipType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ShipType::query();

        // Search by name
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $shipTypes = $query->paginate(10);

        return Inertia::render('ShipTypes/Index', [
            'shipTypes' => $shipTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('ShipTypes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:ship_types,name',
        ]);

        try {
            ShipType::create($validated);

            return redirect()->route('ship_types.index')
                            ->with('success', 'Ship Type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create ship type: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ShipType $shipType)
    {
        return Inertia::render('ShipTypes/Show', [
            'shipType' => $shipType,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ShipType $shipType)
    {
        return Inertia::render('ShipTypes/Edit', [
            'shipType' => $shipType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ShipType $shipType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:ship_types,name,' . $shipType->id,
        ]);

        try {
            $shipType->update($validated);

            return redirect()->route('ship_types.index')
                            ->with('success', 'Ship Type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update ship type: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ShipType $shipType)
    {
        try {
            $shipType->delete();
            return redirect()->route('ship_types.index')
                            ->with('success', 'Ship Type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete ship type: ' . $e->getMessage()]);
        }
    }
}

