<?php

namespace App\Http\Controllers\Import;

use App\Http\Controllers\Controller;
use App\Models\Container;
use App\Models\Customer;
use App\Models\DgType;
use App\Models\Endorsement;
use App\Models\Import;
use App\Models\IsoCode;
use App\Models\JobDocument;
use App\Models\JobNote;
use App\Models\JobService;
use App\Models\Service;
use App\Models\Shipping;
use App\Models\ShipType;
use App\Models\Vessel;
use App\Support\JobFinancialShowData;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function index(Request $request)
    {
        $query = Import::with(['customer', 'containers'])->where('job_type', Import::JOB_TYPE);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('job_number', 'like', "%{$request->search}%")
                    ->orWhereHas('customer', function ($cq) use ($request) {
                        $cq->where('name', 'like', "%{$request->search}%")
                            ->orWhere('customer_code', 'like', "%{$request->search}%");
                    });
            });
        }

        return Inertia::render('Import/Imports/Index', [
            'imports' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Import/Imports/Create', $this->formPayload());
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        DB::beginTransaction();
        try {
            $import = Import::create([
                'customer_id' => $validated['customer_id'],
                'job_type' => Import::JOB_TYPE,
                'document_received_at' => $validated['document_received_at'] ?? null,
            ]);

            foreach ($validated['containers'] as $containerData) {
                Container::create([
                    'container_number' => $containerData['container_number'],
                    'job_type' => Import::JOB_TYPE,
                    'job_id' => $import->id,
                    'cut_off_date' => $containerData['cut_off_date'] ?? null,
                    'grid_position' => $containerData['grid_position'] ?? null,
                    'no_of_containers' => $containerData['no_of_containers'] ?? 1,
                    'reference' => $containerData['reference'] ?? null,
                    'iso_code_id' => $containerData['iso_code_id'] ?? null,
                    'dg_type_id' => $containerData['dg_type_id'] ?? null,
                    'shipping_id' => $containerData['shipping_id'] ?? null,
                    'vessel_id' => $containerData['vessel_id'] ?? null,
                    'ship_type_id' => $containerData['ship_type_id'] ?? null,
                    'weight' => $containerData['weight'] ?? null,
                    'from_location' => $containerData['from_location'] ?? null,
                    'to_location' => $containerData['to_location'] ?? null,
                    'return_to' => $containerData['return_to'] ?? null,
                    'security_check' => $containerData['security_check'] ?? null,
                    'random_number' => $containerData['random_number'] ?? null,
                    'release_ecn_number' => $containerData['release_ecn_number'] ?? null,
                    'port_pin_no' => $containerData['port_pin_no'] ?? null,
                    'available_date' => $containerData['available_date'] ?? null,
                    'vb_slot_date' => $containerData['vb_slot_date'] ?? null,
                    'demurrage_date' => $containerData['demurrage_date'] ?? null,
                    'detention_days' => $containerData['detention_days'] ?? 0,
                    'voyage' => $containerData['voyage'] ?? null,
                    'xray' => (bool)($containerData['xray'] ?? false),
                    'dgs' => (bool)($containerData['dgs'] ?? false),
                    'live_ul' => (bool)($containerData['live_ul'] ?? false),
                    'hold_sh' => (bool)($containerData['hold_sh'] ?? false),
                    'hold_customs' => (bool)($containerData['hold_customs'] ?? false),
                    'hold_mpi' => (bool)($containerData['hold_mpi'] ?? false),
                ]);
            }

            if (!empty($validated['documents'])) {
                foreach ($validated['documents'] as $doc) {
                    $fileValue = $doc['file'];
                    $storedPath = $fileValue instanceof UploadedFile
                        ? $fileValue->store('job-documents', 'public')
                        : (string) $fileValue;

                    JobDocument::create([
                        'job_type' => Import::JOB_TYPE,
                        'file' => $storedPath,
                    ]);
                }
            }

            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $serviceId) {
                    $import->jobServices()->create([
                        'service_id' => $serviceId,
                    ]);
                }
            }

            if (!empty($validated['notes'])) {
                foreach ($validated['notes'] as $noteData) {
                    $import->jobNotes()->create([
                        'endorsement_id' => $noteData['endorsement_id'],
                        'note' => $noteData['note'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('imports.index')->with('success', 'Import job created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create import job: ' . $e->getMessage()]);
        }
    }

    public function show(Import $import)
    {
        $import->load(['customer', 'containers.isoCode', 'containers.shipping', 'containers.vessel', 'containers.shipType', 'containers.dgType']);

        return Inertia::render('Import/Imports/Show', array_merge([
            'importJob' => $import,
            'jobServices' => $import->jobServices()
                ->with('service:id,name')
                ->latest()
                ->take(20)
                ->get(),
            'jobNotes' => $import->jobNotes()
                ->with('endorsement:id,name')
                ->latest()
                ->take(20)
                ->get(),
            'jobDocuments' => JobDocument::where('job_type', Import::JOB_TYPE)->latest()->take(20)->get(),
        ], JobFinancialShowData::for(Import::class, $import->id)));
    }

    public function edit(Import $import)
    {
        $import->load(['customer', 'containers']);
        $container = $import->containers->first();
        $jobServices = $import->jobServices()->get(['service_id']);
        $jobNotes = $import->jobNotes()->get(['endorsement_id', 'note']);
        return Inertia::render('Import/Imports/Edit', array_merge($this->formPayload(), [
            'importJob' => $import,
            'container' => $container,
            'containers' => $import->containers,
            'jobServices' => $jobServices,
            'jobNotes' => $jobNotes,
        ]));
    }

    public function update(Request $request, Import $import)
    {
        $validated = $request->validate($this->rules($import->id));

        DB::beginTransaction();
        try {
            $import->update([
                'customer_id' => $validated['customer_id'],
                'job_type' => Import::JOB_TYPE,
                'document_received_at' => $validated['document_received_at'] ?? null,
            ]);

            // Container has unique container_number. Soft-deleting old rows keeps unique value occupied,
            // so we hard-delete old rows before recreating the submitted container list.
            $import->containers()->forceDelete();
            foreach ($validated['containers'] as $containerData) {
                Container::create([
                    'container_number' => $containerData['container_number'],
                    'job_type' => Import::JOB_TYPE,
                    'job_id' => $import->id,
                    'cut_off_date' => $containerData['cut_off_date'] ?? null,
                    'grid_position' => $containerData['grid_position'] ?? null,
                    'no_of_containers' => $containerData['no_of_containers'] ?? 1,
                    'reference' => $containerData['reference'] ?? null,
                    'iso_code_id' => $containerData['iso_code_id'] ?? null,
                    'dg_type_id' => $containerData['dg_type_id'] ?? null,
                    'shipping_id' => $containerData['shipping_id'] ?? null,
                    'vessel_id' => $containerData['vessel_id'] ?? null,
                    'ship_type_id' => $containerData['ship_type_id'] ?? null,
                    'weight' => $containerData['weight'] ?? null,
                    'from_location' => $containerData['from_location'] ?? null,
                    'to_location' => $containerData['to_location'] ?? null,
                    'return_to' => $containerData['return_to'] ?? null,
                    'security_check' => $containerData['security_check'] ?? null,
                    'random_number' => $containerData['random_number'] ?? null,
                    'release_ecn_number' => $containerData['release_ecn_number'] ?? null,
                    'port_pin_no' => $containerData['port_pin_no'] ?? null,
                    'available_date' => $containerData['available_date'] ?? null,
                    'vb_slot_date' => $containerData['vb_slot_date'] ?? null,
                    'demurrage_date' => $containerData['demurrage_date'] ?? null,
                    'detention_days' => $containerData['detention_days'] ?? 0,
                    'voyage' => $containerData['voyage'] ?? null,
                    'xray' => (bool)($containerData['xray'] ?? false),
                    'dgs' => (bool)($containerData['dgs'] ?? false),
                    'live_ul' => (bool)($containerData['live_ul'] ?? false),
                    'hold_sh' => (bool)($containerData['hold_sh'] ?? false),
                    'hold_customs' => (bool)($containerData['hold_customs'] ?? false),
                    'hold_mpi' => (bool)($containerData['hold_mpi'] ?? false),
                ]);
            }

            if (!empty($validated['documents'])) {
                foreach ($validated['documents'] as $doc) {
                    $fileValue = $doc['file'];
                    $storedPath = $fileValue instanceof UploadedFile
                        ? $fileValue->store('job-documents', 'public')
                        : (string) $fileValue;

                    JobDocument::create([
                        'job_type' => Import::JOB_TYPE,
                        'file' => $storedPath,
                    ]);
                }
            }

            if (!empty($validated['services'])) {
                $import->jobServices()->delete();
                foreach ($validated['services'] as $serviceId) {
                    $import->jobServices()->create([
                        'service_id' => $serviceId,
                    ]);
                }
            }
            if (empty($validated['services'])) {
                $import->jobServices()->delete();
            }

            if (!empty($validated['notes'])) {
                $import->jobNotes()->delete();
                foreach ($validated['notes'] as $noteData) {
                    $import->jobNotes()->create([
                        'endorsement_id' => $noteData['endorsement_id'],
                        'note' => $noteData['note'] ?? null,
                    ]);
                }
            }
            if (empty($validated['notes'])) {
                $import->jobNotes()->delete();
            }

            DB::commit();
            return redirect()->route('imports.show', $import->id)->with('success', 'Import job updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update import job: ' . $e->getMessage()]);
        }
    }

    public function destroy(Import $import)
    {
        DB::beginTransaction();
        try {
            $import->revenues()->delete();
            $import->costs()->delete();
            $import->jobServices()->delete();
            $import->jobNotes()->delete();
            $import->containers()->delete();
            $import->delete();
            DB::commit();
            return redirect()->route('imports.index')->with('success', 'Import job deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete import job: ' . $e->getMessage()]);
        }
    }

    private function rules(?int $importId = null): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'document_received_at' => 'nullable|date',
            'containers' => 'required|array|min:1',
            'containers.*.container_number' => 'required|string|max:100',
            'containers.*.reference' => 'nullable|string|max:100',
            'containers.*.iso_code_id' => 'nullable|exists:iso_codes,id',
            'containers.*.dg_type_id' => 'nullable|exists:dg_types,id',
            'containers.*.shipping_id' => 'nullable|exists:shippings,id',
            'containers.*.vessel_id' => 'nullable|exists:vessels,id',
            'containers.*.ship_type_id' => 'nullable|exists:ship_types,id',
            'containers.*.weight' => 'nullable|numeric|min:0',
            'containers.*.no_of_containers' => 'nullable|integer|min:1',
            'containers.*.from_location' => 'nullable|string|max:150',
            'containers.*.to_location' => 'nullable|string|max:150',
            'containers.*.return_to' => 'nullable|string|max:150',
            'containers.*.security_check' => 'nullable|string|max:100',
            'containers.*.random_number' => 'nullable|string|max:100',
            'containers.*.release_ecn_number' => 'nullable|string|max:100',
            'containers.*.port_pin_no' => 'nullable|string|max:100',
            'containers.*.cut_off_date' => 'nullable|date',
            'containers.*.available_date' => 'nullable|date',
            'containers.*.vb_slot_date' => 'nullable|date',
            'containers.*.demurrage_date' => 'nullable|date',
            'containers.*.detention_days' => 'nullable|integer|min:0',
            'containers.*.voyage' => 'nullable|string|max:100',
            'containers.*.xray' => 'nullable|boolean',
            'containers.*.dgs' => 'nullable|boolean',
            'containers.*.live_ul' => 'nullable|boolean',
            'containers.*.hold_sh' => 'nullable|boolean',
            'containers.*.hold_customs' => 'nullable|boolean',
            'containers.*.hold_mpi' => 'nullable|boolean',
            'services' => 'nullable|array',
            'services.*' => 'exists:services,id',
            'notes' => 'nullable|array',
            'notes.*.endorsement_id' => 'required|exists:endorsements,id',
            'notes.*.note' => 'nullable|string|max:1000',
            'documents' => 'nullable|array',
            'documents.*.file' => 'nullable|file|max:10240',
        ];
    }

    private function formPayload(): array
    {
        return [
            'customers' => Customer::query()->get(['id', 'name', 'customer_code']),
            'isoCodes' => IsoCode::query()->get(['id', 'name', 'code']),
            'dgTypes' => DgType::query()->get(['id', 'name']),
            'shippings' => Shipping::query()->get(['id', 'name']),
            'vessels' => Vessel::query()->get(['id', 'name']),
            'shipTypes' => ShipType::query()->get(['id', 'name']),
            'services' => Service::query()->get(['id', 'name']),
            'endorsements' => Endorsement::query()->get(['id', 'name']),
        ];
    }
}
