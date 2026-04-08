import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon } from '@/Components/Icons';

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

export default function Index({ invoices, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route('invoices.index'), { search, status }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Invoices" />
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <Link
                        href={route('invoices.create')}
                        className="inline-flex shrink-0 items-center gap-2 rounded px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
                        style={{ backgroundColor: '#178089' }}
                    >
                        <PlusIcon className="h-4 w-4" />
                        Create Invoice
                    </Link>
                </div>

                <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-white p-3">
                    <div>
                        <label className="mb-1 block text-xs uppercase text-gray-500">Search</label>
                        <input
                            className="w-64 rounded border border-gray-300 px-3 py-2 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Invoice no / customer"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs uppercase text-gray-500">Status</label>
                        <select className="rounded border border-gray-300 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">All</option>
                            {['draft', 'issued', 'partially_paid', 'paid', 'void', 'overdue'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <button className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-700">Apply</button>
                </form>

                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <th className="px-3 py-2">Invoice No</th>
                                <th className="px-3 py-2">Customer</th>
                                <th className="px-3 py-2">Issue</th>
                                <th className="px-3 py-2">Due</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Grand Total</th>
                                <th className="px-3 py-2">Balance</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.data.length ? invoices.data.map((invoice) => (
                                <tr key={invoice.id} className="border-t border-gray-200">
                                    <td className="px-3 py-2 font-medium">{invoice.invoice_no}</td>
                                    <td className="px-3 py-2">{invoice.customer?.name || '-'}</td>
                                    <td className="px-3 py-2">{formatDate(invoice.issue_date)}</td>
                                    <td className="px-3 py-2">{formatDate(invoice.due_date)}</td>
                                    <td className="px-3 py-2">{invoice.status}</td>
                                    <td className="px-3 py-2">{Number(invoice.grand_total || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2">{Number(invoice.balance_due || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="inline-flex gap-2">
                                            <Link href={route('invoices.show', invoice.id)} className="text-[#178089]">View</Link>
                                            <Link href={route('invoices.edit', invoice.id)} className="text-[#178089]">Edit</Link>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">No invoices found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
