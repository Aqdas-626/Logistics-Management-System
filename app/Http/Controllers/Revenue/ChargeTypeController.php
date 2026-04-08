<?php

namespace App\Http\Controllers\Revenue;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChargeTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('charge_types');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $chargeTypes = $query->latest('id')->paginate(10);

        return Inertia::render('Revenue/ChargeTypes/Index', [
            'chargeTypes' => $chargeTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:charge_types,name',
            'status' => 'required|string|in:active,inactive',
        ]);

        try {
            DB::table('charge_types')->insert([
                'name' => $validated['name'],
                'status' => $validated['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return redirect()->route('charge-types.index')
                ->with('success', 'Charge type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create charge type: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, int $charge_type)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:charge_types,name,' . $charge_type,
            'status' => 'required|string|in:active,inactive',
        ]);

        try {
            DB::table('charge_types')
                ->where('id', $charge_type)
                ->update([
                    'name' => $validated['name'],
                    'status' => $validated['status'],
                    'updated_at' => now(),
                ]);

            return redirect()->route('charge-types.index')
                ->with('success', 'Charge type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update charge type: ' . $e->getMessage()]);
        }
    }

    public function destroy(int $charge_type)
    {
        try {
            DB::table('charge_types')->where('id', $charge_type)->delete();

            return redirect()->route('charge-types.index')
                ->with('success', 'Charge type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete charge type: ' . $e->getMessage()]);
        }
    }
}

