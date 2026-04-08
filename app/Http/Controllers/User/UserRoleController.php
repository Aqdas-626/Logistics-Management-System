<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    public function create(): Response
    {
        $roles = Role::query()
            ->where('guard_name', 'web')
            ->where('name', '!=', 'driver')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('User/Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $usersQuery = User::query()
            ->with('roles')
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'driver');
            })
            ->orderBy('name');

        if ($search !== '') {
            $usersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        $users = $usersQuery->paginate(15)->withQueryString();

        return Inertia::render('User/Users/Index', [
            'users' => $users,
            'filters' => ['search' => $search],
        ]);
    }

    public function edit(User $user): Response
    {
        if ($user->hasRole('driver')) {
            abort(404);
        }

        $roles = Role::query()
            ->where('guard_name', 'web')
            ->where('name', '!=', 'driver')
            ->orderBy('name')
            ->get(['id', 'name']);

        $user->load('roles');

        return Inertia::render('User/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
            'selectedRoleIds' => $user->roles->pluck('id')->all(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        if ($user->hasRole('driver')) {
            abort(404);
        }

        $validated = $request->validate([
            'roles' => ['nullable', 'array'],
            'roles.*' => [
                'integer',
                Rule::exists('roles', 'id')->where(function ($q) {
                    $q->where('name', '!=', 'driver');
                }),
            ],
        ]);

        $roleIds = $validated['roles'] ?? [];
        $user->syncRoles($roleIds);

        return redirect()
            ->route('user-roles.index')
            ->with('success', 'User roles updated successfully.');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_id' => [
                'nullable',
                'integer',
                Rule::exists('roles', 'id')->where(function ($q) {
                    $q->where('name', '!=', 'driver');
                }),
            ],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'status' => ($validated['is_active'] ?? true) ? 'active' : 'inactive',
        ]);

        if (!empty($validated['role_id'])) {
            $user->assignRole((int) $validated['role_id']);
        }

        return redirect()
            ->route('user-roles.index')
            ->with('success', 'User created successfully.');
    }
}

