import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { XMarkIcon, PlusIcon } from '@/Components/Icons';

export default function VesselModal({ isOpen, onClose, vessel = null, countries = [], shipTypes = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        country_id: '',
        ship_type_id: '',
        imo_number: '',
        mmsi: '',
        call_sign: '',
        built_year: '',
        status: 'active',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vessel && isOpen) {
            setFormData({
                name: vessel.name || '',
                country_id: vessel.country_id || '',
                ship_type_id: vessel.ship_type_id || '',
                imo_number: vessel.imo_number || '',
                mmsi: vessel.mmsi || '',
                call_sign: vessel.call_sign || '',
                built_year: vessel.built_year || '',
                status: vessel.status || 'active',
            });
        } else if (isOpen && !vessel) {
            setFormData({
                name: '',
                country_id: '',
                ship_type_id: '',
                imo_number: '',
                mmsi: '',
                call_sign: '',
                built_year: '',
                status: 'active',
            });
        }
        setErrors({});
    }, [vessel, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (vessel) {
            router.put(route('vessels.update', vessel.id), formData, {
                onSuccess: () => {
                    setLoading(false);
                    onClose();
                },
                onError: (errors) => {
                    setErrors(errors);
                    setLoading(false);
                },
            });
        } else {
            router.post(route('vessels.store'), formData, {
                onSuccess: () => {
                    setLoading(false);
                    onClose();
                },
                onError: (errors) => {
                    setErrors(errors);
                    setLoading(false);
                },
            });
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
                                <div className="flex items-start justify-between">
                                    <Dialog.Title className="text-xl font-bold text-gray-900">
                                        {vessel ? 'Edit Vessel' : 'New Vessel'}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#20A4AC] focus:border-transparent"
                                                required
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                IMO Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.imo_number}
                                                onChange={(e) => setFormData({ ...formData, imo_number: e.target.value.toUpperCase() })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#20A4AC] focus:border-transparent uppercase"
                                                maxLength="20"
                                                required
                                            />
                                            {errors.imo_number && <p className="mt-1 text-sm text-red-600">{errors.imo_number}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Country
                                            </label>
                                            <select
                                                value={formData.country_id}
                                                onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#20A4AC] focus:border-transparent"
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map((country) => (
                                                    <option key={country.id} value={country.id}>
                                                        {country.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.country_id && <p className="mt-1 text-sm text-red-600">{errors.country_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ship Type
                                            </label>
                                            <select
                                                value={formData.ship_type_id}
                                                onChange={(e) => setFormData({ ...formData, ship_type_id: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#20A4AC] focus:border-transparent"
                                            >
                                                <option value="">Select Ship Type</option>
                                                {shipTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.ship_type_id && <p className="mt-1 text-sm text-red-600">{errors.ship_type_id}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                MMSI
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.mmsi}
                                                onChange={(e) => setFormData({ ...formData, mmsi: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#20A4AC] focus:border-transparent"
                                                maxLength="20"
                                            />
                                            {errors.mmsi && <p className="mt-1 text-sm text-red-600">{errors.mmsi}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Call Sign
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.call_sign}
                                                onChange={(e) => setFormData({ ...formData, call_sign: e.target.value.toUpperCase() })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#20A4AC] focus:border-transparent uppercase"
                                                maxLength="20"
                                            />
                                            {errors.call_sign && <p className="mt-1 text-sm text-red-600">{errors.call_sign}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Built Year
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.built_year}
                                                onChange={(e) => setFormData({ ...formData, built_year: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#20A4AC] focus:border-transparent"
                                                min="1800"
                                                max={new Date().getFullYear()}
                                            />
                                            {errors.built_year && <p className="mt-1 text-sm text-red-600">{errors.built_year}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status *
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#20A4AC] focus:border-transparent"
                                                required
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={loading}
                                            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20A4AC] disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-[#20A4AC] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#1a8d95] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20A4AC] disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading ? 'Saving...' : vessel ? 'Update Vessel' : 'Create Vessel'}
                                            {loading ? null : <PlusIcon className="h-4 w-4" />}
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

