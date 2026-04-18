import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const TEAL = '#20A4AC';

export default function Edit({ vendor }) {
    const { data, setData, put, processing, errors } = useForm({
        name: vendor.name || '',
        contact_person: vendor.contact_person || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        address: vendor.address || '',
        note: vendor.note || '',
        is_active: Boolean(vendor.is_active),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('fuel-vendors.update', vendor.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-semibold leading-tight text-gray-800">Edit Fuel Vendor</h2>
                    <Link
                        href={route('fuel-vendors.index')}
                        className="rounded-md border px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-[#e8f6f7]"
                        style={{ borderColor: TEAL, color: TEAL }}
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Edit Fuel Vendor" />

            <div className="pb-8">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-t-2 p-5" style={{ borderTopColor: TEAL }}>
                            <p className="mb-6 text-2xl text-gray-700">Update Fuel Vendor</p>

                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="name" value="Vendor Name *" />
                                        <TextInput
                                            id="name"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="contact_person" value="Contact Person" />
                                        <TextInput
                                            id="contact_person"
                                            className="mt-1 block w-full"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                        />
                                        <InputError message={errors.contact_person} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="phone" value="Phone" />
                                        <TextInput
                                            id="phone"
                                            className="mt-1 block w-full"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="email" value="Email" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="address" value="Address" />
                                        <TextInput
                                            id="address"
                                            className="mt-1 block w-full"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="is_active" value="Status" />
                                        <select
                                            id="is_active"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.is_active ? '1' : '0'}
                                            onChange={(e) => setData('is_active', e.target.value === '1')}
                                        >
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                        <InputError message={errors.is_active} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="note" value="Note" />
                                    <textarea
                                        id="note"
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                    />
                                    <InputError message={errors.note} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end">
                                    <PrimaryButton
                                        disabled={processing}
                                        className="bg-[#20A4AC] hover:bg-[#178089] focus:bg-[#178089] active:bg-[#0f6469]"
                                    >
                                        Update Fuel Vendor
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

