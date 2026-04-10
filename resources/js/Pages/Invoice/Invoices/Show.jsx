import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

const formatDate = (value) => {
    if (!value) return '-';
    const raw = String(value).slice(0, 10);
    const [y, m, d] = raw.split('-').map(Number);
    if (!y || !m || !d) return raw;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
};

export default function Show({ invoice }) {
    const { data, setData, post, processing, errors } = useForm({
        payment_date: '',
        amount: '',
        method: '',
        reference_no: '',
        notes: '',
    });

    const addPayment = (e) => {
        e.preventDefault();
        post(route('invoices.payments.store', invoice.id));
    };

    const deletePayment = (paymentId) => {
        confirmDelete({
            message: 'Remove this payment?',
            onConfirm: () => {
            router.delete(route('invoices.payments.destroy', [invoice.id, paymentId]));
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Invoice ${invoice.invoice_no}`} />
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_no}</h1>
                    <div className="flex gap-2">
                        <Link href={route('invoices.edit', invoice.id)} className="rounded bg-[#178089] px-3 py-2 text-sm text-white">Edit</Link>
                        <Link href={route('invoices.index')} className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-700">Back</Link>
                    </div>
                </div>

                <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-3">
                    <div><p className="text-xs text-gray-500">Customer</p><p className="font-medium">{invoice.customer?.name || '-'}</p></div>
                    <div><p className="text-xs text-gray-500">Issue Date</p><p className="font-medium">{formatDate(invoice.issue_date)}</p></div>
                    <div><p className="text-xs text-gray-500">Due Date</p><p className="font-medium">{formatDate(invoice.due_date)}</p></div>
                    <div><p className="text-xs text-gray-500">Status</p><p className="font-medium">{invoice.status}</p></div>
                    <div><p className="text-xs text-gray-500">Grand Total</p><p className="font-medium">{Number(invoice.grand_total || 0).toFixed(2)}</p></div>
                    <div><p className="text-xs text-gray-500">Balance Due</p><p className="font-medium">{Number(invoice.balance_due || 0).toFixed(2)}</p></div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-3 font-semibold text-gray-900">Invoice Lines</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                    <th className="px-3 py-2">Description</th>
                                    <th className="px-3 py-2">Qty</th>
                                    <th className="px-3 py-2">Unit</th>
                                    <th className="px-3 py-2">Discount</th>
                                    <th className="px-3 py-2">Tax</th>
                                    <th className="px-3 py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoice.lines || []).map((line) => (
                                    <tr key={line.id} className="border-t border-gray-200">
                                        <td className="px-3 py-2">{line.description}</td>
                                        <td className="px-3 py-2">{Number(line.qty || 0).toFixed(3)}</td>
                                        <td className="px-3 py-2">{Number(line.unit_price || 0).toFixed(2)}</td>
                                        <td className="px-3 py-2">{Number(line.line_discount || 0).toFixed(2)}</td>
                                        <td className="px-3 py-2">{Number(line.tax_amount || 0).toFixed(2)}</td>
                                        <td className="px-3 py-2">{Number(line.line_total || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="mb-3 font-semibold text-gray-900">Add Payment</h3>
                        <form onSubmit={addPayment} className="space-y-3">
                            <input type="date" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" value={data.payment_date} onChange={(e) => setData('payment_date', e.target.value)} />
                            <input type="number" step="0.01" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Amount" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                            <input type="text" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Method" value={data.method} onChange={(e) => setData('method', e.target.value)} />
                            <input type="text" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Reference No" value={data.reference_no} onChange={(e) => setData('reference_no', e.target.value)} />
                            <textarea className="w-full rounded border border-gray-300 px-3 py-2 text-sm" rows={3} placeholder="Notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            {(errors.amount || errors.payment_date) && (
                                <p className="text-xs text-red-600">{errors.amount || errors.payment_date}</p>
                            )}
                            <button type="submit" disabled={processing} className="rounded bg-[#178089] px-4 py-2 text-sm text-white disabled:opacity-60">
                                Save Payment
                            </button>
                        </form>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="mb-3 font-semibold text-gray-900">Payments</h3>
                        <div className="space-y-2">
                            {(invoice.payments || []).length ? invoice.payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between rounded border border-gray-200 p-2 text-sm">
                                    <div>
                                        <div>{formatDate(payment.payment_date)} - {Number(payment.amount || 0).toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{payment.method || '-'} {payment.reference_no ? `| ${payment.reference_no}` : ''}</div>
                                    </div>
                                    <button type="button" onClick={() => deletePayment(payment.id)} className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">
                                        Remove
                                    </button>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">No payments yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
