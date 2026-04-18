<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\IncidentReport;
use App\Models\MaintenanceChecklistItem;
use App\Models\MaintenanceManagement;
use App\Models\MaintenancePartUsed;
use App\Models\MaintenanceVendor;
use App\Models\MechanicManagement;
use App\Models\PartStock;
use App\Models\Scheduler;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceManagementController extends Controller
{
    private const STATUSES = ['planned', 'in_progress', 'completed', 'cancelled'];

    private const NOTIFICATION_METHODS = ['email', 'sms', 'whatsapp', 'email_sms', 'all'];

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();

        $query = MaintenanceManagement::query()
            ->with([
                'vehicle:id,name,registration_no,image',
                'maintenanceVendor:id,name',
                'mechanicManagement:id,name',
            ])
            ->orderByDesc('start_date')
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('service_details', 'like', '%'.$search.'%')
                    ->orWhereHas('vehicle', function ($vq) use ($search) {
                        $vq->where('registration_no', 'like', '%'.$search.'%')
                            ->orWhere('name', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('maintenanceVendor', function ($mq) use ($search) {
                        $mq->where('name', 'like', '%'.$search.'%');
                    });
            });
        }

        if ($status !== '' && in_array($status, self::STATUSES, true)) {
            $query->where('status', $status);
        }

        $counts = [
            'all' => MaintenanceManagement::count(),
            'planned' => MaintenanceManagement::where('status', 'planned')->count(),
            'in_progress' => MaintenanceManagement::where('status', 'in_progress')->count(),
            'completed' => MaintenanceManagement::where('status', 'completed')->count(),
        ];

        return Inertia::render('MaintenanceManagement/MaintenanceWorkOrders/Index', [
            'records' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'counts' => $counts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('MaintenanceManagement/MaintenanceWorkOrders/Create', $this->formOptions());
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedPayload($request);

        DB::transaction(function () use ($validated, $request): void {
            $checklist = $validated['checklist'] ?? [];
            $partsUsed = $validated['parts_used'] ?? [];
            unset($validated['checklist'], $validated['parts_used'], $validated['invoice_receipt']);

            $validated['created_by'] = $request->user()?->id;
            $validated['is_auto_generated'] = $validated['is_auto_generated'] ?? false;

            if ($request->hasFile('invoice_receipt')) {
                $validated['invoice_receipt_path'] = $request->file('invoice_receipt')->store('maintenance-invoices', 'public');
            }

            $maintenance = MaintenanceManagement::create($validated);

            $this->persistChecklist($maintenance, $checklist);
            $this->persistPartsUsed($maintenance, $partsUsed);
        });

        return redirect()
            ->route('maintenance-management.index')
            ->with('success', 'Maintenance record created successfully.');
    }

    public function show(MaintenanceManagement $maintenanceManagement): Response
    {
        $maintenanceManagement->load([
            'vehicle:id,name,registration_no,image',
            'maintenanceVendor:id,name',
            'mechanicManagement:id,name',
            'incidentReport:id,description,report_date',
            'scheduler:id,service_name,vehicle_id',
            'scheduler.vehicle:id,name,registration_no',
            'checklistItems',
            'partUseds.partStock:id,name,sku,unit',
            'creator:id,name',
        ]);

        return Inertia::render('MaintenanceManagement/MaintenanceWorkOrders/Show', [
            'record' => $maintenanceManagement,
        ]);
    }

    public function edit(MaintenanceManagement $maintenanceManagement): Response
    {
        $maintenanceManagement->load([
            'checklistItems',
            'partUseds.partStock:id,name,sku,unit,unit_cost',
        ]);

        return Inertia::render('MaintenanceManagement/MaintenanceWorkOrders/Edit', array_merge(
            $this->formOptions(),
            ['record' => $maintenanceManagement]
        ));
    }

    public function update(Request $request, MaintenanceManagement $maintenanceManagement): RedirectResponse
    {
        $validated = $this->validatedPayload($request);

        DB::transaction(function () use ($validated, $request, $maintenanceManagement): void {
            $checklist = $validated['checklist'] ?? [];
            $partsUsed = $validated['parts_used'] ?? [];
            unset($validated['checklist'], $validated['parts_used'], $validated['invoice_receipt']);

            if ($request->hasFile('invoice_receipt')) {
                if ($maintenanceManagement->invoice_receipt_path) {
                    Storage::disk('public')->delete($maintenanceManagement->invoice_receipt_path);
                }
                $validated['invoice_receipt_path'] = $request->file('invoice_receipt')->store('maintenance-invoices', 'public');
            }

            $maintenanceManagement->update($validated);

            MaintenanceChecklistItem::where('maintenance_management_id', $maintenanceManagement->id)->get()
                ->each->forceDelete();
            MaintenancePartUsed::where('maintenance_management_id', $maintenanceManagement->id)->get()
                ->each->forceDelete();

            $this->persistChecklist($maintenanceManagement, $checklist);
            $this->persistPartsUsed($maintenanceManagement, $partsUsed);
        });

        return redirect()
            ->route('maintenance-management.index')
            ->with('success', 'Maintenance record updated successfully.');
    }

    public function destroy(MaintenanceManagement $maintenanceManagement): RedirectResponse
    {
        if ($maintenanceManagement->invoice_receipt_path) {
            Storage::disk('public')->delete($maintenanceManagement->invoice_receipt_path);
        }

        $maintenanceManagement->delete();

        return redirect()
            ->route('maintenance-management.index')
            ->with('success', 'Maintenance record removed successfully.');
    }

    public function updateStatus(Request $request, MaintenanceManagement $maintenanceManagement): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        $maintenanceManagement->update($validated);

        return back()->with('success', 'Status updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'vehicles' => Vehicle::query()
                ->orderBy('registration_no')
                ->get(['id', 'name', 'registration_no']),
            'vendors' => MaintenanceVendor::query()->orderBy('name')->get(['id', 'name']),
            'mechanics' => MechanicManagement::query()->orderBy('name')->get(['id', 'name']),
            'incidentReports' => IncidentReport::query()
                ->with('vehicle:id,name,registration_no')
                ->orderByDesc('id')
                ->limit(150)
                ->get(['id', 'vehicle_id', 'description', 'report_date', 'status']),
            'schedulers' => Scheduler::query()
                ->with('vehicle:id,name,registration_no')
                ->where('is_active', true)
                ->orderByDesc('id')
                ->limit(150)
                ->get(['id', 'vehicle_id', 'service_name']),
            'partStocks' => PartStock::query()
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'unit_cost', 'unit']),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(Request $request): array
    {
        $nullableFk = ['maintenance_vendor_id', 'mechanic_management_id', 'incident_report_id', 'scheduler_id'];
        foreach ($nullableFk as $key) {
            if ($request->input($key) === '' || $request->input($key) === '0') {
                $request->merge([$key => null]);
            }
        }
        if ($request->input('notification_method') === '') {
            $request->merge(['notification_method' => null]);
        }

        $cleanChecklist = collect($request->input('checklist', []))
            ->filter(fn ($row) => trim((string) ($row['task_item'] ?? '')) !== '')
            ->values()
            ->all();
        $request->merge(['checklist' => $cleanChecklist]);

        $cleanParts = collect($request->input('parts_used', []))
            ->filter(fn ($row) => ! empty($row['parts_stock_id']) && (int) ($row['quantity'] ?? 0) > 0)
            ->values()
            ->all();
        $request->merge(['parts_used' => $cleanParts]);

        $rules = [
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'maintenance_vendor_id' => ['nullable', 'exists:maintenance_vendors,id'],
            'mechanic_management_id' => ['nullable', 'exists:mechanic_management,id'],
            'incident_report_id' => ['nullable', 'exists:incident_reports,id'],
            'scheduler_id' => ['nullable', 'exists:schedulers,id'],
            'status' => ['required', Rule::in(self::STATUSES)],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'service_details' => ['required', 'string'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'invoice_receipt' => ['nullable', 'file', 'max:5120'],
            'priority' => ['required', Rule::in(['normal', 'high', 'critical'])],
            'notification_method' => ['nullable', 'string', 'max:80', Rule::in(self::NOTIFICATION_METHODS)],
            'notify_user_ids' => ['nullable', 'array'],
            'notify_user_ids.*' => ['integer', 'exists:users,id'],
            'is_auto_generated' => ['sometimes', 'boolean'],
            'checklist' => ['nullable', 'array'],
            'checklist.*.task_item' => ['required', 'string', 'max:255'],
            'checklist.*.is_done' => ['sometimes', 'boolean'],
            'parts_used' => ['nullable', 'array'],
            'parts_used.*.parts_stock_id' => ['required', 'exists:part_stocks,id'],
            'parts_used.*.quantity' => ['required', 'integer', 'min:1'],
        ];

        $validated = $request->validate($rules);

        if (empty($validated['currency'])) {
            $validated['currency'] = 'NZD';
        }

        if (! array_key_exists('total_cost', $validated) || $validated['total_cost'] === null) {
            $validated['total_cost'] = 0;
        }

        $validated['notify_user_ids'] = array_values(array_unique(array_filter($validated['notify_user_ids'] ?? [])));

        $mergedParts = [];
        foreach ($validated['parts_used'] ?? [] as $row) {
            $pid = (int) $row['parts_stock_id'];
            $mergedParts[$pid] = ($mergedParts[$pid] ?? 0) + (int) $row['quantity'];
        }
        $validated['parts_used'] = collect($mergedParts)->map(fn (int $qty, int $pid) => [
            'parts_stock_id' => $pid,
            'quantity' => $qty,
        ])->values()->all();

        return $validated;
    }

    /**
     * @param  array<int, array{task_item: string, is_done?: bool}>  $checklist
     */
    private function persistChecklist(MaintenanceManagement $maintenance, array $checklist): void
    {
        foreach ($checklist as $index => $item) {
            $maintenance->checklistItems()->create([
                'sort_order' => $index,
                'task_item' => $item['task_item'],
                'is_done' => (bool) ($item['is_done'] ?? false),
            ]);
        }
    }

    /**
     * @param  array<int, array{parts_stock_id: int, quantity: int}>  $partsUsed
     */
    private function persistPartsUsed(MaintenanceManagement $maintenance, array $partsUsed): void
    {
        foreach ($partsUsed as $row) {
            $stock = PartStock::query()->find($row['parts_stock_id']);
            $maintenance->partUseds()->create([
                'parts_stock_id' => $row['parts_stock_id'],
                'quantity' => $row['quantity'],
                'unit_cost_snapshot' => $stock?->unit_cost,
            ]);
        }
    }
}
