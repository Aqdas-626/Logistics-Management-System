import { TrashIcon } from '@/Components/Icons';

export default function JobTrackingNotificationTable({ jobTrackingNotifications, onDelete }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notification Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Communication Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {jobTrackingNotifications.data && jobTrackingNotifications.data.length > 0 ? (
                        jobTrackingNotifications.data.map((notification) => (
                            <tr key={notification.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {notification.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {notification.job_booking?.booking_id ?? notification.jobBooking?.booking_id ?? '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {notification.notification_type?.name ?? notification.notificationType?.name ?? '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {notification.communication_type}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${notification.is_sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {notification.is_sent ? 'Sent' : 'Pending'}
                                    </span>
                                    {notification.enabled ? (
                                        <span className="ml-1 inline-flex rounded-full px-2 py-1 text-xs font-medium bg-[#20A4AC]/15 text-[#0f5c61]">
                                            Enabled
                                        </span>
                                    ) : (
                                        <span className="ml-1 inline-flex rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
                                            Disabled
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button
                                        type="button"
                                        onClick={() => onDelete(notification.id)}
                                        className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                                        title="Delete"
                                        aria-label="Delete"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                No job tracking notifications found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
