<?php

namespace App\Http\Requests\Department;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed|string>|string>
     */
    public function rules(): array
    {
        $department = $this->route('department');
        $companyId = (int) $this->input('company_id');

        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'branch_id' => [
                'nullable',
                'integer',
                Rule::exists('branches', 'id')->where(fn ($q) => $q->where('company_id', $companyId)),
            ],
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'code')
                    ->whereNull('deleted_at')
                    ->ignore($department->id),
            ],
            'status' => ['required', 'string', 'max:30'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('branch_id') === '') {
            $this->merge(['branch_id' => null]);
        }
    }
}
