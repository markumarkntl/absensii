import { useEffect, useRef } from 'react';

/**
 * Hook untuk listen Laravel Echo private channel.
 *
 * @param {string} channel  - nama channel, contoh: 'admin.attendance'
 * @param {string} event    - nama event, contoh: 'attendance.checked-in'
 * @param {function} callback - fungsi yang dipanggil saat event diterima
 */
export default function useEcho(channel, event, callback) {
    const callbackRef = useRef(callback);

    // Selalu pakai callback terbaru tanpa re-subscribe
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!window.Echo) return;

        const ch = window.Echo.private(channel);
        ch.listen(`.${event}`, (payload) => {
            callbackRef.current(payload);
        });

        return () => {
            window.Echo.leave(`private-${channel}`);
        };
    }, [channel, event]);
}