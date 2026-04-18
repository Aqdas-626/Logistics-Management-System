import { usePage, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    BellIcon,
    EnvelopeIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
    ArrowRightIcon,
} from '@/Components/Icons';
import { useSidebar } from '@/Context/SidebarContext';

export default function Header() {
    const user = usePage().props.auth.user;
    const { isOpen, toggleSidebar } = useSidebar();
    const [search, setSearch] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={`fixed top-0 right-0 z-50 border-b border-gray-200 bg-white shadow-md transition-all duration-300 ${isOpen ? 'left-64' : 'left-20'}`}>
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left section - Hamburger */}
                <div className="flex items-center">
                    <button
                        onClick={toggleSidebar}
                        className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
                        title="Toggle Sidebar"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                </div>

                {/* Center section - Search */}
                <div className="hidden flex-1 justify-center px-8 md:flex">
                    <form action={route('search.global')} method="get" className="relative w-full max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="q"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search jobs, customers, branches..."
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm transition-all focus:border-[#20A4AC] focus:bg-white focus:outline-none"
                        />
                    </form>
                </div>

                {/* Right section - Icons & User */}
                <div className="flex items-center gap-6">
                    {/* Notification Icon */}
                    {/* <button className="relative rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100">
                        <BellIcon className="h-6 w-6" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                    </button> */}

                    {/* Message Icon */}
                    {/* <button className="relative rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100">
                        <EnvelopeIcon className="h-6 w-6" />
                        <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-green-500 text-xs text-white flex items-center justify-center">
                            2
                        </span>
                    </button> */}

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200"></div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-gray-100"
                        >
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">Admin User</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#20A4AC] to-purple-600 font-semibold text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    <ArrowRightIcon className="h-4 w-4" />
                                    Logout
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
