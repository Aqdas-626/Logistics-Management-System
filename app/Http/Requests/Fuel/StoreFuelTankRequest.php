<?php

namespace App\Http\Requests\Fuel;

use Illuminate\Foundation\Http\FormRequest;

class StoreFuelTankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'fuel_type'     => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'capacity'      => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'numeric', 'min:0'],
            'unit'          => ['required', 'string', 'max:50'],
            'note'          => ['nullable', 'string'],
            'is_active'     => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'          => 'Tank name is required',
            'name.string'            => 'Tank name must be a string',
            'name.max'               => 'Tank name must not exceed 255 characters',
            'fuel_type.in'           => 'Invalid fuel type selected',
            'capacity.required'      => 'Capacity is required',
            'capacity.numeric'       => 'Capacity must be a number',
            'capacity.min'           => 'Capacity must be at least 0',
            'current_stock.required' => 'Current stock is required',
            'current_stock.numeric'  => 'Current stock must be a number',
            'current_stock.min'      => 'Current stock must be at least 0',
            'unit.required'          => 'Unit is required',
            'unit.string'            => 'Unit must be a string',
            'unit.max'               => 'Unit must not exceed 50 characters',
            'is_active.required'     => 'Status is required',
            'is_active.boolean'      => 'Status must be true or false',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'          => 'tank name',
            'fuel_type'     => 'fuel type',
            'capacity'      => 'capacity',
            'current_stock' => 'current stock',
            'unit'          => 'unit',
            'note'          => 'note',
            'is_active'     => 'status',
        ];
    }
}
