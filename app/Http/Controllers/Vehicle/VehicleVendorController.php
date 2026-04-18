<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Models\VehicleVendor;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VehicleVendorController extends Controller
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

    private function filteredQuery(string $search)
    {
        $query = VehicleVendor::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('vendor_name', 'like', '%'.$search.'%')
                    ->orWhere('contact_person', 'like', '%'.$search.'%')
                    ->orWhere('mobile_number', 'like', '%'.$search.'%')
                    ->orWhere('status', 'like', '%'.$search.'%');
            });
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = $this->filteredQuery($search);

        return Inertia::render('Vehicle/Vendors/Index', [
            'vendors' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vehicle/Vendors/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_name' => ['required', 'string', 'max:160'],
            'contact_person' => ['required', 'string', 'max:160'],
            'mobile_number' => ['required', 'string', 'max:30'],
            'date_of_contract' => ['required', 'date'],
            'status' => ['required', 'in:active,inactive,on_hold'],
            'contract_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'address' => ['required', 'string'],
        ]);

        if ($request->hasFile('contract_document')) {
            $validated['contract_document'] = $request->file('contract_document')->store('vehicle-vendors', 'public');
        }

        VehicleVendor::create($validated);

        return redirect()
            ->route('vehicle-vendors.index')
            ->with('success', 'Vehicle vendor created successfully.');
    }

    public function edit(VehicleVendor $vehicleVendor): Response
    {
        return Inertia::render('Vehicle/Vendors/Edit', [
            'vendor' => $vehicleVendor,
        ]);
    }

    public function update(Request $request, VehicleVendor $vehicleVendor): RedirectResponse
    {
        $validated = $request->validate([
            'vendor_name' => ['required', 'string', 'max:160'],
            'contact_person' => ['required', 'string', 'max:160'],
            'mobile_number' => ['required', 'string', 'max:30'],
            'date_of_contract' => ['required', 'date'],
            'status' => ['required', 'in:active,inactive,on_hold'],
            'contract_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'address' => ['required', 'string'],
        ]);

        if ($request->hasFile('contract_document')) {
            if ($vehicleVendor->contract_document) {
                Storage::disk('public')->delete($vehicleVendor->contract_document);
            }
            $validated['contract_document'] = $request->file('contract_document')->store('vehicle-vendors', 'public');
        }

        $vehicleVendor->update($validated);

        return redirect()
            ->route('vehicle-vendors.index')
            ->with('success', 'Vehicle vendor updated successfully.');
    }

    public function destroy(VehicleVendor $vehicleVendor): RedirectResponse
    {
        if ($vehicleVendor->contract_document) {
            Storage::disk('public')->delete($vehicleVendor->contract_document);
        }

        $vehicleVendor->delete();

        return redirect()
            ->route('vehicle-vendors.index')
            ->with('success', 'Vehicle vendor deleted successfully.');
    }

    public function exportCsv(Request $request)
    {
        $search = $request->string('search')->trim()->value();
        $vendors = $this->filteredQuery($search);
        $selectedIds = $this->selectedIds($request);
        if ($selectedIds !== []) {
            $vendors->whereIn('id', $selectedIds);
        }
        $vendors = $vendors->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="vehicle-vendors.csv"',
        ];

        $callback = function () use ($vendors) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['S.NO', 'COMPANY', 'CONTACT PERSON', 'MOBILE', 'DATE OF CONTRACT', 'CONTRACT DOC', 'ADDRESS', 'IS ACTIVE']);

            foreach ($vendors as $index => $vendor) {
                fputcsv($handle, [
                    $index + 1,
                    $vendor->vendor_name,
                    $vendor->contact_person,
                    $vendor->mobile_number,
                    optional($vendor->date_of_contract)->format('d-m-Y'),
                    $vendor->contract_document ? 'Yes' : '-',
                    $vendor->address,
                    $vendor->status === 'active' ? 'Active' : ucfirst(str_replace('_', ' ', $vendor->status)),
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $search = $request->string('search')->trim()->value();
        $vendors = $this->filteredQuery($search);
        $selectedIds = $this->selectedIds($request);
        if ($selectedIds !== []) {
            $vendors->whereIn('id', $selectedIds);
        }
        $vendors = $vendors->get();

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="vehicle-vendors.xls"',
        ];

        $callback = function () use ($vendors) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['S.NO', 'COMPANY', 'CONTACT PERSON', 'MOBILE', 'DATE OF CONTRACT', 'CONTRACT DOC', 'ADDRESS', 'IS ACTIVE'], "\t");

            foreach ($vendors as $index => $vendor) {
                fputcsv($handle, [
                    $index + 1,
                    $vendor->vendor_name,
                    $vendor->contact_person,
                    $vendor->mobile_number,
                    optional($vendor->date_of_contract)->format('d-m-Y'),
                    $vendor->contract_document ? 'Yes' : '-',
                    $vendor->address,
                    $vendor->status === 'active' ? 'Active' : ucfirst(str_replace('_', ' ', $vendor->status)),
                ], "\t");
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $search = $request->string('search')->trim()->value();
        $vendors = $this->filteredQuery($search);
        $selectedIds = $this->selectedIds($request);
        if ($selectedIds !== []) {
            $vendors->whereIn('id', $selectedIds);
        }
        $vendors = $vendors->get();

        $pdf = Pdf::loadView('exports.vehicle-vendors-pdf', [
            'vendors' => $vendors,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('vehicle-vendors.pdf');
    }
}
