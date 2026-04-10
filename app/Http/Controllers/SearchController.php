<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Cart;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Export;
use App\Models\Import;
use App\Models\JobBooking;
use App\Models\Location;
use App\Models\Swing;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $like = '%'.$q.'%';

        if ($q === '') {
            return Inertia::render('Search/Index', [
                'q' => '',
                'sections' => [],
                'total' => 0,
            ]);
        }

        $sections = [];

        $push = function (string $key, string $title, array $items) use (&$sections): void {
            if (count($items) > 0) {
                $sections[] = [
                    'key' => $key,
                    'title' => $title,
                    'items' => $items,
                ];
            }
        };

        $push('jobs', 'Jobs', $this->jobResults($like));
        $push('job_bookings', 'Job Bookings', $this->jobBookingResults($like));
        $push('customers', 'Customers', $this->customerResults($like));
        $push('companies', 'Companies', $this->companyResults($like));
        $push('branches', 'Branches', $this->branchResults($like));
        $push('locations', 'Locations', $this->locationResults($like));
        $push('vehicles', 'Vehicles', $this->vehicleResults($like));

        $total = (int) collect($sections)->sum(fn ($s) => count($s['items']));

        return Inertia::render('Search/Index', [
            'q' => $q,
            'sections' => $sections,
            'total' => $total,
        ]);
    }

    private function jobResults(string $like): array
    {
        $imports = Import::query()
            ->with('customer:id,name')
            ->where('job_number', 'like', $like)
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Import $row) => [
                'id' => 'import-'.$row->id,
                'title' => $row->job_number,
                'subtitle' => 'Import'.($row->customer?->name ? ' - '.$row->customer->name : ''),
                'href' => route('imports.edit', $row->id),
            ]);

        $exports = Export::query()
            ->with('customer:id,name')
            ->where('job_number', 'like', $like)
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Export $row) => [
                'id' => 'export-'.$row->id,
                'title' => $row->job_number,
                'subtitle' => 'Export'.($row->customer?->name ? ' - '.$row->customer->name : ''),
                'href' => route('exports.edit', $row->id),
            ]);

        $carts = Cart::query()
            ->with('customer:id,name')
            ->where('job_no', 'like', $like)
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Cart $row) => [
                'id' => 'cart-'.$row->id,
                'title' => $row->job_no,
                'subtitle' => 'Cart'.($row->customer?->name ? ' - '.$row->customer->name : ''),
                'href' => route('carts.edit', $row->id),
            ]);

        $swings = Swing::query()
            ->with('customer:id,name')
            ->where('job_no', 'like', $like)
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Swing $row) => [
                'id' => 'swing-'.$row->id,
                'title' => $row->job_no,
                'subtitle' => 'Swing'.($row->customer?->name ? ' - '.$row->customer->name : ''),
                'href' => route('swings.edit', $row->id),
            ]);

        return $imports
            ->concat($exports)
            ->concat($carts)
            ->concat($swings)
            ->take(10)
            ->values()
            ->all();
    }

    private function jobBookingResults(string $like): array
    {
        return JobBooking::query()
            ->with('customer:id,name')
            ->where('job_number', 'like', $like)
            ->orWhere('booking_id', 'like', $like)
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn (JobBooking $row) => [
                'id' => 'job-booking-'.$row->id,
                'title' => $row->job_number,
                'subtitle' => ($row->booking_id ? 'Booking: '.$row->booking_id.' - ' : '').($row->customer?->name ?? 'No customer'),
                'href' => route('job-bookings.edit', $row->id),
            ])
            ->values()
            ->all();
    }

    private function customerResults(string $like): array
    {
        return Customer::query()
            ->where('name', 'like', $like)
            ->orWhere('customer_code', 'like', $like)
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn (Customer $row) => [
                'id' => 'customer-'.$row->id,
                'title' => $row->name,
                'subtitle' => $row->customer_code ?? 'Customer',
                'href' => route('customers.edit', $row->id),
            ])
            ->values()
            ->all();
    }

    private function companyResults(string $like): array
    {
        return Company::query()
            ->where('name', 'like', $like)
            ->orWhere('email', 'like', $like)
            ->orWhere('phone', 'like', $like)
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn (Company $row) => [
                'id' => 'company-'.$row->id,
                'title' => $row->name,
                'subtitle' => $row->email ?: ($row->phone ?: 'Company'),
                'href' => route('companies.edit', $row->id),
            ])
            ->values()
            ->all();
    }

    private function branchResults(string $like): array
    {
        return Branch::query()
            ->with('company:id,name')
            ->where('name', 'like', $like)
            ->orWhere('code', 'like', $like)
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn (Branch $row) => [
                'id' => 'branch-'.$row->id,
                'title' => $row->name,
                'subtitle' => ($row->code ? $row->code.' - ' : '').($row->company?->name ?? 'Branch'),
                'href' => route('branches.edit', $row->id),
            ])
            ->values()
            ->all();
    }

    private function locationResults(string $like): array
    {
        return Location::query()
            ->where('name', 'like', $like)
            ->orWhere('location_code', 'like', $like)
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn (Location $row) => [
                'id' => 'location-'.$row->id,
                'title' => $row->name,
                'subtitle' => $row->location_code ?? 'Location',
                'href' => route('locations.edit', $row->id),
            ])
            ->values()
            ->all();
    }

    private function vehicleResults(string $like): array
    {
        return Vehicle::query()
            ->where('registration_no', 'like', $like)
            ->orWhere('engine_no', 'like', $like)
            ->orWhere('chassis_no', 'like', $like)
            ->latest('id')
            ->limit(10)
            ->get()
            ->map(fn (Vehicle $row) => [
                'id' => 'vehicle-'.$row->id,
                'title' => $row->registration_no ?: ('Vehicle #'.$row->id),
                'subtitle' => $row->engine_no ?: 'Vehicle',
                'href' => route('vehicles.edit', $row->id),
            ])
            ->values()
            ->all();
    }
}
