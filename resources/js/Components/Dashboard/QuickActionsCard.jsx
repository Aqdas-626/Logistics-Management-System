import { Link } from '@inertiajs/react';

export default function QuickActionsCard() {
    const actions = [
        {
            icon: '➕',
            label: 'New Job',
            description: 'Create a new shipment',
            color: 'from-[#4db8bf] to-[#20A4AC]',
            bg: 'from-[#20A4AC]/10 to-[#20A4AC]/20',
            href: route('job-bookings.create'),
        },
        {
            icon: '📤',
            label: 'Dispatch',
            description: 'Assign to driver',
            color: 'from-purple-400 to-purple-600',
            bg: 'from-purple-50 to-purple-100',
            href: route('job-queues.index'),
        },
        {
            icon: '👥',
            label: 'Add Customer',
            description: 'Register new customer',
            color: 'from-green-400 to-green-600',
            bg: 'from-green-50 to-green-100',
            href: route('customers.create'),
        },
        {
            icon: '🚗',
            label: 'Add Driver',
            description: 'Hire new driver',
            color: 'from-orange-400 to-orange-600',
            bg: 'from-orange-50 to-orange-100',
            href: route('drivers.create'),
        },
    ];

    return (
        <div className="rounded-xl bg-white p-6 shadow-md">
            <h3 className="mb-6 text-lg font-bold text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {actions.map((action, index) => {
                    const className = `group relative block w-full overflow-hidden rounded-lg bg-gradient-to-br ${action.bg} p-4 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`;
                    const inner = (
                        <div className="relative">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${action.color} text-2xl shadow-md transition-all duration-300 group-hover:scale-110`}>
                                {action.icon}
                            </div>
                            <h4 className="mt-3 text-left font-semibold text-gray-800">{action.label}</h4>
                            <p className="text-left text-xs text-gray-600">{action.description}</p>
                        </div>
                    );
                    return action.href ? (
                        <Link key={index} href={action.href} className={className}>
                            {inner}
                        </Link>
                    ) : (
                        <button key={index} type="button" className={className}>
                            {inner}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
