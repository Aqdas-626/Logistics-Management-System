import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Show({ department }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {department.name}{' '}
                        <span className="font-mono text-base font-normal text-gray-500">
                            ({department.code})
                        </span>
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('departments.edit', department.id)}
                            className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700"
                        >
                            Edit
                        </Link>
                        <Link href={route('departments.index')}>
                            <SecondaryButton type="button">
                                Back to list
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={department.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <dl className="divide-y divide-gray-100">
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Company
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {department.company?.name || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Branch
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {department.branch
                                        ? `${department.branch.name} (${department.branch.code})`
                                        : 'Company-wide'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Status
                                </dt>
                                <dd className="capitalize text-gray-900 sm:col-span-2">
                                    {department.status}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Employees (linked)
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {department.employees_count}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
