<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Country;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $country = Country::query()->where('iso_alpha2', 'US')->first()
            ?? Country::query()->firstOrFail();

        Company::firstOrCreate(
            [
                'country_id' => $country->id,
                'status' => 'active',
            ],
            [
                'name' => 'Demo Logistics',
                'email' => 'info@demologistics.com',
                'phone' => '+1-555-0100',
                'address_line1' => '123 Main Street',
                'city' => 'New York',
                'state' => 'NY',
                'postcode' => '10001',
                'country_code' => 'US',
                'timezone' => 'UTC',
                'base_currency' => 'USD',
                'status' => 'active',
            ]
        );
    }
}
