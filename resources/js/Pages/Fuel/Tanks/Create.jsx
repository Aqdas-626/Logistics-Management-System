import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const TEAL = '#20A4AC';

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        fuel_type: '',
        capacity: '',
        current_stock: '',
        unit: 'liter',
        note: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fuel-tanks.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-semibold leading-tight text-gray-800">Add Fuel Tank</h2>
                    <Link
                        href={route('fuel-tanks.index')}
                        className="rounded-md border px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-[#e8f6f7]"
                        style={{ borderColor: TEAL, color: TEAL }}
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Add Fuel Tank" />

            <div className="pb-8">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-t-2 p-5" style={{ borderTopColor: TEAL }}>
                            <p className="mb-6 text-2xl text-gray-700">Add New Fuel Tank</p>

                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="name" value="Tank Name *" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        placeholder="e.g. Main Tank"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                    <div>
                                        <InputLabel htmlFor="fuel_type" value="Fuel Type" />
                                        <select
                                            id="fuel_type"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.fuel_type}
                                            onChange={(e) => setData('fuel_type', e.target.value)}
                                        >
                                            <option value="">-- Select --</option>
                                            {FUEL_TYPES.map((t) => (
                                                <option key={t} value={t} className="capitalize">
                                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.fuel_type} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="unit" value="Unit *" />
                                        <TextInput
                                            id="unit"
                                            className="mt-1 block w-full"
                                            placeholder="e.g. liter"
                                            value={data.unit}
                                            onChange={(e) => setData('unit', e.target.value)}
                                        />
                                        <InputError message={errors.unit} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="capacity" value="Capacity *" />
                                        <TextInput
                                            id="capacity"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="mt-1 block w-full"
                                            placeholder="Total capacity"
                                            value={data.capacity}
                                            onChange={(e) => setData('capacity', e.target.value)}
                                        />
                                        <InputError message={errors.capacity} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="current_stock" value="Current Stock *" />
                                        <TextInput
                                            id="current_stock"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="mt-1 block w-full"
                                            placeholder="Current stock"
                                            value={data.current_stock}
                                            onChange={(e) => setData('current_stock', e.target.value)}
                                        />
                                        <InputError message={errors.current_stock} className="mt-2" />
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
                                        placeholder="Write note here..."
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
                                        Save Fuel Tank
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
