import { ArrowRightIcon } from '@/Components/Icons';

export default function RevenueCard({ title, amount, period, icon: Icon, color = 'green' }) {
    const colors = {
        green: {
            bg: 'from-green-100 to-green-50',
            icon: 'from-green-400 to-green-600',
            text: 'text-green-700',
        },
        blue: {
            bg: 'from-[#20A4AC]/15 to-[#20A4AC]/10',
            icon: 'from-[#4db8bf] to-[#20A4AC]',
            text: 'text-[#178089]',
        },
        orange: {
            bg: 'from-orange-100 to-orange-50',
            icon: 'from-orange-400 to-orange-600',
            text: 'text-orange-700',
        },
    };

    const colorSet = colors[color] || colors.green;

    return (
        <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${colorSet.bg} p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
            {/* Animated background */}
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-5"></div>

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{title}</p>
                        <h3 className={`mt-3 text-3xl font-bold ${colorSet.text}`}>{amount}</h3>
                        <p className="mt-2 text-xs text-gray-600">{period}</p>
                    </div>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-r ${colorSet.icon} shadow-lg transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="h-7 w-7 text-white" />
                    </div>
                </div>

                <button className={`mt-4 inline-flex items-center gap-2 rounded-lg ${colorSet.text} opacity-70 transition-all hover:opacity-100`}>
                    <span className="text-xs font-semibold">View</span>
                    <ArrowRightIcon className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
