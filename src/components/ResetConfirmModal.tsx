import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kosongkan Seluruh Formulir?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Semua isian kegiatan, waktu, pelaksana, hasil AI, dan draf yang tersimpan di perangkat ini akan dihapus dan dikembalikan ke kondisi awal.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Kosongkan Formulir</span>
          </button>
        </div>

      </div>
    </div>
  );
};
