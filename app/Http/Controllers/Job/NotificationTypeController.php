<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\NotificationType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = NotificationType::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $notificationTypes = $query->paginate(10);

        return Inertia::render('Job/NotificationTypes/Index', [
            'notificationTypes' => $notificationTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:notification_types,name',
        ]);

        try {
            NotificationType::create($validated);

            return redirect()->route('notification-types.index')
                ->with('success', 'Notification type created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create notification type: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(NotificationType $notificationType)
    {
        return redirect()->route('notification-types.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, NotificationType $notificationType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120|unique:notification_types,name,' . $notificationType->id,
        ]);

        try {
            $notificationType->update($validated);

            return redirect()->route('notification-types.index')
                ->with('success', 'Notification type updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update notification type: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NotificationType $notificationType)
    {
        try {
            $notificationType->delete();
            return redirect()->route('notification-types.index')
                ->with('success', 'Notification type deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete notification type: ' . $e->getMessage()]);
        }
    }
}
