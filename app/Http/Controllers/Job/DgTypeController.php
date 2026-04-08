<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\DgType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DgTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = DgType::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $dgTypes = $query->paginate(10);

        return Inertia::render('Job/DgTypes/Index', [
            'dgTypes' => $dgTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:dg_types,name',
            'status' => 'boolean',
        ]);

        try {
            DgType::create($validated);

            return redirect()->route('dg-types.index')
                            ->with('success', 'DG Type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create DG type: ' . $e->getMessage()]);
        }
    }

    public function edit(DgType $dgType)
    {
        return Inertia::render('Job/DgTypes/Edit', [
            'dgType' => $dgType,
        ]);
    }

    public function update(Request $request, DgType $dgType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:dg_types,name,' . $dgType->id,
            'status' => 'boolean',
        ]);

        try {
            $dgType->update($validated);

            return redirect()->route('dg-types.index')
                            ->with('success', 'DG Type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update DG type: ' . $e->getMessage()]);
        }
    }

    public function destroy(DgType $dgType)
    {
        try {
            $dgType->delete();
            return redirect()->route('dg-types.index')
                            ->with('success', 'DG Type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete DG type: ' . $e->getMessage()]);
        }
    }
}

