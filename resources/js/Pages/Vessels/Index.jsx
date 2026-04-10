import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import VesselModal from '@/Components/Vessel/VesselModal';
import VesselTable from '@/Components/Vessel/VesselTable';
import {
    ArrowRightIcon,
    MagnifyingGlassIcon,
    PlusIcon,
} from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ vessels, countries, shipTypes, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVessel, setSelectedVessel] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleCreate = () => {
        setSelectedVessel(null);
        setIsModalOpen(true);
    };

    const handleEdit = (vessel) => {
        setSelectedVessel(vessel);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        confirmDelete({
            message: 'Are you sure you want to delete this vessel?',
            onConfirm: () => {
            router.delete(route('vessels.destroy', id));
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('vessels.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVessel(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Vessels" />

            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vessels</h1>
                        <p className="mt-2 text-gray-600">Manage vessel registry</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Vessel
                    </button>
                </div>

                <div className="mb-6">
                    <form
                        onSubmit={handleSearch}
                        className="flex max-w-full flex-wrap items-center gap-2"
                    >
                        <div className="relative min-w-0 flex-1 md:max-w-md">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or IMO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch(e)
                                }
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

                <VesselTable
                    vessels={vessels}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {vessels.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{vessels.from}</span> to{' '}
                            <span className="font-medium">{vessels.to}</span> of{' '}
                            <span className="font-medium">{vessels.total}</span> vessels
                        </div>
                        <div className="flex gap-2">
                            {vessels.prev_page_url && (
                                <a
                                    href={vessels.prev_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowRightIcon
                                        className="h-4 w-4 rotate-180"
                                        aria-hidden
                                    />
                                    Previous
                                </a>
                            )}
                            {vessels.next_page_url && (
                                <a
                                    href={vessels.next_page_url}
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

                <VesselModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    vessel={selectedVessel}
                    countries={countries}
                    shipTypes={shipTypes}
                />
            </div>
        </AuthenticatedLayout>
    );
}

