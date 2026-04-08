<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\JobTrackingNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobTrackingNotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = JobTrackingNotification::with(['jobBooking', 'notificationType']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('communication_type', 'like', "%{$request->search}%")
                    ->orWhereHas('notificationType', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%");
                    })
                    ->orWhereHas('jobBooking', function ($q) use ($request) {
                        $q->where('booking_id', 'like', "%{$request->search}%");
                    });
            });
        }

        $jobTrackingNotifications = $query->paginate(10);

        return Inertia::render('Job/JobTrackingNotifications/Index', [
            'jobTrackingNotifications' => $jobTrackingNotifications,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobTrackingNotification $jobTrackingNotification)
    {
        try {
            $jobTrackingNotification->delete();
            return redirect()->route('job-tracking-notifications.index')
                ->with('success', 'Job tracking notification deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete job tracking notification: ' . $e->getMessage()]);
        }
    }
}
