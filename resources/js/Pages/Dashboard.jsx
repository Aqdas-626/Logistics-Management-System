import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import StatCard from '@/Components/Dashboard/StatCard';
import RevenueCard from '@/Components/Dashboard/RevenueCard';
import RecentJobsCard from '@/Components/Dashboard/RecentJobsCard';
import QuickActionsCard from '@/Components/Dashboard/QuickActionsCard';
import RecentActivitiesCard from '@/Components/Dashboard/RecentActivitiesCard';
import {
    BriefcaseIcon,
    UserGroupIcon,
    TruckIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@/Components/Icons';

const defaultRevenueStats = {
    today: { total: 0, period: '' },
    week: { total: 0, period: '' },
    month: { total: 0, period: '' },
};

const defaultStatCounts = {
    totalJobs: 0,
    activeDrivers: 0,
    pendingDispatches: 0,
    deliveriesToday: 0,
    completedJobs: 0,
    openInvoices: 0,
};

export default function Dashboard() {
    const {
        revenueStats: rawRevenue,
        statCounts: rawStatCounts,
        recentActivities = [],
        recentJobs = [],
    } = usePage().props;
    const revenueStats = {
        today: { ...defaultRevenueStats.today, ...rawRevenue?.today },
        week: { ...defaultRevenueStats.week, ...rawRevenue?.week },
        month: { ...defaultRevenueStats.month, ...rawRevenue?.month },
    };
    const statCounts = { ...defaultStatCounts, ...rawStatCounts };
    const queueHref = route('job-queues.index');

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div>
                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">Welcome back! Here's what's happening in your logistics business today.</p>
                </div>

                {/* Stats Grid - 3x2 */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        icon={BriefcaseIcon}
                        label="Total Jobs"
                        value={String(statCounts.totalJobs)}
                        color="blue"
                    />
                    <StatCard
                        icon={UserGroupIcon}
                        label="Active Drivers"
                        value={String(statCounts.activeDrivers)}
                        color="green"
                    />
                    <StatCard
                        icon={TruckIcon}
                        label="Pending Dispatches"
                        value={String(statCounts.pendingDispatches)}
                        color="yellow"
                    />
                    <StatCard
                        icon={CurrencyDollarIcon}
                        label="Today's Deliveries"
                        value={String(statCounts.deliveriesToday)}
                        color="purple"
                    />
                    <StatCard
                        icon={CheckCircleIcon}
                        label="Completed Jobs"
                        value={String(statCounts.completedJobs)}
                        color="pink"
                    />
                    <StatCard
                        icon={ClockIcon}
                        label="Open Invoices"
                        value={String(statCounts.openInvoices)}
                        color="blue"
                    />
                </div>

                {/* Revenue Section - 3 columns */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <RevenueCard
                        title="Revenue Today"
                        amount={revenueStats.today.total}
                        period={revenueStats.today.period}
                        icon={CurrencyDollarIcon}
                        color="green"
                        viewHref={queueHref}
                    />
                    <RevenueCard
                        title="Revenue This Week"
                        amount={revenueStats.week.total}
                        period={revenueStats.week.period}
                        icon={ClockIcon}
                        color="blue"
                        viewHref={queueHref}
                    />
                    <RevenueCard
                        title="Revenue This Month"
                        amount={revenueStats.month.total}
                        period={revenueStats.month.period}
                        icon={CheckCircleIcon}
                        color="orange"
                        viewHref={queueHref}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left side - Recent Jobs (takes 2 columns) */}
                    <div className="lg:col-span-2">
                        <RecentJobsCard jobs={recentJobs} />
                    </div>

                    {/* Right side - Quick Actions */}
                    <div>
                        <QuickActionsCard />
                    </div>
                </div>

                {/* Activities Section */}
                <div className="mt-8">
                    <RecentActivitiesCard activities={recentActivities} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
