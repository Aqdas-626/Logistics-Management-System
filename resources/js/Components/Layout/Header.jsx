import { usePage, Link } from '@inertiajs/react';
import {
    BellIcon,
    EnvelopeIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
} from '@/Components/Icons';
import { useSidebar } from '@/Context/SidebarContext';

export default function Header() {
    const user = usePage().props.auth.user;
    const { toggleSidebar } = useSidebar();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white shadow-md">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left section - Hamburger & Logo/Brand */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
                        title="Toggle Sidebar"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#20A4AC] to-purple-600">
                            <span className="text-lg font-bold text-white">📦</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Logistic ERP</h1>
                            <p className="text-xs text-gray-500">Management System</p>
                        </div>
                    </div>
                </div>

                {/* Center section - Search */}
                <div className="hidden flex-1 justify-center px-8 md:flex">
                    <div className="relative w-full max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs, customers..."
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm transition-all focus:border-[#20A4AC] focus:bg-white focus:outline-none"
                        />
                    </div>
                </div>

                {/* Right section - Icons & User */}
                <div className="flex items-center gap-6">
                    {/* Notification Icon */}
                    <button className="relative rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100">
                        <BellIcon className="h-6 w-6" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>

                    {/* Message Icon */}
                    <button className="relative rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100">
                        <EnvelopeIcon className="h-6 w-6" />
                        <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-green-500 text-xs text-white flex items-center justify-center">
                            2
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200"></div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">Admin User</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#20A4AC] to-purple-600 text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
