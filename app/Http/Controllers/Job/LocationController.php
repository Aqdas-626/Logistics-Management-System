<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Company;
use App\Models\Country;
use App\Models\Branch;
use App\Models\LocationType;
use App\Models\DoorType;
use App\Models\LiftType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::with(['company', 'country', 'branch', 'locationType', 'doorType', 'liftType']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('location_code', 'like', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $locations = $query->paginate(10);

        return Inertia::render('Locations/Index', [
            'locations' => $locations,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $companies = Company::active()->get(['id', 'name']);
        $countries = Country::all(['id', 'name']);
        $branches = Branch::with('company')->get(['id', 'name', 'company_id']);
        $locationTypes = LocationType::all(['id', 'name']);
        $doorTypes = DoorType::all(['id', 'name']);
        $liftTypes = LiftType::all(['id', 'name']);

        return Inertia::render('Locations/Create', [
            'companies' => $companies,
            'countries' => $countries,
            'branches' => $branches,
            'locationTypes' => $locationTypes,
            'doorTypes' => $doorTypes,
            'liftTypes' => $liftTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'country_id' => 'required|exists:countries,id',
            'branch_id' => 'nullable|exists:branches,id',
            'name' => 'required|string|max:200',
            'location_code' => 'nullable|string|max:50|unique:locations,location_code',
            'location_type_id' => 'required|exists:location_types,id',
            'door_type_id' => 'required|exists:door_types,id',
            'lift_type_id' => 'required|exists:lift_types,id',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:120',
            'state' => 'nullable|string|max:120',
            'postcode' => 'nullable|string|max:30',
            'contact_person' => 'nullable|string|max:160',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:160',
            'send_tracking_email' => 'boolean',
            'special_instruction' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        try {
            Location::create($validated);

            return redirect()->route('locations.index')
                            ->with('success', 'Location created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create location: ' . $e->getMessage()]);
        }
    }

    public function show(Location $location)
    {
        $location->load(['company', 'country', 'branch', 'locationType', 'doorType', 'liftType']);

        return Inertia::render('Locations/Show', [
            'location' => $location,
        ]);
    }

    public function edit(Location $location)
    {
        $location->load(['company', 'country', 'branch', 'locationType', 'doorType', 'liftType']);
        $companies = Company::active()->get(['id', 'name']);
        $countries = Country::all(['id', 'name']);
        $branches = Branch::with('company')->get(['id', 'name', 'company_id']);
        $locationTypes = LocationType::all(['id', 'name']);
        $doorTypes = DoorType::all(['id', 'name']);
        $liftTypes = LiftType::all(['id', 'name']);

        return Inertia::render('Locations/Edit', [
            'location' => $location,
            'companies' => $companies,
            'countries' => $countries,
            'branches' => $branches,
            'locationTypes' => $locationTypes,
            'doorTypes' => $doorTypes,
            'liftTypes' => $liftTypes,
        ]);
    }

    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'country_id' => 'required|exists:countries,id',
            'branch_id' => 'nullable|exists:branches,id',
            'name' => 'required|string|max:200',
            'location_code' => ['nullable', 'string', 'max:50', 'unique:locations,location_code,' . $location->id],
            'location_type_id' => 'required|exists:location_types,id',
            'door_type_id' => 'required|exists:door_types,id',
            'lift_type_id' => 'required|exists:lift_types,id',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:120',
            'state' => 'nullable|string|max:120',
            'postcode' => 'nullable|string|max:30',
            'contact_person' => 'nullable|string|max:160',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:160',
            'send_tracking_email' => 'boolean',
            'special_instruction' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        try {
            $location->update($validated);

            return redirect()->route('locations.index')
                            ->with('success', 'Location updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update location: ' . $e->getMessage()]);
        }
    }

    public function destroy(Location $location)
    {
        try {
            $location->delete();
            return redirect()->route('locations.index')
                            ->with('success', 'Location deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete location: ' . $e->getMessage()]);
        }
    }
}

