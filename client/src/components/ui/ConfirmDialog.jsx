import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({
                                          title, children, confirmLabel = 'Hapus', loading = false, disabled = false, onConfirm, onCancel,
                                      }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm" onClick={onCancel}>
            <div className="fade-up w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
                <h2 className="mt-4 text-lg font-bold text-navy">{title}</h2>
                <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onCancel} disabled={loading}>Batal</Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading} disabled={disabled}>{confirmLabel}</Button>
                </div>
            </div>
        </div>
    );
}