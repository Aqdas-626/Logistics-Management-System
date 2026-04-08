<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\LocationType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = LocationType::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $locationTypes = $query->paginate(10);
        
        return Inertia::render('Job/LocationTypes/Index', [
            'locationTypes' => $locationTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:location_types,name',
        ]);

        try {
            LocationType::create($validated);

            return redirect()->route('location-types.index')
                            ->with('success', 'Location Type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create: ' . $e->getMessage()]);
        }
    }

    public function show(LocationType $locationType)
    {
        return Inertia::render('Job/LocationTypes/Show', [
            'locationType' => $locationType,
        ]);
    }

    public function edit(LocationType $locationType)
    {
        return Inertia::render('Job/LocationTypes/Edit', [
            'locationType' => $locationType,
        ]);
    }

    public function update(Request $request, LocationType $locationType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:location_types,name,' . $locationType->id,
        ]);

        try {
            $locationType->update($validated);

            return redirect()->route('-types.index')
                            ->with('success', 'Location Type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update: ' . $e->getMessage()]);
        }
    }

    public function destroy(LocationType $locationType)
    {
        try {
            $locationType->delete();
            return redirect()->route('location-types.index')
                            ->with('success', 'Location Type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete: ' . $e->getMessage()]);
        }
    }
}

