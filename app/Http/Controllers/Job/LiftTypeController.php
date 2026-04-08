<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\LiftType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LiftTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LiftType::query();

        // Search by name
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $liftTypes = $query->paginate(10);
        
        return Inertia::render('Job/LiftTypes/Index', [
            'liftTypes' => $liftTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Job/LiftTypes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:lift_types,name',
        ]);

        try {
            LiftType::create($validated);

            return redirect()->route('lift-types.index')
                            ->with('success', 'Lift Type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create Lift Type: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(LiftType $liftType)
    {
        return Inertia::render('Job/LiftTypes/Show', [
            'liftType' => $liftType,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LiftType $liftType)
    {
        return Inertia::render('Job/LiftTypes/Edit', [
            'liftType' => $liftType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LiftType $liftType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:lift_types,name,' . $liftType->id,
        ]);

        try {
            $liftType->update($validated);

            return redirect()->route('lift-types.index')
                            ->with('success', 'Lift Type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update Lift Type: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LiftType $liftType)
    {
        try {
            $liftType->delete();
            return redirect()->route('lift-types.index')
                            ->with('success', 'Lift Type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete Lift Type: ' . $e->getMessage()]);
        }
    }
}

