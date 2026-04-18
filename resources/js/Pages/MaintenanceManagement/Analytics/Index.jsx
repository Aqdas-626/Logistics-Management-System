import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';
const CHART_HEADER_MONTHLY = TEAL;
const CHART_HEADER_VEHICLES = '#d97706';

function formatMoney(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return '0';
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-semibold text-gray-800">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="text-gray-600">
                    <span className="mr-1 inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: p.color }} />
                    {p.name}: {formatMoney(p.value)}
                </p>
            ))}
        </div>
    );
}

export default function Index({ monthlySpend, topVehicles }) {
    const maxMonthly = Math.max(1, ...monthlySpend.map((d) => Number(d.total)));
    const maxVehicle = Math.max(1, ...topVehicles.map((d) => Number(d.total)));
    const yMaxMonthly = Math.ceil(maxMonthly / 1000) * 1000 || 1000;
    const yMaxVehicle = Math.ceil(maxVehicle / 1000) * 1000 || 1000;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Maintenance Analytics</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            <Link href={route('dashboard')} className="hover:underline">
                                Dashboard
                            </Link>
                            <span className="mx-1">/</span>
                            <Link href={route('maintenance-management.index')} className="hover:underline" style={{ color: TEAL }}>
                                Maintenance
                            </Link>
                            <span className="mx-1">/</span>
                            <span>Analytics</span>
                        </p>
                    </div>
                    <Link
                        href={route('maintenance-management.index')}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: TEAL_DARK }}
                    >
                        ← Work orders
                    </Link>
                </div>
            }
        >
            <Head title="Maintenance Analytics" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div
                            className="px-4 py-3 text-sm font-semibold text-white"
                            style={{ backgroundColor: CHART_HEADER_MONTHLY }}
                        >
                            Monthly Maintenance Spend (Last 12 Months)
                        </div>
                        <div className="h-80 w-full p-4 pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlySpend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="fillMaintCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#20A4AC" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#20A4AC" stopOpacity={0.06} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4b5563' }} />
                                    <YAxis
                                        domain={[0, yMaxMonthly]}
                                        tick={{ fontSize: 11, fill: '#4b5563' }}
                                        tickFormatter={(v) => formatMoney(v)}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="Maintenance Cost"
                                        stroke={TEAL_DARK}
                                        strokeWidth={2}
                                        fill="url(#fillMaintCost)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div
                            className="px-4 py-3 text-sm font-semibold text-white"
                            style={{ backgroundColor: CHART_HEADER_VEHICLES }}
                        >
                            Top 10 Costliest Vehicles
                        </div>
                        <div className="h-80 w-full p-4 pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topVehicles} margin={{ top: 8, right: 12, left: 0, bottom: 48 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 10, fill: '#4b5563' }}
                                        interval={0}
                                        angle={-32}
                                        textAnchor="end"
                                        height={56}
                                    />
                                    <YAxis
                                        domain={[0, yMaxVehicle]}
                                        tick={{ fontSize: 11, fill: '#4b5563' }}
                                        tickFormatter={(v) => formatMoney(v)}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="total" name="Total Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
