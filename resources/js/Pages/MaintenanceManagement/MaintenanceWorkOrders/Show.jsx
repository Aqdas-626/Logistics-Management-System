import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const TEAL = '#20A4AC';

function vehicleLabel(v) {
    if (!v) return '—';
    const reg = v.registration_no || '';
    const name = v.name || '';
    if (reg && name) return `${reg} — ${name}`;
    return reg || name || '—';
}

function formatDateRange(start, end) {
    const fmt = (s) => {
        if (!s) return '';
        const d = new Date(`${String(s).slice(0, 10)}T12:00:00`);
        if (Number.isNaN(d.getTime())) return String(s).slice(0, 10);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const a = fmt(start);
    const b = fmt(end);
    if (a && b) return `${a} to ${b}`;
    return a || b || '—';
}

function statusLabel(s) {
    const map = {
        planned: 'Planned',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return map[s] || s;
}

function priorityBadge(priority) {
    let bg = '#e5e7eb';
    let color = '#374151';
    if (priority === 'high') {
        bg = '#fef3c7';
        color = '#b45309';
    } else if (priority === 'critical') {
        bg = '#fee2e2';
        color = '#b91c1c';
    }
    return (
        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize" style={{ backgroundColor: bg, color }}>
            {priority}
        </span>
    );
}

export default function Show({ record }) {
    const inv = record.invoice_receipt_path;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Maintenance #{record.id}</h2>
                        <p className="text-sm text-gray-500">
                            <Link href={route('maintenance-management.index')} className="hover:underline" style={{ color: TEAL }}>
                                Maintenance Management
                            </Link>
                            <span className="mx-1">/</span>
                            <span>View</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route('maintenance-management.edit', record.id)}
                            className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:opacity-95"
                            style={{ backgroundColor: '#178089' }}
                        >
                            Edit
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Maintenance #${record.id}`} />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm" style={{ borderTopWidth: 4, borderTopColor: TEAL }}>
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Vehicle &amp; schedule</h3>
                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-gray-500">Vehicle</dt>
                                <dd className="font-medium text-gray-900">{vehicleLabel(record.vehicle)}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Dates</dt>
                                <dd className="font-medium text-gray-900">{formatDateRange(record.start_date, record.end_date)}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Status</dt>
                                <dd className="font-medium text-gray-900">{statusLabel(record.status)}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Priority</dt>
                                <dd>{priorityBadge(record.priority)}</dd>
                            </div>
                        </dl>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm" style={{ borderTopWidth: 4, borderTopColor: '#10b981' }}>
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Financials &amp; people</h3>
                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-gray-500">Total</dt>
                                <dd className="font-medium text-gray-900">
                                    {record.currency || 'PKR'} {record.total_cost != null ? Number(record.total_cost).toFixed(2) : '0.00'}
                                    {inv ? (
                                        <a
                                            href={`/storage/${inv}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="ml-2 text-xs underline"
                                            style={{ color: TEAL }}
                                        >
                                            Invoice
                                        </a>
                                    ) : null}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Vendor</dt>
                                <dd className="font-medium text-gray-900">{record.maintenance_vendor?.name || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Mechanic</dt>
                                <dd className="font-medium text-gray-900">{record.mechanic_management?.name || '—'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 text-sm font-semibold text-gray-800">Service details</h3>
                    <p className="whitespace-pre-wrap text-sm text-gray-700">{record.service_details || '—'}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">Job card checklist</h3>
                    <ul className="divide-y divide-gray-100 text-sm">
                        {(record.checklist_items || []).map((item) => (
                            <li key={item.id} className="flex gap-3 py-2">
                                <span className="w-8 text-center">{item.is_done ? '✓' : '○'}</span>
                                <span className="flex-1 text-gray-800">{item.task_item}</span>
                            </li>
                        ))}
                        {!(record.checklist_items || []).length && <li className="py-2 text-gray-500">No checklist rows.</li>}
                    </ul>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">Parts used</h3>
                    <ul className="divide-y divide-gray-100 text-sm">
                        {(record.part_useds || []).map((line) => (
                            <li key={line.id} className="flex justify-between py-2">
                                <span>
                                    {line.part_stock?.name || 'Part'}
                                    {line.part_stock?.sku ? ` (${line.part_stock.sku})` : ''}
                                </span>
                                <span className="text-gray-600">
                                    × {line.quantity}
                                    {line.unit_cost_snapshot != null ? ` @ ${line.unit_cost_snapshot}` : ''}
                                </span>
                            </li>
                        ))}
                        {!(record.part_useds || []).length && <li className="py-2 text-gray-500">No parts recorded.</li>}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
