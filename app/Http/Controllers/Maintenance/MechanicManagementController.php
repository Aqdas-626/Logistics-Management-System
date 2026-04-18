<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\MechanicManagement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MechanicManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = MechanicManagement::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('MaintenanceManagement/Mechanic/Index', [
            'mechanics' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['nullable', 'string', 'email', 'max:160', 'unique:mechanic_management,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'category' => ['nullable', 'string', 'max:80'],
        ]);

        MechanicManagement::create($validated);

        return redirect()
            ->route('mechanic-management.index')
            ->with('success', 'Mechanic created successfully.');
    }

    public function update(Request $request, MechanicManagement $mechanicManagement): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['nullable', 'string', 'email', 'max:160', Rule::unique('mechanic_management', 'email')->ignore($mechanicManagement->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'category' => ['nullable', 'string', 'max:80'],
        ]);

        $mechanicManagement->update($validated);

        return redirect()
            ->route('mechanic-management.index')
            ->with('success', 'Mechanic updated successfully.');
    }

    public function destroy(MechanicManagement $mechanicManagement): RedirectResponse
    {
        $mechanicManagement->delete();

        return redirect()
            ->route('mechanic-management.index')
            ->with('success', 'Mechanic deleted successfully.');
    }
}
