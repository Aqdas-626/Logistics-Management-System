<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::query()->firstOrFail();
        $admin = User::query()->where('email', 'admin@demologistics.com')->first();

        Branch::firstOrCreate(
            [
                'code' => 'HO',
            ],
            [
                'company_id' => $company->id,
                'name' => 'Head Office',
                'address_line1' => '123 Main Street',
                'city' => 'New York',
                'state' => 'NY',
                'postcode' => '10001',
                'country_code' => 'US',
                'phone' => '+1-555-0100',
                'timezone' => 'UTC',
                'base_currency' => 'NZD',
                'status' => 'active',
                'manager_user_id' => $admin?->id,
            ]
        );
    }
}
