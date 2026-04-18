<?php

use App\Http\Controllers\Cart\CartController;
use App\Http\Controllers\Company\DepartmentController;
use App\Http\Controllers\Container\ContainerController;
use App\Http\Controllers\Container\JobDocumentController;
use App\Http\Controllers\Container\JobNoteController;
use App\Http\Controllers\Container\JobServiceController;
use App\Http\Controllers\Country\BranchController;
use App\Http\Controllers\Country\CompanyController;
use App\Http\Controllers\Country\CountryController;
use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Driver\DriverController;
use App\Http\Controllers\Driver\DriverDocumentController;
use App\Http\Controllers\Driver\DriverVehicleAssignmentController;
use App\Http\Controllers\Expense\ExpenseCategoryController;
use App\Http\Controllers\Expense\ExpenseController;
use App\Http\Controllers\Export\ExportController;
use App\Http\Controllers\Fuel\FuelController;
use App\Http\Controllers\Fuel\FuelTankController;
use App\Http\Controllers\Fuel\FuelTankTransactionController;
use App\Http\Controllers\Fuel\FuelVendorController;
use App\Http\Controllers\History\JobStatusHistoryController;
use App\Http\Controllers\Import\ImportController;
use App\Http\Controllers\Invoice\InvoiceController;
use App\Http\Controllers\Invoice\InvoicePaymentController;
use App\Http\Controllers\Job\DgSignatoryController;
use App\Http\Controllers\Job\DgTypeController;
use App\Http\Controllers\Job\DoorTypeController;
use App\Http\Controllers\Job\EndorsementController;
use App\Http\Controllers\Job\IsoCodeController;
use App\Http\Controllers\Job\JobAdditionalInformationController;
use App\Http\Controllers\Job\JobBookingController;
use App\Http\Controllers\Job\JobCostController;
use App\Http\Controllers\Job\JobPackageController;
use App\Http\Controllers\Job\JobQueueController;
use App\Http\Controllers\Job\JobQueueHubController;
use App\Http\Controllers\Job\JobQueueJobNoteController;
use App\Http\Controllers\Job\JobRevenueController;
use App\Http\Controllers\Job\JobTrackingNotificationController;
use App\Http\Controllers\Job\LiftTypeController;
use App\Http\Controllers\Job\LocationController;
use App\Http\Controllers\Job\LocationTypeController;
use App\Http\Controllers\Job\NotificationTypeController;
use App\Http\Controllers\Job\PackageTypeController;
use App\Http\Controllers\Job\Queue\JobQueueDocumentController;
use App\Http\Controllers\Job\ShippingController;
use App\Http\Controllers\Job\ShipTypeController;
use App\Http\Controllers\Job\VesselController;
use App\Http\Controllers\Maintenance\IncidentReportController;
use App\Http\Controllers\Maintenance\MaintenanceAnalyticsController;
use App\Http\Controllers\Maintenance\MaintenanceManagementController;
use App\Http\Controllers\Maintenance\MaintenanceVendorController;
use App\Http\Controllers\Maintenance\MechanicManagementController;
use App\Http\Controllers\Maintenance\PartStockController;
use App\Http\Controllers\Maintenance\SchedulerController;
use App\Http\Controllers\Maintenance\TyreManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Revenue\ChargeTypeController;
use App\Http\Controllers\Revenue\RevenueTypeController;
use App\Http\Controllers\Route\RoutePlanController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Swing\SwingController;
use App\Http\Controllers\Tracking\TraccarDeviceController;
use App\Http\Controllers\User\PermissionController;
use App\Http\Controllers\User\RoleController;
use App\Http\Controllers\User\UserRoleController;
use App\Http\Controllers\Vehicle\VehicleController;
use App\Http\Controllers\Vehicle\VehicleTypeController;
use App\Http\Controllers\Vehicle\VehicleVendorController;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Middleware\PermissionMiddleware;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('search', SearchController::class)->name('search.global');
    Route::resource('countries', CountryController::class);
    Route::resource('companies', CompanyController::class);
    Route::resource('branches', BranchController::class);
    Route::resource('departments', DepartmentController::class);
    Route::resource('customers', CustomerController::class);
    Route::resource('door-types', DoorTypeController::class);
    Route::resource('lift-types', LiftTypeController::class);
    Route::resource('location-types', LocationTypeController::class);
    Route::resource('locations', LocationController::class);
    Route::resource('shippings', ShippingController::class);
    Route::resource('ship_types', ShipTypeController::class);
    Route::resource('vessels', VesselController::class);
    Route::resource('iso-codes', IsoCodeController::class);
    Route::resource('package-types', PackageTypeController::class);
    Route::resource('dg-types', DgTypeController::class);
    Route::resource('dg-signatories', DgSignatoryController::class);
    Route::resource('endorsements', EndorsementController::class);
    Route::resource('job-packages', JobPackageController::class)->only(['index', 'destroy']);
    Route::resource('notification-types', NotificationTypeController::class);
    Route::resource('job-tracking-notifications', JobTrackingNotificationController::class)->only(['index', 'destroy']);
    Route::resource('job-additional-information', JobAdditionalInformationController::class)->only(['index', 'destroy']);
    Route::resource('containers', ContainerController::class)->only(['index']);
    Route::resource('job-documents', JobDocumentController::class)->only(['index']);
    Route::resource('job-notes', JobNoteController::class)->only(['index']);
    Route::resource('job-services', JobServiceController::class)->only(['index']);
    Route::get('job-queues', [JobQueueController::class, 'index'])->name('job-queues.index');
    Route::get('job-queues/{jobQueue}/financials', [JobQueueController::class, 'financials'])->name('job-queues.financials');
    Route::get('job-status-histories', [JobStatusHistoryController::class, 'index'])->name('job-status-histories.index');
    Route::post('job-status-histories', [JobStatusHistoryController::class, 'store'])->name('job-status-histories.store');
    Route::post('job-queue-notes', [JobQueueJobNoteController::class, 'store'])->name('job-queue-notes.store');
    Route::put('job-queue-notes/{jobNote}', [JobQueueJobNoteController::class, 'update'])->name('job-queue-notes.update');
    Route::delete('job-queue-notes/{jobNote}', [JobQueueJobNoteController::class, 'destroy'])->name('job-queue-notes.destroy');
    Route::post('job-queues/{jobQueue}/dispatch', [JobQueueController::class, 'dispatch'])->name('job-queues.dispatch');
    Route::post('job-queues/{jobQueue}/hubs', [JobQueueHubController::class, 'store'])->name('job-queues.hubs.store');
    Route::post('job-queues/{jobQueue}/documents', [JobQueueDocumentController::class, 'store'])->name('job-queues.documents.store');
    Route::patch('job-queues/{jobQueue}/status', [JobQueueController::class, 'updateStatus'])->name('job-queues.update-status');
    Route::patch('job-queues/{jobQueue}', [JobQueueController::class, 'updateDetails'])->name('job-queues.update-details');
    Route::delete('job-queues/{jobQueue}', [JobQueueController::class, 'destroyJobQueue'])->name('job-queues.destroy');
    Route::post('job-revenues', [JobRevenueController::class, 'store'])->name('job-revenues.store');
    Route::put('job-revenues/{revenue}', [JobRevenueController::class, 'update'])->name('job-revenues.update');
    Route::delete('job-revenues/{revenue}', [JobRevenueController::class, 'destroy'])->name('job-revenues.destroy');
    Route::post('job-costs', [JobCostController::class, 'store'])->name('job-costs.store');
    Route::put('job-costs/{cost}', [JobCostController::class, 'update'])->name('job-costs.update');
    Route::delete('job-costs/{cost}', [JobCostController::class, 'destroy'])->name('job-costs.destroy');
    Route::resource('imports', ImportController::class);
    Route::resource('exports', ExportController::class);
    Route::resource('carts', CartController::class);
    Route::resource('swings', SwingController::class);
    Route::resource('drivers', DriverController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::resource('driver-vehicle-assignments', DriverVehicleAssignmentController::class)->except(['show']);
    Route::resource('route-plans', RoutePlanController::class);
    Route::patch('route-plans/{route_plan}/status', [RoutePlanController::class, 'updateStatus'])->name('route-plans.update-status');
    Route::resource('vehicle-types', VehicleTypeController::class)->except(['show']);
    Route::resource('vehicles', VehicleController::class)->except(['show']);
    Route::resource('vehicle-vendors', VehicleVendorController::class)->except(['show']);
    Route::resource('maintenance-vendors', MaintenanceVendorController::class)->except(['show', 'create', 'edit']);
    Route::resource('mechanic-management', MechanicManagementController::class)->except(['show', 'create', 'edit']);
    Route::resource('tyre-management', TyreManagementController::class)->only(['index', 'store', 'destroy']);
    Route::resource('incident-reports', IncidentReportController::class)->except(['show', 'create', 'edit']);
    Route::resource('part-stocks', PartStockController::class)->except(['show', 'create', 'edit']);
    Route::patch('maintenance-management/{maintenance_management}/status', [MaintenanceManagementController::class, 'updateStatus'])->name('maintenance-management.update-status');
    Route::resource('maintenance-management', MaintenanceManagementController::class);
    Route::get('maintenance-analytics', [MaintenanceAnalyticsController::class, 'index'])->name('maintenance-analytics.index');
    Route::prefix('pms-scheduler')->name('pms-scheduler.')->group(function () {
        Route::get('/', [SchedulerController::class, 'index'])->name('index');
        Route::post('/', [SchedulerController::class, 'store'])->name('store');
        Route::put('/{scheduler}', [SchedulerController::class, 'update'])->name('update');
        Route::delete('/{scheduler}', [SchedulerController::class, 'destroy'])->name('destroy');
        Route::post('/run-check', [SchedulerController::class, 'runCheck'])->name('run-check');
    });
    Route::resource('fuel-vendors', FuelVendorController::class)->except(['show']);
    Route::resource('fuel-tanks', FuelTankController::class)->except(['show']);
    Route::resource('fuel-tank-transactions', FuelTankTransactionController::class)->except(['show']);
    Route::resource('fuels', FuelController::class)->except(['show']);
    Route::get('vehicle-vendors-export/csv', [VehicleVendorController::class, 'exportCsv'])->name('vehicle-vendors.export.csv');
    Route::get('vehicle-vendors-export/excel', [VehicleVendorController::class, 'exportExcel'])->name('vehicle-vendors.export.excel');
    Route::get('vehicle-vendors-export/pdf', [VehicleVendorController::class, 'exportPdf'])->name('vehicle-vendors.export.pdf');
    Route::resource('traccar-devices', TraccarDeviceController::class)->except(['show']);
    Route::resource('expense-categories', ExpenseCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('expenses', ExpenseController::class);
    Route::resource('revenue-types', RevenueTypeController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('charge-types', ChargeTypeController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('invoices', InvoiceController::class);
    Route::post('invoices/{invoice}/payments', [InvoicePaymentController::class, 'store'])->name('invoices.payments.store');
    Route::delete('invoices/{invoice}/payments/{payment}', [InvoicePaymentController::class, 'destroy'])->name('invoices.payments.destroy');
    Route::get('drivers/{driver}/documents', [DriverDocumentController::class, 'index'])->name('drivers.documents.index');
    Route::post('drivers/{driver}/documents', [DriverDocumentController::class, 'store'])->name('drivers.documents.store');
    Route::put('drivers/{driver}/documents/{document}', [DriverDocumentController::class, 'update'])->name('drivers.documents.update');
    Route::delete('drivers/{driver}/documents/{document}', [DriverDocumentController::class, 'destroy'])->name('drivers.documents.destroy');

    Route::get('job-bookings/customers', [JobBookingController::class, 'getCustomers'])->name('job-bookings.customers');
    Route::get('job-bookings/branches', [JobBookingController::class, 'getBranches'])->name('job-bookings.branches');
    Route::resource('job-bookings', JobBookingController::class);

    // RBAC
    Route::get('roles', [RoleController::class, 'index'])
        ->name('roles.index')
        ->middleware(PermissionMiddleware::class.':role.view');
    Route::get('roles/create', [RoleController::class, 'create'])
        ->name('roles.create')
        ->middleware(PermissionMiddleware::class.':role.manage');
    Route::post('roles', [RoleController::class, 'store'])
        ->name('roles.store')
        ->middleware(PermissionMiddleware::class.':role.manage');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])
        ->name('roles.edit')
        ->middleware(PermissionMiddleware::class.':role.manage');
    Route::put('roles/{role}', [RoleController::class, 'update'])
        ->name('roles.update')
        ->middleware(PermissionMiddleware::class.':role.manage');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])
        ->name('roles.destroy')
        ->middleware(PermissionMiddleware::class.':role.manage');

    Route::get('permissions', [PermissionController::class, 'index'])
        ->name('permissions.index')
        ->middleware(PermissionMiddleware::class.':permission.view');
    Route::get('permissions/create', [PermissionController::class, 'create'])
        ->name('permissions.create')
        ->middleware(PermissionMiddleware::class.':permission.manage');
    Route::post('permissions', [PermissionController::class, 'store'])
        ->name('permissions.store')
        ->middleware(PermissionMiddleware::class.':permission.manage');
    Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])
        ->name('permissions.destroy')
        ->middleware(PermissionMiddleware::class.':permission.manage');

    Route::get('user-roles', [UserRoleController::class, 'index'])
        ->name('user-roles.index')
        ->middleware(PermissionMiddleware::class.':rbac.assign_roles');
    Route::get('user-roles/create', [UserRoleController::class, 'create'])
        ->name('user-roles.create')
        ->middleware(PermissionMiddleware::class.':rbac.assign_roles');
    Route::post('user-roles', [UserRoleController::class, 'store'])
        ->name('user-roles.store')
        ->middleware(PermissionMiddleware::class.':rbac.assign_roles');
    Route::get('user-roles/{user}/edit', [UserRoleController::class, 'edit'])
        ->name('user-roles.edit')
        ->middleware(PermissionMiddleware::class.':rbac.assign_roles');
    Route::put('user-roles/{user}', [UserRoleController::class, 'update'])
        ->name('user-roles.update')
        ->middleware(PermissionMiddleware::class.':rbac.assign_roles');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
