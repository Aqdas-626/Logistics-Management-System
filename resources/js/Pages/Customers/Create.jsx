import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CustomerForm from '@/Components/Customer/CustomerForm';

export default function Create({ companies, countries }) {
    return (
        <AuthenticatedLayout>
            <Head title="Create Customer" />

            <div className="mb-6 flex flex-row items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold text-gray-900">Create Customer</h1>
                    <p className="mt-2 text-gray-600">Add a new customer with all relevant details.</p>
                </div>
                <Link
                    href={route('customers.index')}
                    className="shrink-0 text-sm font-medium text-[#20A4AC] hover:text-[#178089]"
                >
                    Back to Customers
                </Link>
            </div>

            <CustomerForm companies={companies} countries={countries} />
        </AuthenticatedLayout>
    );
}
