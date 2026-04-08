import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');
const toDatetimeInput = (value) => (value ? String(value).slice(0, 16) : '');

const buildContainerNumber = (reference) => {
    const base = String(reference || 'SWING').trim().replace(/\s+/g, '-');
    return `SWING-${base}-${Date.now()}`;
};

export default function Form({
    mode = 'create',
    swingJob = null,
    container = null,
    containers = [],
    customers = [],
    isoCodes = [],
    services = [],
    endorsements = [],
    doorTypes = [],
    liftTypes = [],
    jobServices = [],
    jobNotes = [],
}) {
    const isEdit = mode === 'edit';
    const inputClass =
        'h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-sky-500 focus:outline-none';
    const labelClass = 'mb-1 block text-[13px] font-semibold text-gray-700';
    const actionBtnClass = 'rounded border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200';

    const emptyContainer = {
        reference: '',
        container_number: '',
        iso_code_id: '',
        weight: '',
        available_date: '',
        ready_now: false,
        door_type_id: '',
        lift_type_id: '',
    };

    const normalizeContainer = (item) => {
        const src = item || {};
        const { booking_id: _bookingId, xray: _x, dgs: _d, to_location: _t, ...rest } = src;
        return {
            ...emptyContainer,
            ...rest,
            available_date: toDateInput(src.available_date),
            ready_now: !!src.ready_now,
        };
    };

    const firstContainer = (containers && containers.length ? containers[0] : container) || {};

    const { data, setData, transform, post, put, processing, errors } = useForm({
        customer_id: swingJob?.customer_id || '',
        document_received_at: toDatetimeInput(swingJob?.document_received_at),
        from_location: swingJob?.from_location || '',
        container: {
            ...emptyContainer,
            container_number: firstContainer?.container_number || '',
            reference: firstContainer?.reference || '',
            iso_code_id: firstContainer?.iso_code_id || '',
            weight: firstContainer?.weight ?? '',
            available_date: toDateInput(firstContainer?.available_date),
            ready_now: !!firstContainer?.ready_now,
            door_type_id: firstContainer?.door_type_id || '',
            lift_type_id: firstContainer?.lift_type_id || '',
        },
        containers: (containers && containers.length ? containers : container ? [container] : []).map((item) =>
            normalizeContainer(item),
        ),
        notes: jobNotes.map((item) => ({
            endorsement_id: String(item.endorsement_id || ''),
            note: String(item.note || ''),
        })),
        services: jobServices.map((item) => String(item.service_id)),
    });

    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [editingServiceIndex, setEditingServiceIndex] = useState(null);
    const [selectedEndorsementId, setSelectedEndorsementId] = useState('');
    const [noteText, setNoteText] = useState('');
    const [editingContainerIndex, setEditingContainerIndex] = useState(null);
    const [editingNoteIndex, setEditingNoteIndex] = useState(null);

    const getIsoLabel = (isoId) => {
        const iso = isoCodes.find((item) => String(item.id) === String(isoId));
        return iso?.name || iso?.code || '';
    };

    const getDoorLabel = (id) => doorTypes.find((item) => String(item.id) === String(id))?.name || '';
    const getLiftLabel = (id) => liftTypes.find((item) => String(item.id) === String(id))?.name || '';

    const updateContainer = (key, value) => {
        setData('container', { ...data.container, [key]: value });
    };

    const addContainer = () => {
        if (!data.container.container_number && !data.container.reference) return;
        const item = {
            ...data.container,
            container_number:
                data.container.container_number ||
                buildContainerNumber(data.container.reference),
            from_location: data.from_location || '',
        };
        const normalized = normalizeContainer(item);
        if (editingContainerIndex !== null) {
            setData(
                'containers',
                data.containers.map((row, index) => (index === editingContainerIndex ? normalized : row)),
            );
        } else {
            setData('containers', [...data.containers, normalized]);
        }
        setData('container', emptyContainer);
        setEditingContainerIndex(null);
    };

    const clearContainers = () => {
        setData('containers', []);
        setData('container', emptyContainer);
        setEditingContainerIndex(null);
    };

    const removeContainer = (index) => {
        setData(
            'containers',
            data.containers.filter((_, i) => i !== index),
        );
        if (editingContainerIndex === index) {
            setData('container', emptyContainer);
            setEditingContainerIndex(null);
        }
    };

    const editContainer = (index) => {
        const picked = data.containers[index];
        if (!picked) return;
        const { booking_id: _bookingId, xray: _x, dgs: _d, to_location: _t, ...rest } = picked;
        setData('container', {
            ...emptyContainer,
            ...rest,
            available_date: toDateInput(picked.available_date),
            ready_now: !!picked.ready_now,
        });
        setEditingContainerIndex(index);
    };

    const submit = (e) => {
        e.preventDefault();
        const containersPayload = data.containers.length
            ? data.containers.map((row) => ({
                  ...row,
                  container_number:
                      row.container_number || buildContainerNumber(row.reference),
              }))
            : [
                  {
                      ...data.container,
                      container_number:
                          data.container.container_number ||
                          buildContainerNumber(data.container.reference),
                      from_location: data.from_location || '',
                  },
              ];
        transform((current) => ({ ...current, containers: containersPayload }));
        if (isEdit) {
            put(route('swings.update', swingJob.id));
        } else {
            post(route('swings.store'));
        }
    };

    const addService = () => {
        if (!selectedServiceId) return;
        const strId = String(selectedServiceId);
        if (editingServiceIndex !== null) {
            const duplicateAtAnotherRow = data.services.some(
                (item, index) => String(item) === strId && index !== editingServiceIndex,
            );
            if (duplicateAtAnotherRow) return;
            setData(
                'services',
                data.services.map((item, index) => (index === editingServiceIndex ? strId : item)),
            );
            setEditingServiceIndex(null);
        } else if (!data.services.includes(strId)) {
            setData('services', [...data.services, strId]);
        }
        setSelectedServiceId('');
    };

    const clearServices = () => {
        setData('services', []);
        setEditingServiceIndex(null);
        setSelectedServiceId('');
    };

    const editService = (index) => {
        const picked = data.services[index];
        if (!picked) return;
        setSelectedServiceId(String(picked));
        setEditingServiceIndex(index);
    };

    const removeService = (index) => {
        setData(
            'services',
            data.services.filter((_, i) => i !== index),
        );
        if (editingServiceIndex === index) {
            setEditingServiceIndex(null);
            setSelectedServiceId('');
        }
    };

    const addNote = () => {
        if (!selectedEndorsementId) return;
        const noteRow = {
            endorsement_id: String(selectedEndorsementId),
            note: noteText || '',
        };
        if (editingNoteIndex !== null) {
            setData(
                'notes',
                data.notes.map((item, index) => (index === editingNoteIndex ? noteRow : item)),
            );
        } else {
            setData('notes', [...data.notes, noteRow]);
        }
        setEditingNoteIndex(null);
        setSelectedEndorsementId('');
        setNoteText('');
    };

    const clearNotes = () => {
        setData('notes', []);
        setEditingNoteIndex(null);
        setSelectedEndorsementId('');
        setNoteText('');
    };

    const editNote = (index) => {
        const picked = data.notes[index];
        if (!picked) return;
        setSelectedEndorsementId(String(picked.endorsement_id || ''));
        setNoteText(String(picked.note || ''));
        setEditingNoteIndex(index);
    };

    const removeNote = (index) => {
        setData(
            'notes',
            data.notes.filter((_, i) => i !== index),
        );
        if (editingNoteIndex === index) {
            setEditingNoteIndex(null);
            setSelectedEndorsementId('');
            setNoteText('');
        }
    };

    const SearchableSingleSelect = ({
        label,
        value,
        onChange,
        options,
        placeholder = 'Search...',
        emptyText = 'No results found',
        getLabel = (item) => item?.name ?? '',
    }) => {
        const [query, setQuery] = useState('');
        const [isOpen, setIsOpen] = useState(false);
        const wrapperRef = useRef(null);

        const filteredOptions = useMemo(() => {
            const q = query.trim().toLowerCase();
            if (!q) return options;
            return options.filter((item) => String(getLabel(item)).toLowerCase().includes(q));
        }, [options, query, getLabel]);

        useEffect(() => {
            const selected = options.find((item) => String(item.id) === String(value));
            if (selected) {
                setQuery(String(getLabel(selected)));
            } else if (!value) {
                setQuery('');
            }
        }, [options, value, getLabel]);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div>
                {label ? <label className={labelClass}>{label}</label> : null}
                <div className="relative" ref={wrapperRef}>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder={placeholder}
                        value={query}
                        onFocus={() => setIsOpen(true)}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                            onChange('');
                        }}
                    />
                    {isOpen && (
                        <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setQuery('');
                                    setIsOpen(false);
                                }}
                                className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Select
                            </button>
                            {filteredOptions.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(String(item.id));
                                        setQuery(String(getLabel(item)));
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${
                                        String(value) === String(item.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'
                                    }`}
                                >
                                    {getLabel(item)}
                                </button>
                            ))}
                            {!filteredOptions.length && (
                                <div className="px-3 py-2 text-sm text-gray-500">{emptyText}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Swing Job Booking' : 'Create Swing Job Booking'} />
            <form onSubmit={submit} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Edit Swing Job Booking' : 'Create Swing Job Booking'}
                    </h1>
                    <Link href={route('swings.index')} className="text-sm font-medium text-teal-700 hover:text-teal-800">
                        Back to Swing Jobs
                    </Link>
                </div>

                {errors.error && (
                    <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.error}</div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-0 shadow-sm">
                        <h3 className="mb-4 rounded bg-teal-500 px-3 py-2 text-sm font-semibold text-white">Customer Details</h3>
                        <div className="space-y-4 p-4">
                            <div>
                                <SearchableSingleSelect
                                    label="Customer Name / Customer Code"
                                    value={data.customer_id}
                                    onChange={(value) => setData('customer_id', value)}
                                    options={customers}
                                    placeholder="Search customer..."
                                    emptyText="No customer found"
                                    getLabel={(item) => `${item.name} (${item.customer_code})`}
                                />
                                {errors.customer_id && <p className="mt-1 text-xs text-red-600">{errors.customer_id}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Document Received Date And Time</label>
                                <input
                                    type="datetime-local"
                                    className={inputClass}
                                    value={data.document_received_at}
                                    onChange={(e) => setData('document_received_at', e.target.value)}
                                />
                                {errors.document_received_at && (
                                    <p className="mt-1 text-xs text-red-600">{errors.document_received_at}</p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>From</label>
                                <input
                                    className={inputClass}
                                    placeholder="From"
                                    value={data.from_location}
                                    onChange={(e) => setData('from_location', e.target.value)}
                                />
                                {errors.from_location && <p className="mt-1 text-xs text-red-600">{errors.from_location}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                        <h3 className="mb-4 rounded bg-teal-500 px-3 py-2 text-sm font-semibold text-white">Container Details</h3>
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div>
                                    <label className={labelClass}>Reference</label>
                                    <input
                                        className={inputClass}
                                        placeholder="Reference"
                                        value={data.container.reference}
                                        onChange={(e) => updateContainer('reference', e.target.value)}
                                    />
                                    {(errors['container.reference'] || errors['containers.0.reference']) && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors['container.reference'] || errors['containers.0.reference']}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Container</label>
                                    <input
                                        className={inputClass}
                                        placeholder="Container No"
                                        value={data.container.container_number}
                                        onChange={(e) => updateContainer('container_number', e.target.value)}
                                    />
                                    {(errors['container.container_number'] || errors['containers.0.container_number']) && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors['container.container_number'] ||
                                                errors['containers.0.container_number']}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <SearchableSingleSelect
                                        label="ISO Code"
                                        value={data.container.iso_code_id}
                                        onChange={(value) => updateContainer('iso_code_id', value)}
                                        options={isoCodes}
                                        placeholder="Search ISO code..."
                                        emptyText="No ISO code found"
                                        getLabel={(item) => item.name || item.code || ''}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-4">
                                <div>
                                    <label className={labelClass}>Weight</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={inputClass}
                                        placeholder="0.00"
                                        value={data.container.weight}
                                        onChange={(e) => updateContainer('weight', e.target.value)}
                                    />
                                    {(errors['container.weight'] || errors['containers.0.weight']) && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors['container.weight'] || errors['containers.0.weight']}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Available Date</label>
                                    <input
                                        type="date"
                                        className={inputClass}
                                        value={data.container.available_date}
                                        onChange={(e) => updateContainer('available_date', e.target.value)}
                                    />
                                    {(errors['container.available_date'] || errors['containers.0.available_date']) && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors['container.available_date'] ||
                                                errors['containers.0.available_date']}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <SearchableSingleSelect
                                        label="Door"
                                        value={data.container.door_type_id}
                                        onChange={(value) => updateContainer('door_type_id', value)}
                                        options={doorTypes}
                                        placeholder="Search door..."
                                        emptyText="No door type found"
                                    />
                                    {(errors['container.door_type_id'] || errors['containers.0.door_type_id']) && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors['container.door_type_id'] ||
                                                errors['containers.0.door_type_id']}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <SearchableSingleSelect
                                        label="Service Type"
                                        value={data.container.lift_type_id}
                                        onChange={(value) => updateContainer('lift_type_id', value)}
                                        options={liftTypes}
                                        placeholder="Search service type..."
                                        emptyText="No service type found"
                                    />
                                    {(errors['container.lift_type_id'] || errors['containers.0.lift_type_id']) && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors['container.lift_type_id'] ||
                                                errors['containers.0.lift_type_id']}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Options</label>
                                    <div className="space-y-1 text-sm">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={!!data.container.ready_now}
                                                onChange={(e) => updateContainer('ready_now', e.target.checked)}
                                            />
                                            Ready Now
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
                                <button type="button" onClick={clearContainers} className={actionBtnClass}>
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={addContainer}
                                    className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                                >
                                    {editingContainerIndex !== null ? 'Update' : 'Add'}
                                </button>
                            </div>
                            {data.containers.length > 0 && (
                                <div className="overflow-x-auto rounded border border-gray-200">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                                            <tr>
                                                <th className="px-3 py-2">#</th>
                                                <th className="px-3 py-2">Reference</th>
                                                <th className="px-3 py-2">Container</th>
                                                <th className="px-3 py-2">ISO Code</th>
                                                <th className="px-3 py-2">Weight</th>
                                                <th className="px-3 py-2">Door</th>
                                                <th className="px-3 py-2">Service Type</th>
                                                <th className="px-3 py-2 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.containers.map((item, index) => (
                                                <tr
                                                    key={`${item.container_number}-${item.reference}-${index}`}
                                                    className="border-t border-gray-200"
                                                >
                                                    <td className="px-3 py-2 text-gray-700">{index + 1}</td>
                                                    <td className="px-3 py-2 text-gray-700">{item.reference || '-'}</td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {item.container_number || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {getIsoLabel(item.iso_code_id) || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">{item.weight || '-'}</td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {getDoorLabel(item.door_type_id) || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {getLiftLabel(item.lift_type_id) || '-'}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                className="rounded bg-[#20A4AC]/10 px-2 py-1 text-xs text-[#178089] hover:bg-[#20A4AC]/15"
                                                                onClick={() => editContainer(index)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                                                                onClick={() => removeContainer(index)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="space-y-6">
                        <div className="grid items-end gap-3 border-b border-gray-200 pb-5 md:grid-cols-12">
                            <div className="md:col-span-3">
                                <p className="text-lg font-semibold text-teal-700">Additional Services</p>
                            </div>
                            <div className="md:col-span-5">
                                <label className={labelClass}>Service</label>
                                <select
                                    className={inputClass}
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-4">
                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={addService} className={actionBtnClass}>
                                        {editingServiceIndex !== null ? 'Update' : 'Add'}
                                    </button>
                                    <button type="button" onClick={clearServices} className={actionBtnClass}>
                                        Clear
                                    </button>
                                </div>
                            </div>
                            {data.services.length > 0 && (
                                <div className="md:col-span-12 mt-2 overflow-x-auto rounded border border-gray-200">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                                            <tr>
                                                <th className="px-3 py-2">#</th>
                                                <th className="px-3 py-2">Service</th>
                                                <th className="px-3 py-2 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.services.map((id, index) => (
                                                <tr key={`${id}-${index}`} className="border-t border-gray-200">
                                                    <td className="px-3 py-2 text-gray-700">{index + 1}</td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {services.find((s) => String(s.id) === String(id))?.name || '-'}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                className="rounded bg-[#20A4AC]/10 px-2 py-1 text-xs text-[#178089] hover:bg-[#20A4AC]/15"
                                                                onClick={() => editService(index)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                                                                onClick={() => removeService(index)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="grid items-end gap-3 border-b border-gray-200 pb-5 md:grid-cols-12">
                            <div className="md:col-span-3">
                                <p className="text-lg font-semibold text-teal-700">Add Notes</p>
                            </div>
                            <div className="md:col-span-3">
                                <label className={labelClass}>Endorsement</label>
                                <select
                                    className={inputClass}
                                    value={selectedEndorsementId}
                                    onChange={(e) => setSelectedEndorsementId(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    {endorsements.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-4">
                                <label className={labelClass}>Note</label>
                                <textarea
                                    className={`${inputClass} h-10 py-2`}
                                    rows={1}
                                    placeholder="Note"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={addNote} className={actionBtnClass}>
                                        {editingNoteIndex !== null ? 'Update' : 'Add'}
                                    </button>
                                    <button type="button" onClick={clearNotes} className={actionBtnClass}>
                                        Clear
                                    </button>
                                </div>
                            </div>
                            {data.notes.length > 0 && (
                                <div className="md:col-span-12 mt-2 overflow-x-auto rounded border border-gray-200">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                                            <tr>
                                                <th className="px-3 py-2">#</th>
                                                <th className="px-3 py-2">Endorsement</th>
                                                <th className="px-3 py-2">Note</th>
                                                <th className="px-3 py-2 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.notes.map((item, index) => (
                                                <tr
                                                    key={`${item.endorsement_id}-${index}`}
                                                    className="border-t border-gray-200"
                                                >
                                                    <td className="px-3 py-2 text-gray-700">{index + 1}</td>
                                                    <td className="px-3 py-2 text-gray-700">
                                                        {endorsements.find((n) => String(n.id) === String(item.endorsement_id))
                                                            ?.name || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-700">{item.note || '-'}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                className="rounded bg-[#20A4AC]/10 px-2 py-1 text-xs text-[#178089] hover:bg-[#20A4AC]/15"
                                                                onClick={() => editNote(index)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                                                                onClick={() => removeNote(index)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Link href={route('swings.index')} className={actionBtnClass}>
                        Cancel
                    </Link>
                    <button
                        disabled={processing}
                        className="rounded bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                    >
                        {isEdit ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
