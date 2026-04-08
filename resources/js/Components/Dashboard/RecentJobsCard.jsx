import { SparklesIcon } from '@/Components/Icons';

export default function RecentJobsCard({ jobs = [] }) {
    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Recent Jobs</h3>
                    <a href="#" className="text-sm text-[#20A4AC] hover:text-[#0f5c61] font-semibold">View All</a>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
                {jobs.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Job ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Origin</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Destination</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jobs.map((job, index) => (
                                <tr key={index} className="transition-colors hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{job.id}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{job.customer}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{job.origin}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{job.destination}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            job.status === 'In Progress' ? 'bg-[#20A4AC]/15 text-[#0f5c61]' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
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
                        <p className="mt-4 text-center text-gray-500">No recent jobs found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
