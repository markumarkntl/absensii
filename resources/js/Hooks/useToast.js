import { useCallback, useState } from 'react';

let counter = 0;

/**
 * Hook untuk manage daftar toast notifikasi
 */
export default function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type, title, message }) => {
        const id = ++counter;
        setToasts((prev) => [...prev, { id, type, title, message }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
}