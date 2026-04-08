import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CustomerForm from '@/Components/Customer/CustomerForm';

export default function Edit({ customer, companies, countries }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Edit Customer - ${customer.name}`} />

            <div className="mb-6">
                <Link href={route('customers.index')} className="text-sm font-medium text-[#20A4AC] hover:text-[#178089]">
                    Back to Customers
                </Link>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Customer</h1>
                <p className="mt-2 text-gray-600">Update customer details and save changes.</p>
            </div>

            <CustomerForm customer={customer} companies={companies} countries={countries} />
        </AuthenticatedLayout>
    );
}
