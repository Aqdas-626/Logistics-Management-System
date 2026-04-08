<?php

namespace App\Http\Requests\Country;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCountryRequest extends FormRequest
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
        $country = $this->route('country');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('countries', 'name')->ignore($country->id)],
            'iso_alpha2' => ['required', 'string', 'size:2', Rule::unique('countries', 'iso_alpha2')->ignore($country->id)],
            'iso_alpha3' => ['required', 'string', 'size:3', Rule::unique('countries', 'iso_alpha3')->ignore($country->id)],
            'phone_code' => ['nullable', 'string', 'max:10'],
            'currency_code' => ['nullable', 'string', 'size:3'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('iso_alpha2')) {
            $this->merge(['iso_alpha2' => strtoupper((string) $this->input('iso_alpha2'))]);
        }
        if ($this->has('iso_alpha3')) {
            $this->merge(['iso_alpha3' => strtoupper((string) $this->input('iso_alpha3'))]);
        }
        if ($this->has('currency_code') && $this->input('currency_code') !== null && $this->input('currency_code') !== '') {
            $this->merge(['currency_code' => strtoupper((string) $this->input('currency_code'))]);
        }
        if ($this->input('currency_code') === '') {
            $this->merge(['currency_code' => null]);
        }
        if ($this->input('phone_code') === '') {
            $this->merge(['phone_code' => null]);
        }
    }
}
