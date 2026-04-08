<?php

namespace App\Http\Controllers\Revenue;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RevenueTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('revenue_types')->whereNull('deleted_at');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $revenueTypes = $query->latest('id')->paginate(10);

        return Inertia::render('Revenue/RevenueTypes/Index', [
            'revenueTypes' => $revenueTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:revenue_types,name',
            'status' => 'required|string|in:active,inactive',
        ]);

        try {
            DB::table('revenue_types')->insert([
                'name' => $validated['name'],
                'status' => $validated['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return redirect()->route('revenue-types.index')
                ->with('success', 'Revenue type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create revenue type: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, int $revenue_type)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:revenue_types,name,' . $revenue_type,
            'status' => 'required|string|in:active,inactive',
        ]);

        try {
            DB::table('revenue_types')
                ->where('id', $revenue_type)
                ->whereNull('deleted_at')
                ->update([
                    'name' => $validated['name'],
                    'status' => $validated['status'],
                    'updated_at' => now(),
                ]);

            return redirect()->route('revenue-types.index')
                ->with('success', 'Revenue type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update revenue type: ' . $e->getMessage()]);
        }
    }

    public function destroy(int $revenue_type)
    {
        try {
            DB::table('revenue_types')
                ->where('id', $revenue_type)
                ->whereNull('deleted_at')
                ->update([
                    'deleted_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);

            return redirect()->route('revenue-types.index')
                ->with('success', 'Revenue type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete revenue type: ' . $e->getMessage()]);
        }
    }
}

