<?php

namespace App\Http\Controllers\Country;

use App\Http\Controllers\Controller;
use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Models\Branch;
use App\Models\BranchAsset;
use App\Models\BranchContact;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $companyId = $request->filled('company_id')
            ? (int) $request->input('company_id')
            : null;

        $branches = Branch::query()
            ->with([
                'company:id,name',
                'manager:id,name,email',
            ])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'like', '%'.$search.'%')
                        ->orWhere('code', 'like', '%'.$search.'%')
                        ->orWhere('city', 'like', '%'.$search.'%');
                });
            })
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Branch/Index', [
            'branches' => $branches,
            'companies' => Company::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => [
                'search' => $search,
                'company_id' => $companyId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Branch/Create', [
            'companies' => Company::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'branch' => [
                'company_id' => '',
                'name' => '',
                'code' => '',
                'phone' => '',
                'address_line1' => '',
                'address_line2' => '',
                'city' => '',
                'state' => '',
                'postcode' => '',
                'country_code' => '',
                'timezone' => 'UTC',
                'base_currency' => 'USD',
                'status' => 'active',
                'manager_user_id' => '',
            ],
            'contact' => [
                'name' => '',
                'email' => '',
                'phone' => '',
                'designation' => '',
                'status' => 'active',
            ],
            'assets' => [],
        ]);
    }

    public function store(StoreBranchRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $data = $request->validated();
            $contact = $data['contact'] ?? null;
            $assets = $data['assets'] ?? [];
            unset($data['contact'], $data['assets']);

            $branch = Branch::query()->create($data);
            $this->persistContact($branch, $contact);
            $this->createAssets($branch, $assets);
        });

        return redirect()
            ->route('branches.index')
            ->with('success', 'Branch created successfully.');
    }

    public function show(Branch $branch): Response
    {
        $branch->load([
            'company.country',
            'manager:id,name,email',
            'contact',
            'assets',
        ]);
        $branch->loadCount('branchEmployees');

        return Inertia::render('Branch/Show', [
            'branch' => $branch,
        ]);
    }

    public function edit(Branch $branch): Response
    {
        $branch->load(['contact', 'assets']);

        return Inertia::render('Branch/Edit', [
            'companies' => Company::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'branch' => $branch,
            'contact' => $branch->contact ?? [
                'name' => '',
                'email' => '',
                'phone' => '',
                'designation' => '',
                'status' => 'active',
            ],
            'assets' => $branch->assets->isEmpty()
                ? []
                : $branch->assets->map(fn (BranchAsset $a) => [
                    'id' => $a->id,
                    'asset_name' => $a->asset_name,
                    'asset_code' => $a->asset_code,
                    'category' => $a->category ?? '',
                    'serial_no' => $a->serial_no ?? '',
                    'quantity' => $a->quantity,
                    'condition' => $a->condition ?? '',
                    'purchase_date' => $a->purchase_date?->format('Y-m-d') ?? '',
                    'status' => $a->status,
                ])->values()->all(),
        ]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch): RedirectResponse
    {
        DB::transaction(function () use ($request, $branch): void {
            $data = $request->validated();
            $contact = $data['contact'] ?? null;
            $assets = $data['assets'] ?? [];
            unset($data['contact'], $data['assets']);

            $branch->update($data);
            $this->persistContact($branch, $contact, true);
            $this->syncAssets($branch, $assets);
        });

        return redirect()
            ->route('branches.index')
            ->with('success', 'Branch updated successfully.');
    }

    public function destroy(Branch $branch): RedirectResponse
    {
        $branch->delete();

        return redirect()
            ->route('branches.index')
            ->with('success', 'Branch deleted successfully.');
    }

    /**
     * @param  array<string, mixed>|null  $contact
     */
    private function persistContact(Branch $branch, ?array $contact, bool $allowRemove = false): void
    {
        if (! is_array($contact)) {
            return;
        }

        $hasAny = collect($contact)
            ->filter(fn ($v) => $v !== null && $v !== '')
            ->isNotEmpty();

        $existing = $branch->contact;

        if (! $hasAny) {
            if ($allowRemove) {
                $existing?->delete();
            }

            return;
        }

        $payload = [
            'name' => $contact['name'],
            'email' => ! empty($contact['email']) ? $contact['email'] : null,
            'phone' => $contact['phone'],
            'designation' => ! empty($contact['designation']) ? $contact['designation'] : null,
            'status' => $contact['status'] ?? 'active',
        ];

        if ($existing) {
            $existing->update($payload);
        } else {
            BranchContact::query()->create([
                'branch_id' => $branch->id,
                ...$payload,
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $assets
     */
    private function createAssets(Branch $branch, array $assets): void
    {
        foreach ($assets as $row) {
            BranchAsset::query()->create([
                'branch_id' => $branch->id,
                'asset_name' => $row['asset_name'],
                'asset_code' => $row['asset_code'],
                'category' => $row['category'] ?? null,
                'serial_no' => $row['serial_no'] ?? null,
                'quantity' => $row['quantity'] ?? 1,
                'condition' => $row['condition'] ?? null,
                'purchase_date' => $row['purchase_date'] ?? null,
                'status' => $row['status'] ?? 'active',
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $assets
     */
    private function syncAssets(Branch $branch, array $assets): void
    {
        $keptIds = collect($assets)->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();

        $query = BranchAsset::query()->where('branch_id', $branch->id);
        if ($keptIds !== []) {
            $query->whereNotIn('id', $keptIds);
        }
        $query->get()->each->delete();

        foreach ($assets as $row) {
            $payload = [
                'asset_name' => $row['asset_name'],
                'asset_code' => $row['asset_code'],
                'category' => $row['category'] ?? null,
                'serial_no' => $row['serial_no'] ?? null,
                'quantity' => $row['quantity'] ?? 1,
                'condition' => $row['condition'] ?? null,
                'purchase_date' => $row['purchase_date'] ?? null,
                'status' => $row['status'] ?? 'active',
            ];

            if (! empty($row['id'])) {
                $asset = BranchAsset::query()
                    ->where('branch_id', $branch->id)
                    ->find((int) $row['id']);
                $asset?->update($payload);
            } else {
                BranchAsset::query()->create([
                    'branch_id' => $branch->id,
                    ...$payload,
                ]);
            }
        }
    }
}
