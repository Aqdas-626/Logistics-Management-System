<?php

namespace Database\Seeders;

use App\Models\DoorType;
use App\Models\LiftType;
use App\Models\LocationType;
use App\Models\PackageType;
use App\Models\Service;
use App\Models\IsoCode;
use App\Models\ShipType;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedIsoCodes();
        $this->seedDoorTypes();
        $this->seedLiftTypes();
        $this->seedLocationTypes();
        $this->seedPackageTypes();
        $this->seedShipTypes();
        $this->seedServices();
    }

    private function seedDoorTypes(): void
    {
        $doorTypes = [
            'Doors TSA',
            'Doors Either',
            'Door Rear',
            'Door Front',
            'Door Forward',
        ];

        foreach ($doorTypes as $name) {
            DoorType::firstOrCreate(['name' => $name]);
        }
    }

    private function seedLiftTypes(): void
    {
        $liftTypes = ['Forklift', 'Pallet Jack', 'Loading Dock', 'Hydraulic Lift', 'Crane', 'Manual'];

        foreach ($liftTypes as $name) {
            LiftType::firstOrCreate(['name' => $name]);
        }
    }

    private function seedLocationTypes(): void
    {
        $locationTypes = ['Warehouse', 'Distribution Center', 'Hub', 'Pickup Point', 'Customer Location', 'Cross Dock'];

        foreach ($locationTypes as $name) {
            LocationType::firstOrCreate(['name' => $name]);
        }
    }

    private function seedPackageTypes(): void
    {
        $packageTypes = ['Box', 'Parcel', 'Pallet', 'Crate', 'Bag', 'Envelope', 'Container', 'Drum', 'Bundle'];

        foreach ($packageTypes as $name) {
            PackageType::firstOrCreate(['name' => $name]);
        }
    }

    private function seedShipTypes(): void
    {
        $shipTypes = ['Container Ship', 'Bulk Carrier', 'Tanker', 'Ro-Ro Ship', 'Cargo Ship', 'Lash Ship'];

        foreach ($shipTypes as $name) {
            ShipType::firstOrCreate(['name' => $name]);
        }
    }

    private function seedIsoCodes(): void
    {
        $isoCodes = [
            ['code' => 'US', 'name' => 'United States'],
            ['code' => 'GB', 'name' => 'United Kingdom'],
            ['code' => 'CA', 'name' => 'Canada'],
            ['code' => 'AU', 'name' => 'Australia'],
            ['code' => 'DE', 'name' => 'Germany'],
            ['code' => 'FR', 'name' => 'France'],
            ['code' => 'IN', 'name' => 'India'],
            ['code' => 'CN', 'name' => 'China'],
            ['code' => 'JP', 'name' => 'Japan'],
            ['code' => 'BR', 'name' => 'Brazil'],
        ];

        foreach ($isoCodes as $iso) {
            IsoCode::firstOrCreate(
                ['code' => $iso['code']],
                array_merge($iso, ['status' => true])
            );
        }
    }

    private function seedServices(): void
    {
        $services = [
            ['name' => 'Standard Delivery', 'description' => 'Regular delivery within standard timeframe', 'status' => 'active'],
            ['name' => 'Express Delivery', 'description' => 'Same-day or next-day delivery', 'status' => 'active'],
            ['name' => 'Economy Delivery', 'description' => 'Cost-effective delivery with longer timeframe', 'status' => 'active'],
            ['name' => 'International Shipping', 'description' => 'Cross-border delivery services', 'status' => 'active'],
            ['name' => 'Fragile Handling', 'description' => 'Special care for delicate items', 'status' => 'active'],
            ['name' => 'Temperature Controlled', 'description' => 'Cold chain logistics for sensitive goods', 'status' => 'active'],
            ['name' => 'White Glove Service', 'description' => 'Premium delivery with installation', 'status' => 'active'],
            ['name' => 'Return Logistics', 'description' => 'Reverse logistics and returns management', 'status' => 'active'],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['name' => $service['name']],
                $service
            );
        }
    }
}
