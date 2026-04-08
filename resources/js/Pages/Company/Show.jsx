import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Show({ company }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {company.name}
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('companies.edit', company.id)}
                            className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700"
                        >
                            Edit
                        </Link>
                        <Link href={route('companies.index')}>
                            <SecondaryButton type="button">
                                Back to list
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={company.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <dl className="divide-y divide-gray-100">
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Country
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {company.country
                                        ? `${company.country.name} (${company.country.iso_alpha2} / ${company.country.iso_alpha3})`
                                        : '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Status
                                </dt>
                                <dd className="capitalize text-gray-900 sm:col-span-2">
                                    {company.status}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Email
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {company.email || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Phone
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {company.phone || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Website
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {company.website || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Address
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {[company.address_line1, company.address_line2]
                                        .filter(Boolean)
                                        .join(', ') || '—'}
                                    <br />
                                    {[
                                        company.city,
                                        company.state,
                                        company.postcode,
                                    ]
                                        .filter(Boolean)
                                        .join(', ') || null}
                                    {company.country_code && (
                                        <>
                                            <br />
                                            ISO2: {company.country_code}
                                        </>
                                    )}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Timezone / Currency
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {company.timezone} / {company.base_currency}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Branches (linked)
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {company.branches_count}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
