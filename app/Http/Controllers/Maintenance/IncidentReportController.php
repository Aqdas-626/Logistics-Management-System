<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\IncidentReport;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IncidentReportController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = IncidentReport::query()
            ->with([
                'vehicle:id,name,registration_no',
                'reporter:id,name',
                'maintenanceTicket:id,incident_report_id,status,vehicle_id',
            ])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', '%'.$search.'%')
                    ->orWhereHas('vehicle', function ($vq) use ($search) {
                        $vq->where('registration_no', 'like', '%'.$search.'%')
                            ->orWhere('name', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('reporter', function ($rq) use ($search) {
                        $rq->where('name', 'like', '%'.$search.'%');
                    });
            });
        }

        $vehicles = Vehicle::query()
            ->orderBy('registration_no')
            ->get(['id', 'name', 'registration_no']);

        return Inertia::render('MaintenanceManagement/IncidentReports/Index', [
            'incidents' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id' => ['nullable', 'exists:vehicles,id'],
            'description' => ['required', 'string'],
        ]);

        IncidentReport::create([
            ...$validated,
            'reported_by' => $request->user()->id,
            'report_date' => now()->toDateString(),
            'status' => 'open',
        ]);

        return redirect()
            ->route('incident-reports.index')
            ->with('success', 'Incident report submitted successfully.');
    }

    public function update(Request $request, IncidentReport $incidentReport): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id' => ['nullable', 'exists:vehicles,id'],
            'description' => ['required', 'string'],
            'status' => ['required', Rule::in(['open', 'converted_to_maintenance', 'closed', 'cancelled'])],
        ]);

        $incidentReport->update($validated);

        return redirect()
            ->route('incident-reports.index')
            ->with('success', 'Incident report updated successfully.');
    }

    public function destroy(IncidentReport $incidentReport): RedirectResponse
    {
        $incidentReport->delete();

        return redirect()
            ->route('incident-reports.index')
            ->with('success', 'Incident report removed successfully.');
    }
}
