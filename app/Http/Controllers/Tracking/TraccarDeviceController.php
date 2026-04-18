<?php

namespace App\Http\Controllers\Tracking;

use App\Http\Controllers\Controller;
use App\Models\TraccarDevice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TraccarDeviceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        $query = TraccarDevice::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('traccar_device_id', 'like', '%'.$search.'%')
                    ->orWhere('unique_id', 'like', '%'.$search.'%')
                    ->orWhere('model', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('Tracking/TraccarDevices/Index', [
            'devices' => $query->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Tracking/TraccarDevices/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'traccar_device_id' => ['required', 'integer', 'unique:traccar_devices,traccar_device_id'],
            'name' => ['required', 'string', 'max:160'],
            'unique_id' => ['nullable', 'string', 'max:120'],
            'model' => ['nullable', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:50'],
            'category' => ['nullable', 'string', 'max:60'],
            'is_active' => ['required', 'boolean'],
            'last_synced_at' => ['nullable', 'date'],
            'attributes_json' => ['nullable', 'json'],
        ]);

        TraccarDevice::create([
            'traccar_device_id' => $validated['traccar_device_id'],
            'name' => $validated['name'],
            'unique_id' => $validated['unique_id'] ?? null,
            'model' => $validated['model'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'category' => $validated['category'] ?? null,
            'is_active' => $validated['is_active'],
            'last_synced_at' => $validated['last_synced_at'] ?? null,
            'attributes' => filled($validated['attributes_json'] ?? null)
                ? json_decode($validated['attributes_json'], true)
                : null,
        ]);

        return redirect()
            ->route('traccar-devices.index')
            ->with('success', 'Traccar device created successfully.');
    }

    public function edit(TraccarDevice $traccarDevice): Response
    {
        return Inertia::render('Tracking/TraccarDevices/Edit', [
            'device' => [
                ...$traccarDevice->toArray(),
                'last_synced_at' => $traccarDevice->last_synced_at?->format('Y-m-d\TH:i'),
                'attributes_json' => $traccarDevice->attributes
                    ? json_encode($traccarDevice->attributes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
                    : '',
            ],
        ]);
    }

    public function update(Request $request, TraccarDevice $traccarDevice): RedirectResponse
    {
        $validated = $request->validate([
            'traccar_device_id' => ['required', 'integer', 'unique:traccar_devices,traccar_device_id,'.$traccarDevice->id],
            'name' => ['required', 'string', 'max:160'],
            'unique_id' => ['nullable', 'string', 'max:120'],
            'model' => ['nullable', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:50'],
            'category' => ['nullable', 'string', 'max:60'],
            'is_active' => ['required', 'boolean'],
            'last_synced_at' => ['nullable', 'date'],
            'attributes_json' => ['nullable', 'json'],
        ]);

        $traccarDevice->update([
            'traccar_device_id' => $validated['traccar_device_id'],
            'name' => $validated['name'],
            'unique_id' => $validated['unique_id'] ?? null,
            'model' => $validated['model'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'category' => $validated['category'] ?? null,
            'is_active' => $validated['is_active'],
            'last_synced_at' => $validated['last_synced_at'] ?? null,
            'attributes' => filled($validated['attributes_json'] ?? null)
                ? json_decode($validated['attributes_json'], true)
                : null,
        ]);

        return redirect()
            ->route('traccar-devices.index')
            ->with('success', 'Traccar device updated successfully.');
    }

    public function destroy(TraccarDevice $traccarDevice): RedirectResponse
    {
        $traccarDevice->delete();

        return redirect()
            ->route('traccar-devices.index')
            ->with('success', 'Traccar device deleted successfully.');
    }
}
