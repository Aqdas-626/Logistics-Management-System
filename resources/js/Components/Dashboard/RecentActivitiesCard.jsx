export default function RecentActivitiesCard() {
    const activities = [
        {
            id: 1,
            type: 'job_created',
            message: 'New shipment JOB-001 created',
            time: '2 hours ago',
            icon: '📦',
        },
        {
            id: 2,
            type: 'job_dispatched',
            message: 'Job JOB-002 assigned to Driver John',
            time: '4 hours ago',
            icon: '✅',
        },
        {
            id: 3,
            type: 'customer_added',
            message: 'New customer XYZ Corp registered',
            time: '1 day ago',
            icon: '👤',
        },
        {
            id: 4,
            type: 'invoice_created',
            message: 'Invoice INV-2026-001 generated',
            time: '2 days ago',
            icon: '🧾',
        },
    ];

    return (
        <div className="rounded-xl bg-white shadow-md overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Activities</h3>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-200 p-4">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="flex items-start gap-4 py-4 transition-all hover:bg-gray-50 px-2 rounded-lg -mx-2"
                    >
                        {/* Icon */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#20A4AC]/15 to-purple-100 text-lg">
                            {activity.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                <a href="#" className="text-sm text-[#20A4AC] hover:text-[#0f5c61] font-semibold">
                    View all activities →
                </a>
            </div>
        </div>
    );
}
