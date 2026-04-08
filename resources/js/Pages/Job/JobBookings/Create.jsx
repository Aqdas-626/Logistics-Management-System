import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { PlusIcon, MinusIcon, TrashIcon, CloudArrowUpIcon } from '@/Components/Icons';

const COMMUNICATION_TYPES = ['EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'PUSH'];
const INSURANCE_TYPES = ['Owners Risk', 'Carriers Risk', 'All Risk', 'Total Loss Only', 'Third Party', 'Limited Carrier Liability'];

const pad2 = (n) => String(n).padStart(2, '0');
const generateBookingId = () => {
    const d = new Date();
    // Example: JOB-2026-03-25-143012
    return `JOB-${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
};

const emptyPackage = () => ({ units: 1, weight_kg: '', length_cm: '', width_cm: '', height_cm: '', cubic_m3: '', package_type_id: '', dg_type_id: '', remarks: '' });
const emptyTracking = () => ({
    communication_type: 'EMAIL',
    contact_value: '',
    notification_type_id: '',
    enabled: true,
});

const toDatetimeLocal = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 16);
    return d.toISOString().slice(0, 16);
};

const mapAddressForForm = (addr) => ({
    country_id: addr?.country_id ?? '',
    name: addr?.name ?? '',
    building: addr?.building ?? '',
    street_no: addr?.street_no ?? '',
    street: addr?.street ?? '',
    suburb: addr?.suburb ?? '',
    city: addr?.city ?? '',
    state: addr?.state ?? '',
    postcode: addr?.postcode ?? '',
    contact_person: addr?.contact_person ?? '',
    mobile: addr?.mobile ?? '',
    phone: addr?.phone ?? '',
    email: addr?.email ?? '',
    instructions: addr?.instructions ?? '',
});

const mapCustomerAddressToBookingAddress = (customer) => {
    const addr =
        customer?.address ||
        (Array.isArray(customer?.addresses) ? customer.addresses[0] : null) ||
        {};

    const contacts = Array.isArray(customer?.contacts) ? customer.contacts : [];
    const primaryContact =
        contacts.find((c) => c?.is_primary) || contacts[0] || {};

    return {
        country_id: customer?.country_id ?? '',
        name: customer?.name ?? '',
        building: addr?.building ?? '',
        street_no: addr?.street_no ?? '',
        street: addr?.street ?? '',
        suburb: addr?.suburb ?? '',
        city: addr?.city ?? '',
        state: addr?.state ?? '',
        postcode: addr?.postcode ?? '',
        contact_person: addr?.contact_person ?? '',
        mobile: primaryContact?.mobile ?? '',
        phone: primaryContact?.phone ?? '',
        email: primaryContact?.email ?? '',
        instructions: addr?.instructions ?? '',
    };
};

const mapPackageForForm = (pkg) => ({
    units: pkg?.units ?? 1,
    weight_kg: pkg?.weight_kg ?? '',
    length_cm: pkg?.length_cm ?? '',
    width_cm: pkg?.width_cm ?? '',
    height_cm: pkg?.height_cm ?? '',
    cubic_m3: pkg?.cubic_m3 ?? '',
    package_type_id: pkg?.package_type_id ?? '',
    dg_type_id: pkg?.dg_type_id ?? '',
    remarks: pkg?.remarks ?? '',
});

const mapTrackingForForm = (tn) => ({
    communication_type: tn?.communication_type ?? 'EMAIL',
    contact_value: tn?.contact_value ?? '',
    notification_type_id: tn?.notification_type_id ?? '',
    enabled: tn?.enabled ?? true,
});

const mapAdditionalInformationForForm = (ai) => ({
    insurance_type: ai?.insurance_type ?? 'Owners Risk',
    dg_signatory_id: ai?.dg_signatory_id ?? '',
});

export default function Create({ companies, countries, packageTypes, dgTypes, notificationTypes, dgSignatories, services, jobBooking }) {
    const [customers, setCustomers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [companyQuery, setCompanyQuery] = useState('');
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [customerQuery, setCustomerQuery] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [senderCustomerQuery, setSenderCustomerQuery] = useState('');
    const [isSenderCustomerDropdownOpen, setIsSenderCustomerDropdownOpen] = useState(false);
    const [receiverCustomerQuery, setReceiverCustomerQuery] = useState('');
    const [isReceiverCustomerDropdownOpen, setIsReceiverCustomerDropdownOpen] = useState(false);
    const companyDropdownRef = useRef(null);
    const customerDropdownRef = useRef(null);
    const senderCustomerDropdownRef = useRef(null);
    const receiverCustomerDropdownRef = useRef(null);
    const senderParty = jobBooking?.senderCustomer || jobBooking?.customer;
    const receiverParty = jobBooking?.receiverCustomer || jobBooking?.customer;
    const senderFallback = senderParty ? mapCustomerAddressToBookingAddress(senderParty) : {};
    const receiverFallback = receiverParty ? mapCustomerAddressToBookingAddress(receiverParty) : {};

    const { data, setData, post, put, processing, errors } = useForm({
        company_id: jobBooking?.company_id ?? '',
        branch_id: jobBooking?.branch_id ?? '',
        customer_id: jobBooking?.customer_id ?? '',
        sender_customer_id: jobBooking?.sender_customer_id ?? jobBooking?.senderCustomer?.id ?? jobBooking?.customer_id ?? '',
        receiver_customer_id: jobBooking?.receiver_customer_id ?? jobBooking?.receiverCustomer?.id ?? jobBooking?.customer_id ?? '',
        booking_id: jobBooking?.booking_id ?? generateBookingId(),
        job_type: jobBooking?.job_type ?? 'general',
        customer_reference: jobBooking?.customer_reference ?? '',
        receiver_reference: jobBooking?.receiver_reference ?? '',
        freight_ready_by: jobBooking ? toDatetimeLocal(jobBooking.freight_ready_by) : '',
        signature_required: !!jobBooking?.signature_required,
        sender: {
            ...mapAddressForForm(jobBooking?.senderAddress),
            ...senderFallback,
        },
        receiver: {
            ...mapAddressForForm(jobBooking?.receiverAddress),
            ...receiverFallback,
            additional_services: (jobBooking?.services || []).map((s) => s.id),
        },
        packages: jobBooking?.packages?.length ? jobBooking.packages.map(mapPackageForForm) : [emptyPackage()],
        tracking_notifications: jobBooking?.trackingNotifications?.length ? jobBooking.trackingNotifications.map(mapTrackingForForm) : [],
        additional_information: mapAdditionalInformationForForm(jobBooking?.additionalInformation),
    });

    useEffect(() => {
        // Ensure booking_id is always present on first render.
        if (!jobBooking && !data.booking_id) {
            setData({ ...data, booking_id: generateBookingId() });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (data.company_id) {
            fetch(route('job-bookings.customers', { company_id: data.company_id }))
                .then(r => r.json())
                .then(setCustomers)
                .catch(() => setCustomers([]));
            fetch(route('job-bookings.branches', { company_id: data.company_id }))
                .then(r => r.json())
                .then(setBranches)
                .catch(() => setBranches([]));
        } else {
            setCustomers([]);
            setBranches([]);
        }
    }, [data.company_id]);

    useEffect(() => {
        const selectedCompany = companies.find((c) => String(c.id) === String(data.company_id));
        if (selectedCompany) {
            setCompanyQuery(selectedCompany.name || '');
        }
    }, [companies, data.company_id]);

    useEffect(() => {
        const selectedCustomer = customers.find((c) => String(c.id) === String(data.customer_id));
        if (selectedCustomer) {
            setCustomerQuery(`${selectedCustomer.name} (${selectedCustomer.customer_code})`);
        } else if (!data.customer_id) {
            setCustomerQuery('');
        }
    }, [customers, data.customer_id]);

    useEffect(() => {
        const selectedSender = customers.find((c) => String(c.id) === String(data.sender_customer_id));
        if (selectedSender) {
            setSenderCustomerQuery(`${selectedSender.name} (${selectedSender.customer_code})`);
        } else if (!data.sender_customer_id) {
            setSenderCustomerQuery('');
        }
    }, [customers, data.sender_customer_id]);

    useEffect(() => {
        const selectedReceiver = customers.find((c) => String(c.id) === String(data.receiver_customer_id));
        if (selectedReceiver) {
            setReceiverCustomerQuery(`${selectedReceiver.name} (${selectedReceiver.customer_code})`);
        } else if (!data.receiver_customer_id) {
            setReceiverCustomerQuery('');
        }
    }, [customers, data.receiver_customer_id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
                setIsCompanyDropdownOpen(false);
            }
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
                setIsCustomerDropdownOpen(false);
            }
            if (senderCustomerDropdownRef.current && !senderCustomerDropdownRef.current.contains(event.target)) {
                setIsSenderCustomerDropdownOpen(false);
            }
            if (receiverCustomerDropdownRef.current && !receiverCustomerDropdownRef.current.contains(event.target)) {
                setIsReceiverCustomerDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const inputClass = "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const sectionHeader = "flex items-center justify-between bg-teal-500 px-4 py-2 text-white font-semibold rounded-t-lg";

    const updateSender = (key, val) => setData({ ...data, sender: { ...data.sender, [key]: val } });
    const updateReceiver = (key, val) => setData({ ...data, receiver: { ...data.receiver, [key]: val } });

    const addPackage = () => setData({ ...data, packages: [...data.packages, emptyPackage()] });
    const removePackage = (i) => setData({ ...data, packages: data.packages.filter((_, idx) => idx !== i) });
    const updatePackage = (i, key, val) => {
        const pkg = [...data.packages];
        pkg[i] = { ...pkg[i], [key]: val };
        if (['length_cm', 'width_cm', 'height_cm', 'units'].includes(key) && pkg[i].length_cm && pkg[i].width_cm && pkg[i].height_cm) {
            const l = parseFloat(pkg[i].length_cm) || 0, w = parseFloat(pkg[i].width_cm) || 0, h = parseFloat(pkg[i].height_cm) || 0;
            pkg[i].cubic_m3 = ((l * w * h) / 1000000 * (parseInt(pkg[i].units) || 1)).toFixed(4);
        }
        setData({ ...data, packages: pkg });
    };

    const addTracking = () => setData({ ...data, tracking_notifications: [...data.tracking_notifications, emptyTracking()] });
    const removeTracking = (i) => setData({ ...data, tracking_notifications: data.tracking_notifications.filter((_, idx) => idx !== i) });
    const updateTracking = (i, key, val) => {
        const t = [...data.tracking_notifications];
        t[i] = { ...t[i], [key]: val };
        setData({ ...data, tracking_notifications: t });
    };

    const totalWeight = data.packages.reduce((s, p) => s + (parseFloat(p.weight_kg) || 0), 0);
    const totalCubic = data.packages.reduce((s, p) => s + (parseFloat(p.cubic_m3) || 0), 0);
    const totalUnits = data.packages.reduce((s, p) => s + (parseInt(p.units) || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (jobBooking?.id) {
            put(route('job-bookings.update', jobBooking.id));
        } else {
            post(route('job-bookings.store'));
        }
    };

    const handleClear = () => {
        if (jobBooking?.id) {
            router.visit(route('job-bookings.edit', jobBooking.id));
            return;
        }
        router.visit(route('job-bookings.create'));
    };
    const handleSaveAndPrint = (e) => {
        e.preventDefault();
        if (jobBooking?.id) {
            put(route('job-bookings.update', jobBooking.id), {
                onSuccess: () => {
                    // Redirect ke baad DOM render ho jaye, phir print open kar do.
                    setTimeout(() => window.print(), 400);
                },
            });
            return;
        }

        post(route('job-bookings.store'), {
            onSuccess: () => {
                // Redirect ke baad DOM render ho jaye, phir print open kar do.
                setTimeout(() => window.print(), 400);
            },
        });
    };

    const SearchableMultiSelect = ({ options, value, onChange, placeholder = 'Select...' }) => {
        const [query, setQuery] = useState('');
        const [isOpen, setIsOpen] = useState(false);
        const wrapperRef = useRef(null);

        useEffect(() => {
            const handleOutside = (event) => {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleOutside);
            return () => document.removeEventListener('mousedown', handleOutside);
        }, []);

        const selectedValues = (value || []).map(String);
        const selectedOptions = options.filter((o) => selectedValues.includes(String(o.id)));
        const filteredOptions = options.filter((o) => {
            const q = query.trim().toLowerCase();
            return !q || (o.name || '').toLowerCase().includes(q);
        });

        return (
            <div className="space-y-2" ref={wrapperRef}>
                <input
                    type="text"
                    value={query}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder="Search..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                {isOpen && (
                    <div className="max-h-40 overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                        {filteredOptions.map((o) => {
                            const strId = String(o.id);
                            const isSelected = selectedValues.includes(strId);
                            return (
                                <button
                                    key={o.id}
                                    type="button"
                                    onClick={() => {
                                        const updated = isSelected
                                            ? selectedValues.filter((id) => id !== strId)
                                            : [...selectedValues, strId];
                                        onChange(updated);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${isSelected ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                >
                                    {o.name}
                                </button>
                            );
                        })}
                        {!filteredOptions.length && (
                            <div className="px-3 py-2 text-sm text-gray-500">No service found</div>
                        )}
                    </div>
                )}

                <div className="text-xs text-gray-500">
                    {value?.length ? `${value.length} selected` : placeholder}
                </div>

                {!!selectedOptions.length && (
                    <div className="flex flex-wrap gap-2">
                        {selectedOptions.map((opt) => (
                            <span
                                key={opt.id}
                                className="rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700"
                            >
                                {opt.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const AddressFields = ({ prefix, addr, update }) => (
        <div className="space-y-3">
            <div>
                <label className={labelClass}>Country</label>
                <select value={addr.country_id} onChange={e => update('country_id', e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={addr.name} onChange={e => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Find Address</label>
                <input type="text" placeholder="Search address..." className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Building</label>
                <input type="text" value={addr.building} onChange={e => update('building', e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className={labelClass}>Street No.</label>
                    <input type="text" value={addr.street_no} onChange={e => update('street_no', e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Street</label>
                    <input type="text" value={addr.street} onChange={e => update('street', e.target.value)} className={inputClass} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Suburb</label>
                <input type="text" value={addr.suburb} onChange={e => update('suburb', e.target.value)} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>City / Town</label>
                <input type="text" value={addr.city} onChange={e => update('city', e.target.value)} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>State</label>
                <input type="text" value={addr.state} onChange={e => update('state', e.target.value)} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Postcode</label>
                <input type="text" value={addr.postcode} onChange={e => update('postcode', e.target.value)} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Contact Person</label>
                <input type="text" value={addr.contact_person} onChange={e => update('contact_person', e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className={labelClass}>Mobile</label>
                    <input type="text" value={addr.mobile} onChange={e => update('mobile', e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Phone</label>
                    <input type="text" value={addr.phone} onChange={e => update('phone', e.target.value)} className={inputClass} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={addr.email} onChange={e => update('email', e.target.value)} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>{prefix === 'sender' ? 'Pickup Instruction' : 'Delivery Instruction'}</label>
                <textarea rows={3} value={addr.instructions} onChange={e => update('instructions', e.target.value)} className={inputClass} />
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title={jobBooking?.id ? 'Edit Job Booking' : 'New Job Booking'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Job Booking</h1>
                        <nav className="mt-1 flex text-sm text-gray-500">
                            <Link href={route('dashboard')} className="hover:text-teal-600">Dashboard</Link>
                            <span className="mx-1">/</span>
                            <Link href={route('job-bookings.index')} className="hover:text-teal-600">Job Bookings</Link>
                            <span className="mx-1">/</span>
                            <span className="text-gray-900">{jobBooking?.id ? 'Edit Job Booking' : 'New Job Booking'}</span>
                        </nav>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Information Bar */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="md:col-span-1">
                                <label className={labelClass}>Company *</label>
                                <div className="relative" ref={companyDropdownRef}>
                                    <input
                                        type="text"
                                        value={companyQuery}
                                        onFocus={() => setIsCompanyDropdownOpen(true)}
                                        onChange={(e) => {
                                            setCompanyQuery(e.target.value);
                                            setIsCompanyDropdownOpen(true);
                                            setData({
                                                ...data,
                                                company_id: '',
                                                customer_id: '',
                                                sender_customer_id: '',
                                                receiver_customer_id: '',
                                                branch_id: '',
                                            });
                                        }}
                                        placeholder="Search company..."
                                        className={inputClass}
                                        required={!data.company_id}
                                    />

                                    {isCompanyDropdownOpen && (
                                        <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData({
                                                        ...data,
                                                        company_id: '',
                                                        customer_id: '',
                                                        sender_customer_id: '',
                                                        receiver_customer_id: '',
                                                        branch_id: '',
                                                    });
                                                    setCompanyQuery('');
                                                    setCustomerQuery('');
                                                    setSenderCustomerQuery('');
                                                    setReceiverCustomerQuery('');
                                                    setIsCompanyDropdownOpen(false);
                                                }}
                                                className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                            >
                                                Select Company
                                            </button>

                                            {companies
                                                .filter((c) => !companyQuery.trim() || (c.name || '').toLowerCase().includes(companyQuery.trim().toLowerCase()))
                                                .map((c) => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setData({
                                                                ...data,
                                                                company_id: String(c.id),
                                                                customer_id: '',
                                                                sender_customer_id: '',
                                                                receiver_customer_id: '',
                                                                branch_id: '',
                                                            });
                                                            setCompanyQuery(c.name || '');
                                                            setCustomerQuery('');
                                                            setSenderCustomerQuery('');
                                                            setReceiverCustomerQuery('');
                                                            setIsCompanyDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.company_id) === String(c.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))}

                                            {!companies.some((c) => !companyQuery.trim() || (c.name || '').toLowerCase().includes(companyQuery.trim().toLowerCase())) && (
                                                <div className="px-3 py-2 text-sm text-gray-500">No company found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                <label className={labelClass}>Customer Name / Customer Code *</label>
                                <div className="relative" ref={customerDropdownRef}>
                                    <input
                                        type="text"
                                        value={customerQuery}
                                        onFocus={() => setIsCustomerDropdownOpen(true)}
                                        onChange={(e) => {
                                            setCustomerQuery(e.target.value);
                                            setIsCustomerDropdownOpen(true);
                                            setData({ ...data, customer_id: '' });
                                        }}
                                        placeholder="Search customer..."
                                        className={inputClass}
                                        required={!data.customer_id}
                                    />

                                    {isCustomerDropdownOpen && (
                                        <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData({ ...data, customer_id: '' });
                                                    setCustomerQuery('');
                                                    setIsCustomerDropdownOpen(false);
                                                }}
                                                className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                            >
                                                Select Customer
                                            </button>

                                            {customers
                                                .filter((c) => {
                                                    const q = customerQuery.trim().toLowerCase();
                                                    return !q || `${c.name} ${c.customer_code}`.toLowerCase().includes(q);
                                                })
                                                .map((c) => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const selectedCustomer = c;
                                                            const bookingAddr = mapCustomerAddressToBookingAddress(selectedCustomer);
                                                            const shouldFillSender = Boolean(selectedCustomer?.is_consignor);
                                                            const shouldFillReceiver = Boolean(selectedCustomer?.is_consignee);

                                                            setData({
                                                                ...data,
                                                                customer_id: String(c.id),
                                                                sender_customer_id: String(c.id),
                                                                receiver_customer_id: String(c.id),
                                                                ...(shouldFillSender ? { sender: { ...data.sender, ...bookingAddr } } : null),
                                                                ...(shouldFillReceiver
                                                                    ? { receiver: { ...data.receiver, ...bookingAddr, additional_services: data.receiver?.additional_services || [] } }
                                                                    : null),
                                                            });
                                                            setCustomerQuery(`${c.name} (${c.customer_code})`);
                                                            setIsCustomerDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.customer_id) === String(c.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                                    >
                                                        {c.name} ({c.customer_code})
                                                    </button>
                                                ))}

                                            {!customers.some((c) => {
                                                const q = customerQuery.trim().toLowerCase();
                                                return !q || `${c.name} ${c.customer_code}`.toLowerCase().includes(q);
                                            }) && (
                                                <div className="px-3 py-2 text-sm text-gray-500">No customer found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Customer Reference / Order No.</label>
                                <input type="text" value={data.customer_reference} onChange={e => setData({ ...data, customer_reference: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Receiver Reference</label>
                                <input type="text" value={data.receiver_reference} onChange={e => setData({ ...data, receiver_reference: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Freight Ready By</label>
                                <input type="datetime-local" value={data.freight_ready_by} onChange={e => setData({ ...data, freight_ready_by: e.target.value })} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Sender & Receiver */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className={sectionHeader}>Sender</div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <label className={labelClass}>Sender Customer *</label>
                                    <div className="relative" ref={senderCustomerDropdownRef}>
                                        <input
                                            type="text"
                                            value={senderCustomerQuery}
                                            onFocus={() => setIsSenderCustomerDropdownOpen(true)}
                                            onChange={(e) => {
                                                setSenderCustomerQuery(e.target.value);
                                                setIsSenderCustomerDropdownOpen(true);
                                                setData({ ...data, sender_customer_id: '' });
                                            }}
                                            placeholder="Search sender customer..."
                                            className={inputClass}
                                            required={!data.sender_customer_id}
                                        />

                                        {isSenderCustomerDropdownOpen && (
                                            <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                                {customers
                                                    .filter((c) => {
                                                        const q = senderCustomerQuery.trim().toLowerCase();
                                                        return !q || `${c.name} ${c.customer_code}`.toLowerCase().includes(q);
                                                    })
                                                    .map((c) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const bookingAddr = mapCustomerAddressToBookingAddress(c);
                                                                setData({
                                                                    ...data,
                                                                    sender_customer_id: String(c.id),
                                                                    sender: { ...data.sender, ...bookingAddr },
                                                                });
                                                                setSenderCustomerQuery(`${c.name} (${c.customer_code})`);
                                                                setIsSenderCustomerDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.sender_customer_id) === String(c.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                                        >
                                                            {c.name} ({c.customer_code})
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.sender_customer_id && <p className="mt-1 text-sm text-red-600">{errors.sender_customer_id}</p>}
                                </div>
                                <AddressFields prefix="sender" addr={data.sender} update={updateSender} />
                                <div className="mt-4 flex justify-end gap-2">
                                    <button type="button" onClick={handleClear} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">Clear</button>
                                    <button type="submit" disabled={processing} className="rounded bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50">Save</button>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className={sectionHeader}>Receiver</div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <label className={labelClass}>Receiver Customer *</label>
                                    <div className="relative" ref={receiverCustomerDropdownRef}>
                                        <input
                                            type="text"
                                            value={receiverCustomerQuery}
                                            onFocus={() => setIsReceiverCustomerDropdownOpen(true)}
                                            onChange={(e) => {
                                                setReceiverCustomerQuery(e.target.value);
                                                setIsReceiverCustomerDropdownOpen(true);
                                                setData({ ...data, receiver_customer_id: '' });
                                            }}
                                            placeholder="Search receiver customer..."
                                            className={inputClass}
                                            required={!data.receiver_customer_id}
                                        />

                                        {isReceiverCustomerDropdownOpen && (
                                            <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                                {customers
                                                    .filter((c) => {
                                                        const q = receiverCustomerQuery.trim().toLowerCase();
                                                        return !q || `${c.name} ${c.customer_code}`.toLowerCase().includes(q);
                                                    })
                                                    .map((c) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const bookingAddr = mapCustomerAddressToBookingAddress(c);
                                                                setData({
                                                                    ...data,
                                                                    receiver_customer_id: String(c.id),
                                                                    receiver: {
                                                                        ...data.receiver,
                                                                        ...bookingAddr,
                                                                        additional_services: data.receiver?.additional_services || [],
                                                                    },
                                                                });
                                                                setReceiverCustomerQuery(`${c.name} (${c.customer_code})`);
                                                                setIsReceiverCustomerDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.receiver_customer_id) === String(c.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                                        >
                                                            {c.name} ({c.customer_code})
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    {errors.receiver_customer_id && <p className="mt-1 text-sm text-red-600">{errors.receiver_customer_id}</p>}
                                </div>
                                <AddressFields prefix="receiver" addr={data.receiver} update={updateReceiver} />
                                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                                    <div>
                                        <label className={labelClass}>Additional Services</label>
                                        <SearchableMultiSelect
                                            options={services}
                                            value={data.receiver.additional_services}
                                            onChange={(vals) => updateReceiver('additional_services', vals)}
                                            placeholder="Select services"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="sig"
                                            checked={data.signature_required}
                                            onChange={e => setData({ ...data, signature_required: e.target.checked })}
                                            className="rounded"
                                        />
                                        <label htmlFor="sig" className="text-sm font-medium text-gray-700">
                                            Signature Required
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <button type="button" onClick={handleClear} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">Clear</button>
                                    <button type="submit" disabled={processing} className="rounded bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50">Save</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Package Section */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className={sectionHeader}>
                            <span>Package New</span>
                            <button type="button" onClick={addPackage} className="flex h-8 w-8 items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white">
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-x-auto p-4">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Units*</th>
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Weight(Kg)*</th>
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Dimensions (cm) L</th>
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">W</th>
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">H</th>
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Cubic(m3)*</th>
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Package Type*</th>
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">DG Type</th>
                                        <th className="px-2 py-2 text-left font-medium text-gray-600">Remarks</th>
                                        <th className="px-2 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.packages.map((pkg, i) => (
                                        <tr key={i} className="border-b border-gray-100">
                                            <td className="px-2 py-2"><input type="number" min="1" value={pkg.units} onChange={e => updatePackage(i, 'units', e.target.value)} className={inputClass + " w-16"} /></td>
                                            <td className="px-2 py-2"><input type="number" step="0.001" min="0" value={pkg.weight_kg} onChange={e => updatePackage(i, 'weight_kg', e.target.value)} className={inputClass + " w-20"} required /></td>
                                            <td className="px-2 py-2"><input type="number" step="0.01" value={pkg.length_cm} onChange={e => updatePackage(i, 'length_cm', e.target.value)} className={inputClass + " w-16"} /></td>
                                            <td className="px-2 py-2"><input type="number" step="0.01" value={pkg.width_cm} onChange={e => updatePackage(i, 'width_cm', e.target.value)} className={inputClass + " w-16"} /></td>
                                            <td className="px-2 py-2"><input type="number" step="0.01" value={pkg.height_cm} onChange={e => updatePackage(i, 'height_cm', e.target.value)} className={inputClass + " w-16"} /></td>
                                            <td className="px-2 py-2"><input type="number" step="0.0001" value={pkg.cubic_m3} onChange={e => updatePackage(i, 'cubic_m3', e.target.value)} className={inputClass + " w-20"} /></td>
                                            <td className="px-2 py-2">
                                                <select value={pkg.package_type_id} onChange={e => updatePackage(i, 'package_type_id', e.target.value)} className={inputClass + " min-w-[100px]"} required>
                                                    <option value="">Select</option>
                                                    {packageTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-2 py-2">
                                                <select value={pkg.dg_type_id} onChange={e => updatePackage(i, 'dg_type_id', e.target.value)} className={inputClass + " min-w-[80px]"}>
                                                    <option value="">Select</option>
                                                    {dgTypes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-2 py-2"><input type="text" value={pkg.remarks} onChange={e => updatePackage(i, 'remarks', e.target.value)} className={inputClass} /></td>
                                            <td className="px-2 py-2">
                                                <button type="button" onClick={() => removePackage(i)} className="rounded p-1 text-red-600 hover:bg-red-50">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 font-medium">
                                        <td className="px-2 py-2">Total: {totalUnits}</td>
                                        <td className="px-2 py-2">{totalWeight.toFixed(3)}</td>
                                        <td colSpan="4" className="px-2 py-2"></td>
                                        <td colSpan="3" className="px-2 py-2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                            {/* <div className="mt-2 flex justify-end">
                                <button type="button" className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400">Revenue</button>
                            </div> */}
                        </div>
                    </div>

                    {/* Tracking Notification & Additional Information */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className={sectionHeader}>
                                <span>Tracking Notification</span>
                                <div className="flex gap-1">
                                    <button type="button" onClick={addTracking} className="flex h-8 w-8 items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white"><PlusIcon className="h-4 w-4" /></button>
                                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white"><MinusIcon className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-2 py-2 text-left font-medium text-gray-600">Communication Type</th>
                                            <th className="px-2 py-2 text-left font-medium text-gray-600">Email/Phone</th>
                                            <th className="px-2 py-2 text-left font-medium text-gray-600">Notification Type</th>
                                            <th className="px-2 py-2 text-left font-medium text-gray-600">Enabled</th>
                                            <th className="px-2 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.tracking_notifications.map((tn, i) => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="px-2 py-2">
                                                    <select value={tn.communication_type} onChange={e => updateTracking(i, 'communication_type', e.target.value)} className={inputClass + " min-w-[120px]"}>
                                                        {COMMUNICATION_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-2 py-2"><input type="text" value={tn.contact_value} onChange={e => updateTracking(i, 'contact_value', e.target.value)} className={inputClass} placeholder="Email or Phone" /></td>
                                                <td className="px-2 py-2">
                                                    <select value={tn.notification_type_id} onChange={e => updateTracking(i, 'notification_type_id', e.target.value)} className={inputClass + " min-w-[120px]"}>
                                                        <option value="">Select</option>
                                                        {notificationTypes.map(nt => <option key={nt.id} value={nt.id}>{nt.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!tn.enabled}
                                                            onChange={(e) => updateTracking(i, 'enabled', e.target.checked)}
                                                            className="rounded"
                                                        />
                                                    </label>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTracking(i)}
                                                        className="text-red-600 hover:bg-red-50 rounded p-1"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* <button type="button" className="mt-4 flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                                    <CloudArrowUpIcon className="h-5 w-5" /> Attach File
                                </button> */}
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className={sectionHeader}>Additional Information</div>
                            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Insurance Type</label>
                                    <select value={data.additional_information.insurance_type} onChange={e => setData({
                                        ...data, additional_information: { ...data.additional_information, insurance_type: e.target.value }
                                    })} className={inputClass}>
                                        {INSURANCE_TYPES.map(it => <option key={it} value={it}>{it}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>DG Signatory</label>
                                    <select value={data.additional_information.dg_signatory_id} onChange={e => setData({
                                        ...data, additional_information: { ...data.additional_information, dg_signatory_id: e.target.value }
                                    })} className={inputClass}>
                                        <option value="">Select</option>
                                        {dgSignatories.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={handleClear} className="rounded-lg bg-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-400">Clear</button>
                        <button type="submit" disabled={processing} className="rounded-lg bg-teal-500 px-6 py-2 font-medium text-white hover:bg-teal-600 disabled:opacity-50">Save</button>
                        <button type="button" onClick={handleSaveAndPrint} disabled={processing} className="rounded-lg bg-teal-700 px-6 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-50">
                            Save & Print
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
