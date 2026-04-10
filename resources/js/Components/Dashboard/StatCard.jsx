export default function StatCard({ icon: Icon, label, value, change, isPositive = true, color = 'blue' }) {
    const colors = {
        blue: 'from-[#20A4AC]/15 to-[#20A4AC]/10',
        green: 'from-green-100 to-green-50',
        yellow: 'from-yellow-100 to-yellow-50',
        purple: 'from-purple-100 to-purple-50',
        pink: 'from-pink-100 to-pink-50',
    };

    const iconColors = {
        blue: 'from-[#4db8bf] to-[#20A4AC]',
        green: 'from-green-400 to-green-600',
        yellow: 'from-yellow-400 to-yellow-600',
        purple: 'from-purple-400 to-purple-600',
        pink: 'from-pink-400 to-pink-600',
    };

    return (
        <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${colors[color]} p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
            {/* Animated background element */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-10"></div>

            <div className="relative">
                {/* Top section */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{label}</p>
                        <h3 className="mt-2 text-3xl font-bold text-gray-800">{value}</h3>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${iconColors[color]} shadow-lg transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>

                {change != null && change !== '' && (
                    <div className="mt-4 flex items-center gap-1">
                        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '↑' : '↓'} {change}
                        </span>
                        <span className="text-xs text-gray-500">from last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}
