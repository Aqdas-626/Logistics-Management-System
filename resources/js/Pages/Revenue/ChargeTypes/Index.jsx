import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowRightIcon,
    MagnifyingGlassIcon,
    PlusIcon,
} from '@/Components/Icons';
import ChargeTypeModal from '@/Components/Revenue/ChargeTypeModal';
import ChargeTypeTable from '@/Components/Revenue/ChargeTypeTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ chargeTypes, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChargeType, setSelectedChargeType] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleCreate = () => {
        setSelectedChargeType(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedChargeType(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this charge type?')) {
            router.delete(route('charge-types.destroy', id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('charge-types.index'),
            { search: searchTerm },
            { preserveState: true },
        );
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedChargeType(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Charge Types" />

            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Charge Types</h1>
                        <p className="mt-2 text-gray-600">Manage charge type categories</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Charge Type
                    </button>
                </div>

                <div className="mb-6 flex w-full justify-end">
                    <form
                        onSubmit={handleSearch}
                        className="flex max-w-full flex-wrap items-center justify-end gap-2"
                    >
                        <div className="relative min-w-0 w-full max-w-md md:w-96">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 focus:border-[#20A4AC] focus:outline-none"
                            title="Search"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                <ChargeTypeTable
                    chargeTypes={chargeTypes}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {chargeTypes?.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{chargeTypes.from}</span> to{' '}
                            <span className="font-medium">{chargeTypes.to}</span> of{' '}
                            <span className="font-medium">{chargeTypes.total}</span> charge types
                        </div>
                        <div className="flex gap-2">
                            {chargeTypes.prev_page_url && (
                                <a
                                    href={chargeTypes.prev_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowRightIcon
                                        className="h-4 w-4 rotate-180"
                                        aria-hidden
                                    />
                                    Previous
                                </a>
                            )}
                            {chargeTypes.next_page_url && (
                                <a
                                    href={chargeTypes.next_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                    <ArrowRightIcon
                                        className="h-4 w-4"
                                        aria-hidden
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <ChargeTypeModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    chargeType={selectedChargeType}
                />
            </div>
        </AuthenticatedLayout>
    );
}

