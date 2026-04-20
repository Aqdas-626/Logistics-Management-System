<?php

namespace App\Http\Controllers\Dispatch;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Container;
use App\Models\Dispatch;
use App\Models\Export;
use App\Models\Import;
use App\Models\Swing;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DispatchController extends Controller
{
    private function selectedIds(Request $request): array
    {
        $raw = (string) $request->query('ids', '');
        if ($raw === '') {
            return [];
        }

        return collect(explode(',', $raw))
            ->map(fn ($id) => (int) trim($id))
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();
    }

    private function filteredQuery(string $search, string $status)
    {
        $query = Dispatch::query()
            ->with([
                'jobQueue.jobable',
                'driverVehicleAssignment.driver.user:id,name,email',
                'driverVehicleAssignment.driver:id,user_id,name,driver_code,email',
                'driverVehicleAssignment.vehicle:id,registration_no',
            ])
            ->orderByDesc('dispatched_at')
            ->orderByDesc('id');

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('status', 'like', '%'.$search.'%')
                    ->orWhere('notes', 'like', '%'.$search.'%')
                    ->orWhereHas('jobQueue', function ($qq) use ($search) {
                        $qq->where('jobable_id', 'like', '%'.$search.'%')
                            ->orWhere('jobable_type', 'like', '%'.$search.'%')
                            ->orWhereHas('jobable', function ($jobable) use ($search) {
                                $jobable->where('job_number', 'like', '%'.$search.'%')
                                    ->orWhere('job_no', 'like', '%'.$search.'%');
                            });
                    })
                    ->orWhereHas('driverVehicleAssignment.driver', function ($d) use ($search) {
                        $d->where('name', 'like', '%'.$search.'%')
                            ->orWhere('driver_code', 'like', '%'.$search.'%')
                            ->orWhere('email', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('driverVehicleAssignment.vehicle', function ($v) use ($search) {
                        $v->where('registration_no', 'like', '%'.$search.'%');
                    });
            });
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();

        $dispatches = $this->filteredQuery($search, $status)->paginate(15)->withQueryString();

        $containersByKey = $this->loadContainerNumbersForDispatches($dispatches->getCollection()->all());

        $dispatches->getCollection()->transform(function (Dispatch $dispatch) use ($containersByKey) {
            $queue = $dispatch->jobQueue;
            $jobable = $queue?->jobable;

            $jobTypeKey = $this->jobTypeKeyFromJobableType($queue?->jobable_type);
            $containerKey = $jobTypeKey && $queue?->jobable_id ? $jobTypeKey.':'.$queue->jobable_id : null;

            return [
                'id' => $dispatch->id,
                'status' => $dispatch->status,
                'notes' => $dispatch->notes,
                'dispatched_at' => $dispatch->dispatched_at?->toDateTimeString(),
                'completed_at' => $dispatch->completed_at?->toDateTimeString(),
                'job_queue_id' => $dispatch->job_queue_id,
                'job_type' => $jobTypeKey,
                'job_type_label' => $this->jobTypeLabelFromJobableType($queue?->jobable_type),
                'job_number' => $jobable?->job_number ?? $jobable?->job_no ?? null,
                'container_number' => $containerKey ? ($containersByKey[$containerKey] ?? null) : null,
                'driver' => [
                    'name' => $dispatch->driverVehicleAssignment?->driver?->name,
                    'driver_code' => $dispatch->driverVehicleAssignment?->driver?->driver_code,
                    'email' => $dispatch->driverVehicleAssignment?->driver?->user?->email ?? $dispatch->driverVehicleAssignment?->driver?->email,
                ],
                'vehicle' => [
                    'registration_no' => $dispatch->driverVehicleAssignment?->vehicle?->registration_no,
                ],
            ];
        });

        return Inertia::render('Dispatch/Index', [
            'dispatches' => $dispatches,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function exportCsv(Request $request)
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();
        $selectedIds = $this->selectedIds($request);

        $dispatches = $this->filteredQuery($search, $status);
        if ($selectedIds !== []) {
            $dispatches->whereIn('id', $selectedIds);
        }
        $dispatches = $dispatches->get();

        $containersByKey = $this->loadContainerNumbersForDispatches($dispatches->all());

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="dispatches.csv"',
        ];

        $callback = function () use ($dispatches, $containersByKey) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'S.NO',
                'DISPATCH ID',
                'JOB TYPE',
                'JOB NUMBER',
                'CONTAINER NUMBER',
                'DRIVER',
                'VEHICLE',
                'STATUS',
                'DISPATCHED AT',
                'COMPLETED AT',
                'NOTES',
            ]);

            foreach ($dispatches as $index => $dispatch) {
                $queue = $dispatch->jobQueue;
                $jobable = $queue?->jobable;
                $jobTypeKey = $this->jobTypeKeyFromJobableType($queue?->jobable_type);
                $containerKey = $jobTypeKey && $queue?->jobable_id ? $jobTypeKey.':'.$queue->jobable_id : null;

                fputcsv($handle, [
                    $index + 1,
                    $dispatch->id,
                    $this->jobTypeLabelFromJobableType($queue?->jobable_type),
                    $jobable?->job_number ?? $jobable?->job_no ?? '',
                    $containerKey ? ($containersByKey[$containerKey] ?? '') : '',
                    $dispatch->driverVehicleAssignment?->driver?->name
                        ?? $dispatch->driverVehicleAssignment?->driver?->driver_code
                        ?? '',
                    $dispatch->driverVehicleAssignment?->vehicle?->registration_no ?? '',
                    $dispatch->status ?? '',
                    optional($dispatch->dispatched_at)?->toDateTimeString() ?? '',
                    optional($dispatch->completed_at)?->toDateTimeString() ?? '',
                    Str::limit((string) ($dispatch->notes ?? ''), 500),
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();
        $selectedIds = $this->selectedIds($request);

        $dispatches = $this->filteredQuery($search, $status);
        if ($selectedIds !== []) {
            $dispatches->whereIn('id', $selectedIds);
        }
        $dispatches = $dispatches->get();

        $containersByKey = $this->loadContainerNumbersForDispatches($dispatches->all());

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="dispatches.xls"',
        ];

        $callback = function () use ($dispatches, $containersByKey) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'S.NO',
                'DISPATCH ID',
                'JOB TYPE',
                'JOB NUMBER',
                'CONTAINER NUMBER',
                'DRIVER',
                'VEHICLE',
                'STATUS',
                'DISPATCHED AT',
                'COMPLETED AT',
                'NOTES',
            ], "\t");

            foreach ($dispatches as $index => $dispatch) {
                $queue = $dispatch->jobQueue;
                $jobable = $queue?->jobable;
                $jobTypeKey = $this->jobTypeKeyFromJobableType($queue?->jobable_type);
                $containerKey = $jobTypeKey && $queue?->jobable_id ? $jobTypeKey.':'.$queue->jobable_id : null;

                fputcsv($handle, [
                    $index + 1,
                    $dispatch->id,
                    $this->jobTypeLabelFromJobableType($queue?->jobable_type),
                    $jobable?->job_number ?? $jobable?->job_no ?? '',
                    $containerKey ? ($containersByKey[$containerKey] ?? '') : '',
                    $dispatch->driverVehicleAssignment?->driver?->name
                        ?? $dispatch->driverVehicleAssignment?->driver?->driver_code
                        ?? '',
                    $dispatch->driverVehicleAssignment?->vehicle?->registration_no ?? '',
                    $dispatch->status ?? '',
                    optional($dispatch->dispatched_at)?->toDateTimeString() ?? '',
                    optional($dispatch->completed_at)?->toDateTimeString() ?? '',
                    (string) ($dispatch->notes ?? ''),
                ], "\t");
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();
        $selectedIds = $this->selectedIds($request);

        $dispatches = $this->filteredQuery($search, $status);
        if ($selectedIds !== []) {
            $dispatches->whereIn('id', $selectedIds);
        }
        $dispatches = $dispatches->get();

        $containersByKey = $this->loadContainerNumbersForDispatches($dispatches->all());

        $pdf = Pdf::loadView('exports.dispatches-pdf', [
            'dispatches' => $dispatches,
            'containersByKey' => $containersByKey,
            'jobTypeLabel' => fn (?string $jobableType) => $this->jobTypeLabelFromJobableType($jobableType),
            'jobTypeKey' => fn (?string $jobableType) => $this->jobTypeKeyFromJobableType($jobableType),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('dispatches.pdf');
    }

    public function show(Dispatch $dispatch): Response
    {
        $dispatch->load([
            'jobQueue.jobable',
            'driverVehicleAssignment.driver.user:id,name,email',
            'driverVehicleAssignment.driver:id,user_id,name,driver_code,email',
            'driverVehicleAssignment.vehicle:id,registration_no',
        ]);

        $queue = $dispatch->jobQueue;
        $jobable = $queue?->jobable;
        $jobTypeKey = $this->jobTypeKeyFromJobableType($queue?->jobable_type);

        $containerNumber = null;
        if ($jobTypeKey && $queue?->jobable_id) {
            $containerNumber = Container::query()
                ->where('job_type', $jobTypeKey)
                ->where('job_id', $queue->jobable_id)
                ->latest('id')
                ->value('container_number');
        }

        return Inertia::render('Dispatch/Show', [
            'dispatch' => [
                'id' => $dispatch->id,
                'status' => $dispatch->status,
                'notes' => $dispatch->notes,
                'dispatched_at' => $dispatch->dispatched_at?->toDateTimeString(),
                'completed_at' => $dispatch->completed_at?->toDateTimeString(),
                'job_type' => $jobTypeKey,
                'job_type_label' => $this->jobTypeLabelFromJobableType($queue?->jobable_type),
                'job_number' => $jobable?->job_number ?? $jobable?->job_no ?? null,
                'container_number' => $containerNumber,
                'driver' => [
                    'name' => $dispatch->driverVehicleAssignment?->driver?->name,
                    'driver_code' => $dispatch->driverVehicleAssignment?->driver?->driver_code,
                    'email' => $dispatch->driverVehicleAssignment?->driver?->user?->email ?? $dispatch->driverVehicleAssignment?->driver?->email,
                ],
                'vehicle' => [
                    'registration_no' => $dispatch->driverVehicleAssignment?->vehicle?->registration_no,
                ],
            ],
        ]);
    }

    public function destroy(Dispatch $dispatch): RedirectResponse
    {
        $dispatch->delete();

        return redirect()
            ->route('dispatches.index')
            ->with('success', 'Dispatch deleted successfully.');
    }

    private function jobTypeKeyFromJobableType(?string $jobableType): ?string
    {
        return match ($jobableType) {
            Import::class => 'import',
            Export::class => 'export',
            Cart::class => 'cart',
            Swing::class => 'swing',
            default => null,
        };
    }

    private function jobTypeLabelFromJobableType(?string $jobableType): string
    {
        return match ($jobableType) {
            Import::class => 'Import',
            Export::class => 'Export',
            Cart::class => 'Cart',
            Swing::class => 'Swing',
            default => 'Job',
        };
    }

    /**
     * @param  array<int, Dispatch>  $dispatches
     * @return array<string, string> map: "{job_type}:{job_id}" => container_number
     */
    private function loadContainerNumbersForDispatches(array $dispatches): array
    {
        $idsByType = [
            'import' => [],
            'export' => [],
            'cart' => [],
            'swing' => [],
        ];

        foreach ($dispatches as $dispatch) {
            $queue = $dispatch->jobQueue;
            $type = $this->jobTypeKeyFromJobableType($queue?->jobable_type);
            $id = $queue?->jobable_id;
            if ($type && $id) {
                $idsByType[$type][] = (int) $id;
            }
        }

        $result = [];
        foreach ($idsByType as $type => $ids) {
            $ids = array_values(array_unique(array_filter($ids)));
            if (count($ids) === 0) {
                continue;
            }

            $rows = Container::query()
                ->select(['job_id', 'container_number'])
                ->where('job_type', $type)
                ->whereIn('job_id', $ids)
                ->orderByDesc('id')
                ->get();

            // Pick latest container per job_id (rows are ordered desc by id).
            foreach ($rows as $row) {
                $key = $type.':'.$row->job_id;
                if (! array_key_exists($key, $result) && $row->container_number) {
                    $result[$key] = $row->container_number;
                }
            }
        }

        return $result;
    }
}

