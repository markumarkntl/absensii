/**
 * Badge angka kecil merah untuk sidebar menu.
 * Contoh: <RealtimeBadge count={pendingCount} />
 */
export default function RealtimeBadge({ count }) {
    if (!count || count < 1) return null;

    return (
        <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold leading-none">
            {count > 99 ? '99+' : count}
        </span>
    );
}