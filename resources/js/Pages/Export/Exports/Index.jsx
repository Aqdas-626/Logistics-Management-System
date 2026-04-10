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

export default function Index({ exports, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const onDelete = (id) => {
        confirmDelete({
            message: 'Delete this export job?',
            onConfirm: () => {
            router.delete(route('exports.destroy', id));
            },
        });
    };

    const onSearch = (e) => {
        e.preventDefault();
        router.get(route('exports.index'), { search: searchTerm }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Export Jobs" />
            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Export Jobs</h1>
                        <p className="mt-2 text-gray-600">Complete CRUD for export job booking</p>
                    </div>
                    <Link
                        href={route('exports.create')}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Export Job
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
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none"
                                placeholder="Search by job number, customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 focus:border-teal-500 focus:outline-none"
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
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Job Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Container</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {exports.data?.length ? exports.data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm">{item.id}</td>
                                    <td className="px-6 py-4 text-sm">{item.job_number || '-'}</td>
                                    <td className="px-6 py-4 text-sm">{item.customer?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm">{item.containers?.[0]?.container_number || '-'}</td>
                                    <td className="px-6 py-4 text-sm capitalize">{item.job_type}</td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        <div className="inline-flex items-center justify-end gap-0.5">
                                            <Link
                                                href={route('exports.show', item.id)}
                                                className="inline-flex rounded-md p-1.5 text-teal-600 hover:bg-teal-50 hover:text-teal-900"
                                                title="View"
                                                aria-label="View"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={route('exports.edit', item.id)}
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
                            )) : (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No export jobs found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {exports.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-medium">{exports.from}</span>{' '}
                            to{' '}
                            <span className="font-medium">{exports.to}</span> of{' '}
                            <span className="font-medium">{exports.total}</span>{' '}
                            export jobs
                        </div>
                        <div className="flex gap-2">
                            {exports.prev_page_url && (
                                <a
                                    href={exports.prev_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowRightIcon
                                        className="h-4 w-4 rotate-180"
                                        aria-hidden
                                    />
                                    Previous
                                </a>
                            )}
                            {exports.next_page_url && (
                                <a
                                    href={exports.next_page_url}
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
