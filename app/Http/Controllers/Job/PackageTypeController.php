<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\PackageType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PackageType::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $packageTypes = $query->paginate(10);

        return Inertia::render('Job/PackageTypes/Index', [
            'packageTypes' => $packageTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:package_types,name',
        ]);

        try {
            PackageType::create($validated);

            return redirect()->route('package-types.index')
                            ->with('success', 'Package type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create package type: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PackageType $packageType)
    {
        return Inertia::render('Job/PackageTypes/Edit', [
            'packageType' => $packageType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PackageType $packageType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:package_types,name,' . $packageType->id,
        ]);

        try {
            $packageType->update($validated);

            return redirect()->route('package-types.index')
                            ->with('success', 'Package type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update package type: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource in storage.
     */
    public function destroy(PackageType $packageType)
    {
        try {
            $packageType->delete();
            return redirect()->route('package-types.index')
                            ->with('success', 'Package type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete package type: ' . $e->getMessage()]);
        }
    }
}

