<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CountrySeeder::class,
            CompanySeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            BranchSeeder::class,
            MasterDataSeeder::class,
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
