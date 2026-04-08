import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Show({ location }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {location.name}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={route('locations.edit', location.id)}
                                className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700"
                            >
                                Edit
                            </Link>
                            <Link href={route('locations.index')}>
                                <SecondaryButton type="button">
                                    Back to list
                                </SecondaryButton>
                            </Link>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={location.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <dl className="divide-y divide-gray-100">
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Company
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {location.company?.name || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Country
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {location.country?.name || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Branch
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {location.branch
                                        ? `${location.branch.name} (${location.branch.code})`
                                        : '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Location code
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {location.location_code || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Status
                                </dt>
                                <dd className="capitalize text-gray-900 sm:col-span-2">
                                    {location.status || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    City
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {location.city || '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
