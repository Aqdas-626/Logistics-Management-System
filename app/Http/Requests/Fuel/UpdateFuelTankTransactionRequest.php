<?php

namespace App\Http\Requests\Fuel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFuelTankTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fuel_tank_id'     => ['required', 'exists:fuel_tanks,id'],
            'type'             => ['required', 'in:in,out,adjustment'],
            'quantity'         => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['nullable', 'date'],
            'reference_type'   => ['nullable', 'string', 'max:255'],
            'reference_id'     => ['nullable', 'integer'],
            'remarks'          => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'fuel_tank_id.required'     => 'Fuel tank is required',
            'fuel_tank_id.exists'       => 'Selected fuel tank does not exist',
            'type.required'             => 'Transaction type is required',
            'type.in'                   => 'Invalid transaction type',
            'quantity.required'         => 'Quantity is required',
            'quantity.numeric'          => 'Quantity must be a number',
            'quantity.min'              => 'Quantity must be at least 0.01',
            'transaction_date.date'     => 'Transaction date must be a valid date',
            'reference_type.string'     => 'Reference type must be a string',
            'reference_type.max'        => 'Reference type must not exceed 255 characters',
            'reference_id.integer'      => 'Reference ID must be an integer',
            'remarks.string'            => 'Remarks must be a string',
        ];
    }

    public function attributes(): array
    {
        return [
            'fuel_tank_id'     => 'fuel tank',
            'type'             => 'transaction type',
            'quantity'         => 'quantity',
            'transaction_date' => 'transaction date',
            'reference_type'   => 'reference type',
            'reference_id'     => 'reference ID',
            'remarks'          => 'remarks',
        ];
    }
}
