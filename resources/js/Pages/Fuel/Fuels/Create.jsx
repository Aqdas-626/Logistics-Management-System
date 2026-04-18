import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

const TEAL = '#20A4AC';
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];

export default function Create({ vehicles, drivers, fuelTanks, fuelVendors }) {
    const { data, setData, post, processing, errors } = useForm({
        vehicle_id:     '',
        driver_id:      '',
        fuel_type:      '',
        fill_date:      '',
        quantity:       '0.00',
        odometer:       '00000',
        amount:         '0.00',
        source_type:    'tank',
        fuel_tank_id:   fuelTanks[0]?.id ?? '',
        fuel_vendor_id: '',
        receipt:        null,
        comment:        '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fuels.store'), { forceFormData: true });
    };

    const selectedTank = fuelTanks.find((t) => String(t.id) === String(data.fuel_tank_id));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-semibold leading-tight text-gray-800">Add Fuel</h2>
                    <Link
                        href={route('fuels.index')}
                        className="rounded-md border px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-[#e8f6f7]"
                        style={{ borderColor: TEAL, color: TEAL }}
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Add Fuel" />

            <div className="pb-8">
                <div className="mx-auto max-w-7xl">
                    <form onSubmit={submit}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

                            {/* LEFT PANEL — Fuel Info */}
                            <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-t-4 p-5" style={{ borderTopColor: TEAL }}>
                                    <p className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-700">
                                        <span>⛽</span> Fuel Info
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <InputLabel htmlFor="vehicle_id" value="Vehicle *" />
                                            <select
                                                id="vehicle_id"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                value={data.vehicle_id}
                                                onChange={(e) => setData('vehicle_id', e.target.value)}
                                            >
                                                <option value="">Select Vehicle</option>
                                                {vehicles.map((v) => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.name} {v.registration_no ? `(${v.registration_no})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.vehicle_id} className="mt-1" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="driver_id" value="Added Driver *" />
                                            <select
                                                id="driver_id"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                value={data.driver_id}
                                                onChange={(e) => setData('driver_id', e.target.value)}
                                            >
                                                <option value="">Select Driver</option>
                                                {drivers.map((d) => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.driver_id} className="mt-1" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="fuel_type" value="Fuel Type *" />
                                                <select
                                                    id="fuel_type"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                    value={data.fuel_type}
                                                    onChange={(e) => setData('fuel_type', e.target.value)}
                                                >
                                                    <option value="">Select Type</option>
                                                    {FUEL_TYPES.map((t) => (
                                                        <option key={t} value={t}>
                                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.fuel_type} className="mt-1" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="fill_date" value="Fill Date *" />
                                                <div className="relative mt-1">
                                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                                                        📅
                                                    </span>
                                                    <input
                                                        id="fill_date"
                                                        type="date"
                                                        className="block w-full rounded-md border-gray-300 pl-9 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                        value={data.fill_date}
                                                        onChange={(e) => setData('fill_date', e.target.value)}
                                                    />
                                                </div>
                                                <InputError message={errors.fill_date} className="mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT PANEL — Costs & Source + Receipt */}
                            <div className="flex flex-1 flex-col gap-4">

                                {/* Costs & Source */}
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <div className="border-t-4 p-5" style={{ borderTopColor: TEAL }}>
                                        <p className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-700">
                                            <span>💰</span> Costs &amp; Source
                                        </p>

                                        <div className="mb-4 grid grid-cols-3 gap-4">
                                            <div>
                                                <InputLabel htmlFor="quantity" value="Quantity *" />
                                                <input
                                                    id="quantity"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                    value={data.quantity}
                                                    onChange={(e) => setData('quantity', e.target.value)}
                                                />
                                                <InputError message={errors.quantity} className="mt-1" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="odometer" value="Odometer *" />
                                                <input
                                                    id="odometer"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                    value={data.odometer}
                                                    onChange={(e) => setData('odometer', e.target.value)}
                                                />
                                                <InputError message={errors.odometer} className="mt-1" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="amount" value="Amount *" />
                                                <div className="relative mt-1">
                                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-2 text-gray-500 text-sm">
                                                        $
                                                    </span>
                                                    <input
                                                        id="amount"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="block w-full rounded-md border-gray-300 pl-8 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                        value={data.amount}
                                                        onChange={(e) => setData('amount', e.target.value)}
                                                    />
                                                </div>
                                                <InputError message={errors.amount} className="mt-1" />
                                            </div>
                                        </div>

                                        {/* Tank or Vendor */}
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <p className="mb-3 text-sm font-semibold text-gray-600">Tank or Vendor</p>
                                            <div className="space-y-3">
                                                {/* Fuel Tank option */}
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        id="source_tank"
                                                        name="source_type"
                                                        value="tank"
                                                        checked={data.source_type === 'tank'}
                                                        onChange={() => setData('source_type', 'tank')}
                                                        className="h-4 w-4 accent-[#20A4AC]"
                                                    />
                                                    <label htmlFor="source_tank" className="text-sm font-medium text-gray-700">
                                                        Fuel Tank
                                                    </label>
                                                    {data.source_type === 'tank' && (
                                                        <div className="flex flex-1 items-center gap-2">
                                                            <select
                                                                className="flex-1 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                                value={data.fuel_tank_id}
                                                                onChange={(e) => setData('fuel_tank_id', e.target.value)}
                                                            >
                                                                <option value="">-- Select Tank --</option>
                                                                {fuelTanks.map((t) => (
                                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                                ))}
                                                            </select>
                                                            {selectedTank && (
                                                                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                                                    🛢 Liters in stock: {selectedTank.current_stock} L
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Vendor option */}
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        id="source_vendor"
                                                        name="source_type"
                                                        value="vendor"
                                                        checked={data.source_type === 'vendor'}
                                                        onChange={() => setData('source_type', 'vendor')}
                                                        className="h-4 w-4 accent-[#20A4AC]"
                                                    />
                                                    <label htmlFor="source_vendor" className="text-sm font-medium text-gray-700">
                                                        Vendor
                                                    </label>
                                                    {data.source_type === 'vendor' && (
                                                        <select
                                                            className="flex-1 rounded-md border-gray-300 text-sm shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                            value={data.fuel_vendor_id}
                                                            onChange={(e) => setData('fuel_vendor_id', e.target.value)}
                                                        >
                                                            <option value="">-- Select Vendor --</option>
                                                            {fuelVendors.map((v) => (
                                                                <option key={v.id} value={v.id}>{v.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                            <InputError message={errors.source_type} className="mt-1" />
                                            <InputError message={errors.fuel_tank_id} className="mt-1" />
                                            <InputError message={errors.fuel_vendor_id} className="mt-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Receipt & Comment */}
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <div className="p-5">
                                        <div className="mb-4">
                                            <InputLabel htmlFor="receipt" value="Fuel Receipt" />
                                            <input
                                                id="receipt"
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm file:font-medium"
                                                onChange={(e) => setData('receipt', e.target.files[0])}
                                            />
                                            <InputError message={errors.receipt} className="mt-1" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="comment" value="Label Comment" />
                                            <textarea
                                                id="comment"
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                placeholder="Fuel Comments"
                                                value={data.comment}
                                                onChange={(e) => setData('comment', e.target.value)}
                                            />
                                            <InputError message={errors.comment} className="mt-1" />
                                        </div>

                                        <div className="mt-5">
                                            <PrimaryButton
                                                disabled={processing}
                                                className="w-full justify-center bg-[#20A4AC] py-2.5 hover:bg-[#178089] focus:bg-[#178089] active:bg-[#0f6469]"
                                            >
                                                💾 Add Fuel
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
