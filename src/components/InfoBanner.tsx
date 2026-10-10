import React, { useState } from 'react';
import { ThemeConfig } from '../utils/theme';
import { ShieldCheck, Info, X, ChevronRight } from 'lucide-react';

interface InfoBannerProps {
  theme: ThemeConfig;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ theme }) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed) return null;

  return (
    <div className={`rounded-xl border p-4 ${theme.accentBg} ${theme.accentBorder} text-slate-800 transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/80 border border-slate-200/60 shrink-0 shadow-xs">
            <ShieldCheck className={`w-5 h-5 ${theme.accentText}`} />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Alur Kerja Otomatis Laporan P2M</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Cukup isi nama kegiatan, hari/tanggal, dan poin-poin inti hasil di lapangan. Gemini AI akan
              secara <strong>otomatis (tanpa tombol khusus)</strong> merangkum dan mengembangkan uraian resmi kedinasan
              maksimal 2–3 paragraf begitu Anda berhenti mengetik.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11.5px] text-slate-500">
              <span className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-emerald-600" />
                Format asterisks (*) siap tempel WhatsApp
              </span>
              <span className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-emerald-600" />
                Draf otomatis tersimpan di peramban lokal
              </span>
              <span className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-emerald-600" />
                Fakta asli dipertahankan tanpa manipulasi AI
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
          title="Tutup informasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
