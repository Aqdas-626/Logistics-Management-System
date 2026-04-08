import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import DgSignatoryModal from '@/Components/Job/DgSignatoryModal';
import DgSignatoryTable from '@/Components/Job/DgSignatoryTable';
import { PlusIcon, MagnifyingGlassIcon } from '@/Components/Icons';

export default function Index({ dgSignatories, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDgSignatory, setSelectedDgSignatory] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleCreate = () => {
        setSelectedDgSignatory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dgSignatory) => {
        setSelectedDgSignatory(dgSignatory);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this DG signatory?')) {
            router.delete(route('dg-signatories.destroy', id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dg-signatories.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDgSignatory(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="DG Signatories" />

            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">DG Signatories</h1>
                        <p className="mt-2 text-gray-600">Manage Dangerous Goods signatories</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Signatory
                    </button>
                </div>

                <div className="mb-6">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or certificate..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none md:w-96"
                            />
                        </div>
                    </form>
                </div>

                <DgSignatoryTable
                    dgSignatories={dgSignatories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {dgSignatories.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{dgSignatories.from}</span> to{' '}
                            <span className="font-medium">{dgSignatories.to}</span> of{' '}
                            <span className="font-medium">{dgSignatories.total}</span> signatories
                        </div>
                        <div className="flex gap-2">
                            {dgSignatories.prev_page_url && (
                                <a
                                    href={dgSignatories.prev_page_url}
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </a>
                            )}
                            {dgSignatories.next_page_url && (
                                <a
                                    href={dgSignatories.next_page_url}
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <DgSignatoryModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    dgSignatory={selectedDgSignatory}
                />
            </div>
        </AuthenticatedLayout>
    );
}

