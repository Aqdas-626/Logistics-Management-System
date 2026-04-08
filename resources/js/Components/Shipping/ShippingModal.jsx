import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { XMarkIcon } from '@/Components/Icons';

export default function ShippingModal({ isOpen, onClose, shipping = null }) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        status: true,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (shipping && isOpen) {
            setFormData({
                name: shipping.name || '',
                code: shipping.code || '',
                status: shipping.status !== false, // default true
            });
            setErrors({});
        } else if (isOpen && !shipping) {
            setFormData({
                name: '',
                code: '',
                status: true,
            });
            setErrors({});
        }
    }, [shipping, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (shipping) {
            router.put(route('shippings.update', shipping.id), formData, {
                onSuccess: () => {
                    setLoading(false);
                    onClose();
                },
                onError: (errors) => {
                    setLoading(false);
                    setErrors(errors);
                },
            });
        } else {
            router.post(route('shippings.store'), formData, {
                onSuccess: () => {
                    setLoading(false);
                    onClose();
                },
                onError: (errors) => {
                    setLoading(false);
                    setErrors(errors);
                },
            });
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between bg-gradient-to-r from-[#20A4AC] to-[#1a8d95] px-6 py-4">
                                    <Dialog.Title className="text-lg font-bold text-white">
                                        {shipping ? 'Edit Shipping' : 'New Shipping'}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-white hover:text-gray-200">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => updateField('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20A4AC] focus:border-[#20A4AC]"
                                            placeholder="Enter shipping name"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => updateField('code', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20A4AC] focus:border-[#20A4AC]"
                                            placeholder="Enter shipping code (optional)"
                                            maxLength="50"
                                        />
                                        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                                    </div>

                                    <div>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.status}
                                                onChange={(e) => updateField('status', e.target.checked)}
                                                className="h-4 w-4 text-[#20A4AC] focus:ring-[#20A4AC] border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Active</span>
                                        </label>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={loading}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 text-sm font-medium text-white bg-[#20A4AC] rounded-lg hover:bg-[#1a8d95] disabled:bg-gray-400"
                                        >
                                            {loading ? 'Saving...' : shipping ? 'Update Shipping' : 'Create Shipping'}
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

