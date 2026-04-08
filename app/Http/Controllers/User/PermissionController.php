<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $permissionsQuery = Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name');

        if ($search !== '') {
            $permissionsQuery->where('name', 'like', '%' . $search . '%');
        }

        $permissions = $permissionsQuery->paginate(15)->withQueryString();

        return Inertia::render('User/Permissions/Index', [
            'permissions' => $permissions,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('User/Permissions/Create', [
            'permission' => [
                'name' => '',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('permissions', 'name')->where(fn ($q) => $q->where('guard_name', 'web')),
            ],
        ]);

        Permission::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return redirect()
            ->route('permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        try {
            $permission->delete();

            return redirect()
                ->route('permissions.index')
                ->with('success', 'Permission deleted successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to delete permission: ' . $e->getMessage());
        }
    }
}

