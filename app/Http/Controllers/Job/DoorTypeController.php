<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\DoorType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DoorTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DoorType::query();

        // Search by name
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $doorTypes = $query->paginate(10);
        
        return Inertia::render('Job/DoorTypes/Index', [
            'doorTypes' => $doorTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Job/DoorTypes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:door_types,name',
        ]);

        try {
            DoorType::create($validated);

            return redirect()->route('door-types.index')
                            ->with('success', 'Door Type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create Door Type: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(DoorType $doorType)
    {
        return Inertia::render('Job/DoorTypes/Show', [
            'doorType' => $doorType,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DoorType $doorType)
    {
        return Inertia::render('Job/DoorTypes/Edit', [
            'doorType' => $doorType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DoorType $doorType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:door_types,name,' . $doorType->id,
        ]);

        try {
            $doorType->update($validated);

            return redirect()->route('door-types.index')
                            ->with('success', 'Door Type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update Door Type: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DoorType $doorType)
    {
        try {
            $doorType->delete();
            return redirect()->route('door-types.index')
                            ->with('success', 'Door Type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete Door Type: ' . $e->getMessage()]);
        }
    }
}

