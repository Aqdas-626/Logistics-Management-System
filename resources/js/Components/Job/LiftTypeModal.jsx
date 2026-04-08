import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { XMarkIcon, PlusIcon } from '@/Components/Icons';

export default function LiftTypeModal({ isOpen, onClose, liftType = null }) {
    const [formData, setFormData] = useState({
        name: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (liftType && isOpen) {
            setFormData({
                name: liftType.name || '',
            });
            setErrors({});
        } else if (isOpen && !liftType) {
            setFormData({
                name: '',
            });
            setErrors({});
        }
    }, [liftType, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (liftType) {
            router.put(route('lift-types.update', liftType.id), formData, {
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
            router.post(route('lift-types.store'), formData, {
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
                                        {liftType ? 'Edit Lift Type' : 'New Lift Type'}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-white hover:text-gray-200"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20A4AC] focus:border-[#20A4AC]"
                                                placeholder="Enter lift type name"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 text-sm font-medium text-white bg-[#20A4AC] rounded-lg hover:bg-[#1a8d95] disabled:bg-gray-400 flex items-center gap-2"
                                        >
                                            {loading ? 'Saving...' : (
                                                <>
                                                    {liftType ? 'Update' : 'Create'}
                                                    <PlusIcon className="h-4 w-4" />
                                                </>
                                            )}
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

