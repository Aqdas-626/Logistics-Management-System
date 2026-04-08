<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Models\Cart;
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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $query = Cart::with(['customer', 'containers'])->latest();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('job_no', 'like', "%{$request->search}%")
                    ->orWhereHas('customer', function ($cq) use ($request) {
                        $cq->where('name', 'like', "%{$request->search}%")
                            ->orWhere('customer_code', 'like', "%{$request->search}%");
                    });
            });
        }

        return Inertia::render('Cart/Carts/Index', [
            'carts' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Cart/Carts/Create', $this->formPayload());
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        DB::beginTransaction();
        try {
            $cart = Cart::create([
                'customer_id' => $validated['customer_id'],
                'document_received_at' => $validated['document_received_at'] ?? null,
                'from_location' => $validated['from_location'] ?? null,
                'to_location' => $validated['to_location'] ?? null,
            ]);

            foreach ($validated['containers'] as $containerData) {
                Container::create([
                    'container_number' => $containerData['container_number'],
                    'job_type' => Cart::JOB_TYPE,
                    'job_id' => $cart->id,
                    'reference' => $containerData['reference'] ?? null,
                    'iso_code_id' => $containerData['iso_code_id'] ?? null,
                    'weight' => $containerData['weight'] ?? null,
                    'available_date' => $containerData['available_date'] ?? null,
                    'door_type_id' => $containerData['door_type_id'] ?? null,
                    'lift_type_id' => $containerData['lift_type_id'] ?? null,
                    'xray' => (bool) ($containerData['xray'] ?? false),
                    'dgs' => (bool) ($containerData['dgs'] ?? false),
                    'ready_now' => (bool) ($containerData['ready_now'] ?? false),
                    'from_location' => $validated['from_location'],
                    'to_location' => $validated['to_location'],
                    'no_of_containers' => 1,
                ]);
            }

            if (! empty($validated['services'])) {
                foreach ($validated['services'] as $serviceId) {
                    $cart->jobServices()->create([
                        'service_id' => $serviceId,
                    ]);
                }
            }

            if (! empty($validated['notes'])) {
                foreach ($validated['notes'] as $noteData) {
                    $cart->jobNotes()->create([
                        'endorsement_id' => $noteData['endorsement_id'],
                        'note' => $noteData['note'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('carts.index')->with('success', 'Cart job created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to create cart job: '.$e->getMessage()]);
        }
    }

    public function show(Cart $cart)
    {
        $cart->load([
            'customer',
            'containers.isoCode',
            'containers.doorType',
            'containers.liftType',
        ]);

        return Inertia::render('Cart/Carts/Show', array_merge([
            'cartJob' => $cart,
            'jobServices' => $cart->jobServices()
                ->with('service:id,name')
                ->latest()
                ->take(20)
                ->get(),
            'jobNotes' => $cart->jobNotes()
                ->with('endorsement:id,name')
                ->latest()
                ->take(20)
                ->get(),
        ], JobFinancialShowData::for(Cart::class, $cart->id)));
    }

    public function edit(Cart $cart)
    {
        $cart->load(['customer', 'containers']);
        $container = $cart->containers->first();
        $jobServices = $cart->jobServices()->get(['service_id']);
        $jobNotes = $cart->jobNotes()->get(['endorsement_id', 'note']);

        return Inertia::render('Cart/Carts/Edit', array_merge($this->formPayload(), [
            'cartJob' => $cart,
            'container' => $container,
            'containers' => $cart->containers,
            'jobServices' => $jobServices,
            'jobNotes' => $jobNotes,
        ]));
    }

    public function update(Request $request, Cart $cart)
    {
        $validated = $request->validate($this->rules());

        DB::beginTransaction();
        try {
            $cart->update([
                'customer_id' => $validated['customer_id'],
                'document_received_at' => $validated['document_received_at'] ?? null,
                'from_location' => $validated['from_location'] ?? null,
                'to_location' => $validated['to_location'] ?? null,
            ]);

            $cart->containers()->forceDelete();
            foreach ($validated['containers'] as $containerData) {
                Container::create([
                    'container_number' => $containerData['container_number'],
                    'job_type' => Cart::JOB_TYPE,
                    'job_id' => $cart->id,
                    'reference' => $containerData['reference'] ?? null,
                    'iso_code_id' => $containerData['iso_code_id'] ?? null,
                    'weight' => $containerData['weight'] ?? null,
                    'available_date' => $containerData['available_date'] ?? null,
                    'door_type_id' => $containerData['door_type_id'] ?? null,
                    'lift_type_id' => $containerData['lift_type_id'] ?? null,
                    'xray' => (bool) ($containerData['xray'] ?? false),
                    'dgs' => (bool) ($containerData['dgs'] ?? false),
                    'ready_now' => (bool) ($containerData['ready_now'] ?? false),
                    'from_location' => $validated['from_location'],
                    'to_location' => $validated['to_location'],
                    'no_of_containers' => 1,
                ]);
            }

            $cart->jobServices()->delete();
            if (! empty($validated['services'])) {
                foreach ($validated['services'] as $serviceId) {
                    $cart->jobServices()->create([
                        'service_id' => $serviceId,
                    ]);
                }
            }

            $cart->jobNotes()->delete();
            if (! empty($validated['notes'])) {
                foreach ($validated['notes'] as $noteData) {
                    $cart->jobNotes()->create([
                        'endorsement_id' => $noteData['endorsement_id'],
                        'note' => $noteData['note'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('carts.show', $cart->id)->with('success', 'Cart job updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to update cart job: '.$e->getMessage()]);
        }
    }

    public function destroy(Cart $cart)
    {
        DB::beginTransaction();
        try {
            $cart->revenues()->delete();
            $cart->costs()->delete();
            $cart->jobServices()->delete();
            $cart->jobNotes()->delete();
            $cart->containers()->delete();
            $cart->delete();
            DB::commit();

            return redirect()->route('carts.index')->with('success', 'Cart job deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to delete cart job: '.$e->getMessage()]);
        }
    }

    private function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'document_received_at' => 'nullable|date',
            'from_location' => 'nullable|string|max:150',
            'to_location' => 'nullable|string|max:150',
            'containers' => 'required|array|min:1',
            'containers.*.container_number' => 'required|string|max:100',
            'containers.*.reference' => 'nullable|string|max:100',
            'containers.*.iso_code_id' => 'nullable|exists:iso_codes,id',
            'containers.*.weight' => 'nullable|numeric|min:0',
            'containers.*.available_date' => 'nullable|date',
            'containers.*.door_type_id' => 'nullable|exists:door_types,id',
            'containers.*.lift_type_id' => 'nullable|exists:lift_types,id',
            'containers.*.xray' => 'nullable|boolean',
            'containers.*.dgs' => 'nullable|boolean',
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
