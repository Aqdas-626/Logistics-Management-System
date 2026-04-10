import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import DgTypeModal from '@/Components/Job/DgTypeModal';
import DgTypeTable from '@/Components/Job/DgTypeTable';
import { PlusIcon, MagnifyingGlassIcon } from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ dgTypes, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDgType, setSelectedDgType] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleCreate = () => {
        setSelectedDgType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dgType) => {
        setSelectedDgType(dgType);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        confirmDelete({
            message: 'Are you sure you want to delete this DG type?',
            onConfirm: () => {
            router.delete(route('dg-types.destroy', id));
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('dg-types.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDgType(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="DG Types" />

            <div>
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">DG Types</h1>
                        <p className="mt-2 text-gray-600">Manage Dangerous Goods types</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New DG Type
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none md:w-96"
                            />
                        </div>
                    </form>
                </div>

                {/* Table */}
                <DgTypeTable
                    dgTypes={dgTypes}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {/* Pagination */}
                {dgTypes.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{dgTypes.from}</span> to{' '}
                            <span className="font-medium">{dgTypes.to}</span> of{' '}
                            <span className="font-medium">{dgTypes.total}</span> DG types
                        </div>
                        <div className="flex gap-2">
                            {dgTypes.prev_page_url && (
                                <a
                                    href={dgTypes.prev_page_url}
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </a>
                            )}
                            {dgTypes.next_page_url && (
                                <a
                                    href={dgTypes.next_page_url}
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal */}
                <DgTypeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    dgType={selectedDgType}
                />
            </div>
        </AuthenticatedLayout>
    );
}

