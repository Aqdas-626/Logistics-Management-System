import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const TEAL = '#20A4AC';

export default function Create({ companies, branches, vehicleTypes, traccarDevices = [] }) {
    const [activeTab, setActiveTab] = useState('Specifications');
    const { data, setData, post, processing, errors } = useForm({
        company_id: '',
        branch_id: '',
        vehicle_type_id: '',
        name: '',
        image: null,
        registration_no: '',
        chassis_no: '',
        engine_no: '',
        color: '',
        fuel_type: '',
        fuel_capacity: '',
        fuel_efficiency: '',
        opening_fuel: '',
        current_fuel: '',
        vin: '',
        status: 'active',
        odometer_km: '',
        documents: [
            {
                document_name: '',
                file: null,
                type: 'other',
                registration_expiry: '',
                insurance_expiry: '',
            },
        ],
        financial: {
            billing_method: 'per_km',
            default_cost: '',
            ownership_type: 'company_owned',
            currency: 'PKR',
            effective_from: '',
            effective_to: '',
            notes: '',
        },
        gps: {
            traccar_device_id: '',
            api_username: '',
            imei: '',
            provider: 'Traccar',
            auto_sync: true,
            last_synced_at: '',
            sync_message: '',
        },
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('vehicles.store'));
    };

    const filteredBranches = useMemo(
        () =>
            branches.filter(
                (branch) => !data.company_id || Number(branch.company_id) === Number(data.company_id),
            ),
        [branches, data.company_id],
    );

    const updateDocumentField = (index, field, value) => {
        const nextDocuments = [...data.documents];
        nextDocuments[index] = { ...nextDocuments[index], [field]: value };
        setData('documents', nextDocuments);
    };

    const addDocumentRow = () => {
        setData('documents', [
            ...data.documents,
            {
                document_name: '',
                file: null,
                type: 'other',
                registration_expiry: '',
                insurance_expiry: '',
            },
        ]);
    };

    const removeDocumentRow = (index) => {
        setData(
            'documents',
            data.documents.filter((_, idx) => idx !== index),
        );
    };

    const updateFinancialField = (field, value) => {
        setData('financial', { ...data.financial, [field]: value });
    };

    const updateGpsField = (field, value) => {
        setData('gps', { ...data.gps, [field]: value });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Add Vehicle</h2>
                    <Link
                        href={route('vehicles.index')}
                        className="rounded-md border px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-[#e8f6f7]"
                        style={{ borderColor: TEAL, color: TEAL }}
                    >
                        View List
                    </Link>
                </div>
            }
        >
            <Head title="Add Vehicle" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="self-start rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="mb-3 text-sm font-semibold text-gray-700">Vehicle Image</p>
                            <label
                                htmlFor="image"
                                className="mb-3 flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-cyan-400 bg-cyan-50 px-4 text-center"
                            >
                                <svg
                                    className="mb-3 h-10 w-10 text-cyan-300"
                                    viewBox="0 0 48 48"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M16 34h18a10 10 0 1 0-1.9-19.8A12 12 0 0 0 9.1 18.5 8.5 8.5 0 0 0 16 34Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <p className="text-xl font-bold leading-tight text-cyan-800">
                                    Drag &amp; Drop or click here to upload the files
                                </p>
                                <p className="mt-6 text-xl text-slate-700">
                                    {data.image?.name || 'No files selected'}
                                </p>
                            </label>
                            <input
                                id="image"
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => setData('image', e.target.files?.[0] || null)}
                            />
                            <p className="mt-2 text-xs text-gray-500">Supported: JPG, PNG. Max size: 2MB</p>
                            <InputError message={errors.image} className="mt-2" />
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-0 shadow-sm lg:col-span-2">
                            <div className="flex flex-wrap gap-1 border-b border-gray-200 px-3 pt-3">
                                {['Specifications', 'Registration & Docs', 'Financials', 'GPS Setup'].map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={[
                                            'rounded-t-md px-4 py-2 text-sm font-semibold transition-colors',
                                            activeTab === tab
                                                ? 'text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                                        ].join(' ')}
                                        style={activeTab === tab ? { backgroundColor: TEAL } : undefined}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'Specifications' && (
                                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="company_id" value="Company *" />
                                    <select
                                        id="company_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.company_id}
                                        onChange={(e) => {
                                            setData('company_id', e.target.value);
                                            setData('branch_id', '');
                                        }}
                                    >
                                        <option value="">Select Company</option>
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.branch_id}
                                        onChange={(e) => setData('branch_id', e.target.value)}
                                    >
                                        <option value="">Select Branch</option>
                                        {filteredBranches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.branch_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="registration_no" value="Registration Number *" />
                                    <TextInput
                                        id="registration_no"
                                        className="mt-1 block w-full"
                                        placeholder="e.g. TN-01-AB-1234"
                                        value={data.registration_no}
                                        onChange={(e) => setData('registration_no', e.target.value)}
                                    />
                                    <InputError message={errors.registration_no} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="name" value="Vehicle Name/Alias" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        placeholder="e.g. Red Truck 1"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="vin" value="Vehicle Identification Number" />
                                    <TextInput
                                        id="vin"
                                        className="mt-1 block w-full"
                                        placeholder="e.g. MA3FPDE1S00A12345"
                                        value={data.vin}
                                        onChange={(e) => setData('vin', e.target.value)}
                                    />
                                    <InputError message={errors.vin} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="vehicle_type_id" value="Type *" />
                                    <select
                                        id="vehicle_type_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.vehicle_type_id}
                                        onChange={(e) => setData('vehicle_type_id', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        {vehicleTypes.map((vt) => (
                                            <option key={vt.id} value={vt.id}>
                                                {vt.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.vehicle_type_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="color" value="Color *" />
                                    <div className="mt-1 flex">
                                        <TextInput
                                            id="color"
                                            className="block w-full rounded-r-none"
                                            placeholder="#D6E1F3"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                        />
                                        <label
                                            htmlFor="colorPicker"
                                            className="flex w-12 cursor-pointer items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-lg"
                                            title="Pick color"
                                        >
                                            🎨
                                        </label>
                                        <input
                                            id="colorPicker"
                                            type="color"
                                            className="sr-only"
                                            value={/^#([0-9A-Fa-f]{6})$/.test(data.color || '') ? data.color : '#d6e1f3'}
                                            onChange={(e) => setData('color', e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <InputError message={errors.color} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Current Status" />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="fuel_type" value="Fuel Type" />
                                    <select
                                        id="fuel_type"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.fuel_type}
                                        onChange={(e) => setData('fuel_type', e.target.value)}
                                    >
                                        <option value="">Select Fuel Type</option>
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                    <InputError message={errors.fuel_type} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="fuel_efficiency" value="Fuel Efficiency (km/L)" />
                                    <TextInput
                                        id="fuel_efficiency"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        placeholder="e.g. 15.5"
                                        value={data.fuel_efficiency}
                                        onChange={(e) => setData('fuel_efficiency', e.target.value)}
                                    />
                                    <InputError message={errors.fuel_efficiency} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="opening_fuel" value="Opening Fuel" />
                                    <TextInput
                                        id="opening_fuel"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        placeholder="Initial Fuel"
                                        value={data.opening_fuel}
                                        onChange={(e) => setData('opening_fuel', e.target.value)}
                                    />
                                    <InputError message={errors.opening_fuel} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="current_fuel" value="Current Fuel" />
                                    <TextInput
                                        id="current_fuel"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full bg-gray-100"
                                        placeholder="Auto/Manual"
                                        value={data.current_fuel}
                                        onChange={(e) => setData('current_fuel', e.target.value)}
                                    />
                                    <InputError message={errors.current_fuel} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="fuel_capacity" value="Fuel Capacity" />
                                    <TextInput
                                        id="fuel_capacity"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.fuel_capacity}
                                        onChange={(e) => setData('fuel_capacity', e.target.value)}
                                    />
                                    <InputError message={errors.fuel_capacity} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="odometer_km" value="Odometer (km)" />
                                    <TextInput
                                        id="odometer_km"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.odometer_km}
                                        onChange={(e) => setData('odometer_km', e.target.value)}
                                    />
                                    <InputError message={errors.odometer_km} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="chassis_no" value="Chassis No" />
                                    <TextInput
                                        id="chassis_no"
                                        className="mt-1 block w-full"
                                        value={data.chassis_no}
                                        onChange={(e) => setData('chassis_no', e.target.value)}
                                    />
                                    <InputError message={errors.chassis_no} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="engine_no" value="Engine No" />
                                    <TextInput
                                        id="engine_no"
                                        className="mt-1 block w-full"
                                        value={data.engine_no}
                                        onChange={(e) => setData('engine_no', e.target.value)}
                                    />
                                    <InputError message={errors.engine_no} className="mt-2" />
                                </div>
                                </div>
                            )}

                            {activeTab === 'Registration & Docs' && (
                                <div className="space-y-4 p-4">
                                    {data.documents.map((document, index) => (
                                        <div key={index} className="rounded-lg border border-gray-200 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-700">Document {index + 1}</p>
                                                {data.documents.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                                                        onClick={() => removeDocumentRow(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <InputLabel htmlFor={`document_name_${index}`} value="Document Name" />
                                                    <TextInput
                                                        id={`document_name_${index}`}
                                                        className="mt-1 block w-full"
                                                        placeholder="e.g. RC Book"
                                                        value={document.document_name}
                                                        onChange={(e) =>
                                                            updateDocumentField(index, 'document_name', e.target.value)
                                                        }
                                                    />
                                                    <InputError
                                                        message={errors[`documents.${index}.document_name`]}
                                                        className="mt-2"
                                                    />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor={`type_${index}`} value="Type" />
                                                    <select
                                                        id={`type_${index}`}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                        value={document.type}
                                                        onChange={(e) => updateDocumentField(index, 'type', e.target.value)}
                                                    >
                                                        <option value="registration">Registration</option>
                                                        <option value="insurance">Insurance</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    <InputError message={errors[`documents.${index}.type`]} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor={`file_${index}`} value="File" />
                                                    <input
                                                        id={`file_${index}`}
                                                        type="file"
                                                        className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                                                        onChange={(e) =>
                                                            updateDocumentField(index, 'file', e.target.files?.[0] || null)
                                                        }
                                                    />
                                                    <InputError message={errors[`documents.${index}.file`]} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel
                                                        htmlFor={`registration_expiry_${index}`}
                                                        value="Registration Expiry"
                                                    />
                                                    <TextInput
                                                        id={`registration_expiry_${index}`}
                                                        type="date"
                                                        className="mt-1 block w-full"
                                                        value={document.registration_expiry}
                                                        onChange={(e) =>
                                                            updateDocumentField(
                                                                index,
                                                                'registration_expiry',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={errors[`documents.${index}.registration_expiry`]}
                                                        className="mt-2"
                                                    />
                                                </div>

                                                <div>
                                                    <InputLabel
                                                        htmlFor={`insurance_expiry_${index}`}
                                                        value="Insurance Expiry"
                                                    />
                                                    <TextInput
                                                        id={`insurance_expiry_${index}`}
                                                        type="date"
                                                        className="mt-1 block w-full"
                                                        value={document.insurance_expiry}
                                                        onChange={(e) =>
                                                            updateDocumentField(
                                                                index,
                                                                'insurance_expiry',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={errors[`documents.${index}.insurance_expiry`]}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addDocumentRow}
                                        className="rounded-md border px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#e8f6f7]"
                                        style={{ borderColor: TEAL, color: TEAL }}
                                    >
                                        + Add Document
                                    </button>
                                </div>
                            )}

                            {activeTab === 'Financials' && (
                                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="financial_billing_method" value="Billing Method" />
                                        <select
                                            id="financial_billing_method"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.financial.billing_method}
                                            onChange={(e) => updateFinancialField('billing_method', e.target.value)}
                                        >
                                            <option value="per_km">Per Km</option>
                                            <option value="per_trip">Per Trip</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="hourly">Hourly</option>
                                        </select>
                                        <InputError message={errors['financial.billing_method']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="financial_default_cost" value="Default Cost" />
                                        <TextInput
                                            id="financial_default_cost"
                                            type="number"
                                            step="0.01"
                                            className="mt-1 block w-full"
                                            placeholder="0.00"
                                            value={data.financial.default_cost}
                                            onChange={(e) => updateFinancialField('default_cost', e.target.value)}
                                        />
                                        <InputError message={errors['financial.default_cost']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="financial_ownership_type" value="Ownership Type" />
                                        <select
                                            id="financial_ownership_type"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.financial.ownership_type}
                                            onChange={(e) => updateFinancialField('ownership_type', e.target.value)}
                                        >
                                            <option value="company_owned">Company Owned</option>
                                            <option value="leased">Leased</option>
                                            <option value="rented">Rented</option>
                                            <option value="vendor_owned">Vendor Owned</option>
                                        </select>
                                        <InputError message={errors['financial.ownership_type']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="financial_currency" value="Currency" />
                                        <TextInput
                                            id="financial_currency"
                                            className="mt-1 block w-full"
                                            placeholder="PKR"
                                            value={data.financial.currency}
                                            onChange={(e) => updateFinancialField('currency', e.target.value)}
                                        />
                                        <InputError message={errors['financial.currency']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="financial_effective_from" value="Effective From" />
                                        <TextInput
                                            id="financial_effective_from"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.financial.effective_from}
                                            onChange={(e) => updateFinancialField('effective_from', e.target.value)}
                                        />
                                        <InputError message={errors['financial.effective_from']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="financial_effective_to" value="Effective To" />
                                        <TextInput
                                            id="financial_effective_to"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.financial.effective_to}
                                            onChange={(e) => updateFinancialField('effective_to', e.target.value)}
                                        />
                                        <InputError message={errors['financial.effective_to']} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="financial_notes" value="Notes" />
                                        <textarea
                                            id="financial_notes"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                            rows={3}
                                            value={data.financial.notes}
                                            onChange={(e) => updateFinancialField('notes', e.target.value)}
                                        />
                                        <InputError message={errors['financial.notes']} className="mt-2" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'GPS Setup' && (
                                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="gps_traccar_device_id" value="Traccar Device ID" />
                                        <select
                                            id="gps_traccar_device_id"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            value={data.gps.traccar_device_id}
                                            onChange={(e) => updateGpsField('traccar_device_id', e.target.value)}
                                        >
                                            <option value="">Select Traccar Device</option>
                                            {traccarDevices.map((device) => (
                                                <option key={device.id} value={device.id}>
                                                    {device.name} ({device.traccar_device_id})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors['gps.traccar_device_id']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="gps_api_username" value="API Username (Identifier)" />
                                        <TextInput
                                            id="gps_api_username"
                                            className="mt-1 block w-full"
                                            placeholder="Auto Sync (Auto-generated)"
                                            value={data.gps.api_username}
                                            onChange={(e) => updateGpsField('api_username', e.target.value)}
                                        />
                                        <InputError message={errors['gps.api_username']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="gps_imei" value="IMEI" />
                                        <TextInput
                                            id="gps_imei"
                                            className="mt-1 block w-full"
                                            placeholder="Tracker IMEI"
                                            value={data.gps.imei}
                                            onChange={(e) => updateGpsField('imei', e.target.value)}
                                        />
                                        <InputError message={errors['gps.imei']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="gps_provider" value="Provider" />
                                        <TextInput
                                            id="gps_provider"
                                            className="mt-1 block w-full"
                                            placeholder="Traccar"
                                            value={data.gps.provider}
                                            onChange={(e) => updateGpsField('provider', e.target.value)}
                                        />
                                        <InputError message={errors['gps.provider']} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="gps_last_synced_at" value="Last Synced At" />
                                        <TextInput
                                            id="gps_last_synced_at"
                                            type="datetime-local"
                                            className="mt-1 block w-full"
                                            value={data.gps.last_synced_at}
                                            onChange={(e) => updateGpsField('last_synced_at', e.target.value)}
                                        />
                                        <InputError message={errors['gps.last_synced_at']} className="mt-2" />
                                    </div>

                                    <div className="flex items-center gap-2 pt-8">
                                        <input
                                            id="gps_auto_sync"
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#20A4AC] shadow-sm focus:ring-[#20A4AC]"
                                            checked={Boolean(data.gps.auto_sync)}
                                            onChange={(e) => updateGpsField('auto_sync', e.target.checked)}
                                        />
                                        <InputLabel htmlFor="gps_auto_sync" value="Auto Sync" />
                                        <InputError message={errors['gps.auto_sync']} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="gps_sync_message" value="Sync Message" />
                                        <textarea
                                            id="gps_sync_message"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                            rows={3}
                                            value={data.gps.sync_message}
                                            onChange={(e) => updateGpsField('sync_message', e.target.value)}
                                        />
                                        <InputError message={errors['gps.sync_message']} className="mt-2" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 lg:col-span-3">
                            <Link href={route('vehicles.index')}>
                                <SecondaryButton type="button">Cancel</SecondaryButton>
                            </Link>
                            <PrimaryButton disabled={processing}>Save Vehicle</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

