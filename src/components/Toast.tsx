import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none no-print">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-teal-400 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/30 bg-slate-900/95 text-emerald-300',
    error: 'border-rose-500/30 bg-slate-900/95 text-rose-300',
    info: 'border-teal-500/30 bg-slate-900/95 text-teal-300',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md animate-slideUp transition-all ${borderColors[toast.type]}`}
    >
      <div className="flex items-center gap-2.5">
        {icons[toast.type]}
        <p className="text-xs font-semibold text-slate-100 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
