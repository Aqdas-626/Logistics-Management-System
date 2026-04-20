<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class DriverController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $driversQuery = Driver::query()
            ->with(['company:id,name', 'user:id,name,email'])
            ->orderBy('name');

        if ($search !== '') {
            $driversQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('driver_code', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        return Inertia::render('Driver/Index', [
            'drivers' => $driversQuery->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Driver/Create', [
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'driver_code' => [
                'required',
                'string',
                'max:60',
                Rule::unique('drivers', 'driver_code')->where(function ($q) use ($request) {
                    return $q->where('company_id', $request->input('company_id'));
                }),
            ],
            'name' => ['required', 'string', 'max:200'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'license_no' => ['nullable', 'string', 'max:100'],
            'license_expiry' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $driverRole = Role::query()
            ->where('name', 'driver')
            ->where('guard_name', 'web')
            ->first();

        if (!$driverRole) {
            return back()->withErrors([
                'role' => 'Driver role not found. Please create role "driver" first.',
            ]);
        }

        DB::transaction(function () use ($validated, $driverRole) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => $validated['password'],
                'status' => $validated['status'] ?? 'active',
            ]);

            $user->assignRole($driverRole->name);

            Driver::create([
                'company_id' => $validated['company_id'],
                'user_id' => $user->id,
                'driver_code' => $validated['driver_code'],
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'license_no' => $validated['license_no'] ?? null,
                'license_expiry' => $validated['license_expiry'] ?? null,
                'status' => $validated['status'] ?? 'active',
            ]);
            
            DB::afterCommit(fn () => event(new Registered($user)));
        });

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Driver created successfully. Verification email sent.');
    }

    public function edit(Driver $driver): Response
    {
        $driver->load('user:id,name,email,phone,status');

        return Inertia::render('Driver/Edit', [
            'driver' => $driver,
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Driver $driver): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'driver_code' => [
                'required',
                'string',
                'max:60',
                Rule::unique('drivers', 'driver_code')
                    ->where(function ($q) use ($request) {
                        return $q->where('company_id', $request->input('company_id'));
                    })
                    ->ignore($driver->id),
            ],
            'name' => ['required', 'string', 'max:200'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => [
                'nullable',
                'email',
                'max:160',
                Rule::unique('users', 'email')->ignore($driver->user_id),
            ],
            'license_no' => ['nullable', 'string', 'max:100'],
            'license_expiry' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        DB::transaction(function () use ($validated, $driver) {
            if ($driver->user) {
                $newEmail = $validated['email'] ?? $driver->user->email;
                $shouldSendVerification = $newEmail !== $driver->user->email;

                $userUpdate = [
                    'name' => $validated['name'],
                    'email' => $newEmail,
                    'phone' => $validated['phone'] ?? null,
                    'status' => $validated['status'] ?? 'active',
                ];

                if ($shouldSendVerification) {
                    $userUpdate['email_verified_at'] = null;
                }

                if (!empty($validated['password'])) {
                    $userUpdate['password'] = $validated['password'];
                }

                $driver->user->update($userUpdate);

                if ($shouldSendVerification) {
                    $userForNotification = $driver->user->fresh();
                    DB::afterCommit(fn () => event(new Registered($userForNotification)));
                }
            }

            $driver->update([
                'company_id' => $validated['company_id'],
                'driver_code' => $validated['driver_code'],
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'license_no' => $validated['license_no'] ?? null,
                'license_expiry' => $validated['license_expiry'] ?? null,
                'status' => $validated['status'] ?? 'active',
            ]);
        });

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Driver updated successfully.');
    }

    public function destroy(Driver $driver): RedirectResponse
    {
        DB::transaction(function () use ($driver) {
            if ($driver->user) {
                $driver->user->delete();
            }

            $driver->delete();
        });

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Driver deleted successfully.');
    }
}

