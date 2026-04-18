import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { XMarkIcon } from '@/Components/Icons';

const TEAL = '#20A4AC';
const TEAL_HOVER = '#178089';

export default function MaintenanceVendorModal({ isOpen, onClose, vendor }) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (!isOpen) return;
        if (vendor) {
            setData({
                name: vendor.name || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sync modal fields when opening or switching vendor
    }, [isOpen, vendor?.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (vendor) {
            put(route('maintenance-vendors.update', vendor.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
            });
        } else {
            post(route('maintenance-vendors.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-[1px]">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div
                    className="relative w-full max-w-md transform overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-xl transition-all sm:my-8"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="maintenance-vendor-modal-title"
                >
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <h3 id="maintenance-vendor-modal-title" className="text-base font-semibold text-gray-900">
                            {vendor ? 'Edit Maintenance Vendor' : 'Add New Maintenance Vendor'}
                        </h3>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Close"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-5 py-4">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="mv-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="mv-name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                    placeholder="Enter vendor name"
                                    maxLength={160}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="mv-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="mv-email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                    placeholder="Enter vendor email"
                                    maxLength={160}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>
                            <div>
                                <label htmlFor="mv-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    id="mv-phone"
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                    placeholder="Enter vendor phone"
                                    maxLength={50}
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleClose}
                                className="inline-flex w-full justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 sm:w-auto"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-95 disabled:opacity-50 sm:w-auto"
                                style={{ backgroundColor: TEAL }}
                                onMouseEnter={(e) => {
                                    if (!processing) e.currentTarget.style.backgroundColor = TEAL_HOVER;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = TEAL;
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
