import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExpenseForm from '@/Components/Expense/ExpenseForm';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ expense, expenseCategories, companies, branches, receiptUrl }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        expense_category_id: expense.expense_category_id ?? '',
        company_id: expense.company_id ?? '',
        branch_id: expense.branch_id ?? '',
        title: expense.title ?? '',
        description: expense.description ?? '',
        amount: expense.amount != null ? String(expense.amount) : '',
        currency: expense.currency ?? 'NZD',
        expense_date: expense.expense_date ?? '',
        payment_method: expense.payment_method ?? '',
        reference_no: expense.reference_no ?? '',
        receipt: null,
        status: expense.status ?? 'draft',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('expenses.update', expense.id), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">Edit expense</h2>
                        <Link href={route('expenses.index')}>
                            <SecondaryButton type="button">Back to list</SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Edit — ${expense.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-8">
                            <ExpenseForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                expenseCategories={expenseCategories}
                                companies={companies}
                                branches={branches}
                                existingReceiptUrl={receiptUrl}
                            >
                                <div className="flex justify-end gap-4 pt-2">
                                    <Link href={route('expenses.index')}>
                                        <SecondaryButton type="button">Cancel</SecondaryButton>
                                    </Link>
                                    <PrimaryButton disabled={processing}>Update expense</PrimaryButton>
                                </div>
                            </ExpenseForm>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
