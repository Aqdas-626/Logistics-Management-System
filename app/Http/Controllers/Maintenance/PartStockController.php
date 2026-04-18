<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\PartStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartStockController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = PartStock::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('sku', 'like', '%'.$search.'%')
                    ->orWhere('unit', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('MaintenanceManagement/PartsStock/Index', [
            'parts' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->normalizePartStockRequest($request);

        $validated = $request->validate([
            'sku' => ['nullable', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:200'],
            'unit' => ['required', 'string', 'max:20'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'stock_qty' => ['required', 'integer', 'min:0'],
        ]);

        PartStock::create($validated);

        return redirect()
            ->route('part-stocks.index')
            ->with('success', 'Part stock created successfully.');
    }

    public function update(Request $request, PartStock $partStock): RedirectResponse
    {
        $this->normalizePartStockRequest($request);

        $validated = $request->validate([
            'sku' => ['nullable', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:200'],
            'unit' => ['required', 'string', 'max:20'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'stock_qty' => ['required', 'integer', 'min:0'],
        ]);

        $partStock->update($validated);

        return redirect()
            ->route('part-stocks.index')
            ->with('success', 'Part stock updated successfully.');
    }

    public function destroy(PartStock $partStock): RedirectResponse
    {
        $partStock->delete();

        return redirect()
            ->route('part-stocks.index')
            ->with('success', 'Part stock deleted successfully.');
    }

    private function normalizePartStockRequest(Request $request): void
    {
        if ($request->input('sku') === '') {
            $request->merge(['sku' => null]);
        }
        if ($request->input('unit_cost') === '' || $request->input('unit_cost') === null) {
            $request->merge(['unit_cost' => null]);
        }
    }
}
