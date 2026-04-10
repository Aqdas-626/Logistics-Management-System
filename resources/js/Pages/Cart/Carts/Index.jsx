import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowRightIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ carts, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const onDelete = (id) => {
        confirmDelete({
            message: 'Delete this cart job?',
            onConfirm: () => {
            router.delete(route('carts.destroy', id));
            },
        });
    };

    const onSearch = (e) => {
        e.preventDefault();
        router.get(route('carts.index'), { search: searchTerm }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Cart Jobs" />
            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Cart Jobs</h1>
                        <p className="mt-2 text-gray-600">Cart job booking</p>
                    </div>
                    <Link
                        href={route('carts.create')}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Cart Job
                    </Link>
                </div>

                <div className="mb-6 flex w-full justify-end">
                    <form
                        onSubmit={onSearch}
                        className="flex max-w-full flex-wrap items-center justify-end gap-2"
                    >
                        <div className="relative min-w-0 w-full max-w-md md:w-96">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none"
                                placeholder="Search by job number, customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 focus:border-[#20A4AC] focus:outline-none"
                            title="Search"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Job No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Container</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {carts.data?.length ? (
                                carts.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{item.id}</td>
                                        <td className="px-6 py-4 text-sm">{item.job_no || '-'}</td>
                                        <td className="px-6 py-4 text-sm">{item.customer?.name || '-'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {item.containers?.[0]?.container_number || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            <div className="inline-flex items-center justify-end gap-0.5">
                                                <Link
                                                    href={route('carts.show', item.id)}
                                                    className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#178089]"
                                                    title="View"
                                                    aria-label="View"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    href={route('carts.edit', item.id)}
                                                    className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                                    title="Edit"
                                                    aria-label="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(item.id)}
                                                    className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                    title="Delete"
                                                    aria-label="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No cart jobs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {carts.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-medium">{carts.from}</span> to{' '}
                            <span className="font-medium">{carts.to}</span> of{' '}
                            <span className="font-medium">{carts.total}</span>{' '}
                            cart jobs
                        </div>
                        <div className="flex gap-2">
                            {carts.prev_page_url && (
                                <a
                                    href={carts.prev_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowRightIcon
                                        className="h-4 w-4 rotate-180"
                                        aria-hidden
                                    />
                                    Previous
                                </a>
                            )}
                            {carts.next_page_url && (
                                <a
                                    href={carts.next_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                    <ArrowRightIcon
                                        className="h-4 w-4"
                                        aria-hidden
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
