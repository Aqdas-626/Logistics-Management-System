<?php

namespace App\Http\Controllers\Route;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use App\Models\DriverVehicleAssignment;
use App\Models\JobQueue;
use App\Models\Location;
use App\Models\RoutePlan;
use App\Models\RoutePlanStop;
use App\Models\Shipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RoutePlanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();

        $query = RoutePlan::query()
            ->with([
                'company:id,name',
                'branch:id,name',
                'originLocation:id,name,city',
                'destinationLocation:id,name,city',
                'driverVehicleAssignment.driver:id,name,driver_code',
                'driverVehicleAssignment.vehicle:id,registration_no',
            ])
            ->withCount('stops')
            ->orderByDesc('plan_date')
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('route_code', 'like', '%'.$search.'%')
                    ->orWhere('route_name', 'like', '%'.$search.'%');
            });
        }

        if ($status !== '' && in_array($status, ['planned', 'started', 'completed', 'cancelled'], true)) {
            $query->where('status', $status);
        }

        return Inertia::render('RoutePlans/Index', [
            'routePlans' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('RoutePlans/Create', $this->formOptions());
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->input('route_code') === '') {
            $request->merge(['route_code' => null]);
        }

        $validated = $this->validatedPlanWithStops($request, null, true);

        DB::transaction(function () use ($validated, $request): void {
            $stops = $validated['stops'];
            unset($validated['stops']);

            if (empty($validated['route_code'])) {
                do {
                    $validated['route_code'] = 'RP-'.now()->format('Ymd').'-'.strtoupper(Str::random(4));
                } while (RoutePlan::withTrashed()->where('route_code', $validated['route_code'])->exists());
            }

            $validated['created_by'] = $request->user()?->id;
            $plan = RoutePlan::create($validated);

            $this->persistStops($plan, $stops);
        });

        return redirect()
            ->route('route-plans.index')
            ->with('success', 'Route plan created successfully.');
    }

    public function show(RoutePlan $routePlan): Response
    {
        $routePlan->load([
            'company:id,name',
            'branch:id,name',
            'originLocation:id,name,city,address_line_1',
            'destinationLocation:id,name,city,address_line_1',
            'driverVehicleAssignment.driver:id,name,driver_code,phone',
            'driverVehicleAssignment.vehicle:id,registration_no,name',
            'creator:id,name',
            'stops.location:id,name,city',
            'stops.shipment:id,shipment_no,status',
            'stops.jobQueue:id,status,jobable_type,jobable_id',
        ]);

        return Inertia::render('RoutePlans/Show', [
            'routePlan' => $routePlan,
        ]);
    }

    public function edit(RoutePlan $routePlan): Response
    {
        $routePlan->load(['stops' => fn ($q) => $q->orderBy('stop_order')->orderBy('id')]);

        return Inertia::render('RoutePlans/Edit', [
            'routePlan' => $routePlan,
            ...$this->formOptions(),
        ]);
    }

    public function update(Request $request, RoutePlan $routePlan): RedirectResponse
    {
        if ($request->input('route_code') === '') {
            $request->merge(['route_code' => null]);
        }

        $validated = $this->validatedPlanWithStops($request, $routePlan->id, false);

        DB::transaction(function () use ($validated, $routePlan): void {
            $stops = $validated['stops'];
            unset($validated['stops']);

            if (empty($validated['route_code'])) {
                unset($validated['route_code']);
            }

            $routePlan->update($validated);
            $routePlan->stops()->delete();
            $this->persistStops($routePlan->fresh(), $stops);
        });

        return redirect()
            ->route('route-plans.index')
            ->with('success', 'Route plan updated successfully.');
    }

    public function destroy(RoutePlan $routePlan): RedirectResponse
    {
        if (in_array($routePlan->status, ['started', 'completed'], true)) {
            return back()->with('error', 'Cannot delete a route that is started or completed. Cancel it first.');
        }

        $routePlan->delete();

        return redirect()
            ->route('route-plans.index')
            ->with('success', 'Route plan deleted successfully.');
    }

    public function updateStatus(Request $request, RoutePlan $routePlan): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['planned', 'started', 'completed', 'cancelled'])],
        ]);

        $newStatus = $validated['status'];
        $old = $routePlan->status;

        $allowed = match ($old) {
            'planned' => in_array($newStatus, ['started', 'cancelled', 'planned'], true),
            'started' => in_array($newStatus, ['completed', 'cancelled', 'started'], true),
            'completed' => $newStatus === 'completed',
            'cancelled' => in_array($newStatus, ['planned', 'cancelled'], true),
            default => false,
        };

        if (! $allowed) {
            return back()->with('error', 'Invalid status transition from '.$old.' to '.$newStatus.'.');
        }

        $routePlan->status = $newStatus;

        if ($newStatus === 'started' && $routePlan->started_at === null) {
            $routePlan->started_at = now();
        }

        if ($newStatus === 'completed') {
            $routePlan->completed_at = now();
        }

        if ($newStatus === 'planned' && $old === 'cancelled') {
            $routePlan->started_at = null;
            $routePlan->completed_at = null;
        }

        if ($newStatus === 'cancelled') {
            $routePlan->completed_at = null;
        }

        $routePlan->save();

        return back()->with('success', 'Route status updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        $assignments = DriverVehicleAssignment::query()
            ->where('status', 'active')
            ->with([
                'driver:id,name,driver_code',
                'vehicle:id,registration_no',
            ])
            ->orderByDesc('id')
            ->limit(500)
            ->get()
            ->map(fn (DriverVehicleAssignment $a) => [
                'id' => $a->id,
                'label' => ($a->driver?->name ?? 'Driver').' → '.($a->vehicle?->registration_no ?? 'Vehicle'),
            ]);

        $jobQueues = JobQueue::query()
            ->with('jobable')
            ->orderByDesc('id')
            ->limit(300)
            ->get()
            ->map(fn (JobQueue $q) => [
                'id' => $q->id,
                'label' => 'Queue #'.$q->id.' — '.$q->status
                    .($q->jobable ? ' ('.class_basename((string) $q->jobable_type).' #'.$q->jobable_id.')' : ''),
            ]);

        return [
            'companies' => Company::query()->orderBy('name')->get(['id', 'name']),
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name', 'company_id']),
            'locations' => Location::query()->orderBy('name')->get(['id', 'name', 'city', 'company_id']),
            'assignments' => $assignments,
            'shipments' => Shipment::query()->orderByDesc('id')->limit(300)->get(['id', 'shipment_no', 'status']),
            'jobQueues' => $jobQueues,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPlanWithStops(Request $request, ?int $ignoreRoutePlanId = null, bool $creating = false): array
    {
        $uniqueCode = Rule::unique('route_plans', 'route_code');
        if ($ignoreRoutePlanId) {
            $uniqueCode = $uniqueCode->ignore($ignoreRoutePlanId);
        }

        $statusRule = $creating
            ? ['required', Rule::in(['planned'])]
            : ['required', Rule::in(['planned', 'started', 'completed', 'cancelled'])];

        return $request->validate([
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'route_code' => ['nullable', 'string', 'max:50', $uniqueCode],
            'route_name' => ['required', 'string', 'max:150'],
            'plan_date' => ['required', 'date'],
            'scheduled_departure_at' => ['nullable', 'date'],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'origin_location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'destination_location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'driver_vehicle_assignment_id' => ['nullable', 'integer', 'exists:driver_vehicle_assignments,id'],
            'status' => $statusRule,
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],

            'stops' => ['required', 'array', 'min:1'],
            'stops.*.stop_name' => ['required', 'string', 'max:150'],
            'stops.*.location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'stops.*.latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'stops.*.longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'stops.*.position_recorded_at' => ['nullable', 'date'],
            'stops.*.shipment_id' => ['nullable', 'integer', 'exists:shipments,id'],
            'stops.*.job_queue_id' => ['nullable', 'integer', 'exists:job_queues,id'],
            'stops.*.eta_at' => ['nullable', 'date'],
            'stops.*.ata_at' => ['nullable', 'date'],
            'stops.*.status' => ['required', Rule::in(['pending', 'arrived', 'completed', 'skipped'])],
            'stops.*.notes' => ['nullable', 'string'],
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $stops
     */
    private function persistStops(RoutePlan $plan, array $stops): void
    {
        foreach ($stops as $index => $stop) {
            RoutePlanStop::create([
                'route_plan_id' => $plan->id,
                'stop_order' => $index + 1,
                'stop_name' => $stop['stop_name'],
                'location_id' => $stop['location_id'] ?? null,
                'latitude' => $stop['latitude'] ?? null,
                'longitude' => $stop['longitude'] ?? null,
                'position_recorded_at' => $stop['position_recorded_at'] ?? null,
                'shipment_id' => $stop['shipment_id'] ?? null,
                'job_queue_id' => $stop['job_queue_id'] ?? null,
                'eta_at' => $stop['eta_at'] ?? null,
                'ata_at' => $stop['ata_at'] ?? null,
                'status' => $stop['status'],
                'notes' => $stop['notes'] ?? null,
            ]);
        }
    }
}
