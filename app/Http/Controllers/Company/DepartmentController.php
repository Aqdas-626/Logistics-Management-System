<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $companyId = $request->filled('company_id')
            ? (int) $request->input('company_id')
            : null;
        $branchId = $request->filled('branch_id')
            ? (int) $request->input('branch_id')
            : null;

        $departments = Department::query()
            ->with([
                'company:id,name',
                'branch:id,name,code',
            ])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'like', '%'.$search.'%')
                        ->orWhere('code', 'like', '%'.$search.'%');
                });
            })
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Department/Index', [
            'departments' => $departments,
            'companies' => Company::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'branches' => Branch::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'company_id']),
            'filters' => [
                'search' => $search,
                'company_id' => $companyId,
                'branch_id' => $branchId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Department/Create', [
            'companies' => Company::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'branches' => Branch::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'company_id']),
            'department' => [
                'company_id' => '',
                'branch_id' => '',
                'name' => '',
                'code' => '',
                'status' => 'active',
            ],
        ]);
    }

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        Department::query()->create($request->validated());

        return redirect()
            ->route('departments.index')
            ->with('success', 'Department created successfully.');
    }

    public function show(Department $department): Response
    {
        $department->load([
            'company:id,name',
            'branch:id,name,code',
        ]);
        $department->loadCount('employees');

        return Inertia::render('Department/Show', [
            'department' => $department,
        ]);
    }

    public function edit(Department $department): Response
    {
        return Inertia::render('Department/Edit', [
            'companies' => Company::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'branches' => Branch::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'company_id']),
            'department' => $department,
        ]);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): RedirectResponse
    {
        $department->update($request->validated());

        return redirect()
            ->route('departments.index')
            ->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        if (Employee::withTrashed()->where('department_id', $department->id)->exists()) {
            return redirect()
                ->back()
                ->with('error', 'Cannot delete department while employees are linked to it.');
        }

        $department->delete();

        return redirect()
            ->route('departments.index')
            ->with('success', 'Department deleted successfully.');
    }
}
