import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Show({ branch }) {
    return (
        <AuthenticatedLayout>
            <Head title={branch.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {branch.name}{' '}
                                <span className="font-mono text-xl font-normal text-gray-500">
                                    ({branch.code})
                                </span>
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Branch details
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={route('branches.edit', branch.id)}
                                className="inline-flex items-center rounded-lg bg-[#20A4AC] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1a8d95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20A4AC]"
                            >
                                Edit
                            </Link>
                            <Link href={route('branches.index')}>
                                <SecondaryButton type="button">
                                    Back to list
                                </SecondaryButton>
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <dl className="divide-y divide-gray-100">
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Company
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {branch.company?.name || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Company country
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {branch.company?.country
                                        ? `${branch.company.country.name} (${branch.company.country.iso_alpha2})`
                                        : '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Status
                                </dt>
                                <dd className="capitalize text-gray-900 sm:col-span-2">
                                    {branch.status}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Manager
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {branch.manager
                                        ? `${branch.manager.name} (${branch.manager.email})`
                                        : '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Phone
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {branch.phone || '—'}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Address
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {[branch.address_line1, branch.address_line2]
                                        .filter(Boolean)
                                        .join(', ') || '—'}
                                    <br />
                                    {[
                                        branch.city,
                                        branch.state,
                                        branch.postcode,
                                    ]
                                        .filter(Boolean)
                                        .join(', ') || null}
                                    {branch.country_code && (
                                        <>
                                            <br />
                                            ISO2: {branch.country_code}
                                        </>
                                    )}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Timezone / Currency
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {branch.timezone} / {branch.base_currency}
                                </dd>
                            </div>
                            <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                                <dt className="font-medium text-gray-500">
                                    Branch employees
                                </dt>
                                <dd className="text-gray-900 sm:col-span-2">
                                    {branch.branch_employees_count}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Branch contact
                            </h3>
                        </div>
                        <div className="p-6">
                            {branch.contact ? (
                                <dl className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            Name
                                        </dt>
                                        <dd className="font-medium">
                                            {branch.contact.name}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            Phone
                                        </dt>
                                        <dd>{branch.contact.phone}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            Email
                                        </dt>
                                        <dd>
                                            {branch.contact.email || '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            Designation
                                        </dt>
                                        <dd>
                                            {branch.contact.designation ||
                                                '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            Status
                                        </dt>
                                        <dd className="capitalize">
                                            {branch.contact.status}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No branch contact on file.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Branch assets
                            </h3>
                        </div>
                        <div className="overflow-x-auto p-6">
                            {!branch.assets ||
                            branch.assets.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No assets.
                                </p>
                            ) : (
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-2 pr-4 font-medium text-gray-700">
                                                Code
                                            </th>
                                            <th className="pb-2 pr-4 font-medium text-gray-700">
                                                Name
                                            </th>
                                            <th className="pb-2 pr-4 font-medium text-gray-700">
                                                Qty
                                            </th>
                                            <th className="pb-2 pr-4 font-medium text-gray-700">
                                                Category
                                            </th>
                                            <th className="pb-2 pr-4 font-medium text-gray-700">
                                                Condition
                                            </th>
                                            <th className="pb-2 font-medium text-gray-700">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branch.assets.map((a) => (
                                            <tr
                                                key={a.id}
                                                className="border-b border-gray-50"
                                            >
                                                <td className="py-2 pr-4 font-mono">
                                                    {a.asset_code}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {a.asset_name}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {a.quantity}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {a.category || '—'}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {a.condition || '—'}
                                                </td>
                                                <td className="py-2 capitalize">
                                                    {a.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
