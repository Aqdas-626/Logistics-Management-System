<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceVendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceVendorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = MaintenanceVendor::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('MaintenanceManagement/Maintenance/Vendors/Index', [
            'vendors' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['nullable', 'string', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        MaintenanceVendor::create($validated);

        return redirect()
            ->route('maintenance-vendors.index')
            ->with('success', 'Maintenance vendor created successfully.');
    }

    public function update(Request $request, MaintenanceVendor $maintenanceVendor): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['nullable', 'string', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $maintenanceVendor->update($validated);

        return redirect()
            ->route('maintenance-vendors.index')
            ->with('success', 'Maintenance vendor updated successfully.');
    }

    public function destroy(MaintenanceVendor $maintenanceVendor): RedirectResponse
    {
        $maintenanceVendor->delete();

        return redirect()
            ->route('maintenance-vendors.index')
            ->with('success', 'Maintenance vendor deleted successfully.');
    }
}
