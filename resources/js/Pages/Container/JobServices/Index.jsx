import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@/Components/Icons';

export default function Index({ jobServices, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('job-services.index'), { search: searchTerm }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Job Services" />

            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Job Services</h1>
                    <p className="mt-2 text-gray-600">Manage services by jobable type</p>
                </div>

                <div className="mb-6">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by jobable type or service id..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none md:w-96"
                            />
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Jobable Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Service</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {jobServices.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                            No job services found.
                                        </td>
                                    </tr>
                                ) : (
                                    jobServices.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700">{item.id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{item.jobable_type}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {item.service?.name || item.service_id}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {jobServices.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{jobServices.from || 0}</span> to{' '}
                            <span className="font-medium">{jobServices.to || 0}</span> of{' '}
                            <span className="font-medium">{jobServices.total}</span> job services
                        </div>
                        <div className="flex gap-2">
                            {jobServices.prev_page_url && (
                                <Link
                                    href={jobServices.prev_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </Link>
                            )}
                            {jobServices.next_page_url && (
                                <Link
                                    href={jobServices.next_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
