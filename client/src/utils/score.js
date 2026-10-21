export function scoreTone(n) {
    if (n >= 75) return { label: 'Kuat', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (n >= 50) return { label: 'Cukup', text: 'text-amber-700', bg: 'bg-amber-50' };
    return { label: 'Perlu diperbaiki', text: 'text-red-700', bg: 'bg-red-50' };
}