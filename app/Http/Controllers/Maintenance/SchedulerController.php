<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\Scheduler;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SchedulerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = Scheduler::query()
            ->with(['vehicle:id,name,registration_no'])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('service_name', 'like', '%'.$search.'%')
                    ->orWhereHas('vehicle', function ($vq) use ($search) {
                        $vq->where('registration_no', 'like', '%'.$search.'%')
                            ->orWhere('name', 'like', '%'.$search.'%');
                    });
            });
        }

        $vehicles = Vehicle::query()
            ->orderBy('registration_no')
            ->get(['id', 'name', 'registration_no']);

        return Inertia::render('MaintenanceManagement/PmsScheduler/Index', [
            'rules' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->normalizeIntervalInputs($request);

        $validated = $request->validate([
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'service_name' => ['required', 'string', 'max:200'],
            'interval_km' => ['nullable', 'integer', 'min:0'],
            'interval_days' => ['nullable', 'integer', 'min:0'],
        ]);

        if (($validated['interval_km'] ?? null) === null && ($validated['interval_days'] ?? null) === null) {
            throw ValidationException::withMessages([
                'interval_km' => 'Enter at least one of Interval (KM) or Interval (Days).',
            ]);
        }

        Scheduler::create([
            ...$validated,
            'is_active' => true,
        ]);

        return redirect()
            ->route('pms-scheduler.index')
            ->with('success', 'PMS rule added successfully.');
    }

    public function update(Request $request, Scheduler $scheduler): RedirectResponse
    {
        $this->normalizeIntervalInputs($request);

        $validated = $request->validate([
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'service_name' => ['required', 'string', 'max:200'],
            'interval_km' => ['nullable', 'integer', 'min:0'],
            'interval_days' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        if (($validated['interval_km'] ?? null) === null && ($validated['interval_days'] ?? null) === null) {
            throw ValidationException::withMessages([
                'interval_km' => 'Enter at least one of Interval (KM) or Interval (Days).',
            ]);
        }

        $scheduler->update($validated);

        return redirect()
            ->route('pms-scheduler.index')
            ->with('success', 'PMS rule updated successfully.');
    }

    public function destroy(Scheduler $scheduler): RedirectResponse
    {
        $scheduler->delete();

        return redirect()
            ->route('pms-scheduler.index')
            ->with('success', 'PMS rule removed successfully.');
    }

    public function runCheck(): RedirectResponse
    {
        return redirect()
            ->route('pms-scheduler.index')
            ->with('success', 'PMS check completed (placeholder — hook your job logic here).');
    }

    private function normalizeIntervalInputs(Request $request): void
    {
        foreach (['interval_km', 'interval_days'] as $key) {
            $v = $request->input($key);
            if ($v === '' || $v === null) {
                $request->merge([$key => null]);
            }
        }
    }
}
