<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use App\Models\TraccarDevice;
use App\Models\Vehicle;
use App\Models\VehicleDocument;
use App\Models\VehicleFinancial;
use App\Models\VehicleGpsSetup;
use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $fleet = strtolower($request->string('fleet')->trim()->value());

        $query = Vehicle::query()
            ->with([
                'company:id,name',
                'branch:id,name',
                'vehicleType:id,name',
                'financial:id,vehicle_id,ownership_type',
                'documents:id,vehicle_id,registration_expiry,insurance_expiry',
                'driverAssignments' => function ($q): void {
                    $q->where('status', 'active')
                        ->whereNull('assigned_to')
                        ->with('driver:id,name')
                        ->orderByDesc('assigned_from');
                },
            ])
            ->orderByDesc('id');

        $this->applyFleetFilter($query, $fleet);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('registration_no', 'like', '%'.$search.'%')
                    ->orWhere('name', 'like', '%'.$search.'%')
                    ->orWhere('vin', 'like', '%'.$search.'%')
                    ->orWhere('chassis_no', 'like', '%'.$search.'%')
                    ->orWhere('engine_no', 'like', '%'.$search.'%')
                    ->orWhere('color', 'like', '%'.$search.'%')
                    ->orWhere('fuel_type', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('Vehicle/Index', [
            'vehicles' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'search' => $search,
                'fleet' => $fleet,
            ],
            'fleetCounts' => $this->fleetCounts(),
        ]);
    }

    /**
     * @param  Builder<Vehicle>  $query
     */
    private function applyFleetFilter($query, string $fleet): void
    {
        match ($fleet) {
            'active' => $query->whereRaw('LOWER(TRIM(COALESCE(status, ""))) = ?', ['active']),
            'inactive' => $query->whereRaw('LOWER(TRIM(COALESCE(status, ""))) != ?', ['active']),
            'low_fuel' => $query->whereNotNull('fuel_capacity')
                ->where('fuel_capacity', '>', 0)
                ->whereNotNull('current_fuel')
                ->whereRaw('current_fuel <= (fuel_capacity * 0.25)'),
            'expiries' => $query->whereHas('documents', function ($q): void {
                $threshold = now()->addDays(30);
                $q->where(function ($inner) use ($threshold): void {
                    $inner->whereNotNull('registration_expiry')
                        ->whereDate('registration_expiry', '<=', $threshold)
                        ->orWhere(function ($i2) use ($threshold): void {
                            $i2->whereNotNull('insurance_expiry')
                                ->whereDate('insurance_expiry', '<=', $threshold);
                        });
                });
            }),
            default => null,
        };
    }

    /**
     * @return array{all: int, active: int, inactive: int, low_fuel: int, expiries: int}
     */
    private function fleetCounts(): array
    {
        $base = Vehicle::query();

        $all = (clone $base)->count();
        $active = (clone $base)->whereRaw('LOWER(TRIM(COALESCE(status, ""))) = ?', ['active'])->count();
        $inactive = (clone $base)->whereRaw('LOWER(TRIM(COALESCE(status, ""))) != ?', ['active'])->count();
        $lowFuel = (clone $base)->whereNotNull('fuel_capacity')
            ->where('fuel_capacity', '>', 0)
            ->whereNotNull('current_fuel')
            ->whereRaw('current_fuel <= (fuel_capacity * 0.25)')
            ->count();

        $expiries = (clone $base)->whereHas('documents', function ($q): void {
            $threshold = now()->addDays(30);
            $q->where(function ($inner) use ($threshold): void {
                $inner->whereNotNull('registration_expiry')
                    ->whereDate('registration_expiry', '<=', $threshold)
                    ->orWhere(function ($i2) use ($threshold): void {
                        $i2->whereNotNull('insurance_expiry')
                            ->whereDate('insurance_expiry', '<=', $threshold);
                    });
            });
        })->count();

        return [
            'all' => $all,
            'active' => $active,
            'inactive' => $inactive,
            'low_fuel' => $lowFuel,
            'expiries' => $expiries,
        ];
    }

    public function create(): Response
    {
        return Inertia::render('Vehicle/Create', [
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name', 'company_id']),
            'vehicleTypes' => VehicleType::query()->orderBy('name')->get(['id', 'name']),
            'traccarDevices' => TraccarDevice::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'traccar_device_id', 'name', 'unique_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'vehicle_type_id' => ['nullable', 'integer', 'exists:vehicle_types,id'],
            'name' => ['nullable', 'string', 'max:160'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'registration_no' => [
                'required',
                'string',
                'max:60',
                Rule::unique('vehicles', 'registration_no')->where(function ($q) use ($request) {
                    return $q->where('company_id', $request->input('company_id'));
                }),
            ],
            'vin' => ['nullable', 'string', 'max:60'],
            'chassis_no' => ['nullable', 'string', 'max:60'],
            'engine_no' => ['nullable', 'string', 'max:60'],
            'color' => ['nullable', 'string', 'max:60'],
            'fuel_type' => ['nullable', Rule::in(['petrol', 'diesel', 'electric', 'hybrid'])],
            'fuel_capacity' => ['nullable', 'numeric', 'min:0'],
            'fuel_efficiency' => ['nullable', 'numeric', 'min:0'],
            'opening_fuel' => ['nullable', 'numeric', 'min:0'],
            'current_fuel' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:30'],
            'odometer_km' => ['nullable', 'numeric', 'min:0'],
            'documents' => ['nullable', 'array'],
            'documents.*.document_name' => ['required_with:documents.*.file', 'nullable', 'string', 'max:255'],
            'documents.*.file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:5120'],
            'documents.*.type' => ['nullable', Rule::in(['registration', 'insurance', 'other'])],
            'documents.*.registration_expiry' => ['nullable', 'date'],
            'documents.*.insurance_expiry' => ['nullable', 'date'],
            'financial' => ['nullable', 'array'],
            'financial.billing_method' => ['nullable', Rule::in(['per_km', 'per_trip', 'monthly', 'hourly'])],
            'financial.default_cost' => ['nullable', 'numeric', 'min:0'],
            'financial.ownership_type' => ['nullable', Rule::in(['company_owned', 'leased', 'rented', 'vendor_owned'])],
            'financial.currency' => ['nullable', 'string', 'max:10'],
            'financial.effective_from' => ['nullable', 'date'],
            'financial.effective_to' => ['nullable', 'date', 'after_or_equal:financial.effective_from'],
            'financial.notes' => ['nullable', 'string'],
            'gps' => ['nullable', 'array'],
            'gps.traccar_device_id' => ['nullable', 'integer', 'exists:traccar_devices,id'],
            'gps.api_username' => ['nullable', 'string', 'max:160'],
            'gps.imei' => ['nullable', 'string', 'max:50'],
            'gps.provider' => ['nullable', 'string', 'max:100'],
            'gps.auto_sync' => ['nullable', 'boolean'],
            'gps.last_synced_at' => ['nullable', 'date'],
            'gps.sync_message' => ['nullable', 'string'],
        ]);

        $documents = $validated['documents'] ?? [];
        $financial = $validated['financial'] ?? [];
        $gps = $validated['gps'] ?? [];
        unset($validated['documents'], $validated['financial'], $validated['gps']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('vehicles', 'public');
        }

        DB::transaction(function () use ($validated, $documents, $financial, $gps) {
            $vehicle = Vehicle::create($validated);

            foreach ($documents as $document) {
                if (! isset($document['file'])) {
                    continue;
                }

                VehicleDocument::create([
                    'vehicle_id' => $vehicle->id,
                    'document_name' => $document['document_name'] ?? 'Document',
                    'file' => $document['file']->store('vehicle-documents', 'public'),
                    'type' => $document['type'] ?? 'other',
                    'registration_expiry' => $document['registration_expiry'] ?? null,
                    'insurance_expiry' => $document['insurance_expiry'] ?? null,
                ]);
            }

            $hasFinancialData = collect($financial)
                ->filter(fn ($value) => $value !== null && $value !== '')
                ->isNotEmpty();

            if ($hasFinancialData) {
                VehicleFinancial::create([
                    'vehicle_id' => $vehicle->id,
                    'billing_method' => $financial['billing_method'] ?? 'per_km',
                    'default_cost' => $financial['default_cost'] ?? 0,
                    'ownership_type' => $financial['ownership_type'] ?? 'company_owned',
                    'currency' => $financial['currency'] ?? 'PKR',
                    'effective_from' => $financial['effective_from'] ?? null,
                    'effective_to' => $financial['effective_to'] ?? null,
                    'notes' => $financial['notes'] ?? null,
                ]);
            }

            $hasGpsData = collect($gps)
                ->filter(fn ($value) => $value !== null && $value !== '')
                ->isNotEmpty();

            if ($hasGpsData) {
                VehicleGpsSetup::create([
                    'vehicle_id' => $vehicle->id,
                    'traccar_device_id' => $gps['traccar_device_id'] ?? null,
                    'api_username' => $gps['api_username'] ?? null,
                    'imei' => $gps['imei'] ?? null,
                    'provider' => $gps['provider'] ?? 'Traccar',
                    'auto_sync' => $gps['auto_sync'] ?? true,
                    'last_synced_at' => $gps['last_synced_at'] ?? null,
                    'sync_message' => $gps['sync_message'] ?? null,
                ]);
            }
        });

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehicle created successfully.');
    }

    public function edit(Vehicle $vehicle): Response
    {
        return Inertia::render('Vehicle/Edit', [
            'vehicle' => $vehicle,
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name', 'company_id']),
            'vehicleTypes' => VehicleType::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'vehicle_type_id' => ['nullable', 'integer', 'exists:vehicle_types,id'],
            'name' => ['nullable', 'string', 'max:160'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'registration_no' => [
                'required',
                'string',
                'max:60',
                Rule::unique('vehicles', 'registration_no')
                    ->where(function ($q) use ($request) {
                        return $q->where('company_id', $request->input('company_id'));
                    })
                    ->ignore($vehicle->id),
            ],
            'vin' => ['nullable', 'string', 'max:60'],
            'chassis_no' => ['nullable', 'string', 'max:60'],
            'engine_no' => ['nullable', 'string', 'max:60'],
            'color' => ['nullable', 'string', 'max:60'],
            'fuel_type' => ['nullable', Rule::in(['petrol', 'diesel', 'electric', 'hybrid'])],
            'fuel_capacity' => ['nullable', 'numeric', 'min:0'],
            'fuel_efficiency' => ['nullable', 'numeric', 'min:0'],
            'opening_fuel' => ['nullable', 'numeric', 'min:0'],
            'current_fuel' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:30'],
            'odometer_km' => ['nullable', 'numeric', 'min:0'],
            'financial' => ['nullable', 'array'],
            'financial.billing_method' => ['nullable', Rule::in(['per_km', 'per_trip', 'monthly', 'hourly'])],
            'financial.default_cost' => ['nullable', 'numeric', 'min:0'],
            'financial.ownership_type' => ['nullable', Rule::in(['company_owned', 'leased', 'rented', 'vendor_owned'])],
            'financial.currency' => ['nullable', 'string', 'max:10'],
            'financial.effective_from' => ['nullable', 'date'],
            'financial.effective_to' => ['nullable', 'date', 'after_or_equal:financial.effective_from'],
            'financial.notes' => ['nullable', 'string'],
            'gps' => ['nullable', 'array'],
            'gps.traccar_device_id' => ['nullable', 'integer', 'exists:traccar_devices,id'],
            'gps.api_username' => ['nullable', 'string', 'max:160'],
            'gps.imei' => ['nullable', 'string', 'max:50'],
            'gps.provider' => ['nullable', 'string', 'max:100'],
            'gps.auto_sync' => ['nullable', 'boolean'],
            'gps.last_synced_at' => ['nullable', 'date'],
            'gps.sync_message' => ['nullable', 'string'],
        ]);

        $financial = $validated['financial'] ?? [];
        $gps = $validated['gps'] ?? [];
        unset($validated['financial'], $validated['gps']);

        if ($request->hasFile('image')) {
            if ($vehicle->image) {
                Storage::disk('public')->delete($vehicle->image);
            }
            $validated['image'] = $request->file('image')->store('vehicles', 'public');
        }

        $vehicle->update($validated);

        $hasFinancialData = collect($financial)
            ->filter(fn ($value) => $value !== null && $value !== '')
            ->isNotEmpty();

        if ($hasFinancialData) {
            VehicleFinancial::updateOrCreate(
                ['vehicle_id' => $vehicle->id],
                [
                    'billing_method' => $financial['billing_method'] ?? 'per_km',
                    'default_cost' => $financial['default_cost'] ?? 0,
                    'ownership_type' => $financial['ownership_type'] ?? 'company_owned',
                    'currency' => $financial['currency'] ?? 'PKR',
                    'effective_from' => $financial['effective_from'] ?? null,
                    'effective_to' => $financial['effective_to'] ?? null,
                    'notes' => $financial['notes'] ?? null,
                ],
            );
        }

        $hasGpsData = collect($gps)
            ->filter(fn ($value) => $value !== null && $value !== '')
            ->isNotEmpty();

        if ($hasGpsData) {
            VehicleGpsSetup::updateOrCreate(
                ['vehicle_id' => $vehicle->id],
                [
                    'traccar_device_id' => $gps['traccar_device_id'] ?? null,
                    'api_username' => $gps['api_username'] ?? null,
                    'imei' => $gps['imei'] ?? null,
                    'provider' => $gps['provider'] ?? 'Traccar',
                    'auto_sync' => $gps['auto_sync'] ?? true,
                    'last_synced_at' => $gps['last_synced_at'] ?? null,
                    'sync_message' => $gps['sync_message'] ?? null,
                ],
            );
        }

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehicle updated successfully.');
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $vehicle->delete();

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehicle deleted successfully.');
    }
}
