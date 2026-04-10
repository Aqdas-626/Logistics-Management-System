import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const money = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Card({ title, value, subtitle }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
        </div>
    );
}

function SimpleTable({ columns, rows, emptyText = 'No records found.' }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                        {columns.map((c) => (
                            <th key={c.key} className="px-3 py-2">{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500">
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        rows.map((r, idx) => (
                            <tr key={r.id || r.job_key || r.dispatch_id || idx} className="border-t border-gray-200">
                                {columns.map((c) => (
                                    <td key={c.key} className="px-3 py-2 text-gray-800">
                                        {c.render ? c.render(r[c.key], r) : (r[c.key] ?? '—')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default function Index({ filters, options, kpis, reports }) {
    const [form, setForm] = useState({
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
        driver_id: filters?.driver_id ? String(filters.driver_id) : '',
        company_id: filters?.company_id ? String(filters.company_id) : '',
    });

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route('reports.index'), form, { preserveState: true, replace: true });
    };

    const driverDeliveryRows = reports?.driver_delivery || [];
    const paymentsRows = reports?.collections_payments || [];
    const jobFinancialRows = reports?.job_financial_lines || [];
    const driverPerformanceRows = reports?.driver_performance || [];
    const companyRevenueRows = reports?.company_revenue || [];
    const branchRevenueRows = reports?.branch_revenue || [];
    const unpaidRows = reports?.unpaid_invoices || [];
    const aging = reports?.aging_receivables || {};

    const topDriversByCompleted = useMemo(
        () => [...driverPerformanceRows].sort((a, b) => (b.completed_deliveries || 0) - (a.completed_deliveries || 0)).slice(0, 5),
        [driverPerformanceRows],
    );

    return (
        <AuthenticatedLayout>
            <Head title="Reports" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                        <p className="text-sm text-gray-600">Driver, finance, collections, aging, and unpaid invoice reports.</p>
                    </div>
                </div>

                <form onSubmit={applyFilters} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-5">
                    <div>
                        <label className="mb-1 block text-xs uppercase text-gray-500">Start Date</label>
                        <input
                            type="date"
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={form.start_date}
                            onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs uppercase text-gray-500">End Date</label>
                        <input
                            type="date"
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={form.end_date}
                            onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs uppercase text-gray-500">Driver</label>
                        <select
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={form.driver_id}
                            onChange={(e) => setForm((p) => ({ ...p, driver_id: e.target.value }))}
                        >
                            <option value="">All drivers</option>
                            {(options?.drivers || []).map((d) => (
                                <option key={d.id} value={d.id}>{d.name}{d.driver_code ? ` (${d.driver_code})` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs uppercase text-gray-500">Company</label>
                        <select
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={form.company_id}
                            onChange={(e) => setForm((p) => ({ ...p, company_id: e.target.value }))}
                        >
                            <option value="">All companies</option>
                            {(options?.companies || []).map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full rounded bg-[#20A4AC] px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
                            Apply Filters
                        </button>
                    </div>
                </form>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    <Card title="Total Revenue" value={money(kpis?.total_revenue)} />
                    <Card title="Total Cost" value={money(kpis?.total_cost)} />
                    <Card title="Total Margin" value={money(kpis?.total_margin)} subtitle={`${kpis?.margin_percent || 0}%`} />
                    <Card title="Collections" value={money(kpis?.collections_total)} />
                    <Card title="Unpaid Amount" value={money(kpis?.unpaid_total)} />
                    <Card title="Unpaid Invoices" value={String(unpaidRows.length)} />
                </div>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Profit & Loss / Margin Report</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <Card title="Revenue" value={money(reports?.profit_loss?.revenue)} />
                        <Card title="Cost" value={money(reports?.profit_loss?.cost)} />
                        <Card title="Margin" value={money(reports?.profit_loss?.margin)} />
                        <Card title="Margin %" value={`${reports?.profit_loss?.margin_percent || 0}%`} />
                    </div>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Report (Revenue/Cost lines per job)</h2>
                    <SimpleTable
                        columns={[
                            { key: 'job_number', label: 'Job Number' },
                            { key: 'job_type', label: 'Job Type' },
                            { key: 'customer', label: 'Customer' },
                            { key: 'company', label: 'Company' },
                            { key: 'revenue', label: 'Revenue', render: (v) => money(v) },
                            { key: 'cost', label: 'Cost', render: (v) => money(v) },
                            { key: 'margin', label: 'Margin', render: (v) => money(v) },
                        ]}
                        rows={jobFinancialRows}
                    />
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Collections/Payments Report</h2>
                    <SimpleTable
                        columns={[
                            { key: 'payment_date', label: 'Payment Date' },
                            { key: 'invoice_no', label: 'Invoice #' },
                            { key: 'customer', label: 'Customer' },
                            { key: 'company', label: 'Company' },
                            { key: 'method', label: 'Method' },
                            { key: 'reference_no', label: 'Reference' },
                            { key: 'amount', label: 'Amount', render: (v) => money(v) },
                        ]}
                        rows={paymentsRows}
                    />
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Aging Report (Receivables)</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                        <Card title="Current" value={money(aging.current)} />
                        <Card title="1-30 Days" value={money(aging.days_1_30)} />
                        <Card title="31-60 Days" value={money(aging.days_31_60)} />
                        <Card title="61-90 Days" value={money(aging.days_61_90)} />
                        <Card title="90+ Days" value={money(aging.days_90_plus)} />
                    </div>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Unpaid Invoices</h2>
                    <SimpleTable
                        columns={[
                            { key: 'invoice_no', label: 'Invoice #' },
                            { key: 'customer', label: 'Customer' },
                            { key: 'company', label: 'Company' },
                            { key: 'issue_date', label: 'Issue Date' },
                            { key: 'due_date', label: 'Due Date' },
                            { key: 'status', label: 'Status' },
                            { key: 'balance_due', label: 'Balance Due', render: (v) => money(v) },
                            { key: 'days_overdue', label: 'Days Overdue' },
                        ]}
                        rows={unpaidRows}
                    />
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Driver Delivery Report</h2>
                    <SimpleTable
                        columns={[
                            { key: 'driver', label: 'Driver' },
                            { key: 'driver_code', label: 'Driver Code' },
                            { key: 'company', label: 'Company' },
                            { key: 'job_number', label: 'Job Number' },
                            { key: 'dispatched_at', label: 'Dispatched At' },
                            { key: 'completed_at', label: 'Completed At' },
                            { key: 'status', label: 'Status' },
                        ]}
                        rows={driverDeliveryRows}
                    />
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Driver Performance Report</h2>
                    <SimpleTable
                        columns={[
                            { key: 'driver_name', label: 'Driver' },
                            { key: 'driver_code', label: 'Driver Code' },
                            { key: 'company', label: 'Company' },
                            { key: 'total_dispatches', label: 'Total Dispatches' },
                            { key: 'completed_deliveries', label: 'Completed' },
                            { key: 'pending_deliveries', label: 'Pending' },
                            { key: 'completion_rate', label: 'Completion %', render: (v) => `${v}%` },
                        ]}
                        rows={driverPerformanceRows}
                    />
                    <p className="text-xs text-gray-500">
                        Top 5 drivers by completed deliveries: {topDriversByCompleted.map((d) => d.driver_name).join(', ') || '—'}
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Branch/Company-wise Revenue Report</h2>
                    <SimpleTable
                        columns={[
                            { key: 'company', label: 'Company' },
                            { key: 'revenue', label: 'Revenue', render: (v) => money(v) },
                            { key: 'cost', label: 'Cost', render: (v) => money(v) },
                            { key: 'margin', label: 'Margin', render: (v) => money(v) },
                        ]}
                        rows={companyRevenueRows}
                    />
                    <SimpleTable
                        columns={[
                            { key: 'branch', label: 'Branch' },
                            { key: 'revenue', label: 'Revenue', render: (v) => money(v) },
                            { key: 'cost', label: 'Cost', render: (v) => money(v) },
                            { key: 'margin', label: 'Margin', render: (v) => money(v) },
                        ]}
                        rows={branchRevenueRows}
                        emptyText="Branch-level revenue is not available in current job financial schema."
                    />
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

