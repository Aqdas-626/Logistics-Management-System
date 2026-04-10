import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from '@/Components/Icons';

function formatCurrency(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(0);
    }
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
}

export default function RevenueCard({
    title,
    amount,
    period,
    icon: Icon,
    color = 'green',
    viewHref,
    viewLabel = 'View job queue',
}) {
    const colors = {
        green: {
            bg: 'from-green-100 to-green-50',
            icon: 'from-green-400 to-green-600',
            text: 'text-green-700',
            accent: 'ring-green-200/60',
        },
        blue: {
            bg: 'from-[#20A4AC]/15 to-[#20A4AC]/10',
            icon: 'from-[#4db8bf] to-[#20A4AC]',
            text: 'text-[#178089]',
            accent: 'ring-[#20A4AC]/25',
        },
        orange: {
            bg: 'from-orange-100 to-orange-50',
            icon: 'from-orange-400 to-orange-600',
            text: 'text-orange-700',
            accent: 'ring-orange-200/60',
        },
    };

    const colorSet = colors[color] || colors.green;

    return (
        <div
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${colorSet.bg} p-6 shadow-md ring-1 ${colorSet.accent} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
        >
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-5" />

            <div className="relative">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold tracking-tight text-gray-800">{title}</p>
                        <h3 className={`mt-3 truncate text-3xl font-bold tabular-nums ${colorSet.text}`}>
                            {formatCurrency(amount)}
                        </h3>
                        <p className="mt-2 text-xs font-medium text-gray-600">{period}</p>
                    </div>
                    <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${colorSet.icon} shadow-lg transition-all duration-300 group-hover:scale-110`}
                    >
                        <Icon className="h-7 w-7 text-white" />
                    </div>
                </div>

                {viewHref ? (
                    <Link
                        href={viewHref}
                        className={`mt-5 inline-flex items-center gap-2 rounded-lg text-xs font-semibold ${colorSet.text} opacity-80 transition-all hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#20A4AC]`}
                    >
                        <span>{viewLabel}</span>
                        <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
