import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

function formatDateForInput(value) {
    if (!value) return '';
    if (typeof value === 'string' && value.length >= 10) {
        return value.slice(0, 10);
    }
    try {
        return new Date(value).toISOString().slice(0, 10);
    } catch {
        return '';
    }
}

export default function ExpenseForm({
    data,
    setData,
    errors,
    expenseCategories,
    companies,
    branches,
    existingReceiptUrl = null,
    children,
}) {
    const companyId = data.company_id === '' || data.company_id == null ? '' : String(data.company_id);

    const categoryOptions = expenseCategories.filter((c) => {
        if (!c.company_id) return true;
        if (!companyId) return true;
        return String(c.company_id) === companyId;
    });

    const branchOptions = branches.filter((b) => {
        if (!companyId) return false;
        return String(b.company_id) === companyId;
    });

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <InputLabel htmlFor="company_id" value="Company" />
                    <select
                        id="company_id"
                        value={data.company_id ?? ''}
                        onChange={(e) => {
                            const v = e.target.value;
                            setData('company_id', v);
                            setData('branch_id', '');
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                    >
                        <option value="">— Optional —</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.company_id} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="branch_id" value="Branch" />
                    <select
                        id="branch_id"
                        value={data.branch_id ?? ''}
                        onChange={(e) => setData('branch_id', e.target.value)}
                        disabled={!companyId}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC] disabled:bg-gray-100"
                    >
                        <option value="">— Optional —</option>
                        {branchOptions.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.branch_id} className="mt-2" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="expense_category_id" value="Expense category *" />
                <select
                    id="expense_category_id"
                    value={data.expense_category_id ?? ''}
                    onChange={(e) => setData('expense_category_id', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                >
                    <option value="">Select category</option>
                    {categoryOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                            {c.company_id ? '' : ' (global)'}
                        </option>
                    ))}
                </select>
                <InputError message={errors.expense_category_id} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="title" value="Title *" />
                <input
                    id="title"
                    type="text"
                    value={data.title ?? ''}
                    onChange={(e) => setData('title', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                    maxLength={160}
                    required
                />
                <InputError message={errors.title} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="description" value="Description" />
                <textarea
                    id="description"
                    value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div>
                    <InputLabel htmlFor="amount" value="Amount *" />
                    <input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={data.amount ?? ''}
                        onChange={(e) => setData('amount', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                        required
                    />
                    <InputError message={errors.amount} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="currency" value="Currency *" />
                    <input
                        id="currency"
                        type="text"
                        value={data.currency ?? 'NZD'}
                        onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                        maxLength={10}
                    />
                    <InputError message={errors.currency} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="expense_date" value="Expense date *" />
                    <input
                        id="expense_date"
                        type="date"
                        value={formatDateForInput(data.expense_date)}
                        onChange={(e) => setData('expense_date', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                        required
                    />
                    <InputError message={errors.expense_date} className="mt-2" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <InputLabel htmlFor="payment_method" value="Payment method" />
                    <input
                        id="payment_method"
                        type="text"
                        value={data.payment_method ?? ''}
                        onChange={(e) => setData('payment_method', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                        maxLength={40}
                        placeholder="e.g. bank transfer, cash"
                    />
                    <InputError message={errors.payment_method} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="reference_no" value="Reference no." />
                    <input
                        id="reference_no"
                        type="text"
                        value={data.reference_no ?? ''}
                        onChange={(e) => setData('reference_no', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                        maxLength={80}
                    />
                    <InputError message={errors.reference_no} className="mt-2" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="status" value="Status *" />
                <select
                    id="status"
                    value={data.status ?? 'draft'}
                    onChange={(e) => setData('status', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <InputError message={errors.status} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="receipt" value="Receipt (image or PDF)" />
                <input
                    id="receipt"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
                    onChange={(e) => setData('receipt', e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full text-sm text-gray-600"
                />
                {existingReceiptUrl && (
                    <p className="mt-2 text-sm">
                        <a
                            href={existingReceiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-[#20A4AC] hover:underline"
                        >
                            View current receipt
                        </a>
                    </p>
                )}
                <InputError message={errors.receipt} className="mt-2" />
            </div>

            {errors.error && (
                <p className="text-sm text-red-600">{errors.error}</p>
            )}

            {children}
        </div>
    );
}
