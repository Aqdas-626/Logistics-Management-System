<?php

namespace App\Http\Controllers\Export;

use App\Http\Controllers\Controller;
use App\Models\Container;
use App\Models\Customer;
use App\Models\Endorsement;
use App\Models\Export;
use App\Models\IsoCode;
use App\Models\JobDocument;
use App\Models\JobNote;
use App\Models\JobService;
use App\Models\Service;
use App\Models\Shipping;
use App\Models\ShipType;
use App\Models\Vessel;
use App\Support\JobFinancialShowData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExportController extends Controller
{
    public function index(Request $request)
    {
        $query = Export::with(['customer', 'containers'])->where('job_type', Export::JOB_TYPE);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('job_number', 'like', "%{$request->search}%")
                    ->orWhereHas('customer', function ($cq) use ($request) {
                        $cq->where('name', 'like', "%{$request->search}%")
                            ->orWhere('customer_code', 'like', "%{$request->search}%");
                    });
            });
        }

        return Inertia::render('Export/Exports/Index', [
            'exports' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Export/Exports/Create', $this->formPayload());
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        DB::beginTransaction();
        try {
            $export = Export::create([
                'customer_id' => $validated['customer_id'],
                'job_type' => Export::JOB_TYPE,
                'document_received_at' => $validated['document_received_at'] ?? null,
                'shipping_id' => $validated['shipping_id'] ?? null,
                'vessel_id' => $validated['vessel_id'] ?? null,
                'voyage' => $validated['voyage'] ?? null,
                'from_location' => $validated['from_location'] ?? null,
                'to_location' => $validated['to_location'] ?? null,
            ]);

            foreach ($validated['containers'] as $containerData) {
                Container::create([
                    'container_number' => $containerData['container_number'],
                    'job_type' => Export::JOB_TYPE,
                    'job_id' => $export->id,
                    'cut_off_date' => $containerData['cut_off_date'] ?? null,
                    'grid_position' => $containerData['grid_position'] ?? null,
                    'no_of_containers' => $containerData['no_of_containers'] ?? 1,
                    'reference' => $containerData['reference'] ?? null,
                    'iso_code_id' => $containerData['iso_code_id'] ?? null,
                    'dg_type_id' => null,
                    'shipping_id' => $validated['shipping_id'] ?? null,
                    'vessel_id' => $validated['vessel_id'] ?? null,
                    'ship_type_id' => $containerData['ship_type_id'] ?? null,
                    'weight' => $containerData['weight'] ?? null,
                    'from_location' => $validated['from_location'] ?? null,
                    'to_location' => $validated['to_location'] ?? null,
                    'return_to' => null,
                    'security_check' => null,
                    'random_number' => $containerData['random_number'] ?? null,
                    'release_ecn_number' => $containerData['release_ecn_number'] ?? null,
                    'port_pin_no' => $containerData['port_pin_no'] ?? null,
                    'available_date' => $containerData['available_date'] ?? null,
                    'vb_slot_date' => null,
                    'demurrage_date' => null,
                    'detention_days' => 0,
                    'voyage' => $validated['voyage'] ?? null,
                    'xray' => (bool)($containerData['xray'] ?? false),
                    'dgs' => (bool)($containerData['dgs'] ?? false),
                    'live_ul' => (bool)($containerData['live_ul'] ?? false),
                    'hold_sh' => (bool)($containerData['hold_sh'] ?? false),
                    'hold_customs' => false,
                    'hold_mpi' => false,
                ]);
            }

            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $serviceId) {
                    $export->jobServices()->create([
                        'service_id' => $serviceId,
                    ]);
                }
            }

            if (!empty($validated['notes'])) {
                foreach ($validated['notes'] as $noteData) {
                    $export->jobNotes()->create([
                        'endorsement_id' => $noteData['endorsement_id'],
                        'note' => $noteData['note'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('exports.index')->with('success', 'Export job created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create export job: ' . $e->getMessage()]);
        }
    }

    public function show(Export $export)
    {
        $export->load(['customer', 'containers.isoCode', 'containers.shipping', 'containers.vessel', 'containers.shipType', 'containers.dgType']);

        return Inertia::render('Export/Exports/Show', array_merge([
            'importJob' => $export,
            'jobServices' => $export->jobServices()
                ->with('service:id,name')
                ->latest()
                ->take(20)
                ->get(),
            'jobNotes' => $export->jobNotes()
                ->with('endorsement:id,name')
                ->latest()
                ->take(20)
                ->get(),
            'jobDocuments' => JobDocument::where('job_type', Export::JOB_TYPE)->latest()->take(20)->get(),
        ], JobFinancialShowData::for(Export::class, $export->id)));
    }

    public function edit(Export $export)
    {
        $export->load(['customer', 'containers']);
        $container = $export->containers->first();
        $jobServices = $export->jobServices()->get(['service_id']);
        $jobNotes = $export->jobNotes()->get(['endorsement_id', 'note']);

        return Inertia::render('Export/Exports/Edit', array_merge($this->formPayload(), [
            'importJob' => $export,
            'container' => $container,
            'containers' => $export->containers,
            'jobServices' => $jobServices,
            'jobNotes' => $jobNotes,
        ]));
    }

    public function update(Request $request, Export $export)
    {
        $validated = $request->validate($this->rules());

        DB::beginTransaction();
        try {
            $export->update([
                'customer_id' => $validated['customer_id'],
                'job_type' => Export::JOB_TYPE,
                'document_received_at' => $validated['document_received_at'] ?? null,
                'shipping_id' => $validated['shipping_id'] ?? null,
                'vessel_id' => $validated['vessel_id'] ?? null,
                'voyage' => $validated['voyage'] ?? null,
                'from_location' => $validated['from_location'] ?? null,
                'to_location' => $validated['to_location'] ?? null,
            ]);

            $export->containers()->forceDelete();
            foreach ($validated['containers'] as $containerData) {
                Container::create([
                    'container_number' => $containerData['container_number'],
                    'job_type' => Export::JOB_TYPE,
                    'job_id' => $export->id,
                    'cut_off_date' => $containerData['cut_off_date'] ?? null,
                    'grid_position' => $containerData['grid_position'] ?? null,
                    'no_of_containers' => $containerData['no_of_containers'] ?? 1,
                    'reference' => $containerData['reference'] ?? null,
                    'iso_code_id' => $containerData['iso_code_id'] ?? null,
                    'dg_type_id' => null,
                    'shipping_id' => $validated['shipping_id'] ?? null,
                    'vessel_id' => $validated['vessel_id'] ?? null,
                    'ship_type_id' => $containerData['ship_type_id'] ?? null,
                    'weight' => $containerData['weight'] ?? null,
                    'from_location' => $validated['from_location'] ?? null,
                    'to_location' => $validated['to_location'] ?? null,
                    'return_to' => null,
                    'security_check' => null,
                    'random_number' => $containerData['random_number'] ?? null,
                    'release_ecn_number' => $containerData['release_ecn_number'] ?? null,
                    'port_pin_no' => $containerData['port_pin_no'] ?? null,
                    'available_date' => $containerData['available_date'] ?? null,
                    'vb_slot_date' => null,
                    'demurrage_date' => null,
                    'detention_days' => 0,
                    'voyage' => $validated['voyage'] ?? null,
                    'xray' => (bool)($containerData['xray'] ?? false),
                    'dgs' => (bool)($containerData['dgs'] ?? false),
                    'live_ul' => (bool)($containerData['live_ul'] ?? false),
                    'hold_sh' => (bool)($containerData['hold_sh'] ?? false),
                    'hold_customs' => false,
                    'hold_mpi' => false,
                ]);
            }

            $export->jobServices()->delete();
            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $serviceId) {
                    $export->jobServices()->create([
                        'service_id' => $serviceId,
                    ]);
                }
            }

            $export->jobNotes()->delete();
            if (!empty($validated['notes'])) {
                foreach ($validated['notes'] as $noteData) {
                    $export->jobNotes()->create([
                        'endorsement_id' => $noteData['endorsement_id'],
                        'note' => $noteData['note'] ?? null,
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('exports.show', $export->id)->with('success', 'Export job updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update export job: ' . $e->getMessage()]);
        }
    }

    public function destroy(Export $export)
    {
        DB::beginTransaction();
        try {
            $export->revenues()->delete();
            $export->costs()->delete();
            $export->containers()->forceDelete();
            $export->jobServices()->delete();
            $export->jobNotes()->delete();
            $export->delete();
            DB::commit();
            return redirect()->route('exports.index')->with('success', 'Export job deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete export job: ' . $e->getMessage()]);
        }
    }

    private function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'document_received_at' => 'nullable|date',
            'shipping_id' => 'nullable|exists:shippings,id',
            'vessel_id' => 'nullable|exists:vessels,id',
            'voyage' => 'nullable|string|max:100',
            'from_location' => 'nullable|string|max:150',
            'to_location' => 'nullable|string|max:150',
            'containers' => 'required|array|min:1',
            'containers.*.container_number' => 'required|string|max:100',
            'containers.*.reference' => 'nullable|string|max:100',
            'containers.*.iso_code_id' => 'nullable|exists:iso_codes,id',
            'containers.*.ship_type_id' => 'nullable|exists:ship_types,id',
            'containers.*.weight' => 'nullable|numeric|min:0',
            'containers.*.no_of_containers' => 'nullable|integer|min:1',
            'containers.*.random_number' => 'nullable|string|max:100',
            'containers.*.release_ecn_number' => 'nullable|string|max:100',
            'containers.*.port_pin_no' => 'nullable|string|max:100',
            'containers.*.cut_off_date' => 'nullable|date',
            'containers.*.available_date' => 'nullable|date',
            'containers.*.xray' => 'nullable|boolean',
            'containers.*.dgs' => 'nullable|boolean',
            'containers.*.live_ul' => 'nullable|boolean',
            'containers.*.hold_sh' => 'nullable|boolean',
            'services' => 'nullable|array',
            'services.*' => 'exists:services,id',
            'notes' => 'nullable|array',
            'notes.*.endorsement_id' => 'required|exists:endorsements,id',
            'notes.*.note' => 'nullable|string|max:1000',
        ];
    }

    private function formPayload(): array
    {
        return [
            'customers' => Customer::query()->get(['id', 'name', 'customer_code']),
            'isoCodes' => IsoCode::query()->get(['id', 'name', 'code']),
            'shippings' => Shipping::query()->get(['id', 'name']),
            'vessels' => Vessel::query()->get(['id', 'name']),
            'shipTypes' => ShipType::query()->get(['id', 'name']),
            'services' => Service::query()->get(['id', 'name']),
            'endorsements' => Endorsement::query()->get(['id', 'name']),
        ];
    }
}
