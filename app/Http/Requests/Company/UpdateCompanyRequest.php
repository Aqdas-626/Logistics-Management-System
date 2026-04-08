<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
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
        $company = $this->route('company');
        $status = $this->input('status', $company->status);

        return [
            'country_id' => [
                'required',
                'integer',
                'exists:countries,id',
                Rule::unique('companies', 'country_id')
                    ->where(fn ($q) => $q->where('status', $status))
                    ->ignore($company->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:160'],
            'address_line1' => ['nullable', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'max:120'],
            'postcode' => ['nullable', 'string', 'max:30'],
            'country_code' => ['nullable', 'string', 'size:2'],
            'timezone' => ['required', 'string', 'max:80'],
            'base_currency' => ['required', 'string', 'size:3'],
            'settings_json' => ['nullable', 'array'],
            'status' => ['required', 'string', 'max:30'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('country_code') && $this->input('country_code') !== null && $this->input('country_code') !== '') {
            $this->merge(['country_code' => strtoupper((string) $this->input('country_code'))]);
        }
        if ($this->has('base_currency')) {
            $this->merge(['base_currency' => strtoupper((string) $this->input('base_currency'))]);
        }
        if ($this->input('country_code') === '') {
            $this->merge(['country_code' => null]);
        }
    }
}
