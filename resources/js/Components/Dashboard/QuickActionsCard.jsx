export default function QuickActionsCard() {
    const actions = [
        {
            icon: '➕',
            label: 'New Job',
            description: 'Create a new shipment',
            color: 'from-[#4db8bf] to-[#20A4AC]',
            bg: 'from-[#20A4AC]/10 to-[#20A4AC]/20',
        },
        {
            icon: '📤',
            label: 'Dispatch',
            description: 'Assign to driver',
            color: 'from-purple-400 to-purple-600',
            bg: 'from-purple-50 to-purple-100',
        },
        {
            icon: '👥',
            label: 'Add Customer',
            description: 'Register new customer',
            color: 'from-green-400 to-green-600',
            bg: 'from-green-50 to-green-100',
        },
        {
            icon: '🚗',
            label: 'Add Driver',
            description: 'Hire new driver',
            color: 'from-orange-400 to-orange-600',
            bg: 'from-orange-50 to-orange-100',
        },
    ];

    return (
        <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="mb-6 text-lg font-bold text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={`group relative overflow-hidden rounded-lg bg-gradient-to-br ${action.bg} p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                    >
                        <div className="relative">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${action.color} text-2xl shadow-md transition-all duration-300 group-hover:scale-110`}>
                                {action.icon}
                            </div>
                            <h4 className="mt-3 text-left font-semibold text-gray-800">{action.label}</h4>
                            <p className="text-left text-xs text-gray-600">{action.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
