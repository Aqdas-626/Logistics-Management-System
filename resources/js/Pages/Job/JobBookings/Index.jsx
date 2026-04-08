import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@/Components/Icons';

export default function Index({ jobBookings, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleEdit = (jobBooking) => {
        router.visit(route('job-bookings.edit', jobBooking.id));
    };

    const handleView = (jobBooking) => {
        router.visit(route('job-bookings.show', jobBooking.id));
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this job booking?')) {
            router.delete(route('job-bookings.destroy', id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('job-bookings.index'), { search: searchTerm }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Job Bookings" />

            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Job Bookings</h1>
                        <p className="mt-2 text-gray-600">Manage job bookings</p>
                    </div>
                    <Link
                        href={route('job-bookings.create')}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Job Booking
                    </Link>
                </div>

                <div className="mb-6">
                    <form onSubmit={handleSearch}>
                        <div className="relative max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by booking ID, job number, customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none"
                            />
                        </div>
                    </form>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jobBookings.data?.length > 0 ? (
                                jobBookings.data.map((jb) => (
                                    <tr key={jb.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{jb.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{jb.booking_id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{jb.job_number ?? '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{jb.customer?.name ?? '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{jb.company?.name ?? '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 capitalize">{jb.job_type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(jb.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleView(jb)}
                                                    className="inline-flex items-center rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(jb)}
                                                    className="inline-flex items-center rounded-lg bg-[#20A4AC] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a8d95] transition-colors"
                                                >
                                                    <PencilIcon className="mr-1 h-3 w-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(jb.id)}
                                                    className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                                                >
                                                    <TrashIcon className="mr-1 h-3 w-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">No job bookings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {jobBookings.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {jobBookings.from} to {jobBookings.to} of {jobBookings.total} bookings
                        </div>
                        <div className="flex gap-2">
                            {jobBookings.prev_page_url && <a href={jobBookings.prev_page_url} className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">Previous</a>}
                            {jobBookings.next_page_url && <a href={jobBookings.next_page_url} className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">Next</a>}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
