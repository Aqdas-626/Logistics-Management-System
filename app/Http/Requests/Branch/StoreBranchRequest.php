<?php

namespace App\Http\Requests\Branch;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBranchRequest extends FormRequest
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
        $rules = [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('branches', 'code')->whereNull('deleted_at'),
            ],
            'phone' => ['nullable', 'string', 'max:255'],
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
            'manager_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'contact' => ['nullable', 'array'],
            'contact.name' => ['nullable', 'string', 'max:255'],
            'contact.email' => ['nullable', 'string', 'email', 'max:255'],
            'contact.phone' => ['nullable', 'string', 'max:255'],
            'contact.designation' => ['nullable', 'string', 'max:255'],
            'contact.status' => ['nullable', 'string', 'max:30'],
            'assets' => ['nullable', 'array'],
        ];

        foreach ($this->input('assets', []) as $i => $asset) {
            $rules["assets.$i.asset_name"] = ['required', 'string', 'max:255'];
            $rules["assets.$i.asset_code"] = [
                'required',
                'string',
                'max:255',
                Rule::unique('branch_assets', 'asset_code')->whereNull('deleted_at'),
            ];
            $rules["assets.$i.category"] = ['nullable', 'string', 'max:100'];
            $rules["assets.$i.serial_no"] = ['nullable', 'string', 'max:100'];
            $rules["assets.$i.quantity"] = ['required', 'integer', 'min:1'];
            $rules["assets.$i.condition"] = ['nullable', 'string', 'max:255'];
            $rules["assets.$i.purchase_date"] = ['nullable', 'date'];
            $rules["assets.$i.status"] = ['nullable', 'string', 'max:30'];
        }

        return $rules;
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $contact = $this->input('contact');
            if (! is_array($contact)) {
                return;
            }

            $hasAny = collect($contact)
                ->filter(fn ($v) => $v !== null && $v !== '')
                ->isNotEmpty();

            if ($hasAny) {
                if (empty($contact['name'])) {
                    $validator->errors()->add('contact.name', 'Contact name is required when adding branch contact.');
                }
                if (empty($contact['phone'])) {
                    $validator->errors()->add('contact.phone', 'Contact phone is required when adding branch contact.');
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->input('status', 'active'),
        ]);

        if ($this->input('manager_user_id') === '' || $this->input('manager_user_id') === null) {
            $this->merge(['manager_user_id' => null]);
        }

        if ($this->has('country_code') && $this->input('country_code') !== null && $this->input('country_code') !== '') {
            $this->merge(['country_code' => strtoupper((string) $this->input('country_code'))]);
        }
        if ($this->has('base_currency')) {
            $this->merge(['base_currency' => strtoupper((string) $this->input('base_currency'))]);
        }
        if ($this->input('country_code') === '') {
            $this->merge(['country_code' => null]);
        }

        $contact = $this->input('contact');
        if (is_array($contact)) {
            $contact['status'] = $contact['status'] ?? 'active';
            $this->merge(['contact' => $contact]);
        }

        $assets = $this->input('assets', []);
        if (is_array($assets)) {
            $filtered = array_values(array_filter($assets, function ($row) {
                if (! is_array($row)) {
                    return false;
                }

                return ($row['asset_name'] ?? '') !== ''
                    || ($row['asset_code'] ?? '') !== ''
                    || ($row['serial_no'] ?? '') !== ''
                    || ($row['category'] ?? '') !== '';
            }));
            $this->merge(['assets' => $filtered]);
        }
    }
}
