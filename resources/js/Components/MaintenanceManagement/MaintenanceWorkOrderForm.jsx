import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SearchableMultiSelect from '@/Components/SearchableMultiSelect';
import TextInput from '@/Components/TextInput';
import { PlusIcon, TrashIcon, XMarkIcon } from '@/Components/Icons';
import { useState } from 'react';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';

const NOTIFICATION_OPTIONS = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'Sms' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email_sms', label: 'Email + SMS' },
    { value: 'all', label: 'All' },
];

function vehicleLabel(v) {
    if (!v) return '';
    const reg = v.registration_no || '';
    const name = v.name || '';
    if (reg && name) return `${reg} — ${name}`;
    return reg || name || '';
}

function incidentLabel(ir) {
    if (!ir) return '';
    const v = ir.vehicle;
    const vlab = v ? vehicleLabel(v) : '';
    const d = ir.report_date ? String(ir.report_date).slice(0, 10) : '';
    return `#${ir.id}${vlab ? ` — ${vlab}` : ''}${d ? ` (${d})` : ''}`;
}

function schedulerLabel(s) {
    if (!s) return '';
    const v = s.vehicle;
    const vlab = v ? vehicleLabel(v) : '';
    return `${s.service_name || 'Rule'}${vlab ? ` — ${vlab}` : ''}`;
}

export default function MaintenanceWorkOrderForm({
    data,
    setData,
    errors,
    processing,
    vehicles,
    vendors,
    mechanics,
    incidentReports,
    schedulers,
    partStocks,
    users,
    submitLabel,
    onSubmit,
}) {
    const [partPickId, setPartPickId] = useState('');
    const [partQty, setPartQty] = useState(1);

    const addChecklistRow = () => {
        setData('checklist', [...(data.checklist || []), { task_item: '', is_done: false }]);
    };

    const removeChecklistRow = (index) => {
        const next = [...(data.checklist || [])];
        next.splice(index, 1);
        setData('checklist', next.length ? next : [{ task_item: '', is_done: false }]);
    };

    const updateChecklist = (index, field, value) => {
        const next = [...(data.checklist || [])];
        next[index] = { ...next[index], [field]: value };
        setData('checklist', next);
    };

    const addPartLine = () => {
        if (!partPickId) return;
        const qty = Math.max(1, parseInt(String(partQty), 10) || 1);
        const pid = parseInt(partPickId, 10);
        const lines = [...(data.parts_used || [])];
        const idx = lines.findIndex((p) => Number(p.parts_stock_id) === pid);
        if (idx >= 0) {
            lines[idx] = { ...lines[idx], quantity: Number(lines[idx].quantity) + qty };
        } else {
            lines.push({ parts_stock_id: pid, quantity: qty });
        }
        setData('parts_used', lines);
        setPartPickId('');
        setPartQty(1);
    };

    const removePartLine = (index) => {
        const next = [...(data.parts_used || [])];
        next.splice(index, 1);
        setData('parts_used', next);
    };

    const partName = (id) => {
        const p = partStocks?.find((x) => Number(x.id) === Number(id));
        return p ? `${p.name}${p.sku ? ` (${p.sku})` : ''}` : id;
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        style={{ borderTopWidth: 4, borderTopColor: TEAL }}
                    >
                        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                            <span className="text-lg" aria-hidden>
                                🚚
                            </span>
                            <h3 className="text-sm font-semibold text-gray-800">Vehicle Service Details</h3>
                        </div>
                        <div className="grid gap-4 p-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="vehicle_id" value="Select Vehicle *" />
                                <select
                                    id="vehicle_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.vehicle_id}
                                    onChange={(e) => setData('vehicle_id', e.target.value)}
                                >
                                    <option value="">—</option>
                                    {vehicles?.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {vehicleLabel(v)}
                                        </option>
                                    ))}
                                </select>
                                {errors.vehicle_id && <p className="mt-1 text-sm text-red-600">{errors.vehicle_id}</p>}
                            </div>
                            <div>
                                <InputLabel htmlFor="status" value="Maintenance Status *" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option value="planned">Planned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                            </div>
                            <div>
                                <InputLabel htmlFor="start_date" value="Start Date *" />
                                <TextInput
                                    id="start_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                />
                                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                            </div>
                            <div>
                                <InputLabel htmlFor="end_date" value="End Date *" />
                                <TextInput
                                    id="end_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="service_details" value="Service Details *" />
                                <textarea
                                    id="service_details"
                                    rows={5}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.service_details}
                                    onChange={(e) => setData('service_details', e.target.value)}
                                />
                                {errors.service_details && (
                                    <p className="mt-1 text-sm text-red-600">{errors.service_details}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="incident_report_id" value="Link Incident (optional)" />
                                <select
                                    id="incident_report_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.incident_report_id || ''}
                                    onChange={(e) => setData('incident_report_id', e.target.value || null)}
                                >
                                    <option value="">—</option>
                                    {incidentReports?.map((ir) => (
                                        <option key={ir.id} value={ir.id}>
                                            {incidentLabel(ir)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="scheduler_id" value="Link PMS Scheduler (optional)" />
                                <select
                                    id="scheduler_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.scheduler_id || ''}
                                    onChange={(e) => setData('scheduler_id', e.target.value || null)}
                                >
                                    <option value="">—</option>
                                    {schedulers?.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {schedulerLabel(s)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        style={{ borderTopWidth: 4, borderTopColor: '#f59e0b' }}
                    >
                        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                            <span className="text-lg" aria-hidden>
                                ☑
                            </span>
                            <h3 className="text-sm font-semibold text-gray-800">Job Card Checklist</h3>
                        </div>
                        <div className="p-4">
                            <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-semibold uppercase text-gray-500">
                                <div className="col-span-2">Done</div>
                                <div className="col-span-9">Task / Inspection</div>
                                <div className="col-span-1" />
                            </div>
                            <div className="space-y-2">
                                {(data.checklist || []).map((row, index) => (
                                    <div key={index} className="grid grid-cols-12 items-center gap-2">
                                        <div className="col-span-2 flex justify-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300"
                                                checked={!!row.is_done}
                                                onChange={(e) => updateChecklist(index, 'is_done', e.target.checked)}
                                            />
                                        </div>
                                        <div className="col-span-9">
                                            <TextInput
                                                className="w-full"
                                                value={row.task_item}
                                                onChange={(e) => updateChecklist(index, 'task_item', e.target.value)}
                                                placeholder="Task description"
                                            />
                                            {errors[`checklist.${index}.task_item`] && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors[`checklist.${index}.task_item`]}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                className="rounded p-1 text-red-600 hover:bg-red-50"
                                                onClick={() => removeChecklistRow(index)}
                                                aria-label="Remove row"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-center">
                                <button
                                    type="button"
                                    onClick={addChecklistRow}
                                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    style={{ borderColor: TEAL, color: TEAL_DARK }}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </section>

                    <section
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        style={{ borderTopWidth: 4, borderTopColor: '#1f2937' }}
                    >
                        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                            <span className="text-lg" aria-hidden>
                                ⚙
                            </span>
                            <h3 className="text-sm font-semibold text-gray-800">Parts Used</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="min-w-[200px] flex-1">
                                    <InputLabel value="Select Part" />
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={partPickId}
                                        onChange={(e) => setPartPickId(e.target.value)}
                                    >
                                        <option value="">—</option>
                                        {partStocks?.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                                {p.sku ? ` (${p.sku})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <InputLabel value="Qty" />
                                    <TextInput
                                        type="number"
                                        min={1}
                                        className="mt-1"
                                        value={partQty}
                                        onChange={(e) => setPartQty(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addPartLine}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white shadow"
                                    style={{ backgroundColor: TEAL }}
                                    aria-label="Add part"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                            </div>
                            {(data.parts_used || []).length > 0 && (
                                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200 text-sm">
                                    {(data.parts_used || []).map((line, index) => (
                                        <li key={index} className="flex items-center justify-between gap-2 px-3 py-2">
                                            <span>{partName(line.parts_stock_id)} × {line.quantity}</span>
                                            <button
                                                type="button"
                                                className="text-red-600 hover:text-red-800"
                                                onClick={() => removePartLine(index)}
                                                aria-label="Remove part"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {errors.parts_used && (
                                <p className="text-sm text-red-600">{typeof errors.parts_used === 'string' ? errors.parts_used : ''}</p>
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        style={{ borderTopWidth: 4, borderTopColor: '#10b981' }}
                    >
                        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                            <span className="text-lg" aria-hidden>
                                $
                            </span>
                            <h3 className="text-sm font-semibold text-gray-800">Financials</h3>
                        </div>
                        <div className="space-y-4 p-4">
                            <div>
                                <InputLabel htmlFor="total_cost" value="Total Cost" />
                                <div className="relative mt-1">
                                    <span className="pointer-events-none absolute left-3 top-2 text-gray-500">$</span>
                                    <TextInput
                                        id="total_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full pl-8"
                                        value={data.total_cost}
                                        onChange={(e) => setData('total_cost', e.target.value)}
                                    />
                                </div>
                                {errors.total_cost && <p className="mt-1 text-sm text-red-600">{errors.total_cost}</p>}
                            </div>
                            <div>
                                <InputLabel htmlFor="currency" value="Currency" />
                                <TextInput
                                    id="currency"
                                    className="mt-1"
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    maxLength={10}
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="maintenance_vendor_id" value="Vendor" />
                                <select
                                    id="maintenance_vendor_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.maintenance_vendor_id || ''}
                                    onChange={(e) => setData('maintenance_vendor_id', e.target.value || null)}
                                >
                                    <option value="">—</option>
                                    {vendors?.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Upload Receipt / Invoice" />
                                <input
                                    type="file"
                                    className="mt-1 block w-full text-sm text-gray-600"
                                    onChange={(e) => setData('invoice_receipt', e.target.files?.[0] || null)}
                                />
                                {errors.invoice_receipt && (
                                    <p className="mt-1 text-sm text-red-600">{errors.invoice_receipt}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        style={{ borderTopWidth: 4, borderTopColor: '#14b8a6' }}
                    >
                        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                            <span className="text-lg" aria-hidden>
                                🔧
                            </span>
                            <h3 className="text-sm font-semibold text-gray-800">Mechanic &amp; Priority</h3>
                        </div>
                        <div className="space-y-4 p-4">
                            <div>
                                <InputLabel htmlFor="mechanic_management_id" value="Mechanic" />
                                <select
                                    id="mechanic_management_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.mechanic_management_id || ''}
                                    onChange={(e) => setData('mechanic_management_id', e.target.value || null)}
                                >
                                    <option value="">—</option>
                                    {mechanics?.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="priority" value="Priority" />
                                <select
                                    id="priority"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section
                        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        style={{ borderTopWidth: 4, borderTopColor: '#4b5563' }}
                    >
                        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                            <span className="text-lg" aria-hidden>
                                🔔
                            </span>
                            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        </div>
                        <div className="space-y-4 p-4">
                            <div>
                                <InputLabel value="Notify members" />
                                <div className="mt-1">
                                    <SearchableMultiSelect
                                        options={users || []}
                                        value={data.notify_user_ids || []}
                                        onChange={(ids) => setData('notify_user_ids', ids)}
                                        placeholder="Search by name or email…"
                                        emptyText="No users found"
                                    />
                                </div>
                            </div>
                            <div>
                                <InputLabel value="Notification method" />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {NOTIFICATION_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setData('notification_method', opt.value)}
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                                data.notification_method === opt.value
                                                    ? 'text-white shadow'
                                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                            style={
                                                data.notification_method === opt.value
                                                    ? { backgroundColor: TEAL }
                                                    : undefined
                                            }
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 pt-6">
                <PrimaryButton disabled={processing} className="min-w-[200px] justify-center" style={{ backgroundColor: TEAL }}>
                    {submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}
