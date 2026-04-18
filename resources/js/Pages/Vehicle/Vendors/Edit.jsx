import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const TEAL = '#20A4AC';

export default function Edit({ vendor }) {
    const { data, setData, put, processing, errors } = useForm({
        vendor_name: vendor.vendor_name || '',
        contact_person: vendor.contact_person || '',
        mobile_number: vendor.mobile_number || '',
        date_of_contract: vendor.date_of_contract || '',
        status: vendor.status || 'active',
        contract_document: null,
        address: vendor.address || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('vehicle-vendors.update', vendor.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-semibold leading-tight text-gray-800">Edit Vehicle Vendor</h2>
                    <Link
                        href={route('vehicle-vendors.index')}
                        className="rounded-md border px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-[#e8f6f7]"
                        style={{ borderColor: TEAL, color: TEAL }}
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Edit Vehicle Vendor" />

            <div className="pb-8">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-t-2 p-5" style={{ borderTopColor: TEAL }}>
                            <p className="mb-6 text-2xl text-gray-700">Update Vendor Info</p>

                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="vendor_name" value="Vendor Name *" />
                                        <TextInput
                                            id="vendor_name"
                                            className="mt-1 block w-full"
                                            value={data.vendor_name}
                                            onChange={(e) => setData('vendor_name', e.target.value)}
                                        />
                                        <InputError message={errors.vendor_name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="contact_person" value="Contact Person *" />
                                        <TextInput
                                            id="contact_person"
                                            className="mt-1 block w-full"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                        />
                                        <InputError message={errors.contact_person} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="mobile_number" value="Mobile Number *" />
                                        <TextInput
                                            id="mobile_number"
                                            className="mt-1 block w-full"
                                            value={data.mobile_number}
                                            onChange={(e) => setData('mobile_number', e.target.value)}
                                        />
                                        <InputError message={errors.mobile_number} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="date_of_contract" value="Date of Contract *" />
                                        <TextInput
                                            id="date_of_contract"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.date_of_contract}
                                            onChange={(e) => setData('date_of_contract', e.target.value)}
                                        />
                                        <InputError message={errors.date_of_contract} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="status" value="Status" />
                                        <select
                                            id="status"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="on_hold">On Hold</option>
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="contract_document" value="Contract Document" />
                                        <input
                                            id="contract_document"
                                            type="file"
                                            className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                                            onChange={(e) => setData('contract_document', e.target.files?.[0] || null)}
                                        />
                                        <InputError message={errors.contract_document} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="address" value="Address *" />
                                    <textarea
                                        id="address"
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end">
                                    <PrimaryButton
                                        disabled={processing}
                                        className="bg-[#0a98ff] hover:bg-[#0789e5] focus:bg-[#0789e5] active:bg-[#067fce]"
                                    >
                                        Update Vendor
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

