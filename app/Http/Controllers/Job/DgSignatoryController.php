<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\DgSignatory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DgSignatoryController extends Controller
{
    public function index(Request $request)
    {
        $query = DgSignatory::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('certificate_no', 'like', "%{$request->search}%");
        }

        $dgSignatories = $query->orderBy('is_active', 'desc')->paginate(10);

        return Inertia::render('Job/DgSignatories/Index', [
            'dgSignatories' => $dgSignatories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'certificate_no' => 'required|string|max:80|unique:dg_signatories,certificate_no',
            'expiry_date' => 'nullable|date|after_or_equal:today',
            'is_active' => 'boolean',
        ]);

        try {
            DgSignatory::create($validated);

            return redirect()->route('dg-signatories.index')
                            ->with('success', 'DG Signatory created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, DgSignatory $dgSignatory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'certificate_no' => 'required|string|max:80|unique:dg_signatories,certificate_no,' . $dgSignatory->id,
            'expiry_date' => 'nullable|date|after_or_equal:today',
            'is_active' => 'boolean',
        ]);

        try {
            $dgSignatory->update($validated);

            return redirect()->route('dg-signatories.index')
                            ->with('success', 'DG Signatory updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update: ' . $e->getMessage()]);
        }
    }

    public function destroy(DgSignatory $dgSignatory)
    {
        try {
            $dgSignatory->delete();
            return redirect()->route('dg-signatories.index')
                            ->with('success', 'DG Signatory deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete: ' . $e->getMessage()]);
        }
    }
}

