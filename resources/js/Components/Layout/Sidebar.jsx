import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    BriefcaseIcon,
    HomeIcon,
    SparklesIcon,
    TruckIcon,
    UserGroupIcon,
    CogIcon,
    ChevronDownIcon,
    WrenchScrewdriverIcon,
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
            icon: TruckIcon,
            label: 'Companies',
            href: route('companies.index'),
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
            icon: UserGroupIcon,
            label: 'Branches',
            href: route('branches.index'),
            children: null,
        },
        // {
        //     icon: CogIcon,
        //     label: 'Departments',
        //     href: route('departments.index'),
        //     children: null,
        // },
        {
            icon: UserGroupIcon,
            label: 'Driver',
            href: '#',
            children: [
                { label: 'Driver', href: route('drivers.index') },
                { label: 'Assignment', href: route('driver-vehicle-assignments.index') },
            ],
        },
        {
            icon: TruckIcon,
            label: 'Vehicle',
            href: '#',
            children: [
                { label: 'Type', href: route('vehicle-types.index') },
                { label: 'Vendor', href: route('vehicle-vendors.index') },
                { label: 'Vehicles', href: route('vehicles.index') },
            ],
        },
        {
            icon: TruckIcon,
            label: 'Courier / Transport',
            href: '#',
            children: [{ label: 'Job Booking', href: route('job-bookings.index') }],
        },
        {
            icon: BriefcaseIcon,
            label: 'Operations',
            href: '#',
            children: [
                { label: 'Job Queue', href: route('job-queues.index') },
                { label: 'Vessel', href: route('vessels.index') },
                { label: 'Location', href: route('locations.index') },
            ],
        },
        {
            icon: BriefcaseIcon,
            label: 'Container',
            href: '#',
            children: [
                { label: 'Import', href: route('imports.index') },
                { label: 'Export', href: route('exports.index') },
                { label: 'Carts', href: route('carts.index') },
                { label: 'Swings', href: route('swings.index') },
            ],
        },       
        {
            icon: TruckIcon,
            label: 'Fuel Management',
            href: '#',
            children: [
                { label: 'Vendor', href: route('fuel-vendors.index') },
                { label: 'Fuel Tank', href: route('fuel-tanks.index') },
                { label: 'Transaction', href: route('fuel-tank-transactions.index') },
                { label: 'Fuel', href: route('fuels.index') },
            ],
        },
        {
            icon: WrenchScrewdriverIcon,
            label: 'Maintenance',
            href: '#',
            children: [
                { label: 'Vendor', href: route('maintenance-vendors.index') },
                { label: 'Mechanic', href: route('mechanic-management.index') },
                { label: 'Tyre Management', href: route('tyre-management.index') },
                { label: 'Incident Report', href: route('incident-reports.index') },
                { label: 'Part Stock', href: route('part-stocks.index') },
                { label: 'Maintenance', href: route('maintenance-management.index') },
                { label: 'Scheduler', href: route('pms-scheduler.index') },
                { label: 'Cost Analytics', href: route('maintenance-analytics.index') },
            ],
        },
        {
            icon: BriefcaseIcon,
            label: 'Expense',
            href: '#',
            children: [
                { label: 'Expense Category', href: route('expense-categories.index') },
                { label: 'Expenses', href: route('expenses.index') },
            ],
        },
        {
            icon: TruckIcon,
            label: 'Route Plans',
            href: route('route-plans.index'),
            children: null,
        },
       
        
        {
            icon: CogIcon,
            label: 'Type',
            href: '#',
            children: [
                { label: 'Door Type', href: route('door-types.index') },
                { label: 'Lift Type', href: route('lift-types.index') },
                { label: 'Location type', href: route('location-types.index') },
                { label: 'Ship Type', href: route('ship_types.index') },
                { label: 'Package Type', href: route('package-types.index') },
                { label: 'DG Type', href: route('dg-types.index') },
                { label: 'DG Signatories', href: route('dg-signatories.index') },
                { label: 'Endorsement', href: route('endorsements.index') },
                { label: 'ISO Codes', href: route('iso-codes.index') },
                { label: 'Notification Type', href: route('notification-types.index') },
            ],
        },
        {
            icon: SparklesIcon,
            label: 'History',
            href: '#',
            children: [
                { label: 'Job Status History', href: route('job-status-histories.index') },
                { label: 'Job Package', href: route('job-packages.index') },
                { label: 'Job Information', href: route('job-additional-information.index') },
                { label: 'Job Tracking', href: route('job-tracking-notifications.index') },
            ],
        },
        {
            icon: SparklesIcon,
            label: 'Reports',
            href: route('reports.index'),
            children: null,
        },
        {
            icon: TruckIcon,
            label: 'Shippings',
            href: route('shippings.index'),
            children: null,
        },
        {
            icon: UserGroupIcon,
            label: 'User Management',
            href: '#',
            children: [
                { label: 'Role', href: route('roles.index') },
                { label: 'User', href: route('user-roles.index') },
            ],
        },
        {
            icon: CogIcon,
            label: 'Permissions',
            href: route('permissions.index'),
            children: null,
        },
    ];

    const pathMatchesHref = (pathname, href) => {
        if (!href || href === '#') return false;
        const path = pathname.split('?')[0];
        let base = href;
        if (typeof href === 'string' && href.startsWith('http')) {
            try {
                base = new URL(href).pathname;
            } catch {
                return false;
            }
        }
        if (base === '/locations') {
            return path === '/locations' || path.startsWith('/locations/');
        }
        return path.startsWith(base);
    };

    const isActive = (href) => {
        if (href === '#') return false;
        return url.startsWith(href);
    };

    const isChildActive = (children) => {
        if (!children) return false;
        return children.some((child) => pathMatchesHref(url, child.href));
    };

    const toggleExpand = (index) => {
        setExpandedMenu(expandedMenu === index ? null : index);
    };

    useEffect(() => {
        if (
            url.startsWith('/drivers') ||
            url.startsWith('/driver-vehicle-assignments')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'Driver');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (
            url.startsWith('/vehicle-types') ||
            url.startsWith('/vehicle-vendors') ||
            url.startsWith('/vehicles')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'Vehicle');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (
            url.startsWith('/fuel-vendors') ||
            url.startsWith('/fuel-tanks') ||
            url.startsWith('/fuel-tank-transactions') ||
            url.startsWith('/fuels')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'Fuel Management');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (
            url.startsWith('/maintenance-vendors') ||
            url.startsWith('/mechanic-management') ||
            url.startsWith('/tyre-management') ||
            url.startsWith('/incident-reports') ||
            url.startsWith('/pms-scheduler') ||
            url.startsWith('/part-stocks') ||
            url.startsWith('/maintenance-management') ||
            url.startsWith('/maintenance-analytics')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'Maintenance');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (
            url.startsWith('/expense-categories') ||
            url === '/expenses' ||
            url.startsWith('/expenses/')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'Expense');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (url.startsWith('/job-bookings')) {
            const idx = menuItems.findIndex((item) => item.label === 'Courier / Transport');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (
            url.startsWith('/job-queues') ||
            url.startsWith('/vessels') ||
            url === '/locations' ||
            url.startsWith('/locations/')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'Operations');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (
            url.startsWith('/imports') ||
            url.startsWith('/exports') ||
            url.startsWith('/carts') ||
            url.startsWith('/swings')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'Container');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (
            url.startsWith('/job-status-histories') ||
            url.startsWith('/job-packages') ||
            url.startsWith('/job-additional-information') ||
            url.startsWith('/job-tracking-notifications')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'History');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (url.startsWith('/roles') || url.startsWith('/user-roles')) {
            const idx = menuItems.findIndex((item) => item.label === 'User Management');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        } else if (
            url.startsWith('/door-types') ||
            url.startsWith('/lift-types') ||
            url.startsWith('/location-types') ||
            url.startsWith('/ship_types') ||
            url.startsWith('/package-types') ||
            url.startsWith('/dg-types') ||
            url.startsWith('/dg-signatories') ||
            url.startsWith('/endorsements') ||
            url.startsWith('/iso-codes') ||
            url.startsWith('/notification-types')
        ) {
            const idx = menuItems.findIndex((item) => item.label === 'Type');
            if (idx >= 0) {
                setExpandedMenu(idx);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- menuItems is static navigation config
    }, [url]);

    return (
        <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className={`flex items-center gap-3 border-b border-gray-200 px-4 py-4 ${isOpen ? 'justify-start' : 'justify-center'}`}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <img
                        src="/ralo-logistic-icon.png"
                        alt="Ralo Logistic"
                        className="h-10 w-10 object-contain"
                        draggable={false}
                    />
                </div>
                {isOpen && (
                    <div>
                        <h1 className="text-base font-bold text-gray-800">Logistic ERP</h1>
                        <p className="text-[11px] text-gray-500">Management System</p>
                    </div>
                )}
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const hasChildren = item.children && item.children.length > 0;
                    const isItemActive = hasChildren ? isChildActive(item.children) : isActive(item.href);

                    return (
                        <div key={index}>
                            {index === 2 && (
                                <div
                                    className={`px-2 pb-1 pt-2 text-xs font-semibold tracking-wide text-gray-400 ${
                                        isOpen ? 'text-left' : 'text-center'
                                    }`}
                                >
                                    {isOpen ? '---- Master Data ---' : '---'}
                                </div>
                            )}
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpand(index)}
                                    className={`group relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                        isItemActive
                                            ? 'bg-[#0a98ff] text-white shadow-sm'
                                            : 'text-slate-700 hover:bg-[#20A4AC]/15 hover:text-[#20A4AC]'
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
                                            ? 'bg-[#0a98ff] text-white shadow-sm'
                                            : 'text-slate-700 hover:bg-[#20A4AC]/15 hover:text-[#20A4AC]'
                                    } ${isOpen ? 'justify-start' : 'justify-center'}`}
                                    title={isOpen ? '' : item.label}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {isOpen && <span className="flex-1 text-left">{item.label}</span>}
                                </Link>
                            )}

                            {hasChildren && expandedMenu === index && isOpen && (
                                <div className="ml-2 mt-2 space-y-1 border-l-2 border-blue-100 pl-2">
                                    {item.children.map((child, childIndex) => (
                                        <Link
                                            key={childIndex}
                                            href={child.href}
                                            className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                                                url.startsWith(child.href)
                                                    ? 'bg-blue-50 font-semibold text-[#0a98ff]'
                                                    : 'text-slate-600 hover:bg-[#20A4AC]/15 hover:text-[#20A4AC]'
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
