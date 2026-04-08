<?php

namespace App\Http\Controllers\Swing;

use App\Http\Controllers\Controller;
use App\Models\Container;
use App\Models\Customer;
use App\Models\DoorType;
use App\Models\Endorsement;
use App\Models\IsoCode;
use App\Models\JobNote;
use App\Models\JobService;
use App\Models\LiftType;
use App\Models\Service;
use App\Support\JobFinancialShowData;
use App\Models\Swing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SwingController extends Controller
{
    public function index(Request $request)
    {
        $query = Swing::with(['customer', 'containers'])->latest();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('job_no', 'like', "%{$request->search}%")
                    ->orWhereHas('customer', function ($cq) use ($request) {
                        $cq->where('name', 'like', "%{$request->search}%")
                            ->orWhere('customer_code', 'like', "%{$request->search}%");
                    });
            });
        }

        return Inertia::render('Swing/Swings/Index', [
            'swings' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Swing/Swings/Create', $this->formPayload());
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        DB::beginTransaction();
        try {
            $swing = Swing::create([
                'customer_id' => $validated['customer_id'],
                'document_received_at' => $validated['document_received_at'] ?? null,
                'from_location' => $validated['from_location'] ?? null,
            ]);

            foreach ($validated['containers'] as $containerData) {
                Container::create([
                    'container_number' => $containerData['container_number'],
                    'job_type' => Swing::JOB_TYPE,
                    'job_id' => $swing->id,
                    'reference' => $containerData['reference'] ?? null,
                    'iso_code_id' => $containerData['iso_code_id'] ?? null,
                    'weight' => $containerData['weight'] ?? null,
                    'available_date' => $containerData['available_date'] ?? null,
                    'door_type_id' => $containerData['door_type_id'] ?? null,
                    'lift_type_id' => $containerData['lift_type_id'] ?? null,
                    'xray' => false,
                    'dgs' => false,
                    'ready_now' => (bool) ($containerData['ready_now'] ?? false),
                    'from_location' => $validated['from_location'] ?? null,
                    'to_location' => null,
                    'no_of_containers' => 1,
                ]);
            }

            if (! empty($validated['services'])) {
                foreach ($validated['services'] as $serviceId) {
                    $swing->jobServices()->create([
                        'service_id' => $serviceId,
                    ]);
                }
            }

            if (! empty($validated['notes'])) {
                foreach ($validated['notes'] as $noteData) {
                    $swing->jobNotes()->create([
                        'endorsement_id' => $noteData['endorsement_id'],
                        'note' => $noteData['note'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('swings.index')->with('success', 'Swing job created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to create swing job: '.$e->getMessage()]);
        }
    }

    public function show(Swing $swing)
    {
        $swing->load([
            'customer',
            'containers.isoCode',
            'containers.doorType',
            'containers.liftType',
        ]);

        return Inertia::render('Swing/Swings/Show', array_merge([
            'swingJob' => $swing,
            'jobServices' => $swing->jobServices()
                ->with('service:id,name')
                ->latest()
                ->take(20)
                ->get(),
            'jobNotes' => $swing->jobNotes()
                ->with('endorsement:id,name')
                ->latest()
                ->take(20)
                ->get(),
        ], JobFinancialShowData::for(Swing::class, $swing->id)));
    }

    public function edit(Swing $swing)
    {
        $swing->load(['customer', 'containers']);
        $container = $swing->containers->first();
        $jobServices = $swing->jobServices()->get(['service_id']);
        $jobNotes = $swing->jobNotes()->get(['endorsement_id', 'note']);

        return Inertia::render('Swing/Swings/Edit', array_merge($this->formPayload(), [
            'swingJob' => $swing,
            'container' => $container,
            'containers' => $swing->containers,
            'jobServices' => $jobServices,
            'jobNotes' => $jobNotes,
        ]));
    }

    public function update(Request $request, Swing $swing)
    {
        $validated = $request->validate($this->rules());

        DB::beginTransaction();
        try {
            $swing->update([
                'customer_id' => $validated['customer_id'],
                'document_received_at' => $validated['document_received_at'] ?? null,
                'from_location' => $validated['from_location'] ?? null,
            ]);

            $swing->containers()->forceDelete();
            foreach ($validated['containers'] as $containerData) {
                Container::create([
                    'container_number' => $containerData['container_number'],
                    'job_type' => Swing::JOB_TYPE,
                    'job_id' => $swing->id,
                    'reference' => $containerData['reference'] ?? null,
                    'iso_code_id' => $containerData['iso_code_id'] ?? null,
                    'weight' => $containerData['weight'] ?? null,
                    'available_date' => $containerData['available_date'] ?? null,
                    'door_type_id' => $containerData['door_type_id'] ?? null,
                    'lift_type_id' => $containerData['lift_type_id'] ?? null,
                    'xray' => false,
                    'dgs' => false,
                    'ready_now' => (bool) ($containerData['ready_now'] ?? false),
                    'from_location' => $validated['from_location'] ?? null,
                    'to_location' => null,
                    'no_of_containers' => 1,
                ]);
            }

            $swing->jobServices()->delete();
            if (! empty($validated['services'])) {
                foreach ($validated['services'] as $serviceId) {
                    $swing->jobServices()->create([
                        'service_id' => $serviceId,
                    ]);
                }
            }

            $swing->jobNotes()->delete();
            if (! empty($validated['notes'])) {
                foreach ($validated['notes'] as $noteData) {
                    $swing->jobNotes()->create([
                        'endorsement_id' => $noteData['endorsement_id'],
                        'note' => $noteData['note'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('swings.show', $swing->id)->with('success', 'Swing job updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to update swing job: '.$e->getMessage()]);
        }
    }

    public function destroy(Swing $swing)
    {
        DB::beginTransaction();
        try {
            $swing->revenues()->delete();
            $swing->costs()->delete();
            $swing->jobServices()->delete();
            $swing->jobNotes()->delete();
            $swing->containers()->delete();
            $swing->delete();
            DB::commit();

            return redirect()->route('swings.index')->with('success', 'Swing job deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to delete swing job: '.$e->getMessage()]);
        }
    }

    private function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'document_received_at' => 'nullable|date',
            'from_location' => 'nullable|string|max:150',
            'containers' => 'required|array|min:1',
            'containers.*.container_number' => 'required|string|max:100',
            'containers.*.reference' => 'nullable|string|max:100',
            'containers.*.iso_code_id' => 'nullable|exists:iso_codes,id',
            'containers.*.weight' => 'nullable|numeric|min:0',
            'containers.*.available_date' => 'nullable|date',
            'containers.*.door_type_id' => 'nullable|exists:door_types,id',
            'containers.*.lift_type_id' => 'nullable|exists:lift_types,id',
            'containers.*.ready_now' => 'nullable|boolean',
            'services' => 'nullable|array',
            'services.*' => 'exists:services,id',
            'notes' => 'nullable|array',
            'notes.*.endorsement_id' => 'required|exists:endorsements,id',
            'notes.*.note' => 'nullable|string|max:5000',
        ];
    }

    private function formPayload(): array
    {
        return [
            'customers' => Customer::query()->get(['id', 'name', 'customer_code']),
            'isoCodes' => IsoCode::query()->get(['id', 'name', 'code']),
            'services' => Service::query()->get(['id', 'name']),
            'endorsements' => Endorsement::query()->get(['id', 'name']),
            'doorTypes' => DoorType::query()->get(['id', 'name']),
            'liftTypes' => LiftType::query()->get(['id', 'name']),
        ];
    }
}
