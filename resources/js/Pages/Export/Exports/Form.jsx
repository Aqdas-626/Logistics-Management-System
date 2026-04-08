import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');
const toDatetimeInput = (value) => (value ? String(value).slice(0, 16) : '');

const buildContainerNumber = (reference) => {
    const base = String(reference || 'EXPORT').trim().replace(/\s+/g, '-');
    return `EXP-${base}-${Date.now()}`;
};

export default function Form({
    mode = 'create',
    importJob = null,
    containers = [],
    customers = [],
    isoCodes = [],
    shippings = [],
    vessels = [],
    shipTypes = [],
    services = [],
    endorsements = [],
    jobServices = [],
    jobNotes = [],
}) {
    const isEdit = mode === 'edit';
    const inputClass = 'h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-sky-500 focus:outline-none';
    const labelClass = 'mb-1 block text-[13px] font-semibold text-gray-700';
    const actionBtnClass = 'rounded border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200';
    const firstContainer = containers?.[0] || {};
    const emptyContainer = {
        container_number: '',
        reference: '',
        iso_code_id: '',
        weight: '',
        no_of_containers: 1,
        available_date: '',
        cut_off_date: '',
        ship_type_id: '',
        grid_position: '',
        random_number: '',
        release_ecn_number: '',
        port_pin_no: '',
        hold_sh: false,
        xray: false,
        dgs: false,
        live_ul: false,
    };

    const { data, setData, transform, post, put, processing, errors } = useForm({
        customer_id: importJob?.customer_id || '',
        document_received_at: toDatetimeInput(importJob?.document_received_at),
        shipping_id: importJob?.shipping_id || '',
        vessel_id: importJob?.vessel_id || '',
        voyage: importJob?.voyage || '',
        from_location: importJob?.from_location || '',
        to_location: importJob?.to_location || '',
        container: {
            ...emptyContainer,
            container_number: firstContainer?.container_number || '',
            reference: firstContainer?.reference || '',
            iso_code_id: firstContainer?.iso_code_id || '',
            weight: firstContainer?.weight || '',
            no_of_containers: firstContainer?.no_of_containers || 1,
            available_date: toDateInput(firstContainer?.available_date),
            cut_off_date: toDateInput(firstContainer?.cut_off_date),
            ship_type_id: firstContainer?.ship_type_id || '',
            grid_position: firstContainer?.grid_position || '',
            random_number: firstContainer?.random_number || '',
            release_ecn_number: firstContainer?.release_ecn_number || '',
            port_pin_no: firstContainer?.port_pin_no || '',
            hold_sh: !!firstContainer?.hold_sh,
            xray: !!firstContainer?.xray,
            dgs: !!firstContainer?.dgs,
            live_ul: !!firstContainer?.live_ul,
        },
        containers: containers || [],
        services: (jobServices || []).map((item) => String(item.service_id)),
        notes: (jobNotes || []).map((item) => ({
            endorsement_id: String(item.endorsement_id || ''),
            note: String(item.note || ''),
        })),
    });

    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedEndorsementId, setSelectedEndorsementId] = useState('');
    const [noteText, setNoteText] = useState('');
    const [editingContainerIndex, setEditingContainerIndex] = useState(null);

    const serviceNames = useMemo(
        () => data.services.map((id) => services.find((s) => String(s.id) === String(id))?.name).filter(Boolean),
        [data.services, services],
    );
    const noteNames = useMemo(
        () =>
            data.notes
                .map((item) => {
                    const endorsement = endorsements.find((e) => String(e.id) === String(item.endorsement_id))?.name;
                    return endorsement ? `${endorsement}${item.note ? `: ${item.note}` : ''}` : null;
                })
                .filter(Boolean),
        [data.notes, endorsements],
    );

    const updateContainer = (key, value) => {
        setData('container', { ...data.container, [key]: value });
    };
    const getIsoLabel = (id) => isoCodes.find((item) => String(item.id) === String(id))?.name || isoCodes.find((item) => String(item.id) === String(id))?.code || '';
    const getDoorLabel = (id) => shipTypes.find((item) => String(item.id) === String(id))?.name || '';

    const addContainer = () => {
        if (!data.container.container_number && !data.container.reference) return;
        const item = {
            ...data.container,
            container_number: data.container.container_number || buildContainerNumber(data.container.reference),
            from_location: data.from_location || '',
            to_location: data.to_location || '',
            shipping_id: data.shipping_id || '',
            vessel_id: data.vessel_id || '',
            voyage: data.voyage || '',
        };
        if (editingContainerIndex !== null) {
            setData('containers', data.containers.map((container, index) => (index === editingContainerIndex ? item : container)));
        } else {
            setData('containers', [...data.containers, item]);
        }
        setData('container', emptyContainer);
        setEditingContainerIndex(null);
    };

    const clearContainers = () => {
        setData('containers', []);
        setData('container', emptyContainer);
        setEditingContainerIndex(null);
    };

    const editContainer = (index) => {
        const picked = data.containers[index];
        if (!picked) return;
        setData('container', {
            ...emptyContainer,
            ...picked,
            available_date: toDateInput(picked.available_date),
            cut_off_date: toDateInput(picked.cut_off_date),
            hold_sh: !!picked.hold_sh,
            xray: !!picked.xray,
            dgs: !!picked.dgs,
            live_ul: !!picked.live_ul,
        });
        setEditingContainerIndex(index);
    };

    const removeContainer = (index) => {
        setData('containers', data.containers.filter((_, i) => i !== index));
        if (editingContainerIndex === index) {
            setData('container', emptyContainer);
            setEditingContainerIndex(null);
        }
    };

    const addService = () => {
        if (!selectedServiceId) return;
        const id = String(selectedServiceId);
        if (!data.services.includes(id)) setData('services', [...data.services, id]);
        setSelectedServiceId('');
    };

    const clearServices = () => setData('services', []);

    const addNote = () => {
        if (!selectedEndorsementId) return;
        setData('notes', [...data.notes, { endorsement_id: String(selectedEndorsementId), note: noteText || '' }]);
        setSelectedEndorsementId('');
        setNoteText('');
    };

    const clearNotes = () => {
        setData('notes', []);
        setSelectedEndorsementId('');
        setNoteText('');
    };

    const submit = (e) => {
        e.preventDefault();
        const containersPayload = data.containers.length
            ? data.containers
            : [
                {
                    ...data.container,
                    container_number: data.container.container_number || buildContainerNumber(data.container.reference),
                    from_location: data.from_location || '',
                    to_location: data.to_location || '',
                    shipping_id: data.shipping_id || '',
                    vessel_id: data.vessel_id || '',
                    voyage: data.voyage || '',
                },
            ];
        transform((current) => ({ ...current, containers: containersPayload }));
        if (isEdit) put(route('exports.update', importJob.id));
        else post(route('exports.store'));
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
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(value) === String(item.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
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
            <Head title={isEdit ? 'Edit Export Job Booking' : 'Create Export Job Booking'} />
            <form onSubmit={submit} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Export Job Booking' : 'Create Export Job Booking'}</h1>
                    <Link href={route('exports.index')} className="text-sm font-medium text-teal-700 hover:text-teal-800">
                        Back to Export Jobs
                    </Link>
                </div>

                {errors.error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.error}</div>}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-0 shadow-sm">
                        <h3 className="mb-4 rounded bg-teal-500 px-3 py-2 text-sm font-semibold text-white">Customer Details</h3>
                        <div className="space-y-4 p-4">
                            <SearchableSingleSelect
                                label="Customer Name / Customer Code"
                                value={data.customer_id}
                                onChange={(value) => setData('customer_id', value)}
                                options={customers}
                                placeholder="Search customer..."
                                emptyText="No customer found"
                                getLabel={(item) => `${item.name} (${item.customer_code})`}
                            />
                            <div>
                                <label className={labelClass}>Document Received Date And Time</label>
                                <input type="datetime-local" className={inputClass} value={data.document_received_at} onChange={(e) => setData('document_received_at', e.target.value)} />
                            </div>
                            <div>
                                <SearchableSingleSelect
                                    label="Shipping"
                                    value={data.shipping_id}
                                    onChange={(value) => setData('shipping_id', value)}
                                    options={shippings}
                                    placeholder="Search shipping..."
                                    emptyText="No shipping found"
                                />
                            </div>
                            <div>
                                <SearchableSingleSelect
                                    label="Vessel"
                                    value={data.vessel_id}
                                    onChange={(value) => setData('vessel_id', value)}
                                    options={vessels}
                                    placeholder="Search vessel..."
                                    emptyText="No vessel found"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Voyage</label>
                                <input className={inputClass} placeholder="Enter voyage" value={data.voyage} onChange={(e) => setData('voyage', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>From</label>
                                <input className={inputClass} placeholder="From" value={data.from_location} onChange={(e) => setData('from_location', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>To</label>
                                <input className={inputClass} placeholder="To" value={data.to_location} onChange={(e) => setData('to_location', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                        <h3 className="mb-4 rounded bg-teal-500 px-3 py-2 text-sm font-semibold text-white">Container Details</h3>
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-4">
                                <div><label className={labelClass}>Reference</label><input className={inputClass} placeholder="Reference" value={data.container.reference} onChange={(e) => updateContainer('reference', e.target.value)} /></div>
                                <SearchableSingleSelect
                                    label="ISO Code"
                                    value={data.container.iso_code_id}
                                    onChange={(value) => updateContainer('iso_code_id', value)}
                                    options={isoCodes}
                                    placeholder="Search ISO code..."
                                    emptyText="No ISO code found"
                                    getLabel={(item) => item.name || item.code || ''}
                                />
                                <div><label className={labelClass}>Weight</label><input className={inputClass} type="number" step="0.01" value={data.container.weight} onChange={(e) => updateContainer('weight', e.target.value)} /></div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-4">
                                <div><label className={labelClass}>No. Of Containers</label><input className={inputClass} type="number" value={data.container.no_of_containers} onChange={(e) => updateContainer('no_of_containers', e.target.value)} /></div>
                                <div><label className={labelClass}>Available Date</label><input className={inputClass} type="date" value={data.container.available_date} onChange={(e) => updateContainer('available_date', e.target.value)} /></div>
                                <div><label className={labelClass}>Cut off Date</label><input className={inputClass} type="date" value={data.container.cut_off_date} onChange={(e) => updateContainer('cut_off_date', e.target.value)} /></div>
                                <div className="md:col-span-1"><label className={labelClass}>Ready Now</label><label className="flex items-center gap-2 pt-2 text-sm text-gray-700"><input type="checkbox" checked={!!data.container.hold_sh} onChange={(e) => updateContainer('hold_sh', e.target.checked)} />Ready Now</label></div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-4">
                                <SearchableSingleSelect
                                    label="Door"
                                    value={data.container.ship_type_id}
                                    onChange={(value) => updateContainer('ship_type_id', value)}
                                    options={shipTypes}
                                    placeholder="Search door..."
                                    emptyText="No door found"
                                />
                                <div><label className={labelClass}>Grid position</label><input className={inputClass} placeholder="Grid position" value={data.container.grid_position} onChange={(e) => updateContainer('grid_position', e.target.value)} /></div>
                                <div><label className={labelClass}>Random Number</label><input className={inputClass} placeholder="Random number" value={data.container.random_number} onChange={(e) => updateContainer('random_number', e.target.value)} /></div>
                                <div><label className={labelClass}>Release/ECN Number</label><input className={inputClass} placeholder="Release/ECN Number" value={data.container.release_ecn_number} onChange={(e) => updateContainer('release_ecn_number', e.target.value)} /></div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div><label className={labelClass}>Port</label><input className={inputClass} placeholder="Port" value={data.container.port_pin_no} onChange={(e) => updateContainer('port_pin_no', e.target.value)} /></div>
                                <div>
                                    <label className={labelClass}>Options</label>
                                    <div className="space-y-1 text-sm">
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.container.xray} onChange={(e) => updateContainer('xray', e.target.checked)} />XRay</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.container.dgs} onChange={(e) => updateContainer('dgs', e.target.checked)} />DGS</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.container.live_ul} onChange={(e) => updateContainer('live_ul', e.target.checked)} />Live Load</label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
                                <button type="button" onClick={clearContainers} className={actionBtnClass}>Clear</button>
                                <button type="button" onClick={addContainer} className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">{editingContainerIndex !== null ? 'Update' : 'Add'}</button>
                            </div>
                            {data.containers.length > 0 && (
                                <div className="overflow-x-auto rounded border border-gray-200">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                                            <tr>
                                                <th className="px-3 py-2">#</th>
                                                <th className="px-3 py-2">Reference</th>
                                                <th className="px-3 py-2">ISO Code</th>
                                                <th className="px-3 py-2">Weight</th>
                                                <th className="px-3 py-2">Door</th>
                                                <th className="px-3 py-2 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.containers.map((item, index) => (
                                                <tr key={`${item.container_number}-${item.reference}-${index}`} className="border-t border-gray-200">
                                                    <td className="px-3 py-2 text-gray-700">{index + 1}</td>
                                                    <td className="px-3 py-2 text-gray-700">{item.reference || '-'}</td>
                                                    <td className="px-3 py-2 text-gray-700">{getIsoLabel(item.iso_code_id) || '-'}</td>
                                                    <td className="px-3 py-2 text-gray-700">{item.weight || '-'}</td>
                                                    <td className="px-3 py-2 text-gray-700">{getDoorLabel(item.ship_type_id) || '-'}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" className="rounded bg-[#20A4AC]/10 px-2 py-1 text-xs text-[#178089] hover:bg-[#20A4AC]/15" onClick={() => editContainer(index)}>Edit</button>
                                                            <button type="button" className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100" onClick={() => removeContainer(index)}>Delete</button>
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
                                <select className={inputClass} value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                                    <option value="">Select</option>
                                    {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-4">
                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={addService} className={actionBtnClass}>Add</button>
                                    <button type="button" onClick={clearServices} className={actionBtnClass}>Clear</button>
                                </div>
                            </div>
                            {!!serviceNames.length && (
                                <div className="md:col-span-12 text-sm text-gray-600">{serviceNames.join(', ')}</div>
                            )}
                        </div>

                        <div className="grid items-end gap-3 border-b border-gray-200 pb-5 md:grid-cols-12">
                            <div className="md:col-span-3">
                                <p className="text-lg font-semibold text-teal-700">Add Notes</p>
                            </div>
                            <div className="md:col-span-3">
                                <label className={labelClass}>Endorsement</label>
                                <select className={inputClass} value={selectedEndorsementId} onChange={(e) => setSelectedEndorsementId(e.target.value)}>
                                    <option value="">Select</option>
                                    {endorsements.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-4">
                                <label className={labelClass}>Note</label>
                                <textarea className={`${inputClass} h-10 py-2`} rows={1} placeholder="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={addNote} className={actionBtnClass}>Add</button>
                                    <button type="button" onClick={clearNotes} className={actionBtnClass}>Clear</button>
                                </div>
                            </div>
                            {!!noteNames.length && (
                                <div className="md:col-span-12 text-sm text-gray-600">{noteNames.join(', ')}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Link href={route('exports.index')} className={actionBtnClass}>Cancel</Link>
                    <button disabled={processing} className="rounded bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">{isEdit ? 'Update' : 'Save'}</button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
