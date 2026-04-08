import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

const emptyLine = {
    description: '',
    qty: 1,
    unit_price: 0,
    line_discount: 0,
    tax_rate: 0,
};

export default function Form({
    mode = 'create',
    invoice = null,
    customers = [],
    defaultIssueDate = '',
    defaultDueDate = '',
}) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors } = useForm({
        customer_id: invoice?.customer_id ? String(invoice.customer_id) : '',
        issue_date: invoice?.issue_date ? String(invoice.issue_date).slice(0, 10) : defaultIssueDate,
        due_date: invoice?.due_date ? String(invoice.due_date).slice(0, 10) : defaultDueDate,
        currency_code: invoice?.currency_code || 'USD',
        status: invoice?.status || 'draft',
        notes: invoice?.notes || '',
        terms: invoice?.terms || '',
        lines: invoice?.lines?.length
            ? invoice.lines.map((line) => ({
                  description: line.description || '',
                  qty: Number(line.qty || 0),
                  unit_price: Number(line.unit_price || 0),
                  line_discount: Number(line.line_discount || 0),
                  tax_rate: Number(line.tax_rate || 0),
              }))
            : [emptyLine],
    });

    const totals = useMemo(() => {
        let subtotal = 0;
        let discount = 0;
        let tax = 0;
        for (const row of data.lines) {
            const qty = Number(row.qty || 0);
            const unit = Number(row.unit_price || 0);
            const disc = Number(row.line_discount || 0);
            const rate = Number(row.tax_rate || 0);
            const lineSub = qty * unit;
            const taxable = Math.max(0, lineSub - disc);
            subtotal += lineSub;
            discount += disc;
            tax += taxable * rate;
        }
        return {
            subtotal,
            discount,
            tax,
            grand: Math.max(0, subtotal - discount + tax),
        };
    }, [data.lines]);

    const updateLine = (index, field, value) => {
        const next = data.lines.map((line, i) => (i === index ? { ...line, [field]: value } : line));
        setData('lines', next);
    };

    const addLine = () => setData('lines', [...data.lines, { ...emptyLine }]);
    const removeLine = (index) => {
        if (data.lines.length === 1) return;
        setData(
            'lines',
            data.lines.filter((_, i) => i !== index),
        );
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('invoices.update', invoice.id));
            return;
        }
        post(route('invoices.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit Invoice ${invoice?.invoice_no || ''}` : 'Create Invoice'} />
            <form onSubmit={submit} className="space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h1>
                    <Link href={route('invoices.index')} className="text-sm font-medium text-[#178089]">
                        Back to Invoices
                    </Link>
                </div>

                <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Customer *</label>
                        <select
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={data.customer_id}
                            onChange={(e) => setData('customer_id', e.target.value)}
                        >
                            <option value="">Select customer</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.customer_code})
                                </option>
                            ))}
                        </select>
                        {errors.customer_id && <p className="mt-1 text-xs text-red-600">{errors.customer_id}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Issue Date *</label>
                        <input
                            type="date"
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={data.issue_date}
                            onChange={(e) => setData('issue_date', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Due Date</label>
                        <input
                            type="date"
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={data.due_date || ''}
                            onChange={(e) => setData('due_date', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Currency</label>
                        <input
                            type="text"
                            maxLength={3}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm uppercase"
                            value={data.currency_code}
                            onChange={(e) => setData('currency_code', e.target.value.toUpperCase())}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Status</label>
                        <select
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {['draft', 'issued', 'partially_paid', 'paid', 'void', 'overdue'].map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Invoice Lines</h3>
                        <button type="button" onClick={addLine} className="rounded bg-[#178089] px-3 py-1.5 text-sm text-white">
                            Add Line
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                    <th className="px-2 py-2">Description</th>
                                    <th className="px-2 py-2">Qty</th>
                                    <th className="px-2 py-2">Unit Price</th>
                                    <th className="px-2 py-2">Discount</th>
                                    <th className="px-2 py-2">Tax Rate</th>
                                    <th className="px-2 py-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lines.map((line, index) => (
                                    <tr key={index} className="border-t border-gray-200">
                                        <td className="px-2 py-2">
                                            <input
                                                className="w-full rounded border border-gray-300 px-2 py-1"
                                                value={line.description}
                                                onChange={(e) => updateLine(index, 'description', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="number"
                                                step="0.001"
                                                className="w-24 rounded border border-gray-300 px-2 py-1"
                                                value={line.qty}
                                                onChange={(e) => updateLine(index, 'qty', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-28 rounded border border-gray-300 px-2 py-1"
                                                value={line.unit_price}
                                                onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-28 rounded border border-gray-300 px-2 py-1"
                                                value={line.line_discount}
                                                onChange={(e) => updateLine(index, 'line_discount', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="number"
                                                step="0.0001"
                                                className="w-24 rounded border border-gray-300 px-2 py-1"
                                                value={line.tax_rate}
                                                onChange={(e) => updateLine(index, 'tax_rate', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeLine(index)}
                                                className="rounded bg-red-50 px-2 py-1 text-xs text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {errors.lines && <p className="mt-2 text-xs text-red-600">{errors.lines}</p>}
                </div>

                <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Notes</label>
                        <textarea
                            rows={3}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-600">Terms</label>
                        <textarea
                            rows={3}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                            value={data.terms}
                            onChange={(e) => setData('terms', e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2 rounded bg-gray-50 p-3 text-sm">
                        <div className="flex justify-between py-0.5"><span>Subtotal</span><span>{totals.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between py-0.5"><span>Discount</span><span>{totals.discount.toFixed(2)}</span></div>
                        <div className="flex justify-between py-0.5"><span>Tax</span><span>{totals.tax.toFixed(2)}</span></div>
                        <div className="mt-1 flex justify-between border-t border-gray-300 pt-1 font-semibold">
                            <span>Grand Total</span>
                            <span>{totals.grand.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Link href={route('invoices.index')} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {isEdit ? 'Update Invoice' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
