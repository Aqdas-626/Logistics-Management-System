import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

export default function Index({ branches, companies, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        company_id: filters.company_id || '',
    });

    const filterSubmit = (e) => {
        e.preventDefault();
        get(route('branches.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const destroy = (id) => {
        if (confirm('Delete this branch?')) {
            router.delete(route('branches.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Branches" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Branches
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage company branches
                            </p>
                        </div>
                        <Link
                            href={route('branches.create')}
                            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20A4AC]"
                            style={{ backgroundColor: '#20A4AC' }}
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add branch
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
                            {flash.error}
                        </div>
                    )}

                    <form
                        onSubmit={filterSubmit}
                        className="mb-6 flex w-full flex-wrap items-end justify-end gap-4"
                    >
                        <div>
                            <InputLabel htmlFor="search" value="Search" />
                            <TextInput
                                id="search"
                                className="mt-1 block w-64"
                                value={data.search}
                                onChange={(e) =>
                                    setData('search', e.target.value)
                                }
                                placeholder="Name, code, city"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="company_id" value="Company" />
                            <select
                                id="company_id"
                                className="mt-1 block w-56 rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                value={data.company_id}
                                onChange={(e) =>
                                    setData('company_id', e.target.value)
                                }
                            >
                                <option value="">All companies</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <SecondaryButton type="submit" disabled={processing}>
                            Apply
                        </SecondaryButton>
                    </form>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto p-6">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Name
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Code
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Company
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            City
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Manager
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {branches.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-8 text-center text-gray-500"
                                            >
                                                No branches found.
                                            </td>
                                        </tr>
                                    )}
                                    {branches.data.map((row) => (
                                        <tr key={row.id}>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {row.name}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-gray-700">
                                                {row.code}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {row.company?.name || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {row.city || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {row.manager?.name || '—'}
                                            </td>
                                            <td className="px-3 py-2 capitalize text-gray-700">
                                                {row.status}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="inline-flex items-center justify-end gap-1">
                                                    <Link
                                                        href={route(
                                                            'branches.show',
                                                            row.id,
                                                        )}
                                                        className="inline-flex rounded-lg p-2 text-[#20A4AC] transition-colors hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                                        title="View"
                                                    >
                                                        <span className="sr-only">
                                                            View
                                                        </span>
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            'branches.edit',
                                                            row.id,
                                                        )}
                                                        className="inline-flex rounded-lg p-2 text-[#20A4AC] transition-colors hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                                        title="Edit"
                                                    >
                                                        <span className="sr-only">
                                                            Edit
                                                        </span>
                                                        <PencilIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            destroy(row.id)
                                                        }
                                                        className="inline-flex rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                                                        title="Delete"
                                                    >
                                                        <span className="sr-only">
                                                            Delete
                                                        </span>
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {branches.links.length > 3 && (
                            <div className="flex flex-wrap gap-1 border-t border-gray-100 px-6 py-4">
                                {branches.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={
                                                link.active
                                                    ? 'rounded border border-[#20A4AC] bg-[#20A4AC]/10 px-3 py-1 text-sm text-[#178089]'
                                                    : 'rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50'
                                            }
                                            preserveState
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="rounded border border-gray-100 px-3 py-1 text-sm text-gray-400"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
