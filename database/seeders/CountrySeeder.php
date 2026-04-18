<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            ['name' => 'United States', 'iso_alpha2' => 'US', 'iso_alpha3' => 'USA', 'phone_code' => '+1', 'currency_code' => 'USD', 'is_active' => true],
            ['name' => 'United Kingdom', 'iso_alpha2' => 'GB', 'iso_alpha3' => 'GBR', 'phone_code' => '+44', 'currency_code' => 'GBP', 'is_active' => true],
            ['name' => 'Germany', 'iso_alpha2' => 'DE', 'iso_alpha3' => 'DEU', 'phone_code' => '+49', 'currency_code' => 'EUR', 'is_active' => true],
            ['name' => 'France', 'iso_alpha2' => 'FR', 'iso_alpha3' => 'FRA', 'phone_code' => '+33', 'currency_code' => 'EUR', 'is_active' => true],
            ['name' => 'Japan', 'iso_alpha2' => 'JP', 'iso_alpha3' => 'JPN', 'phone_code' => '+81', 'currency_code' => 'JPY', 'is_active' => true],
            ['name' => 'China', 'iso_alpha2' => 'CN', 'iso_alpha3' => 'CHN', 'phone_code' => '+86', 'currency_code' => 'CNY', 'is_active' => true],
            ['name' => 'India', 'iso_alpha2' => 'IN', 'iso_alpha3' => 'IND', 'phone_code' => '+91', 'currency_code' => 'INR', 'is_active' => true],
            ['name' => 'Australia', 'iso_alpha2' => 'AU', 'iso_alpha3' => 'AUS', 'phone_code' => '+61', 'currency_code' => 'AUD', 'is_active' => true],
            ['name' => 'New Zealand', 'iso_alpha2' => 'NZ', 'iso_alpha3' => 'NZL', 'phone_code' => '+64', 'currency_code' => 'NZD', 'is_active' => true],
            ['name' => 'Canada', 'iso_alpha2' => 'CA', 'iso_alpha3' => 'CAN', 'phone_code' => '+1', 'currency_code' => 'CAD', 'is_active' => true],
            ['name' => 'Singapore', 'iso_alpha2' => 'SG', 'iso_alpha3' => 'SGP', 'phone_code' => '+65', 'currency_code' => 'SGD', 'is_active' => true],
            ['name' => 'Pakistan', 'iso_alpha2' => 'PK', 'iso_alpha3' => 'PAK', 'phone_code' => '+92', 'currency_code' => 'PKR', 'is_active' => true],
        ];

        foreach ($countries as $row) {
            Country::firstOrCreate(
                ['iso_alpha2' => $row['iso_alpha2']],
                $row
            );
        }
    }
}
