import { Link } from '@inertiajs/react';
import { SparklesIcon } from '@/Components/Icons';

export default function RecentActivitiesCard({ activities = [] }) {
    const hasActivities = activities.length > 0;

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Activities</h3>
                <p className="mt-1 text-xs text-gray-500">Latest bookings, customers, invoices, and dispatches</p>
            </div>

            <div className={hasActivities ? 'divide-y divide-gray-200 p-4' : 'p-4'}>
                {hasActivities ? (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 transition-colors hover:bg-gray-50 px-2 rounded-lg -mx-2"
                        >
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#20A4AC]/20 to-purple-100 text-lg shadow-sm"
                                aria-hidden
                            >
                                {activity.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                                <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <SparklesIcon className="h-12 w-12 text-gray-300" />
                        <p className="mt-4 text-center text-sm text-gray-500">No recent activity yet</p>
                        <p className="mt-1 max-w-sm text-center text-xs text-gray-400">
                            New job bookings, customers, invoices, and dispatches will show up here.
                        </p>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                <Link
                    href={route('job-queues.index')}
                    className="text-sm font-semibold text-[#20A4AC] transition-colors hover:text-[#0f5c61]"
                >
                    View job queue →
                </Link>
            </div>
        </div>
    );
}
