import { useEffect, useState } from 'react';

/**
 * Satu item toast notifikasi real-time.
 */
function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 5000);
        return () => clearTimeout(timer);
    }, [toast.id]);

    const colors = {
        'check-in':  'bg-green-600',
        'check-out': 'bg-blue-600',
        'izin':      'bg-yellow-500',
        'terlambat': 'bg-orange-500',
        'approved':  'bg-green-600',
        'rejected':  'bg-red-600',
    };

    const bgColor = colors[toast.type] ?? 'bg-gray-700';

    return (
        <div className={`flex items-start gap-3 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg min-w-72 max-w-sm`}>
            <div className="flex-1">
                <p className="font-semibold text-sm">{toast.title}</p>
                <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-white opacity-70 hover:opacity-100 text-lg leading-none mt-0.5"
            >
                ×
            </button>
        </div>
    );
}

/**
 * Container toast — taruh di pojok kanan bawah.
 * Gunakan bersama useToast().
 */
export default function RealtimeToast({ toasts, onRemove }) {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}