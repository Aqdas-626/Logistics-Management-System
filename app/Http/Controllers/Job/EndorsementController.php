<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\Endorsement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EndorsementController extends Controller
{
    public function index(Request $request)
    {
        $query = Endorsement::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $endorsements = $query->paginate(10);

        return Inertia::render('Job/Endorsements/Index', [
            'endorsements' => $endorsements,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:endorsements,name',
            'status' => 'boolean',
        ]);

        try {
            Endorsement::create($validated);

            return redirect()->route('endorsements.index')
                            ->with('success', 'Endorsement created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create endorsement: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Endorsement $endorsement)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:endorsements,name,' . $endorsement->id,
            'status' => 'boolean',
        ]);

        try {
            $endorsement->update($validated);

            return redirect()->route('endorsements.index')
                            ->with('success', 'Endorsement updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update endorsement: ' . $e->getMessage()]);
        }
    }

    public function destroy(Endorsement $endorsement)
    {
        try {
            $endorsement->delete();
            return redirect()->route('endorsements.index')
                            ->with('success', 'Endorsement deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete endorsement: ' . $e->getMessage()]);
        }
    }
}

