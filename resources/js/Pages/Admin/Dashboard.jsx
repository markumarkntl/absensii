import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';

export default function Dashboard() {
    return (
        <AuthenticatedLayout title="Dashboard Admin">
            <FlashMessage />
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-slate-500 text-sm">INI ADALAH HALAMAN ADMIN SEMENTARA.</p>
            </div>
        </AuthenticatedLayout>
    );
}