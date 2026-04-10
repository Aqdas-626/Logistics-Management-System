<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\ChargeType;
use App\Models\Container;
use App\Models\Customer;
use App\Models\Dispatch;
use App\Models\DriverVehicleAssignment;
use App\Models\Endorsement;
use App\Models\Export;
use App\Models\Import;
use App\Models\JobDocument;
use App\Models\JobNote;
use App\Models\JobQueue;
use App\Models\JobStatusHistory;
use App\Models\Location;
use App\Models\Swing;
use App\Support\JobFinancialShowData;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JobQueueController extends Controller
{
    private const STATUSES = [
        'PENDING_TBA',
        'ACTIVE',
        'IN_PROCESS',
        'DISPATCH',
        'DELIVERED',
        'CANCELLED',
    ];

    public function index(Request $request): Response
    {
        $status = $request->string('status')->trim()->value();
        $movementType = $request->string('movement_type')->trim()->value();
        $search = $request->string('search')->trim()->value();
        $perPage = $request->integer('per_page', 25);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 25;
        }

        $query = JobQueue::query()
            ->with([
                'jobable',
                'latestDispatch.driverVehicleAssignment.driver:id,name,driver_code',
                'latestDispatch.driverVehicleAssignment.vehicle:id,registration_no',
            ])
            ->orderByDesc('id');

        if ($status !== '') {
            // Some "status" cards are derived from Container fields (not JobQueue.status).
            // Apply the appropriate filter so clicking cards returns the expected rows.
            if (in_array($status, self::STATUSES, true)) {
                $query->where('status', $status);
            } else {
                $typeMap = [
                    Import::class => 'import',
                    Export::class => 'export',
                    Cart::class => 'cart',
                    Swing::class => 'swing',
                ];

                $jobQueueTable = $query->getModel()->getTable(); // job_queues
                $containerTable = (new Container)->getTable(); // containers

                $containerScope = match ($status) {
                    'URGENT' => function ($c) {
                        $c->whereDate('available_date', '<=', now()->toDateString());
                    },
                    'DEMURRAGE' => function ($c) {
                        $c->whereNotNull('demurrage_date');
                    },
                    'DETENTION' => function ($c) {
                        $c->where('detention_days', '>', 0);
                    },
                    'DG' => function ($c) {
                        $c->where('dgs', true);
                    },
                    // Frontend uses LIVE_UL; support common alias too.
                    'LIVE_UL', 'LIVE_UNLOAD' => function ($c) {
                        $c->where('live_ul', true);
                    },
                    default => null,
                };

                if ($containerScope) {
                    $query->where(function ($q) use ($typeMap, $containerScope, $jobQueueTable, $containerTable) {
                        foreach ($typeMap as $jobableType => $jobType) {
                            $q->orWhere(function ($qq) use ($jobableType, $jobType, $containerScope, $jobQueueTable, $containerTable) {
                                $qq->where('jobable_type', $jobableType)
                                    ->whereExists(function ($sub) use ($jobType, $containerScope, $jobQueueTable, $containerTable) {
                                        $containerScope($sub->selectRaw('1')->from($containerTable)
                                            ->whereColumn($containerTable.'.job_id', $jobQueueTable.'.jobable_id')
                                            ->where($containerTable.'.job_type', $jobType));
                                    });
                            });
                        }
                    });
                } else {
                    // Unknown status: keep previous behavior (JobQueue.status).
                    $query->where('status', $status);
                }
            }
        }

        if ($movementType !== '') {
            $query->where('jobable_type', $movementType);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('status', 'like', '%'.$search.'%')
                    ->orWhere('jobable_type', 'like', '%'.$search.'%')
                    ->orWhere('jobable_id', 'like', '%'.$search.'%')
                    ->orWhereHas('jobable', function ($jobableQuery) use ($search) {
                        $jobableQuery->where('job_number', 'like', '%'.$search.'%')
                            ->orWhere('job_no', 'like', '%'.$search.'%');
                    });
            });
        }

        $jobQueues = $query->paginate($perPage)->withQueryString();

        $jobQueues->getCollection()->transform(function (JobQueue $queue) {
            $container = $this->resolveContainerForQueue($queue);
            $jobable = $queue->jobable;
            if ($jobable) {
                // Polymorphic eager-loading isn't always reliable across morph types,
                // so ensure customer data is loaded for the specific jobable model instance.
                $jobable->loadMissing(['customer.country']);
            }

            return [
                'id' => $queue->id,
                'status' => $queue->status,
                'jobable_type' => $queue->jobable_type,
                'jobable_id' => $queue->jobable_id,
                'job_number' => $queue->jobable?->job_number ?? $queue->jobable?->job_no ?? null,
                'container_number' => $container?->container_number,
                'from_location' => $container?->from_location,
                'to_location' => $container?->to_location,
                'iso_code' => $container?->isoCode?->code ?? $container?->isoCode?->name ?? null,
                'weight' => $container?->weight,
                'truck' => $queue->latestDispatch?->driverVehicleAssignment?->vehicle?->registration_no,
                'available_date' => $container?->available_date,
                'dg' => (bool) ($container?->dgs ?? false),
                // For Import/Export/Cart/Swing there is no JobBooking linkage anymore,
                // so branch/sender/receiver details are not available from Container.
                'branch_name' => null,
                // On Import/Export/Cart/Swing show pages, the customer comes from jobable->customer.
                'customer_name' => $jobable?->customer?->name,
                'customer_code' => $jobable?->customer?->customer_code,
                'customer_country' => $jobable?->customer?->country?->name,
                // Use the main customer as a best-effort fallback.
                'sender_customer_name' => $jobable?->customer?->name,
                'sender_customer_code' => $jobable?->customer?->customer_code,
                'sender_customer_country' => $jobable?->customer?->country?->name,
                'receiver_customer_name' => $jobable?->customer?->name,
                'receiver_customer_code' => $jobable?->customer?->customer_code,
                'receiver_customer_country' => $jobable?->customer?->country?->name,
                'ef' => null,
                'release_random' => $container?->random_number,
                'ecn' => $container?->release_ecn_number,
                'job_type' => $container?->job_type,
                'trip_code' => null,
                'created_date' => $queue->created_at?->toDateString(),
                'live_ul' => (bool) ($container?->live_ul ?? false),
                'demurrage_date' => $container?->demurrage_date,
                'detention_days' => $container?->detention_days,
                'do_after_date' => $this->calculateDoAfterDate($container),
                'shipping_line' => $container?->shipping?->code ?? $container?->shipping?->name,
                'dispatched_at' => $queue->latestDispatch?->dispatched_at?->toDateString(),
                'completed_at' => $queue->latestDispatch?->completed_at?->toDateString(),
                'driver_vehicle_assignment_id' => $queue->latestDispatch?->driver_vehicle_assignment_id,
            ];
        });

        $statusCounts = $this->buildStatusCards();

        return Inertia::render('Job/Queue/Index', [
            'jobQueues' => $jobQueues,
            'filters' => [
                'status' => $status,
                'movement_type' => $movementType,
                'search' => $search,
                'per_page' => $perPage,
            ],
            'statusOptions' => self::STATUSES,
            'movementTypeOptions' => [
                Import::class => 'Import',
                Export::class => 'Export',
                Cart::class => 'Cart',
                Swing::class => 'Swing',
            ],
            'statusCounts' => $statusCounts,
            'dispatchAssignments' => DriverVehicleAssignment::query()
                ->with(['driver:id,name,driver_code', 'vehicle:id,registration_no'])
                ->where('status', 'active')
                ->orderByDesc('id')
                ->get(['id', 'driver_id', 'vehicle_id']),
            'jobQueueChargeTypes' => ChargeType::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name']),
            'hubLocations' => Location::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'location_code']),
        ]);
    }

    /**
     * JSON payload for the job queue edit modal (revenue / cost lines).
     */
    public function financials(JobQueue $jobQueue): JsonResponse
    {
        $type = $jobQueue->jobable_type;
        $id = (int) $jobQueue->jobable_id;

        if ($type === '' || $type === null || $id < 1) {
            return response()->json([
                'revenues' => [],
                'costs' => [],
                'jobNotes' => [],
                'endorsements' => [],
                'jobable_type' => '',
                'jobable_id' => null,
            ]);
        }

        $allowed = [Import::class, Export::class, Cart::class, Swing::class];
        if (! in_array($type, $allowed, true)) {
            return response()->json([
                'revenues' => [],
                'costs' => [],
                'jobNotes' => [],
                'endorsements' => [],
                'jobable_type' => $type,
                'jobable_id' => $id,
            ]);
        }

        $data = JobFinancialShowData::for($type, $id);

        $jobNotes = JobNote::query()
            ->where('jobable_type', $type)
            ->where('jobable_id', $id)
            ->with('endorsement:id,name')
            ->latest()
            ->get();

        $endorsements = Endorsement::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json([
            'revenues' => $data['revenues'],
            'costs' => $data['costs'],
            'jobNotes' => $jobNotes,
            'endorsements' => $endorsements,
            'jobable_type' => $data['jobableType'],
            'jobable_id' => $id,
        ]);
    }

    public function dispatch(Request $request, JobQueue $jobQueue): RedirectResponse
    {
        $validated = $request->validate([
            'driver_vehicle_assignment_id' => [
                'required',
                'integer',
                Rule::exists('driver_vehicle_assignments', 'id')
                    ->where(fn ($q) => $q->where('status', 'active')),
            ],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        Dispatch::create([
            'job_queue_id' => $jobQueue->id,
            'driver_vehicle_assignment_id' => $validated['driver_vehicle_assignment_id'],
            'dispatched_at' => now(),
            'status' => 'IN_PROCESS',
            'notes' => $validated['notes'] ?? null,
        ]);

        $oldStatus = $jobQueue->status;
        $jobQueue->update([
            'status' => 'IN_PROCESS',
        ]);
        $this->recordStatusHistory($jobQueue, $oldStatus, 'IN_PROCESS', $request->user()?->id);

        return redirect()->route('job-queues.index')->with('success', 'Job dispatched successfully.');
    }

    public function updateStatus(Request $request, JobQueue $jobQueue): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(self::STATUSES)],
        ]);

        $oldStatus = $jobQueue->status;
        $jobQueue->update([
            'status' => $validated['status'],
        ]);

        $this->recordStatusHistory($jobQueue, $oldStatus, $validated['status'], $request->user()?->id);

        if ($validated['status'] === 'DELIVERED') {
            $jobQueue->latestDispatch?->update([
                'completed_at' => now(),
                'status' => 'COMPLETED',
            ]);
        }

        return redirect()->route('job-queues.index')->with('success', 'Job status updated successfully.');
    }

    /**
     * Update job queue details (Container fields + JobQueue status + jobable customer by customer_code).
     * This is used inside the "Job Queue Edit" modal.
     */
    public function updateDetails(Request $request, JobQueue $jobQueue): RedirectResponse
    {
        // Convert empty strings from HTML inputs to `null` so `nullable|date` / `nullable|numeric` works.
        $request->merge([
            'available_date' => $request->input('available_date') !== '' ? $request->input('available_date') : null,
            'demurrage_date' => $request->input('demurrage_date') !== '' ? $request->input('demurrage_date') : null,
            'weight' => $request->input('weight') !== '' ? $request->input('weight') : null,
            'detention_days' => $request->input('detention_days') !== '' ? $request->input('detention_days') : null,
        ]);

        $validated = $request->validate([
            // Status
            'status' => ['nullable', 'string', Rule::in(self::STATUSES)],

            // Customer (by code)
            'customer_code' => ['nullable', 'string'],

            // Container fields
            'container_number' => ['nullable', 'string', 'max:255'],
            'from_location' => ['nullable', 'string', 'max:255'],
            'to_location' => ['nullable', 'string', 'max:255'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'available_date' => ['nullable', 'date'],
            'dgs' => ['nullable', 'boolean'],
            'live_ul' => ['nullable', 'boolean'],
            'demurrage_date' => ['nullable', 'date'],
            'detention_days' => ['nullable', 'integer', 'min:0'],
            'random_number' => ['nullable', 'string', 'max:255'],
            'release_ecn_number' => ['nullable', 'string', 'max:255'],
        ]);

        $container = $this->resolveContainerForQueue($jobQueue);
        $jobable = $jobQueue->jobable;

        if ($container) {
            $containerPayload = [
                'container_number' => $validated['container_number'] ?? $container->container_number,
                'from_location' => $validated['from_location'] ?? $container->from_location,
                'to_location' => $validated['to_location'] ?? $container->to_location,
                'weight' => $validated['weight'] ?? $container->weight,
                'available_date' => array_key_exists('available_date', $validated) ? $validated['available_date'] : $container->available_date,
                'dgs' => array_key_exists('dgs', $validated) ? (bool) $validated['dgs'] : $container->dgs,
                'live_ul' => array_key_exists('live_ul', $validated) ? (bool) $validated['live_ul'] : $container->live_ul,
                'demurrage_date' => array_key_exists('demurrage_date', $validated) ? $validated['demurrage_date'] : $container->demurrage_date,
                'detention_days' => array_key_exists('detention_days', $validated) ? (int) $validated['detention_days'] : $container->detention_days,
                'random_number' => $validated['random_number'] ?? $container->random_number,
                'release_ecn_number' => $validated['release_ecn_number'] ?? $container->release_ecn_number,
            ];

            $container->update($containerPayload);
        }

        if ($jobable && array_key_exists('customer_code', $validated) && ! empty($validated['customer_code'])) {
            $customer = Customer::query()->where('customer_code', $validated['customer_code'])->first();
            if ($customer) {
                $jobable->customer_id = $customer->id;
                $jobable->save();
            }
        }

        if ($validated['status'] ?? null) {
            $oldStatus = $jobQueue->status;
            $jobQueue->update(['status' => $validated['status']]);
            $this->recordStatusHistory($jobQueue, $oldStatus, $validated['status'], $request->user()?->id);
            if ($validated['status'] === 'DELIVERED') {
                $jobQueue->latestDispatch?->update([
                    'completed_at' => now(),
                    'status' => 'COMPLETED',
                ]);
            }
        }

        return redirect()->route('job-queues.index')->with('success', 'Job updated successfully.');
    }

    /**
     * Delete complete job (import/export/cart/swing) for a given JobQueue row.
     * Removes: job_services, job_notes, containers (and related pivot content), then deletes jobable and the job_queue row.
     */
    public function destroyJobQueue(JobQueue $jobQueue): RedirectResponse
    {
        DB::beginTransaction();

        try {
            // Use withTrashed so we still get related records even if jobable was soft deleted.
            $jobableType = $jobQueue->jobable_type;
            $jobableId = $jobQueue->jobable_id;

            switch ($jobableType) {
                case Import::class:
                    $jobable = Import::withTrashed()->find($jobableId);
                    if ($jobable) {
                        $jobable->revenues()->delete();
                        $jobable->costs()->delete();
                        $jobable->jobServices()->delete();
                        $jobable->jobNotes()->delete();
                        $jobable->containers()->forceDelete();
                        JobDocument::where('job_type', Import::JOB_TYPE)->delete();
                        $jobable->delete();
                    }
                    break;

                case Export::class:
                    $jobable = Export::withTrashed()->find($jobableId);
                    if ($jobable) {
                        $jobable->revenues()->delete();
                        $jobable->costs()->delete();
                        $jobable->containers()->forceDelete();
                        $jobable->jobServices()->delete();
                        $jobable->jobNotes()->delete();
                        JobDocument::where('job_type', Export::JOB_TYPE)->delete();
                        $jobable->delete();
                    }
                    break;

                case Cart::class:
                    $jobable = Cart::withTrashed()->find($jobableId);
                    if ($jobable) {
                        $jobable->revenues()->delete();
                        $jobable->costs()->delete();
                        $jobable->jobServices()->delete();
                        $jobable->jobNotes()->delete();
                        $jobable->containers()->forceDelete();
                        JobDocument::where('job_type', Cart::JOB_TYPE)->delete();
                        $jobable->delete();
                    }
                    break;

                case Swing::class:
                    $jobable = Swing::withTrashed()->find($jobableId);
                    if ($jobable) {
                        $jobable->revenues()->delete();
                        $jobable->costs()->delete();
                        $jobable->jobServices()->delete();
                        $jobable->jobNotes()->delete();
                        $jobable->containers()->forceDelete();
                        JobDocument::where('job_type', Swing::JOB_TYPE)->delete();
                        $jobable->delete();
                    }
                    break;

            }

            // Always remove the queue record itself.
            $jobQueue->delete();

            DB::commit();

            return redirect()->route('job-queues.index')->with('success', 'Job deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to delete job: '.$e->getMessage()]);
        }
    }

    private function buildStatusCards(): array
    {
        $base = JobQueue::query();
        $containers = Container::query();

        return [
            'IN_PROCESS' => (clone $base)->where('status', 'IN_PROCESS')->count(),
            'PENDING_TBA' => (clone $base)->where('status', 'PENDING_TBA')->count(),
            'ACTIVE' => (clone $base)->where('status', 'ACTIVE')->count(),
            'URGENT' => (clone $containers)->whereDate('available_date', '<=', now()->toDateString())->count(),
            'DEMURRAGE' => (clone $containers)->whereNotNull('demurrage_date')->count(),
            'DETENTION' => (clone $containers)->where('detention_days', '>', 0)->count(),
            'DG' => (clone $containers)->where('dgs', true)->count(),
            'LIVE_UL' => (clone $containers)->where('live_ul', true)->count(),
        ];
    }

    private function resolveContainerForQueue(JobQueue $queue): ?Container
    {
        $typeMap = [
            Import::class => 'import',
            Export::class => 'export',
            Cart::class => 'cart',
            Swing::class => 'swing',
        ];

        $jobType = $typeMap[$queue->jobable_type] ?? null;
        if (! $jobType) {
            return null;
        }

        return Container::query()
            ->with([
                'isoCode:id,code,name',
                'shipping:id,code,name',
            ])
            ->where('job_type', $jobType)
            ->where('job_id', $queue->jobable_id)
            ->latest('id')
            ->first();
    }

    private function calculateDoAfterDate(?Container $container): ?string
    {
        if (! $container?->available_date || ! $container?->detention_days) {
            return null;
        }

        return Carbon::parse($container->available_date)->addDays((int) $container->detention_days)->toDateString();
    }

    private function recordStatusHistory(JobQueue $jobQueue, ?string $oldStatus, string $newStatus, ?int $changedBy): void
    {
        if ($oldStatus === $newStatus) {
            return;
        }

        JobStatusHistory::query()->create([
            'job_queue_id' => $jobQueue->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $changedBy,
            'changed_at' => now(),
        ]);
    }
}
