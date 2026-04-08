import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Show({ country }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center max-w-7xl  justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {country.name}
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('countries.edit', country.id)}
                            className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700"
                        >
                            Edit
                        </Link>
                        <Link href={route('countries.index')}>
                            <SecondaryButton type="button">
                                Back to list
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={country.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <dl className="divide-y divide-gray-100">
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    ISO alpha-2
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {country.iso_alpha2}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    ISO alpha-3
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {country.iso_alpha3}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Phone code
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {country.phone_code || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Currency
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {country.currency_code || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Active
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {country.is_active ? 'Yes' : 'No'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Companies (linked)
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {country.companies_count}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
