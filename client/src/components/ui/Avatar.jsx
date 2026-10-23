import { useState } from 'react';

const ukuranKelas = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-24 w-24 text-3xl',
};

export default function Avatar({ user, size = 'md', className = '' }) {
    const [gagal, setGagal] = useState(false);
    const inisial = (user.full_name || '?').trim().charAt(0).toUpperCase();

    if (user.avatar_path && !gagal) {
        return (
            <img
                src={`/api/avatars/${user.avatar_path}`}
                alt={user.full_name}
                onError={() => setGagal(true)}
                className={`${ukuranKelas[size]} shrink-0 rounded-full object-cover ${className}`}
            />
        );
    }
    return (
        <span className={`${ukuranKelas[size]} flex shrink-0 items-center justify-center rounded-full bg-navy font-bold text-white ${className}`}>
      {inisial}
    </span>
    );
}