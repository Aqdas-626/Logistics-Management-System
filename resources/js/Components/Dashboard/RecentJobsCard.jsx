import { Link, router } from '@inertiajs/react';
import { SparklesIcon } from '@/Components/Icons';

const statusToneClass = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-[#20A4AC]/15 text-[#0f5c61]',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-700',
};

export default function RecentJobsCard({ jobs = [] }) {
    const openQueue = (job) => {
        router.get(route('job-queues.index'), { search: job.jobId }, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Recent Jobs</h3>
                        <p className="mt-1 text-xs text-gray-500">Latest rows from your job queue</p>
                    </div>
                    <Link
                        href={route('job-queues.index')}
                        className="shrink-0 text-sm font-semibold text-[#20A4AC] transition-colors hover:text-[#0f5c61]"
                    >
                        View all
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                {jobs.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Job ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Origin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Destination
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                    Updated
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jobs.map((job) => (
                                <tr
                                    key={job.queueId}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openQueue(job)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openQueue(job);
                                        }
                                    }}
                                    className="cursor-pointer transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {job.jobId}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{job.customer}</td>
                                    <td className="max-w-[10rem] truncate px-6 py-4 text-sm text-gray-600" title={job.origin}>
                                        {job.origin}
                                    </td>
                                    <td className="max-w-[10rem] truncate px-6 py-4 text-sm text-gray-600" title={job.destination}>
                                        {job.destination}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                statusToneClass[job.statusTone] ?? statusToneClass.pending
                                            }`}
                                        >
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{job.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center px-6 py-12">
                        <SparklesIcon className="h-12 w-12 text-gray-300" />
                        <p className="mt-4 text-center text-sm text-gray-500">No jobs in the queue yet</p>
                        <p className="mt-1 max-w-sm text-center text-xs text-gray-400">
                            Create an import, export, cart, or swing job — it will appear here automatically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
