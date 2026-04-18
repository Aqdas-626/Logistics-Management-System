import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExpenseForm from '@/Components/Expense/ExpenseForm';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

const today = new Date().toISOString().slice(0, 10);

export default function Create({ expenseCategories, companies, branches }) {
    const { data, setData, post, processing, errors } = useForm({
        expense_category_id: '',
        company_id: '',
        branch_id: '',
        title: '',
        description: '',
        amount: '',
        currency: 'NZD',
        expense_date: today,
        payment_method: '',
        reference_no: '',
        receipt: null,
        status: 'draft',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('expenses.store'), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">New expense</h2>
                        <Link href={route('expenses.index')}>
                            <SecondaryButton type="button">Back to list</SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="New expense" />

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
                            >
                                <div className="flex justify-end gap-4 pt-2">
                                    <Link href={route('expenses.index')}>
                                        <SecondaryButton type="button">Cancel</SecondaryButton>
                                    </Link>
                                    <PrimaryButton disabled={processing}>Save expense</PrimaryButton>
                                </div>
                            </ExpenseForm>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
