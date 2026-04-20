import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router } from '@inertiajs/react';
import { TrashIcon } from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

function Row({ label, value }) {
    return (
        <div className="grid grid-cols-1 gap-1 py-2 md:grid-cols-3 md:gap-3">
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <div className="md:col-span-2">
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                    {value || '—'}
                </div>
            </div>
        </div>
    );
}

export default function Show({ dispatch }) {
    const handleDelete = () => {
        confirmDelete({
            message: 'Are you sure you want to delete this dispatch?',
            onConfirm: () => {
                router.delete(route('dispatches.destroy', dispatch.id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Dispatch Details
                        </h2>
                        <div className="flex items-center gap-2">
                            <Link href={route('dispatches.index')}>
                                <SecondaryButton type="button">
                                    Back to list
                                </SecondaryButton>
                            </Link>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Dispatch Details" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="space-y-1">
                            <div className="text-sm text-gray-500">
                                Dispatch ID
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                                #{dispatch.id}
                            </div>
                        </div>

                        <div className="mt-6 divide-y divide-gray-100">
                            <Row
                                label="Job Type"
                                value={dispatch.job_type_label}
                            />
                            <Row label="Job Number" value={dispatch.job_number} />
                            <Row
                                label="Container Number"
                                value={dispatch.container_number}
                            />
                            <Row label="Status" value={dispatch.status} />
                            <Row
                                label="Dispatched At"
                                value={dispatch.dispatched_at}
                            />
                            <Row
                                label="Completed At"
                                value={dispatch.completed_at}
                            />
                            <Row label="Notes" value={dispatch.notes} />
                            <Row
                                label="Driver"
                                value={
                                    dispatch.driver?.name ||
                                    dispatch.driver?.driver_code
                                }
                            />
                            <Row
                                label="Driver Email"
                                value={dispatch.driver?.email}
                            />
                            <Row
                                label="Vehicle"
                                value={dispatch.vehicle?.registration_no}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

