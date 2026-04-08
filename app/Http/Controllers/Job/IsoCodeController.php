<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\IsoCode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IsoCodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = IsoCode::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
        }

        $isoCodes = $query->paginate(10);

        return Inertia::render('Job/IsoCodes/Index', [
            'isoCodes' => $isoCodes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:iso_codes,name',
            'code' => 'nullable|string|max:30|unique:iso_codes,code',
            'status' => 'boolean',
        ]);

        try {
            IsoCode::create($validated);

            return redirect()->route('iso-codes.index')
                            ->with('success', 'ISO Code created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create ISO code: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(IsoCode $isoCode)
    {
        return Inertia::render('Job/IsoCodes/Show', [
            'isoCode' => $isoCode,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(IsoCode $isoCode)
    {
        return Inertia::render('Job/IsoCodes/Edit', [
            'isoCode' => $isoCode,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, IsoCode $isoCode)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:iso_codes,name,' . $isoCode->id,
            'code' => 'nullable|string|max:30|unique:iso_codes,code,' . $isoCode->id,
            'status' => 'boolean',
        ]);

        try {
            $isoCode->update($validated);

            return redirect()->route('iso-codes.index')
                            ->with('success', 'ISO Code updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update ISO code: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(IsoCode $isoCode)
    {
        try {
            $isoCode->delete();
            return redirect()->route('iso-codes.index')
                            ->with('success', 'ISO Code deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete ISO code: ' . $e->getMessage()]);
        }
    }
}

