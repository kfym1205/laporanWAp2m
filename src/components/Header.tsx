import React from 'react';
import { ThemeType } from '../types/report';
import { THEMES } from '../utils/theme';
import { Palette, Sparkles, HardDrive, Shield } from 'lucide-react';

interface HeaderProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  onLoadSample: () => void;
  isDraftSaved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onThemeChange,
  onLoadSample,
  isDraftSaved,
}) => {
  const theme = THEMES[currentTheme];

  return (
    <header className={`bg-gradient-to-r ${theme.headerGradient} text-white shadow-lg transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Shield className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Laporan Harian P2M
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-white tracking-wide uppercase">
                  Seksi Pencegahan & Dayamas
                </span>
              </div>
              <p className="text-sm font-medium text-white/80 mt-0.5 flex items-center gap-1.5">
                <span>Badan Narkotika Nasional Kabupaten Gorontalo</span>
              </p>
            </div>
          </div>

          {/* Action controls & Theme switcher */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            
            {/* Quick sample button */}
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-medium border border-white/20 transition shadow-sm cursor-pointer"
              title="Isi formulir dengan contoh data kegiatan lapangan resmi"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Muat Contoh Kegiatan</span>
            </button>

            {/* Theme switcher */}
            <div className="flex items-center bg-black/25 rounded-lg p-1 border border-white/15">
              <Palette className="w-3.5 h-3.5 text-white/70 ml-1.5 mr-1 hidden sm:inline" />
              <div className="flex items-center space-x-1">
                {(['burgundy', 'sage', 'blue'] as ThemeType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onThemeChange(t)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer capitalize ${
                      currentTheme === t
                        ? 'bg-white text-slate-900 shadow-sm font-semibold'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {t === 'burgundy' ? 'Burgundy' : t === 'sage' ? 'Sage' : 'Biru'}
                  </button>
                ))}
              </div>
            </div>

            {/* Draft status indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isDraftSaved
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
                  : 'bg-white/10 text-white/70 border-white/15'
              }`}
              title="Data formulir otomatis tersimpan di peramban (localStorage) perangkat ini."
            >
              <HardDrive className="w-3 h-3 text-emerald-300 shrink-0" />
              <span className="hidden sm:inline">Draf tersimpan di perangkat ini</span>
              <span className="sm:hidden">Draf tersimpan</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
