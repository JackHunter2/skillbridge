export const ACCENTS = [
    { key: 'biru', label: 'Biru', warna: '#1e6fd9' },
    { key: 'toska', label: 'Toska', warna: '#0d9488' },
    { key: 'ungu', label: 'Ungu', warna: '#7c3aed' },
    { key: 'oranye', label: 'Oranye', warna: '#d9480f' },
    { key: 'mawar', label: 'Mawar', warna: '#e11d48' },
];

const KUNCI = 'accent';

export function applyAccent(key) {
    if (!key || key === 'biru') delete document.documentElement.dataset.accent;
    else document.documentElement.dataset.accent = key;
}

export function getAccent() {
    try {
        return localStorage.getItem(KUNCI) || 'biru';
    } catch {
        return 'biru';
    }
}

export function setAccent(key) {
    try {
        localStorage.setItem(KUNCI, key);
    } catch {
        /* penyimpanan browser tidak tersedia, aksen tetap berlaku sampai halaman ditutup */
    }
    applyAccent(key);
}