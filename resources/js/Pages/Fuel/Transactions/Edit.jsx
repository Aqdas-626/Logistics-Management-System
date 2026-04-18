import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const TEAL = '#20A4AC';

export default function Edit({ transaction, tanks }) {
    const { data, setData, put, processing, errors } = useForm({
        fuel_tank_id:     transaction.fuel_tank_id || '',
        type:             transaction.type || 'in',
        quantity:         transaction.quantity || '',
        transaction_date: transaction.transaction_date || '',
        reference_type:   transaction.reference_type || '',
        reference_id:     transaction.reference_id || '',
        remarks:          transaction.remarks || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('fuel-tank-transactions.update', transaction.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-semibold leading-tight text-gray-800">Edit Transaction</h2>
                    <Link
                        href={route('fuel-tank-transactions.index')}
                        className="rounded-md border px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-[#e8f6f7]"
                        style={{ borderColor: TEAL, color: TEAL }}
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Edit Transaction" />

            <div className="pb-8">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-t-2 p-5" style={{ borderTopColor: TEAL }}>
                            <p className="mb-6 text-2xl text-gray-700">Update Transaction</p>

                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="fuel_tank_id" value="Fuel Tank *" />
                                        <select
                                            id="fuel_tank_id"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.fuel_tank_id}
                                            onChange={(e) => setData('fuel_tank_id', e.target.value)}
                                        >
                                            <option value="">-- Select Tank --</option>
                                            {tanks.map((tank) => (
                                                <option key={tank.id} value={tank.id}>
                                                    {tank.name} (Stock: {tank.current_stock})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.fuel_tank_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="type" value="Type *" />
                                        <select
                                            id="type"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                        >
                                            <option value="in">In</option>
                                            <option value="out">Out</option>
                                            <option value="adjustment">Adjustment</option>
                                        </select>
                                        <InputError message={errors.type} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="quantity" value="Quantity *" />
                                        <TextInput
                                            id="quantity"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="mt-1 block w-full"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                        />
                                        <InputError message={errors.quantity} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="transaction_date" value="Transaction Date" />
                                        <TextInput
                                            id="transaction_date"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.transaction_date}
                                            onChange={(e) => setData('transaction_date', e.target.value)}
                                        />
                                        <InputError message={errors.transaction_date} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="reference_type" value="Reference Type" />
                                        <TextInput
                                            id="reference_type"
                                            className="mt-1 block w-full"
                                            value={data.reference_type}
                                            onChange={(e) => setData('reference_type', e.target.value)}
                                        />
                                        <InputError message={errors.reference_type} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="reference_id" value="Reference ID" />
                                        <TextInput
                                            id="reference_id"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.reference_id}
                                            onChange={(e) => setData('reference_id', e.target.value)}
                                        />
                                        <InputError message={errors.reference_id} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="remarks" value="Remarks" />
                                    <textarea
                                        id="remarks"
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                    />
                                    <InputError message={errors.remarks} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end">
                                    <PrimaryButton
                                        disabled={processing}
                                        className="bg-[#20A4AC] hover:bg-[#178089] focus:bg-[#178089] active:bg-[#0f6469]"
                                    >
                                        Update Transaction
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
