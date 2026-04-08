import ShowPage from '@/Pages/Import/Imports/Show';

export default function Show(props) {
    return <ShowPage {...props} routeName="exports" entityLabel="Export" backLabel="Export Jobs" jobTypeLabel="export" />;
}
