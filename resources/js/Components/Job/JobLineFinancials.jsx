import { Dialog, Transition } from '@headlessui/react';
import { PencilIcon, TrashIcon } from '@/Components/Icons';
import { router, useForm } from '@inertiajs/react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmDelete } from '@/Utils/confirmDelete';

const TEAL = '#20A4AC';

function emptyForm(jobableType, jobableId) {
    return {
        jobable_type: jobableType,
        jobable_id: jobableId,
        charge_type_id: '',
        type: '',
        charge: '',
        comments: '',
    };
}

export default function JobLineFinancials({
    variant,
    jobableType,
    jobableId,
    lines = [],
    chargeTypes = [],
    /** When set (e.g. job queue edit modal), keep page state and refresh lines via callback after save/delete */
    onAfterMutation,
}) {
    const isRevenue = variant === 'revenue';
    const title = isRevenue ? 'Revenue' : 'Cost';
    const addLabel = isRevenue ? 'Add Revenue' : 'Add Cost';
    const storeRoute = isRevenue ? 'job-revenues.store' : 'job-costs.store';
    const updateRouteName = isRevenue ? 'job-revenues.update' : 'job-costs.update';
    const destroyRouteName = isRevenue ? 'job-revenues.destroy' : 'job-costs.destroy';

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [chargeTypeSearch, setChargeTypeSearch] = useState('');
    const [isChargeTypeDropdownOpen, setIsChargeTypeDropdownOpen] = useState(false);
    const chargeTypeDropdownRef = useRef(null);

    const form = useForm(emptyForm(jobableType, jobableId));

    const openCreate = useCallback(() => {
        setEditingId(null);
        form.setData(emptyForm(jobableType, jobableId));
        form.clearErrors();
        setModalOpen(true);
    }, [jobableType, jobableId]);

    const openEdit = useCallback(
        (row) => {
            setEditingId(row.id);
            form.setData({
                jobable_type: jobableType,
                jobable_id: jobableId,
                charge_type_id: String(row.charge_type_id ?? ''),
                type: row.type ?? '',
                charge: row.charge != null ? String(row.charge) : '',
                comments: row.comments ?? '',
            });
            form.clearErrors();
            setModalOpen(true);
        },
        [jobableType, jobableId],
    );

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
    };

    const normalizePayload = (data) => ({
        charge_type_id: data.charge_type_id === '' ? null : Number(data.charge_type_id),
        type: data.type || null,
        charge: data.charge === '' ? null : Number(data.charge),
        comments: data.comments || null,
    });

    const canSubmit = useMemo(() => {
        const p = normalizePayload(form.data);
        return p.charge_type_id != null && p.charge != null && !Number.isNaN(p.charge);
    }, [form.data]);
    const filteredChargeTypes = useMemo(() => {
        const query = chargeTypeSearch.trim().toLowerCase();
        if (!query) return chargeTypes;
        return chargeTypes.filter((item) => String(item.name || '').toLowerCase().includes(query));
    }, [chargeTypes, chargeTypeSearch]);

    const inertiaVisitOptions = onAfterMutation
        ? { preserveScroll: true, preserveState: true }
        : { preserveScroll: true };

    const applyErrors = (errors) => {
        form.clearErrors();
        if (!errors || typeof errors !== 'object') return;
        Object.entries(errors).forEach(([k, v]) => {
            const msg = Array.isArray(v) ? v[0] : v;
            form.setError(k, msg);
        });
    };

    const submit = (andNext) => {
        if (!canSubmit || saving) return;
        const p = normalizePayload(form.data);
        if (p.charge_type_id == null || p.charge == null || Number.isNaN(p.charge)) return;

        const body = {
            charge_type_id: p.charge_type_id,
            type: p.type,
            charge: p.charge,
            comments: p.comments,
        };

        setSaving(true);
        form.clearErrors();

        if (editingId) {
            router.put(route(updateRouteName, editingId), body, {
                ...inertiaVisitOptions,
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    if (andNext) {
                        setEditingId(null);
                        form.setData(emptyForm(jobableType, jobableId));
                    } else {
                        closeModal();
                    }
                    onAfterMutation?.();
                },
                onError: applyErrors,
            });
            return;
        }

        router.post(
            route(storeRoute),
            {
                jobable_type: jobableType,
                jobable_id: jobableId,
                ...body,
            },
            {
                ...inertiaVisitOptions,
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    if (andNext) {
                        form.setData(emptyForm(jobableType, jobableId));
                    } else {
                        closeModal();
                    }
                    onAfterMutation?.();
                },
                onError: applyErrors,
            },
        );
    };

    const onDelete = (row) => {
        confirmDelete({
            message: `Delete this ${title.toLowerCase()} line?`,
            onConfirm: () => {
                router.delete(route(destroyRouteName, row.id), {
                    ...inertiaVisitOptions,
                    onSuccess: () => onAfterMutation?.(),
                });
            },
        });
    };

    const formatDate = (value) => {
        if (!value) return '—';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return String(value);
        return parsed.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatMoney = (n) => {
        if (n == null || n === '') return '—';
        const v = Number(n);
        return Number.isFinite(v) ? v.toFixed(2) : String(n);
    };

    useEffect(() => {
        const selected = chargeTypes.find((item) => String(item.id) === String(form.data.charge_type_id));
        if (selected) {
            setChargeTypeSearch(selected.name || '');
        } else if (!form.data.charge_type_id) {
            setChargeTypeSearch('');
        }
    }, [chargeTypes, form.data.charge_type_id, modalOpen]);

    useEffect(() => {
        if (!modalOpen) {
            setIsChargeTypeDropdownOpen(false);
            return;
        }
        const handleClickOutside = (event) => {
            if (chargeTypeDropdownRef.current && !chargeTypeDropdownRef.current.contains(event.target)) {
                setIsChargeTypeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [modalOpen]);

    return (
        <div className="relative min-h-[12rem]">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
                    style={{ backgroundColor: TEAL }}
                >
                    {addLabel}
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left">
                            {isRevenue ? (
                                <>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Type</th>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Customer Code</th>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Charge</th>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Created Date</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Revenue Type</th>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Customer Code</th>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Charge Type</th>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Created By</th>
                                    <th className="px-3 py-2 font-semibold text-gray-700">Charge</th>
                                </>
                            )}
                            <th className="px-3 py-2 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                                    No records yet.
                                </td>
                            </tr>
                        )}
                        {lines.map((row) => (
                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                                {isRevenue ? (
                                    <>
                                        <td className="px-3 py-2 text-gray-800">{row.type || '—'}</td>
                                        <td className="px-3 py-2 text-gray-800">{row.customer?.customer_code || '—'}</td>
                                        <td className="px-3 py-2 text-gray-800">{formatMoney(row.charge)}</td>
                                        <td className="px-3 py-2 text-gray-800">{formatDate(row.created_at)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-3 py-2 text-gray-800">{row.type || '—'}</td>
                                        <td className="px-3 py-2 text-gray-800">{row.customer?.customer_code || '—'}</td>
                                        <td className="px-3 py-2 text-gray-800">{row.charge_type?.name || '—'}</td>
                                        <td className="px-3 py-2 text-gray-800">{row.charged_by_user?.name || '—'}</td>
                                        <td className="px-3 py-2 text-gray-800">{formatMoney(row.charge)}</td>
                                    </>
                                )}
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(row)}
                                            className="text-[#178089] hover:opacity-80"
                                            title="Edit"
                                            aria-label="Edit"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(row)}
                                            className="text-red-600 hover:text-red-700"
                                            title="Delete"
                                            aria-label="Delete"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Transition appear show={modalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[120]" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
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
                                <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                                        {editingId ? `Edit ${title}` : addLabel}
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Charge Type <span className="text-red-600">*</span>
                                            </label>
                                            <div className="relative mt-1" ref={chargeTypeDropdownRef}>
                                                <input
                                                    type="text"
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                    placeholder="Search charge type..."
                                                    value={chargeTypeSearch}
                                                    onFocus={() => setIsChargeTypeDropdownOpen(true)}
                                                    onChange={(e) => {
                                                        setChargeTypeSearch(e.target.value);
                                                        form.setData('charge_type_id', '');
                                                        setIsChargeTypeDropdownOpen(true);
                                                    }}
                                                    required
                                                />
                                                {isChargeTypeDropdownOpen && (
                                                    <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                form.setData('charge_type_id', '');
                                                                setChargeTypeSearch('');
                                                                setIsChargeTypeDropdownOpen(false);
                                                            }}
                                                            className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                                        >
                                                            Select charge type
                                                        </button>
                                                        {filteredChargeTypes.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    form.setData('charge_type_id', String(item.id));
                                                                    setChargeTypeSearch(item.name || '');
                                                                    setIsChargeTypeDropdownOpen(false);
                                                                }}
                                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${
                                                                    String(form.data.charge_type_id) === String(item.id)
                                                                        ? 'bg-[#20A4AC] text-white'
                                                                        : 'text-gray-700'
                                                                }`}
                                                            >
                                                                {item.name}
                                                            </button>
                                                        ))}
                                                        {!filteredChargeTypes.length && (
                                                            <div className="px-3 py-2 text-sm text-gray-500">No charge type found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {form.errors.charge_type_id && (
                                                <p className="mt-1 text-sm text-red-600">{form.errors.charge_type_id}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type</label>
                                            <input
                                                type="text"
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                value={form.data.type}
                                                onChange={(e) => form.setData('type', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Charge <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                value={form.data.charge}
                                                onChange={(e) => form.setData('charge', e.target.value)}
                                            />
                                            {form.errors.charge && (
                                                <p className="mt-1 text-sm text-red-600">{form.errors.charge}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Comments</label>
                                            <textarea
                                                rows={3}
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                value={form.data.comments}
                                                onChange={(e) => form.setData('comments', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-wrap justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        {!editingId && (
                                            <button
                                                type="button"
                                                disabled={!canSubmit || saving}
                                                onClick={() => submit(true)}
                                                className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Add &amp; Next
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            disabled={!canSubmit || saving}
                                            onClick={() => submit(false)}
                                            className="rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{ backgroundColor: TEAL }}
                                        >
                                            {editingId ? 'Save' : 'Add'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
