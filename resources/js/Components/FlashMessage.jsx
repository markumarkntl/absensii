import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || (!flash?.success && !flash?.error)) return null;

    const isSuccess = !!flash.success;

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3
                         rounded-xl shadow-lg border max-w-sm animate-in slide-in-from-top-2
                         ${isSuccess
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'}`}>
            {isSuccess
                ? <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                : <XCircle    size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            }
            <p className="text-sm font-medium flex-1">
                {flash.success ?? flash.error}
            </p>
            <button onClick={() => setVisible(false)}
                    className="opacity-60 hover:opacity-100">
                <X size={14} />
            </button>
        </div>
    );
}