import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';

export default function Dashboard() {
    return (
        <AuthenticatedLayout title="Dashboard Admin">
            <FlashMessage />
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-slate-500 text-sm">Panel Admin — fitur lengkap hadir di langkah berikutnya.</p>
            </div>
        </AuthenticatedLayout>
    );
}