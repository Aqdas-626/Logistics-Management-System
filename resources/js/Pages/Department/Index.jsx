import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import {
    CheckIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

export default function Index({ departments, companies, branches, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        company_id: filters.company_id || '',
        branch_id: filters.branch_id || '',
    });

    const filterSubmit = (e) => {
        e.preventDefault();
        get(route('departments.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const destroy = (id) => {
        if (confirm('Delete this department?')) {
            router.delete(route('departments.destroy', id));
        }
    };

    const branchOptions = data.company_id
        ? branches.filter(
              (b) => String(b.company_id) === String(data.company_id),
          )
        : branches;

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Departments
                        </h2>
                        <Link
                            href={route('departments.create')}
                            className="inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#20A4AC] focus:ring-offset-2 active:opacity-80"
                            style={{ backgroundColor: '#20A4AC' }}
                        >
                            <PlusIcon className="h-4 w-4" aria-hidden />
                            Add department
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Departments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
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

                    <div className="mb-6 flex justify-end">
                        <form
                            onSubmit={filterSubmit}
                            className="flex flex-wrap items-end justify-end gap-4"
                        >
                            <div>
                                <InputLabel htmlFor="search" value="Search" />
                                <div className="relative mt-1">
                                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        id="search"
                                        className="block w-56 pl-10"
                                        value={data.search}
                                        onChange={(e) =>
                                            setData('search', e.target.value)
                                        }
                                        placeholder="Name or code"
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="company_id"
                                    value="Company"
                                />
                                <select
                                    id="company_id"
                                    className="mt-1 block w-52 rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    value={data.company_id}
                                    onChange={(e) => {
                                        setData('company_id', e.target.value);
                                        setData('branch_id', '');
                                    }}
                                >
                                    <option value="">All</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="branch_id" value="Branch" />
                                <select
                                    id="branch_id"
                                    className="mt-1 block w-52 rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    value={data.branch_id}
                                    onChange={(e) =>
                                        setData('branch_id', e.target.value)
                                    }
                                    disabled={!data.company_id}
                                >
                                    <option value="">All</option>
                                    {branchOptions.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} ({b.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <SecondaryButton
                                type="submit"
                                disabled={processing}
                                className="gap-2"
                            >
                                <CheckIcon
                                    className="h-4 w-4 text-gray-600"
                                    aria-hidden
                                />
                                Apply
                            </SecondaryButton>
                        </form>
                    </div>

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
                                            Branch
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
                                    {departments.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-3 py-8 text-center text-gray-500"
                                            >
                                                No departments found.
                                            </td>
                                        </tr>
                                    )}
                                    {departments.data.map((row) => (
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
                                                {row.branch
                                                    ? `${row.branch.name} (${row.branch.code})`
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2 capitalize text-gray-700">
                                                {row.status}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="inline-flex items-center justify-end gap-0.5">
                                                    <Link
                                                        href={route(
                                                            'departments.show',
                                                            row.id,
                                                        )}
                                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                                        title="View"
                                                        aria-label="View"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            'departments.edit',
                                                            row.id,
                                                        )}
                                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                                        title="Edit"
                                                        aria-label="Edit"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                        title="Delete"
                                                        aria-label="Delete"
                                                        onClick={() =>
                                                            destroy(row.id)
                                                        }
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {departments.links.length > 3 && (
                            <div className="flex flex-wrap gap-1 border-t border-gray-100 px-6 py-4">
                                {departments.links.map((link, i) =>
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
