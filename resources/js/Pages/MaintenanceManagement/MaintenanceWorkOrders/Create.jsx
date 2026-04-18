import MaintenanceWorkOrderForm from '@/Components/MaintenanceManagement/MaintenanceWorkOrderForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const TEAL = '#20A4AC';

function defaultForm() {
    return {
        vehicle_id: '',
        maintenance_vendor_id: '',
        mechanic_management_id: '',
        incident_report_id: '',
        scheduler_id: '',
        status: 'planned',
        start_date: '',
        end_date: '',
        service_details: '',
        total_cost: '0',
        currency: 'PKR',
        invoice_receipt: null,
        priority: 'normal',
        notification_method: 'email',
        notify_user_ids: [],
        checklist: [{ task_item: '', is_done: false }],
        parts_used: [],
    };
}

export default function Create({ vehicles, vendors, mechanics, incidentReports, schedulers, partStocks, users }) {
    const form = useForm(defaultForm());

    const submit = (e) => {
        e.preventDefault();
        form.post(route('maintenance-management.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Add Maintenance</h2>
                        <p className="text-sm text-gray-500">
                            <Link href={route('dashboard')} className="hover:underline">
                                Dashboard
                            </Link>
                            <span className="mx-1">/</span>
                            <Link href={route('maintenance-management.index')} className="hover:underline">
                                Maintenance
                            </Link>
                            <span className="mx-1">/</span>
                            <span>Add</span>
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
            <Head title="Add Maintenance" />

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
                    submitLabel="Add Maintenance"
                    onSubmit={submit}
                />
            </div>
        </AuthenticatedLayout>
    );
}
