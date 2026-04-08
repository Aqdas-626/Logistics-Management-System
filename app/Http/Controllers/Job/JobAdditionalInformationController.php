<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\JobAdditionalInformation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobAdditionalInformationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = JobAdditionalInformation::with(['booking', 'dgSignatory']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('insurance_type', 'like', "%{$request->search}%")
                    ->orWhereHas('booking', function ($q) use ($request) {
                        $q->where('booking_id', 'like', "%{$request->search}%");
                    })
                    ->orWhereHas('dgSignatory', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%");
                    });
            });
        }

        $jobAdditionalInformation = $query->paginate(10);

        return Inertia::render('Job/JobAdditionalInformation/Index', [
            'jobAdditionalInformation' => $jobAdditionalInformation,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobAdditionalInformation $jobAdditionalInformation)
    {
        try {
            $jobAdditionalInformation->delete();
            return redirect()->route('job-additional-information.index')
                ->with('success', 'Job additional information deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete job additional information: ' . $e->getMessage()]);
        }
    }
}
