import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import {
    ArrowRightIcon,
    CheckIcon,
    EyeIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ driver, documents }) {
    const { flash } = usePage().props;
    const form = useForm({
        doc_type: '',
        file: null,
        link: '',
    });
    const editForm = useForm({
        id: null,
        doc_type: '',
        file: null,
        current_file_path: '',
        link: '',
    });

    const startEdit = (document) => {
        editForm.setData({
            id: document.id,
            doc_type: document.doc_type || '',
            file: null,
            current_file_path: document.file_path || '',
            link: document.link || '',
        });
        editForm.setDefaults({
            doc_type: document.doc_type || '',
            file: null,
            current_file_path: document.file_path || '',
            link: document.link || '',
        });
    };

    const cancelEdit = () => {
        editForm.reset();
    };

    const submitCreate = (e) => {
        e.preventDefault();
        form.post(route('drivers.documents.store', driver.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        if (!editForm.data.id) return;
        editForm.put(route('drivers.documents.update', [driver.id, editForm.data.id]), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => cancelEdit(),
        });
    };

    const destroy = (documentId) => {
        confirmDelete({
            message: 'Delete this document?',
            onConfirm: () => {
            router.delete(route('drivers.documents.destroy', [driver.id, documentId]), {
                            preserveScroll: true,
                        });
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Driver Documents
                    </h2>
                    <Link href={route('drivers.index')}>
                        <SecondaryButton type="button" className="gap-2">
                            <ArrowRightIcon
                                className="h-4 w-4 rotate-180"
                                aria-hidden
                            />
                            Back to Drivers
                        </SecondaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Driver Documents" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-md bg-green-50 p-4 text-green-800">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <div className="mb-4">
                            <div className="text-lg font-semibold text-gray-900">
                                {driver.name}
                            </div>
                            <div className="text-sm text-gray-600">
                                Code: {driver.driver_code}
                            </div>
                        </div>

                        <form onSubmit={submitCreate} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <InputLabel htmlFor="doc_type" value="Document Type" />
                                <TextInput
                                    id="doc_type"
                                    className="mt-1 block w-full"
                                    value={form.data.doc_type}
                                    onChange={(e) => form.setData('doc_type', e.target.value)}
                                />
                                <InputError message={form.errors.doc_type} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="file" value="File (Image/PDF/Word)" />
                                <input
                                    id="file"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:me-3 file:rounded file:border-0 file:bg-[#20A4AC]/10 file:px-3 file:py-1.5 file:text-[#178089]"
                                    onChange={(e) => form.setData('file', e.target.files[0] || null)}
                                />
                                <InputError message={form.errors.file} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="link" value="Document Link" />
                                <TextInput
                                    id="link"
                                    className="mt-1 block w-full"
                                    value={form.data.link}
                                    onChange={(e) => form.setData('link', e.target.value)}
                                    placeholder="https://..."
                                />
                                <InputError message={form.errors.link} className="mt-2" />
                            </div>
                            <div className="flex items-end">
                                <PrimaryButton
                                    disabled={form.processing}
                                    className="gap-2"
                                >
                                    <PlusIcon className="h-4 w-4" aria-hidden />
                                    Add Document
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {editForm.data.id && (
                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Edit Document</h3>
                            <form onSubmit={submitUpdate} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <InputLabel htmlFor="edit_doc_type" value="Document Type" />
                                    <TextInput
                                        id="edit_doc_type"
                                        className="mt-1 block w-full"
                                        value={editForm.data.doc_type || ''}
                                        onChange={(e) =>
                                            editForm.setData('doc_type', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={editForm.errors.doc_type}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="edit_file" value="Replace File (optional)" />
                                    <input
                                        id="edit_file"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:me-3 file:rounded file:border-0 file:bg-[#20A4AC]/10 file:px-3 file:py-1.5 file:text-[#178089]"
                                        onChange={(e) =>
                                            editForm.setData('file', e.target.files[0] || null)
                                        }
                                    />
                                    {editForm.data.current_file_path && (
                                        <div className="mt-2 text-xs text-gray-600">
                                            Current: {editForm.data.current_file_path}
                                        </div>
                                    )}
                                    <InputError
                                        message={editForm.errors.file}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="edit_link" value="Document Link" />
                                    <TextInput
                                        id="edit_link"
                                        className="mt-1 block w-full"
                                        value={editForm.data.link || ''}
                                        onChange={(e) => editForm.setData('link', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <InputError message={editForm.errors.link} className="mt-2" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <PrimaryButton
                                        disabled={editForm.processing}
                                        className="gap-2"
                                    >
                                        <CheckIcon
                                            className="h-4 w-4"
                                            aria-hidden
                                        />
                                        Update
                                    </PrimaryButton>
                                    <SecondaryButton
                                        type="button"
                                        className="gap-2"
                                        onClick={cancelEdit}
                                    >
                                        <XMarkIcon
                                            className="h-4 w-4 text-gray-600"
                                            aria-hidden
                                        />
                                        Cancel
                                    </SecondaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto p-6">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Type
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            File
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Link
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {documents.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-3 py-8 text-center text-gray-500"
                                            >
                                                No documents found.
                                            </td>
                                        </tr>
                                    )}
                                    {documents.map((document) => (
                                        <tr key={document.id}>
                                            <td className="px-3 py-2 text-gray-700">
                                                {document.doc_type}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                <a
                                                    href={`/storage/${document.file_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-[#20A4AC] hover:text-[#0d4f54]"
                                                >
                                                    <EyeIcon
                                                        className="h-4 w-4 shrink-0"
                                                        aria-hidden
                                                    />
                                                    View File
                                                </a>
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {document.link ? (
                                                    <a
                                                        href={document.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-[#20A4AC] hover:text-[#0d4f54]"
                                                    >
                                                        <ArrowRightIcon
                                                            className="h-4 w-4 shrink-0"
                                                            aria-hidden
                                                        />
                                                        Open Link
                                                    </a>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="inline-flex items-center justify-end gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEdit(document)
                                                        }
                                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                                        title="Edit"
                                                        aria-label="Edit"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                        title="Delete"
                                                        aria-label="Delete"
                                                        onClick={() =>
                                                            destroy(document.id)
                                                        }
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

