import MaintenanceWorkOrderForm from '@/Components/MaintenanceManagement/MaintenanceWorkOrderForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const TEAL = '#20A4AC';

function mapRecordToForm(record) {
    const start = record.start_date ? String(record.start_date).slice(0, 10) : '';
    const end = record.end_date ? String(record.end_date).slice(0, 10) : '';
    const checklist =
        record.checklist_items?.length > 0
            ? record.checklist_items.map((ci) => ({
                  task_item: ci.task_item || '',
                  is_done: !!ci.is_done,
              }))
            : [{ task_item: '', is_done: false }];
    const partsUsed =
        record.part_useds?.map((p) => ({
            parts_stock_id: p.parts_stock_id,
            quantity: p.quantity,
        })) || [];

    return {
        _method: 'put',
        vehicle_id: record.vehicle_id != null ? String(record.vehicle_id) : '',
        maintenance_vendor_id: record.maintenance_vendor_id != null ? String(record.maintenance_vendor_id) : '',
        mechanic_management_id: record.mechanic_management_id != null ? String(record.mechanic_management_id) : '',
        incident_report_id: record.incident_report_id != null ? String(record.incident_report_id) : '',
        scheduler_id: record.scheduler_id != null ? String(record.scheduler_id) : '',
        status: record.status || 'planned',
        start_date: start,
        end_date: end,
        service_details: record.service_details || '',
        total_cost: record.total_cost != null ? String(record.total_cost) : '0',
        currency: record.currency || 'NZD',
        invoice_receipt: null,
        priority: record.priority || 'normal',
        notification_method: record.notification_method || 'email',
        notify_user_ids: Array.isArray(record.notify_user_ids) ? record.notify_user_ids.map(Number) : [],
        checklist,
        parts_used: partsUsed,
    };
}

export default function Edit({ record, vehicles, vendors, mechanics, incidentReports, schedulers, partStocks, users }) {
    const form = useForm(mapRecordToForm(record));

    const submit = (e) => {
        e.preventDefault();
        form.post(route('maintenance-management.update', record.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Edit Maintenance</h2>
                        <p className="text-sm text-gray-500">
                            <Link href={route('dashboard')} className="hover:underline">
                                Dashboard
                            </Link>
                            <span className="mx-1">/</span>
                            <Link href={route('maintenance-management.index')} className="hover:underline">
                                Maintenance
                            </Link>
                            <span className="mx-1">/</span>
                            <span>Edit #{record.id}</span>
                        </p>
                    </div>
                    <Link
                        href={route('maintenance-management.index')}
                        className="text-sm font-medium hover:underline"
                        style={{ color: TEAL }}
                    >
                        ← Back to list
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Maintenance #${record.id}`} />

            <div className="mx-auto max-w-7xl">
                <MaintenanceWorkOrderForm
                    data={form.data}
                    setData={form.setData}
                    errors={form.errors}
                    processing={form.processing}
                    vehicles={vehicles}
                    vendors={vendors}
                    mechanics={mechanics}
                    incidentReports={incidentReports}
                    schedulers={schedulers}
                    partStocks={partStocks}
                    users={users}
                    submitLabel="Save Changes"
                    onSubmit={submit}
                />
            </div>
        </AuthenticatedLayout>
    );
}
