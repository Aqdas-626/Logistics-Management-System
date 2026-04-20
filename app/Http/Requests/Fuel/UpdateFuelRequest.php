<?php

namespace App\Http\Requests\Fuel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFuelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id'     => ['required', 'exists:vehicles,id'],
            'driver_id'      => ['nullable', 'exists:drivers,id'],
            'fuel_type'      => ['nullable', 'in:petrol,diesel,electric,hybrid'],
            'fill_date'      => ['required', 'date'],
            'quantity'       => ['required', 'numeric', 'min:0.01'],
            'odometer'       => ['required', 'numeric', 'min:0'],
            'amount'         => ['required', 'numeric', 'min:0'],
            'source_type'    => ['required', 'in:tank,vendor'],
            'fuel_tank_id'   => ['nullable', 'exists:fuel_tanks,id'],
            'fuel_vendor_id' => ['nullable', 'exists:fuel_vendors,id'],
            'receipt'        => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'comment'        => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required'     => 'Vehicle is required',
            'vehicle_id.exists'       => 'Selected vehicle does not exist',
            'fuel_type.in'            => 'Invalid fuel type selected',
            'fill_date.required'      => 'Fill date is required',
            'fill_date.date'          => 'Fill date must be a valid date',
            'quantity.required'       => 'Quantity is required',
            'quantity.numeric'        => 'Quantity must be a number',
            'quantity.min'            => 'Quantity must be at least 0.01',
            'odometer.required'       => 'Odometer reading is required',
            'odometer.numeric'        => 'Odometer must be a number',
            'amount.required'         => 'Amount is required',
            'amount.numeric'          => 'Amount must be a number',
            'source_type.required'    => 'Source type is required',
            'source_type.in'          => 'Invalid source type',
            'fuel_tank_id.exists'     => 'Selected fuel tank does not exist',
            'fuel_vendor_id.exists'   => 'Selected fuel vendor does not exist',
            'receipt.file'            => 'Receipt must be a file',
            'receipt.mimes'           => 'Receipt must be JPG, PNG, or PDF',
            'receipt.max'             => 'Receipt file size must not exceed 2MB',
        ];
    }

    public function attributes(): array
    {
        return [
            'vehicle_id'     => 'vehicle',
            'driver_id'      => 'driver',
            'fuel_type'      => 'fuel type',
            'fill_date'      => 'fill date',
            'quantity'       => 'quantity',
            'odometer'       => 'odometer',
            'amount'         => 'amount',
            'source_type'    => 'source type',
            'fuel_tank_id'   => 'fuel tank',
            'fuel_vendor_id' => 'fuel vendor',
            'receipt'        => 'receipt',
            'comment'        => 'comment',
        ];
    }
}
