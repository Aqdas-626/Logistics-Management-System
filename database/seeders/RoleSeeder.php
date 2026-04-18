<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $guard = 'web';

        $roles = [
            [
                'name' => 'Super Admin',
                'permissions' => Permission::query()->pluck('name')->all(),
            ],
            [
                'name' => 'Company Admin',
                'permissions' => [
                    'company.view', 'company.update',
                    'branch.view', 'branch.create', 'branch.update', 'branch.delete',
                    'department.view', 'department.manage',
                    'user.view', 'user.create', 'user.update', 'user.disable',
                    'role.view', 'role.manage',
                    'customer.view', 'customer.create', 'customer.update', 'customer.delete', 'customer.contacts.manage', 'customer.addresses.manage', 'customer.billing.manage', 'customer.documents.manage',
                    'master.countries.view', 'master.locations.view', 'master.services.view', 'master.packagetypes.view', 'master.shiptypes.view', 'master.doorcodes.view', 'master.liftcodes.view', 'master.locationtypes.view',
                    'job.view', 'job.create', 'job.update', 'job.delete', 'job.assign', 'job.cancel', 'job.notes.add', 'job.documents.manage',
                    'dispatch.view', 'dispatch.manage', 'dispatch.assign_driver', 'dispatch.assign_vehicle', 'dispatch.route_optimize',
                    'route_plan.view', 'route_plan.manage',
                    'delivery.view', 'delivery.update_status', 'delivery.pod.capture', 'delivery.attempt.reschedule',
                    'tracking.view', 'tracking.update', 'tracking.events.view',
                    'hub.view', 'hub.manage', 'hub.manifest.manage', 'hub.sorting.manage', 'hub.staging.manage',
                    'fleet.view', 'fleet.manage', 'fleet.vehicles.manage', 'fleet.drivers.manage', 'fleet.maintenance.manage', 'fleet.fuel.manage', 'fleet.assignments.manage',
                    'inventory.view', 'inventory.manage', 'inventory.items.manage', 'inventory.stock.manage', 'inventory.movements.manage', 'inventory.locations.manage',
                    'invoice.view', 'invoice.create', 'invoice.update', 'invoice.delete', 'invoice.send', 'invoice.payment.apply',
                    'payment.view', 'payment.create', 'payment.process', 'payment.refund',
                    'expense.view', 'expense.create', 'expense.manage', 'expense.categories.manage',
                    'ledger.view', 'ledger.manage', 'ledger.entries.manage', 'ledger.reconcile',
                    'report.view', 'report.generate', 'report.export', 'report.scheduled.manage',
                ],
            ],
            [
                'name' => 'Operations Manager',
                'permissions' => [
                    'branch.view',
                    'department.view',
                    'user.view',
                    'customer.view', 'customer.create', 'customer.update',
                    'master.countries.view', 'master.locations.view', 'master.services.view', 'master.packagetypes.view',
                    'job.view', 'job.create', 'job.update', 'job.assign', 'job.cancel', 'job.notes.add', 'job.documents.manage',
                    'dispatch.view', 'dispatch.manage', 'dispatch.assign_driver', 'dispatch.assign_vehicle', 'dispatch.route_optimize',
                    'route_plan.view', 'route_plan.manage',
                    'delivery.view', 'delivery.update_status', 'delivery.pod.capture', 'delivery.attempt.reschedule',
                    'tracking.view', 'tracking.update', 'tracking.events.view',
                    'hub.view', 'hub.manage', 'hub.manifest.manage', 'hub.sorting.manage', 'hub.staging.manage',
                    'fleet.view', 'fleet.drivers.manage', 'fleet.assignments.manage',
                    'inventory.view', 'inventory.stock.manage', 'inventory.movements.manage',
                    'report.view', 'report.generate', 'report.export',
                ],
            ],
            [
                'name' => 'Customer Service',
                'permissions' => [
                    'branch.view',
                    'user.view',
                    'customer.view', 'customer.create', 'customer.update', 'customer.contacts.manage', 'customer.addresses.manage',
                    'master.countries.view', 'master.locations.view', 'master.services.view', 'master.packagetypes.view',
                    'job.view', 'job.create', 'job.update', 'job.notes.add',
                    'dispatch.view',
                    'route_plan.view',
                    'delivery.view', 'delivery.update_status',
                    'tracking.view', 'tracking.events.view',
                    'hub.view',
                    'report.view', 'report.generate',
                ],
            ],
            [
                'name' => 'Dispatcher',
                'permissions' => [
                    'branch.view',
                    'customer.view',
                    'job.view', 'job.update', 'job.assign', 'job.notes.add',
                    'dispatch.view', 'dispatch.manage', 'dispatch.assign_driver', 'dispatch.assign_vehicle', 'dispatch.route_optimize',
                    'route_plan.view', 'route_plan.manage',
                    'delivery.view', 'delivery.update_status',
                    'tracking.view', 'tracking.update',
                    'hub.view',
                    'fleet.view', 'fleet.drivers.manage', 'fleet.assignments.manage',
                ],
            ],
            [
                'name' => 'Hub Supervisor',
                'permissions' => [
                    'branch.view',
                    'user.view',
                    'job.view', 'job.update',
                    'delivery.view', 'delivery.update_status',
                    'tracking.view', 'tracking.update',
                    'hub.view', 'hub.manage', 'hub.manifest.manage', 'hub.sorting.manage', 'hub.staging.manage',
                    'route_plan.view',
                    'inventory.view', 'inventory.stock.manage', 'inventory.movements.manage',
                ],
            ],
            [
                'name' => 'Inventory Manager',
                'permissions' => [
                    'branch.view',
                    'master.locations.view', 'master.packagetypes.view',
                    'inventory.view', 'inventory.manage', 'inventory.items.manage', 'inventory.stock.manage', 'inventory.movements.manage', 'inventory.locations.manage',
                    'report.view', 'report.generate', 'report.export',
                ],
            ],
            [
                'name' => 'Fleet Manager',
                'permissions' => [
                    'branch.view',
                    'fleet.view', 'fleet.manage', 'fleet.vehicles.manage', 'fleet.drivers.manage', 'fleet.maintenance.manage', 'fleet.fuel.manage', 'fleet.assignments.manage',
                    'route_plan.view', 'route_plan.manage',
                    'report.view', 'report.generate', 'report.export',
                ],
            ],
            [
                'name' => 'Finance Manager',
                'permissions' => [
                    'branch.view',
                    'department.view',
                    'customer.view', 'customer.billing.manage',
                    'invoice.view', 'invoice.create', 'invoice.update', 'invoice.delete', 'invoice.send', 'invoice.payment.apply',
                    'payment.view', 'payment.create', 'payment.process', 'payment.refund',
                    'expense.view', 'expense.create', 'expense.manage', 'expense.categories.manage',
                    'ledger.view', 'ledger.manage', 'ledger.entries.manage', 'ledger.reconcile',
                    'report.view', 'report.generate', 'report.export', 'report.scheduled.manage',
                ],
            ],
            [
                'name' => 'Accountant',
                'permissions' => [
                    'branch.view',
                    'customer.view',
                    'invoice.view', 'invoice.create', 'invoice.update', 'invoice.send', 'invoice.payment.apply',
                    'payment.view', 'payment.create', 'payment.process',
                    'expense.view', 'expense.create',
                    'ledger.view', 'ledger.entries.manage',
                    'report.view', 'report.generate', 'report.export',
                ],
            ],
            [
                'name' => 'Reporting Analyst',
                'permissions' => [
                    'branch.view',
                    'customer.view',
                    'job.view',
                    'dispatch.view',
                    'route_plan.view',
                    'delivery.view',
                    'tracking.view',
                    'hub.view',
                    'fleet.view',
                    'inventory.view',
                    'invoice.view',
                    'payment.view',
                    'expense.view',
                    'ledger.view',
                    'report.view', 'report.generate', 'report.export', 'report.scheduled.manage',
                ],
            ],
            [
                'name' => 'driver',
                'permissions' => [
                    'delivery.view',
                    'tracking.view',
                    'tracking.events.view',
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            $permissions = $roleData['permissions'];
            $roleName = $roleData['name'];

            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => $guard]
            );

            $role->syncPermissions($permissions);
        }
    }
}
