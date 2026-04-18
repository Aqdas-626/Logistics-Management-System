import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { PlusIcon, XMarkIcon } from '@/Components/Icons';

const emptyForm = {
    company_id: '',
    name: '',
    code: '',
    description: '',
    sort_order: 0,
    status: 'active',
};

export default function ExpenseCategoryModal({ isOpen, onClose, expenseCategory = null, companies = [] }) {
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (expenseCategory && isOpen) {
            setFormData({
                company_id: expenseCategory.company_id != null ? String(expenseCategory.company_id) : '',
                name: expenseCategory.name || '',
                code: expenseCategory.code || '',
                description: expenseCategory.description || '',
                sort_order: expenseCategory.sort_order ?? 0,
                status: expenseCategory.status || 'active',
            });
            setErrors({});
        } else if (isOpen && !expenseCategory) {
            setFormData(emptyForm);
            setErrors({});
        }
    }, [expenseCategory, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const sortNum = Number(formData.sort_order);
        const payload = {
            ...formData,
            company_id: formData.company_id === '' ? '' : formData.company_id,
            sort_order:
                formData.sort_order === '' || Number.isNaN(sortNum) ? 0 : sortNum,
        };

        if (expenseCategory) {
            router.put(route('expense-categories.update', expenseCategory.id), payload, {
                onSuccess: () => {
                    setLoading(false);
                    onClose();
                },
                onError: (errs) => {
                    setLoading(false);
                    setErrors(errs);
                },
            });
        } else {
            router.post(route('expense-categories.store'), payload, {
                onSuccess: () => {
                    setLoading(false);
                    onClose();
                },
                onError: (errs) => {
                    setLoading(false);
                    setErrors(errs);
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between bg-gradient-to-r from-[#20A4AC] to-[#1a8d95] px-6 py-4">
                                    <Dialog.Title className="text-lg font-bold text-white">
                                        {expenseCategory ? 'Edit Expense Category' : 'New Expense Category'}
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
                                    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Company
                                            </label>
                                            <select
                                                value={formData.company_id}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, company_id: e.target.value })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#20A4AC] focus:outline-none focus:ring-2 focus:ring-[#20A4AC]"
                                            >
                                                <option value="">Global (all companies)</option>
                                                {companies.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.company_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#20A4AC] focus:outline-none focus:ring-2 focus:ring-[#20A4AC]"
                                                placeholder="Category name"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Code
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#20A4AC] focus:outline-none focus:ring-2 focus:ring-[#20A4AC]"
                                                placeholder="Optional short code"
                                            />
                                            {errors.code && (
                                                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, description: e.target.value })
                                                }
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#20A4AC] focus:outline-none focus:ring-2 focus:ring-[#20A4AC]"
                                                placeholder="Optional notes"
                                            />
                                            {errors.description && (
                                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Sort order
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={formData.sort_order}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            sort_order: e.target.value === '' ? '' : Number(e.target.value),
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#20A4AC] focus:outline-none focus:ring-2 focus:ring-[#20A4AC]"
                                                />
                                                {errors.sort_order && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Status <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, status: e.target.value })
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#20A4AC] focus:outline-none focus:ring-2 focus:ring-[#20A4AC]"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                                {errors.status && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 rounded-lg bg-[#20A4AC] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a8d95] disabled:bg-gray-400"
                                        >
                                            {loading ? 'Saving...' : (
                                                <>
                                                    {expenseCategory ? 'Update' : 'Create'}
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
