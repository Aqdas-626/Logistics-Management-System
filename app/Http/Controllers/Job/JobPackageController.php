<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\JobPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobPackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = JobPackage::with(['booking', 'packageType', 'dgType']);

        if ($request->search) {
            $query->where('package_name', 'like', "%{$request->search}%");
        }

        $jobPackages = $query->paginate(10);

        return Inertia::render('Job/JobPackages/Index', [
            'jobPackages' => $jobPackages,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobPackage $jobPackage)
    {
        try {
            $jobPackage->delete();
            return redirect()->route('job-packages.index')
                ->with('success', 'Job package deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete job package: ' . $e->getMessage()]);
        }
    }
}
