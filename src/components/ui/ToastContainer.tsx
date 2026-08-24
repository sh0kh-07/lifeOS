import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start justify-between gap-3 p-3.5 bg-[#151A21] border border-[#242A33] rounded-xl shadow-xl shadow-black/60 animate-in slide-in-from-bottom-5 duration-200 text-left"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
                {toast.type === 'error' && <XCircle size={18} className="text-red-400" />}
                {toast.type === 'warning' && <AlertCircle size={18} className="text-amber-400" />}
                {toast.type === 'info' && <Info size={18} className="text-sky-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#F5F7FA]">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-[#8B93A1] mt-0.5 line-clamp-2">{toast.message}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#8B93A1] hover:text-[#F5F7FA] p-1 rounded-md hover:bg-[#1C232D] transition shrink-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
