import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    HomeIcon,
    SparklesIcon,
    TruckIcon,
    UserGroupIcon,
    CogIcon,
    ChevronDownIcon,
} from '@/Components/Icons';
import { useSidebar } from '@/Context/SidebarContext';

export default function Sidebar() {
    const { url } = usePage();
    const { isOpen } = useSidebar();
    const [expandedMenu, setExpandedMenu] = useState(null);

    const menuItems = [
        {
            icon: HomeIcon,
            label: 'Dashboard',
            href: route('dashboard'),
            children: null,
        },
        {
            icon: UserGroupIcon,
            label: 'Customers',
            href: route('customers.index'),
            children: null,
        },
        {
            icon: SparklesIcon,
            label: 'Countries',
            href: route('countries.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Companies',
            href: route('companies.index'),
            children: null,
        },
        {
            icon: UserGroupIcon,
            label: 'Branches',
            href: route('branches.index'),
            children: null,
        },
        {
            icon: CogIcon,
            label: 'Departments',
            href: route('departments.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Locations',
            href: route('locations.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Shippings',
            href: route('shippings.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Ship Types',
            href: route('ship_types.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Vessels',
            href: route('vessels.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Drivers',
            href: route('drivers.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Vehicle Types',
            href: route('vehicle-types.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Vehicles',
            href: route('vehicles.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Driver Assignments',
            href: route('driver-vehicle-assignments.index'),
            children: null,
        },
        {
            icon: CogIcon,
            label: 'Job Settings',
            href: '#',
            children: [
                { label: 'Door Types', href: route('door-types.index') },
                { label: 'Lift Types', href: route('lift-types.index') },
                { label: 'Location Types', href: route('location-types.index') },
                { label: 'ISO Codes', href: route('iso-codes.index') },
                { label: 'Package Types', href: route('package-types.index') },
                { label: 'DG Types', href: route('dg-types.index') },
{ label: 'DG Signatories', href: route('dg-signatories.index') },
                { label: 'Endorsements', href: route('endorsements.index') },
                { label: 'Job Packages', href: route('job-packages.index') },
                { label: 'Notification Types', href: route('notification-types.index') },
                { label: 'Job Tracking Notifications', href: route('job-tracking-notifications.index') },
                { label: 'Job Additional Information', href: route('job-additional-information.index') },
                { label: 'Job Queue', href: route('job-queues.index') },
                { label: 'Job Bookings', href: route('job-bookings.index') },
                { label: 'Import Jobs', href: route('imports.index') },
                { label: 'Export Jobs', href: route('exports.index') },
                { label: 'Cart Jobs', href: route('carts.index') },
                { label: 'Swing Jobs', href: route('swings.index') },
            ],
        },
        {
            icon: CogIcon,
            label: 'RBAC',
            href: '#',
            children: [
                { label: 'Roles', href: route('roles.index') },
                { label: 'Permissions', href: route('permissions.index') },
                { label: 'User Roles', href: route('user-roles.index') },
            ],
        },
    ];

    const isActive = (href) => {
        if (href === '#') return false;
        return url.startsWith(href);
    };

    const isChildActive = (children) => {
        if (!children) return false;
        return children.some((child) => url.startsWith(child.href));
    };

    const toggleExpand = (index) => {
        setExpandedMenu(expandedMenu === index ? null : index);
    };

    return (
        <aside className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-900 to-slate-800 pt-20 shadow-2xl transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const hasChildren = item.children && item.children.length > 0;
                    const isItemActive = hasChildren ? isChildActive(item.children) : isActive(item.href);

                    return (
                        <div key={index}>
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpand(index)}
                                    className={`group relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                        isItemActive
                                            ? 'bg-[#20A4AC] text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                                    } ${isOpen ? 'justify-start' : 'justify-center'}`}
                                    title={isOpen ? '' : item.label}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {isOpen && (
                                        <>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronDownIcon
                                                className={`h-4 w-4 transition-transform duration-200 ${expandedMenu === index ? 'rotate-180' : ''}`}
                                            />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`group relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                        isItemActive
                                            ? 'bg-[#20A4AC] text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                                    } ${isOpen ? 'justify-start' : 'justify-center'}`}
                                    title={isOpen ? '' : item.label}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {isOpen && <span className="flex-1 text-left">{item.label}</span>}
                                </Link>
                            )}

                            {hasChildren && expandedMenu === index && isOpen && (
                                <div className="ml-2 mt-2 space-y-1 border-l-2 border-slate-700 pl-2">
                                    {item.children.map((child, childIndex) => (
                                        <Link
                                            key={childIndex}
                                            href={child.href}
                                            className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                                                url.startsWith(child.href)
                                                    ? 'bg-slate-600 text-white'
                                                    : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
