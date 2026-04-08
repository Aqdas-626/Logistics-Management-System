import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');
const toDatetimeInput = (value) => (value ? String(value).slice(0, 16) : '');

export default function Form({
mode = 'create',
importJob = null,
routeName = 'imports',
entityTitle = 'Import Job',
backLabel = 'Imports',
container = null,
containers = [],
customers = [],
isoCodes = [],
dgTypes = [],
shippings = [],
vessels = [],
shipTypes = [],
services = [],
endorsements = [],
jobServices = [],
jobNotes = [],
}) {
const isEdit = mode === 'edit';
const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none';
const labelClass = 'mb-1 block text-xs font-semibold uppercase text-gray-600';
const actionBtnClass = 'rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200';
const emptyContainer = {
container_number: '',
reference: '',
iso_code_id: '',
dg_type_id: '',
shipping_id: '',
vessel_id: '',
ship_type_id: '',
weight: '',
no_of_containers: 1,
cut_off_date: '',
from_location: '',
to_location: '',
return_to: '',
security_check: '',
random_number: '',
release_ecn_number: '',
port_pin_no: '',
available_date: '',
vb_slot_date: '',
demurrage_date: '',
detention_days: 0,
voyage: '',
xray: false,
dgs: false,
live_ul: false,
hold_sh: false,
hold_customs: false,
hold_mpi: false,
};
const normalizeContainer = (item) => {
    const src = item || {};
    // Prevent sending/storing container booking_id anywhere in this flow.
    const { booking_id: _bookingId, ...rest } = src;

    return {
        ...emptyContainer,
        ...rest,
        cut_off_date: toDateInput(src?.cut_off_date),
        available_date: toDateInput(src?.available_date),
        vb_slot_date: toDateInput(src?.vb_slot_date),
        demurrage_date: toDateInput(src?.demurrage_date),
        xray: !!src?.xray,
        dgs: !!src?.dgs,
        live_ul: !!src?.live_ul,
        hold_sh: !!src?.hold_sh,
        hold_customs: !!src?.hold_customs,
        hold_mpi: !!src?.hold_mpi,
    };
};
const initialContainers = containers.length
? containers.map((item) => normalizeContainer(item))
: container
? [normalizeContainer(container)]
: [];
const initialCurrentContainer = initialContainers.length ? normalizeContainer(initialContainers[0]) : emptyContainer;

const { data, setData, transform, post, put, processing, errors } = useForm({
customer_id: importJob?.customer_id || '',
document_received_at: toDatetimeInput(importJob?.document_received_at),
container: initialCurrentContainer,
containers: initialContainers,
notes: jobNotes.map((item) => ({
endorsement_id: String(item.endorsement_id || ''),
note: String(item.note || ''),
})),
services: jobServices.map((item) => String(item.service_id)),
documents: [],
});
const [selectedServiceId, setSelectedServiceId] = useState('');
const [editingServiceIndex, setEditingServiceIndex] = useState(null);
const [selectedEndorsementId, setSelectedEndorsementId] = useState('');
const [noteText, setNoteText] = useState('');
const [selectedFileNames, setSelectedFileNames] = useState([]);
const [customerSearch, setCustomerSearch] = useState('');
const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
const customerDropdownRef = useRef(null);
const [editingContainerIndex, setEditingContainerIndex] = useState(null);
const [editingNoteIndex, setEditingNoteIndex] = useState(null);

const filteredCustomers = useMemo(() => {
const query = customerSearch.trim().toLowerCase();
if (!query) return customers;
return customers.filter((c) => {
const name = String(c.name || '').toLowerCase();
const code = String(c.customer_code || '').toLowerCase();
return name.includes(query) || code.includes(query);
});
}, [customers, customerSearch]);

const getIsoLabel = (isoId) => {
const iso = isoCodes.find((item) => String(item.id) === String(isoId));
return iso?.name || iso?.code || '';
};

useEffect(() => {
const selectedCustomer = customers.find((c) => String(c.id) === String(data.customer_id));
if (selectedCustomer) {
setCustomerSearch(`${selectedCustomer.name} (${selectedCustomer.customer_code})`);
} else if (!data.customer_id) {
setCustomerSearch('');
}
}, [customers, data.customer_id]);

useEffect(() => {
const handleClickOutside = (event) => {
if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
setIsCustomerDropdownOpen(false);
}
};
document.addEventListener('mousedown', handleClickOutside);
return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

const onCustomerSearchChange = (value) => {
setCustomerSearch(value);
setIsCustomerDropdownOpen(true);
setData('customer_id', '');
};

const onCustomerSelect = (value) => {
setData('customer_id', value);
const picked = customers.find((c) => String(c.id) === String(value));
if (picked) {
setCustomerSearch(`${picked.name} (${picked.customer_code})`);
}
setIsCustomerDropdownOpen(false);
};

const updateContainer = (key, value) => {
setData('container', { ...data.container, [key]: value });
};

const addContainer = () => {
if (!data.container.container_number) return;
const normalized = normalizeContainer(data.container);
if (editingContainerIndex !== null) {
setData('containers', data.containers.map((item, index) => (index === editingContainerIndex ? normalized : item)));
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
setData('containers', data.containers.filter((_, i) => i !== index));
if (editingContainerIndex === index) {
setData('container', emptyContainer);
setEditingContainerIndex(null);
}
};
const editContainer = (index) => {
const picked = data.containers[index];
if (!picked) return;
setData('container', normalizeContainer(picked));
setEditingContainerIndex(index);
};

const submit = (e) => {
e.preventDefault();
const preparedContainers = data.containers.length ? data.containers : [data.container];
transform((current) => ({ ...current, containers: preparedContainers }));
if (isEdit) {
put(route(`${routeName}.update`, importJob.id));
} else {
post(route(`${routeName}.store`));
}
};

const addService = () => {
if (!selectedServiceId) return;
const strId = String(selectedServiceId);
if (editingServiceIndex !== null) {
const duplicateAtAnotherRow = data.services.some((item, index) => String(item) === strId && index !== editingServiceIndex);
if (duplicateAtAnotherRow) return;
setData('services', data.services.map((item, index) => (index === editingServiceIndex ? strId : item)));
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
setData('services', data.services.filter((_, i) => i !== index));
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
setData('notes', data.notes.map((item, index) => (index === editingNoteIndex ? noteRow : item)));
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
setData('notes', data.notes.filter((_, i) => i !== index));
if (editingNoteIndex === index) {
setEditingNoteIndex(null);
setSelectedEndorsementId('');
setNoteText('');
}
};

const onUploadDocuments = (files) => {
const picked = Array.from(files || []);
if (!picked.length) return;
setData('documents', picked.map((file) => ({ file })));
setSelectedFileNames(picked.map((f) => f.name));
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

    <Head title={isEdit ? `Edit ${entityTitle}` : `${entityTitle} Booking` } />

    <form onSubmit={submit} className="space-y-6">
        {errors.error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.error}
        </div>
        )}
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? `Edit ${entityTitle}` : `${entityTitle} Booking`}</h1>
            <Link href={route(`${routeName}.index`)} className="text-sm font-medium text-teal-700 hover:text-teal-800">Back
            to {backLabel}</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-0 shadow-sm">
                <h3 className="mb-4 rounded bg-teal-500 px-3 py-2 text-sm font-semibold text-white">Customer Details
                </h3>
                <div className="space-y-4 px-4 pb-4">
                    <div>
                        <label className={labelClass}>Customer Name / Customer Code *</label>
                        <div className="relative" ref={customerDropdownRef}>
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Search customer..."
                                value={customerSearch}
                                onFocus={() => setIsCustomerDropdownOpen(true)}
                                onChange={(e) => onCustomerSearchChange(e.target.value)}
                                required={!data.customer_id}
                            />
                            {isCustomerDropdownOpen && (
                                <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('customer_id', '');
                                            setCustomerSearch('');
                                            setIsCustomerDropdownOpen(false);
                                        }}
                                        className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Select Customer
                                    </button>
                                    {filteredCustomers.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => onCustomerSelect(String(c.id))}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.customer_id) === String(c.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                        >
                                            {c.name} ({c.customer_code})
                                        </button>
                                    ))}
                                    {!filteredCustomers.length && (
                                        <div className="px-3 py-2 text-sm text-gray-500">No customer found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        {errors.customer_id && <p className="mt-1 text-xs text-red-600">{errors.customer_id}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Document Received Date And Time *</label>
                        <input type="datetime-local" className={inputClass} value={data.document_received_at}
                            onChange={(e)=> setData('document_received_at', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Upload Documents</label>
                        <label htmlFor="import-document-upload"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-cyan-500 bg-cyan-50 px-4 py-8 text-center">
                            <div className="mb-2 text-4xl text-cyan-600">☁</div>
                            <p className="text-lg font-medium text-cyan-700">Drag & Drop or click here to upload the
                                files</p>
                            <p className="mt-3 text-sm text-gray-600">
                                {selectedFileNames.length ? selectedFileNames.join(', ') : 'No files selected'}
                            </p>
                        </label>
                        <input id="import-document-upload" type="file" className="hidden" multiple onChange={(e)=>
                        onUploadDocuments(e.target.files)}
                        />
                        {errors['documents.0.file'] && <p className="mt-1 text-xs text-red-600">
                            {errors['documents.0.file']}</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                <h3 className="mb-4 rounded bg-teal-500 px-3 py-2 text-sm font-semibold text-white">Container Details
                </h3>
                
              
                <div className="grid gap-3 md:grid-cols-3">
                    <div><label className={labelClass}>Reference</label><input className={inputClass}
                            value={data.container.reference} onChange={(e)=> updateContainer('reference',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>Container # *</label><input className={inputClass}
                            value={data.container.container_number} onChange={(e)=> updateContainer('container_number',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>ISO Code</label><select className={inputClass}
                            value={data.container.iso_code_id} onChange={(e)=> updateContainer('iso_code_id',
                            e.target.value)}><option value="">Select</option>{isoCodes.map((x) => <option key={x.id}
                                value={x.id}>{x.name || x.code}</option>)}</select></div>
                    <div><label className={labelClass}>Weight</label><input type="number" step="0.01"
                            className={inputClass} value={data.container.weight} onChange={(e)=>
                        updateContainer('weight', e.target.value)} /></div>
                    <div><label className={labelClass}>No of Containers</label><input type="number"
                            className={inputClass} value={data.container.no_of_containers} onChange={(e)=>
                        updateContainer('no_of_containers', e.target.value)} /></div>
                    <div><label className={labelClass}>From</label><input className={inputClass}
                            value={data.container.from_location} onChange={(e)=> updateContainer('from_location',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>To</label><input className={inputClass}
                            value={data.container.to_location} onChange={(e)=> updateContainer('to_location',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>Return To</label><input className={inputClass}
                            value={data.container.return_to} onChange={(e)=> updateContainer('return_to',
                        e.target.value)} /></div>
                    <SearchableSingleSelect
                        label="Shipping"
                        value={data.container.shipping_id}
                        onChange={(value) => updateContainer('shipping_id', value)}
                        options={shippings}
                        placeholder="Search shipping..."
                        emptyText="No shipping found"
                    />
                    <SearchableSingleSelect
                        label="Vessel"
                        value={data.container.vessel_id}
                        onChange={(value) => updateContainer('vessel_id', value)}
                        options={vessels}
                        placeholder="Search vessel..."
                        emptyText="No vessel found"
                    />
                    <SearchableSingleSelect
                        label="Ship Type"
                        value={data.container.ship_type_id}
                        onChange={(value) => updateContainer('ship_type_id', value)}
                        options={shipTypes}
                        placeholder="Search ship type..."
                        emptyText="No ship type found"
                    />
                    <SearchableSingleSelect
                        label="DG Type"
                        value={data.container.dg_type_id}
                        onChange={(value) => updateContainer('dg_type_id', value)}
                        options={dgTypes}
                        placeholder="Search DG type..."
                        emptyText="No DG type found"
                    />
                    <div><label className={labelClass}>Cut Off Date</label><input type="date" className={inputClass}
                            value={data.container.cut_off_date} onChange={(e)=> updateContainer('cut_off_date',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>Available Date</label><input type="date" className={inputClass}
                            value={data.container.available_date} onChange={(e)=> updateContainer('available_date',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>VB Slot Date</label><input type="date" className={inputClass}
                            value={data.container.vb_slot_date} onChange={(e)=> updateContainer('vb_slot_date',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>Demurrage Date</label><input type="date" className={inputClass}
                            value={data.container.demurrage_date} onChange={(e)=> updateContainer('demurrage_date',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>Detention Days</label><input type="number" className={inputClass}
                            value={data.container.detention_days} onChange={(e)=> updateContainer('detention_days',
                        e.target.value)} /></div>
                    <div><label className={labelClass}>Voyage</label><input className={inputClass}
                            value={data.container.voyage} onChange={(e)=> updateContainer('voyage', e.target.value)} />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    {['xray', 'dgs', 'live_ul', 'hold_sh', 'hold_customs', 'hold_mpi'].map((field) => (
                    <label key={field} className="flex items-center gap-2 capitalize">
                        <input type="checkbox" checked={!!data.container[field]} onChange={(e)=> updateContainer(field,
                        e.target.checked)} />
                        {field.replace('_', ' ')}
                    </label>
                    ))}
                </div>
                <div className="mb-3 flex gap-2 justify-end">
                    <button type="button" onClick={addContainer} className={actionBtnClass}>{editingContainerIndex !== null ? 'Update' : 'Add'}</button>
                    <button type="button" onClick={clearContainers} className={actionBtnClass}>Clear</button>
                </div>
                {data.containers.length > 0 && (
                <div className="mb-3 overflow-x-auto rounded border border-gray-200">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-3 py-2">#</th>
                                <th className="px-3 py-2">Reference</th>
                                <th className="px-3 py-2">Container</th>
                                <th className="px-3 py-2">ISO</th>
                                <th className="px-3 py-2">Weight</th>
                                <th className="px-3 py-2">From</th>
                                <th className="px-3 py-2">To</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.containers.map((item, index) => (
                            <tr key={`${item.container_number}-${item.reference}-${index}`} className="border-t border-gray-200">
                                <td className="px-3 py-2 text-gray-700">{index + 1}</td>
                                <td className="px-3 py-2 text-gray-700">{item.reference || '-'}</td>
                                <td className="px-3 py-2 text-gray-700">{item.container_number || '-'}</td>
                                <td className="px-3 py-2 text-gray-700">{getIsoLabel(item.iso_code_id) || '-'}</td>
                                <td className="px-3 py-2 text-gray-700">{item.weight || '-'}</td>
                                <td className="px-3 py-2 text-gray-700">{item.from_location || '-'}</td>
                                <td className="px-3 py-2 text-gray-700">{item.to_location || '-'}</td>
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

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="space-y-6">
                <div className="grid items-end gap-3 border-b border-gray-200 pb-5 md:grid-cols-12">
                    <div className="md:col-span-3">
                        <p className="text-lg font-semibold text-teal-700">Additional Services</p>
                    </div>
                    <div className="md:col-span-5">
                        <SearchableSingleSelect
                            label="Service *"
                            value={selectedServiceId}
                            onChange={(value) => setSelectedServiceId(value)}
                            options={services}
                            placeholder="Search service..."
                            emptyText="No service found"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={addService} className={actionBtnClass}>
                                {editingServiceIndex !== null ? 'Update' : 'Add'}
                            </button>
                            <button type="button" onClick={clearServices} className={actionBtnClass}>Clear</button>
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
                                            <button type="button" className="rounded bg-[#20A4AC]/10 px-2 py-1 text-xs text-[#178089] hover:bg-[#20A4AC]/15" onClick={() => editService(index)}>Edit</button>
                                            <button type="button" className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100" onClick={() => removeService(index)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>

                <div className="grid grid-cols-12 items-end gap-4 border-b border-gray-200 pb-4">

                    {/* Left Title */}
                    <div className="col-span-12 md:col-span-2">
                        <p className="text-base font-semibold text-teal-600">Add Notes</p>
                    </div>

                    {/* Endorsement */}
                    <div className="col-span-12 md:col-span-3">
                        <SearchableSingleSelect
                            label="Endorsement *"
                            value={selectedEndorsementId}
                            onChange={(value) => setSelectedEndorsementId(value)}
                            options={endorsements}
                            placeholder="Search endorsement..."
                            emptyText="No endorsement found"
                        />
                    </div>

                    {/* Note Input */}
                    <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                            Note
                        </label>
                        <input type="text" placeholder="Note" value={noteText} onChange={(e)=>
                        setNoteText(e.target.value)}
                        className="w-full border-0 border-b border-gray-300 bg-transparent py-1 text-sm text-gray-700
                        placeholder:text-gray-400 focus:border-teal-500 focus:outline-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="col-span-12 md:col-span-3 md:flex md:justify-end">
                        <div className="flex rounded-md border border-gray-200 overflow-hidden bg-gray-100">
                            <button type="button" onClick={addNote}
                                className="px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-200">
                                {editingNoteIndex !== null ? 'Update' : 'Add'}
                            </button>
                            <button type="button" onClick={clearNotes}
                                className="px-4 py-1.5 text-sm text-gray-700 border-l border-gray-200 hover:bg-gray-200">
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Selected Notes */}
                    {data.notes.length > 0 && (
                    <div className="col-span-12 mt-2 overflow-x-auto rounded border border-gray-200">
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
                                <tr key={`${item.endorsement_id}-${index}`} className="border-t border-gray-200">
                                    <td className="px-3 py-2 text-gray-700">{index + 1}</td>
                                    <td className="px-3 py-2 text-gray-700">
                                        {endorsements.find((n) => String(n.id) === String(item.endorsement_id))?.name || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">{item.note || '-'}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-2">
                                            <button type="button" className="rounded bg-[#20A4AC]/10 px-2 py-1 text-xs text-[#178089] hover:bg-[#20A4AC]/15" onClick={() => editNote(index)}>Edit</button>
                                            <button type="button" className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100" onClick={() => removeNote(index)}>Delete</button>
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

        <div className="flex justify-end gap-3">
            <Link href={route(`${routeName}.index`)}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">Cancel
            </Link>
            <button disabled={processing}
                className="rounded bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                {isEdit ? 'Update' : 'Save'}
            </button>
        </div>
    </form>
</AuthenticatedLayout>
);
}