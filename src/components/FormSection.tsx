import React, { useState } from 'react';
import { FormDataState, SumberDanaType } from '../types/report';
import { ThemeConfig } from '../utils/theme';
import { PelaksanaInput } from './PelaksanaInput';
import { formatIndonesianDate, getTodayIsoDate } from '../utils/formatDate';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Users,
  Wallet,
  Sparkles,
  Info,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface FormSectionProps {
  formData: FormDataState;
  onChange: (updated: Partial<FormDataState>) => void;
  onResetClick: () => void;
  theme: ThemeConfig;
  aiStatus: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  formData,
  onChange,
  onResetClick,
  theme,
  aiStatus,
}) => {
  const [datePickerVal, setDatePickerVal] = useState<string>('');

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDatePickerVal(val);
    if (val) {
      const formatted = formatIndonesianDate(val);
      onChange({ hariTanggal: formatted });
    }
  };

  const handleSetToday = () => {
    const todayIso = getTodayIsoDate();
    setDatePickerVal(todayIso);
    onChange({ hariTanggal: formatIndonesianDate(todayIso) });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      
      {/* Top Banner inside form */}
      <div className={`px-5 py-4 border-b ${theme.cardHeaderBg} flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <FileText className={`w-5 h-5 ${theme.accentText}`} />
          <h2 className="text-base font-bold text-slate-800">
            Formulir Isian Laporan Kegiatan
          </h2>
        </div>
        <button
          type="button"
          onClick={onResetClick}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-750 hover:bg-rose-50 rounded-lg transition border border-rose-200 cursor-pointer"
          title="Kosongkan seluruh isian formulir"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kosongkan Formulir</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-6">

        {/* ================= BAGIAN A. KEGIATAN ================= */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className={`w-6 h-6 rounded-md ${theme.accentBg} ${theme.accentText} inline-flex items-center justify-center text-xs font-bold`}>
                A
              </span>
              <span>KEGIATAN</span>
              <span className="text-rose-500 font-semibold text-xs">*wajib</span>
            </label>
            <span className="text-xs text-slate-400">
              {formData.namaKegiatan.length}/300
            </span>
          </div>

          <textarea
            rows={2}
            value={formData.namaKegiatan}
            onChange={(e) => onChange({ namaKegiatan: e.target.value })}
            placeholder="Contoh: Rapat Koordinasi Program Ketahanan Remaja Anti Narkoba di Lingkungan Pendidikan"
            className={`w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl shadow-xs focus:bg-white focus:outline-hidden ${theme.accentRing} focus:ring-2 ${theme.accentBorder} transition leading-relaxed`}
            maxLength={300}
          />
        </section>

        {/* ================= BAGIAN B. WAKTU & TEMPAT ================= */}
        <section className="space-y-3 pt-3 border-t border-slate-100">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-md ${theme.accentBg} ${theme.accentText} inline-flex items-center justify-center text-xs font-bold`}>
              B
            </span>
            <span>WAKTU & TEMPAT PELAKSANAAN</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Hari dan Tanggal */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Hari dan Tanggal <span className="text-rose-500">*wajib</span>
                </span>
                <button
                  type="button"
                  onClick={handleSetToday}
                  className={`text-xs font-semibold ${theme.accentText} hover:underline cursor-pointer`}
                >
                  Gunakan Hari Ini
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.hariTanggal}
                  onChange={(e) => onChange({ hariTanggal: e.target.value })}
                  placeholder="Contoh: Senin, 12 Oktober 2026"
                  className={`flex-1 px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-xl shadow-xs focus:bg-white focus:outline-hidden ${theme.accentRing} focus:ring-2 ${theme.accentBorder} transition`}
                />
                <input
                  type="date"
                  value={datePickerVal}
                  onChange={handleDateSelect}
                  className="px-2.5 py-2 text-sm bg-slate-100 border border-slate-300 rounded-xl shadow-xs text-slate-600 cursor-pointer focus:outline-hidden"
                  title="Pilih kalender untuk isi otomatis hari & tanggal Indonesia"
                />
              </div>
            </div>

            {/* Pukul / Waktu */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Waktu Pelaksanaan (Pukul)
              </span>
              <input
                type="text"
                value={formData.waktu}
                onChange={(e) => onChange({ waktu: e.target.value })}
                placeholder="Contoh: 09.00 - 12.00 WITA"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-xl shadow-xs focus:bg-white focus:outline-hidden ${theme.accentRing} focus:ring-2 ${theme.accentBorder} transition`}
              />
            </div>

            {/* Tempat */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Tempat Kegiatan
              </span>
              <input
                type="text"
                value={formData.tempat}
                onChange={(e) => onChange({ tempat: e.target.value })}
                placeholder="Contoh: Aula SMPN 1 Limboto"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-xl shadow-xs focus:bg-white focus:outline-hidden ${theme.accentRing} focus:ring-2 ${theme.accentBorder} transition`}
              />
            </div>
          </div>
        </section>

        {/* ================= BAGIAN C. PELAKSANA KEGIATAN ================= */}
        <section className="space-y-2 pt-3 border-t border-slate-100">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-md ${theme.accentBg} ${theme.accentText} inline-flex items-center justify-center text-xs font-bold`}>
              C
            </span>
            <span>PELAKSANA KEGIATAN</span>
          </label>

          <PelaksanaInput
            pelaksana={formData.pelaksana}
            onChange={(pelaksana) => onChange({ pelaksana })}
            theme={theme}
          />
        </section>

        {/* ================= BAGIAN D. HASIL KEGIATAN (INPUT POIN INTI) ================= */}
        <section className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className={`w-6 h-6 rounded-md ${theme.accentBg} ${theme.accentText} inline-flex items-center justify-center text-xs font-bold`}>
                D
              </span>
              <span>POIN-POIN HASIL KEGIATAN</span>
              <span className="text-rose-500 font-semibold text-xs">*wajib</span>
            </label>

            {/* AI auto badge */}
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>Otomatis dikembangkan AI</span>
            </div>
          </div>

          {/* Contextual guidance accordion/box */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1 text-amber-950">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Petunjuk Isi Poin Hasil Lapangan:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-850 pl-1 text-[11.5px] leading-relaxed">
              <li>Pembukaan kegiatan (siapa yang membuka, didampingi siapa).</li>
              <li>Nama & jabatan narasumber jika ada, materi yang disampaikan.</li>
              <li>Proses pelaksanaan kegiatan dan jumlah peserta yang hadir.</li>
              <li>Diskusi atau tanya jawab yang berlangsung di forum.</li>
              <li>Hasil konkret dan rencana tindak lanjut kegiatan yang diketahui.</li>
            </ul>
          </div>

          <textarea
            rows={6}
            value={formData.poinHasil}
            onChange={(e) => onChange({ poinHasil: e.target.value })}
            placeholder={`Tuliskan poin-poin inti hasil kegiatan lapangan di sini, contoh:
- Acara dibuka oleh Kepala BNN Kab. Gorontalo dihadiri 40 orang perwakilan karang taruna.
- Materi P4GN disampaikan oleh Penyuluh Ahli Pertama tentang bahaya zat adiktif.
- Peserta aktif berdiskusi mengenai deteksi dini peredaran narkoba di lingkungan desa.
- Terbentuk kesepakatan jejaring komunikasi remaja anti narkoba tingkat kecamatan.`}
            className={`w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl shadow-xs focus:bg-white focus:outline-hidden ${theme.accentRing} focus:ring-2 ${theme.accentBorder} transition leading-relaxed font-sans`}
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {formData.poinHasil.trim().length === 0
                ? 'Minimal masukkan beberapa poin hasil kegiatan.'
                : `${formData.poinHasil.trim().length} karakter dimasukkan.`}
            </span>
            <span className="text-[11px] text-slate-400">
              AI akan otomatis menyusun uraian 1.2s setelah Anda berhenti mengetik.
            </span>
          </div>
        </section>

        {/* ================= BAGIAN E. SUMBER DANA ================= */}
        <section className="space-y-2 pt-3 border-t border-slate-100">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-md ${theme.accentBg} ${theme.accentText} inline-flex items-center justify-center text-xs font-bold`}>
              E
            </span>
            <span>SUMBER DANA</span>
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                { id: 'DIPA', label: 'DIPA' },
                { id: 'NON DIPA', label: 'NON DIPA' },
                { id: 'TIDAK_DICANTUMKAN', label: 'Tidak Dicantumkan (-)' },
              ] as { id: SumberDanaType; label: string }[]
            ).map((opt) => {
              const isSelected = formData.sumberDana === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ sumberDana: opt.id })}
                  className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? `${theme.badgeActiveBg} border-transparent shadow-xs`
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};
