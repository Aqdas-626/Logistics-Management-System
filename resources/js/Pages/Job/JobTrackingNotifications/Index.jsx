import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import JobTrackingNotificationTable from '@/Components/Job/JobTrackingNotificationTable';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@/Components/Icons';

export default function Index({ jobTrackingNotifications, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this job tracking notification?')) {
            router.delete(route('job-tracking-notifications.destroy', id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('job-tracking-notifications.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Job Tracking Notifications" />

            <div>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Job Tracking Notifications</h1>
                    <p className="mt-2 text-gray-600">View and manage job tracking notifications</p>
                </div>

                {/* Search */}
                <div className="mb-6 flex w-full justify-end">
                    <form
                        onSubmit={handleSearch}
                        className="flex max-w-full flex-wrap items-center justify-end gap-2"
                    >
                        <div className="relative min-w-0 w-full max-w-md md:max-w-xl">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by booking, notification type, or communication..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch(e)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none"
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

                {/* Table */}
                <JobTrackingNotificationTable
                    jobTrackingNotifications={jobTrackingNotifications}
                    onDelete={handleDelete}
                />

                {/* Pagination */}
                {jobTrackingNotifications.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{jobTrackingNotifications.from}</span> to{' '}
                            <span className="font-medium">{jobTrackingNotifications.to}</span> of{' '}
                            <span className="font-medium">{jobTrackingNotifications.total}</span> notifications
                        </div>
                        <div className="flex gap-2">
                            {jobTrackingNotifications.prev_page_url && (
                                <a
                                    href={jobTrackingNotifications.prev_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowRightIcon
                                        className="h-4 w-4 rotate-180"
                                        aria-hidden
                                    />
                                    Previous
                                </a>
                            )}
                            {jobTrackingNotifications.next_page_url && (
                                <a
                                    href={jobTrackingNotifications.next_page_url}
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
