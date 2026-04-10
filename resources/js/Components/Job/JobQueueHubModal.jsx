import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { XMarkIcon } from '@/Components/Icons';

const HEADER_BG = '#17A2B8';
const TEAL = '#20A4AC';

function IconLocationPin(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

export default function JobQueueHubModal({ isOpen, onClose, queue, locations = [] }) {
    const q = queue || {};
    const [locationSearch, setLocationSearch] = useState('');
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const locationDropdownRef = useRef(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        location_id: '',
        is_charge_customer: false,
    });

    const filteredLocations = useMemo(() => {
        const query = locationSearch.trim().toLowerCase();
        if (!query) return locations;
        return locations.filter((loc) => {
            const name = String(loc.name || '').toLowerCase();
            const code = String(loc.location_code || '').toLowerCase();
            return name.includes(query) || code.includes(query);
        });
    }, [locations, locationSearch]);

    useEffect(() => {
        if (!isOpen) return;
        reset();
        setLocationSearch('');
        setIsLocationDropdownOpen(false);
    }, [isOpen, q.id, reset]);

    useEffect(() => {
        const selected = locations.find((loc) => String(loc.id) === String(data.location_id));
        if (selected) {
            setLocationSearch(`${selected.name}${selected.location_code ? ` (${selected.location_code})` : ''}`);
        } else if (!data.location_id) {
            setLocationSearch('');
        }
    }, [locations, data.location_id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
                setIsLocationDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (!q.id) return;
        post(route('job-queues.hubs.store', q.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[120]" onClose={processing ? () => {} : onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto p-4">
                    <div className="flex min-h-full items-center justify-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-white shadow-xl transition-all">
                                <div className="flex items-center justify-between px-4 py-2.5 text-white" style={{ backgroundColor: HEADER_BG }}>
                                    <Dialog.Title className="text-sm font-semibold">Add Hub</Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={processing}
                                        className="rounded p-1 text-white/90 hover:bg-white/15 hover:text-white disabled:opacity-50"
                                        aria-label="Close"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                                    <div>
                                        <label htmlFor="hub_location" className="text-xs text-gray-600">
                                            Location <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative mt-1 flex items-center gap-2 border-b border-[#17A2B8] pb-1" ref={locationDropdownRef}>
                                            <IconLocationPin className="h-4 w-4 text-[#17A2B8]" />
                                            <input
                                                id="hub_location"
                                                type="text"
                                                className="w-full border-0 bg-transparent p-0 text-sm text-gray-800 focus:outline-none focus:ring-0"
                                                placeholder="Search location..."
                                                value={locationSearch}
                                                onFocus={() => setIsLocationDropdownOpen(true)}
                                                onChange={(e) => {
                                                    setLocationSearch(e.target.value);
                                                    setData('location_id', '');
                                                    setIsLocationDropdownOpen(true);
                                                }}
                                                required
                                            />

                                            {isLocationDropdownOpen && (
                                                <div className="absolute left-0 top-full z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData('location_id', '');
                                                            setLocationSearch('');
                                                            setIsLocationDropdownOpen(false);
                                                        }}
                                                        className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                                    >
                                                        Select location
                                                    </button>
                                                    {filteredLocations.map((loc) => (
                                                        <button
                                                            key={loc.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setData('location_id', String(loc.id));
                                                                setLocationSearch(`${loc.name}${loc.location_code ? ` (${loc.location_code})` : ''}`);
                                                                setIsLocationDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.location_id) === String(loc.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                                        >
                                                            {loc.name}
                                                            {loc.location_code ? ` (${loc.location_code})` : ''}
                                                        </button>
                                                    ))}
                                                    {!filteredLocations.length && (
                                                        <div className="px-3 py-2 text-sm text-gray-500">No location found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.location_id && <p className="mt-1 text-xs text-red-600">{errors.location_id}</p>}
                                    </div>

                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#17A2B8] focus:ring-[#17A2B8]"
                                            checked={!!data.is_charge_customer}
                                            onChange={(e) => setData('is_charge_customer', e.target.checked)}
                                        />
                                        Is Charge Customer
                                    </label>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={processing}
                                            className="rounded px-3 py-1.5 text-xs font-medium text-white"
                                            style={{ backgroundColor: TEAL }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing || !data.location_id}
                                            className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 disabled:opacity-60"
                                        >
                                            {processing ? 'Adding…' : 'Add'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
