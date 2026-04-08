import { Dialog, Transition } from '@headlessui/react';
import { PencilIcon, TrashIcon } from '@/Components/Icons';
import { router, useForm } from '@inertiajs/react';
import { Fragment, useCallback, useMemo, useState } from 'react';

const TEAL = '#20A4AC';

function emptyForm(jobableType, jobableId) {
    return {
        jobable_type: jobableType,
        jobable_id: jobableId,
        endorsement_id: '',
        note: '',
    };
}

export default function JobLineNotes({
    jobableType,
    jobableId,
    lines = [],
    endorsements = [],
    onAfterMutation,
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

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
                endorsement_id: String(row.endorsement_id ?? ''),
                note: row.note ?? '',
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
        endorsement_id: data.endorsement_id === '' ? null : Number(data.endorsement_id),
        note: data.note || null,
    });

    const canSubmit = useMemo(() => {
        const p = normalizePayload(form.data);
        return p.endorsement_id != null && !Number.isNaN(p.endorsement_id);
    }, [form.data]);

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

    const submit = () => {
        if (!canSubmit || saving) return;
        const p = normalizePayload(form.data);
        if (p.endorsement_id == null || Number.isNaN(p.endorsement_id)) return;

        const body = {
            endorsement_id: p.endorsement_id,
            note: p.note,
        };

        setSaving(true);
        form.clearErrors();

        if (editingId) {
            router.put(route('job-queue-notes.update', editingId), body, {
                ...inertiaVisitOptions,
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    closeModal();
                    onAfterMutation?.();
                },
                onError: applyErrors,
            });
            return;
        }

        router.post(
            route('job-queue-notes.store'),
            {
                jobable_type: jobableType,
                jobable_id: jobableId,
                ...body,
            },
            {
                ...inertiaVisitOptions,
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    closeModal();
                    onAfterMutation?.();
                },
                onError: applyErrors,
            },
        );
    };

    const onDelete = (row) => {
        if (!confirm('Delete this note?')) return;
        router.delete(route('job-queue-notes.destroy', row.id), {
            ...inertiaVisitOptions,
            onSuccess: () => onAfterMutation?.(),
        });
    };

    const formatDate = (value) => {
        if (!value) return '—';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return String(value);
        return parsed.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="relative min-h-[12rem]">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
                    style={{ backgroundColor: TEAL }}
                >
                    Add Note
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left">
                            <th className="px-3 py-2 font-semibold text-gray-700">Endorsement</th>
                            <th className="px-3 py-2 font-semibold text-gray-700">Note</th>
                            <th className="px-3 py-2 font-semibold text-gray-700">Created</th>
                            <th className="px-3 py-2 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                                    No notes yet.
                                </td>
                            </tr>
                        )}
                        {lines.map((row) => (
                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                                <td className="px-3 py-2 text-gray-800">{row.endorsement?.name || '—'}</td>
                                <td className="max-w-xs truncate px-3 py-2 text-gray-800" title={row.note || ''}>
                                    {row.note || '—'}
                                </td>
                                <td className="px-3 py-2 text-gray-800">{formatDate(row.created_at)}</td>
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
                <Dialog as="div" className="relative z-[125]" onClose={closeModal}>
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
                                        {editingId ? 'Edit Note' : 'Add Note'}
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Endorsement <span className="text-red-600">*</span>
                                            </label>
                                            <select
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                value={form.data.endorsement_id}
                                                onChange={(e) => form.setData('endorsement_id', e.target.value)}
                                            >
                                                <option value="">Select…</option>
                                                {endorsements.map((e) => (
                                                    <option key={e.id} value={String(e.id)}>
                                                        {e.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {form.errors.endorsement_id && (
                                                <p className="mt-1 text-sm text-red-600">{form.errors.endorsement_id}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Note</label>
                                            <textarea
                                                rows={4}
                                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                value={form.data.note}
                                                onChange={(e) => form.setData('note', e.target.value)}
                                            />
                                            {form.errors.note && <p className="mt-1 text-sm text-red-600">{form.errors.note}</p>}
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
                                        <button
                                            type="button"
                                            disabled={!canSubmit || saving}
                                            onClick={() => submit()}
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
