<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\Shipping;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShippingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Shipping::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
        }

        $shippings = $query->paginate(10);

        return Inertia::render('Shippings/Index', [
            'shippings' => $shippings,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:shippings,name',
            'code' => 'nullable|string|max:50|unique:shippings,code',
            'status' => 'boolean',
        ]);

        try {
            Shipping::create($validated);

            return redirect()->route('shippings.index')
                            ->with('success', 'Shipping created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create shipping: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Shipping $shipping)
    {
        return Inertia::render('Shippings/Show', [
            'shipping' => $shipping,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Shipping $shipping)
    {
        return Inertia::render('Shippings/Edit', [
            'shipping' => $shipping,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Shipping $shipping)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:shippings,name,' . $shipping->id,
            'code' => 'nullable|string|max:50|unique:shippings,code,' . $shipping->id,
            'status' => 'boolean',
        ]);

        try {
            $shipping->update($validated);

            return redirect()->route('shippings.index')
                            ->with('success', 'Shipping updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update shipping: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shipping $shipping)
    {
        try {
            $shipping->delete();
            return redirect()->route('shippings.index')
                            ->with('success', 'Shipping deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete shipping: ' . $e->getMessage()]);
        }
    }
}

