import React, { useState, useEffect } from 'react';
import {
  Users,
  Check,
  Plus,
  Trash2,
  Settings2,
  RotateCcw,
  UserCheck,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ThemeConfig } from '../utils/theme';
import {
  DEFAULT_P2M_STAFF,
  getSavedStaffRoster,
  saveStaffRoster,
} from '../utils/staffRoster';

interface PelaksanaInputProps {
  pelaksana: string[];
  onChange: (pelaksana: string[]) => void;
  theme: ThemeConfig;
}

export const PelaksanaInput: React.FC<PelaksanaInputProps> = ({
  pelaksana,
  onChange,
  theme,
}) => {
  // Master roster of staff members
  const [roster, setRoster] = useState<string[]>(() => getSavedStaffRoster());
  const [showManageRoster, setShowManageRoster] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState<string>('');

  // Persist roster when changed
  useEffect(() => {
    saveStaffRoster(roster);
  }, [roster]);

  // Clean list of currently active pelaksana (trimmed, non-empty)
  const activePelaksana = pelaksana.map((p) => p.trim()).filter((p) => p.length > 0);

  // Check if a staff member from roster is selected
  const isStaffSelected = (name: string): boolean => {
    return activePelaksana.includes(name.trim());
  };

  // Toggle selection of a staff member
  const handleToggleStaff = (staffName: string) => {
    const trimmed = staffName.trim();
    if (isStaffSelected(trimmed)) {
      // Remove from selected list
      const updated = pelaksana.filter((p) => p.trim() !== trimmed);
      onChange(updated.length > 0 ? updated : []);
    } else {
      // Add to selected list
      const currentFiltered = pelaksana.filter((p) => p.trim().length > 0);
      onChange([...currentFiltered, trimmed]);
    }
  };

  // Select all staff from roster
  const handleSelectAll = () => {
    onChange([...roster]);
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };

  // Add a blank manual line
  const handleAddManual = () => {
    onChange([...pelaksana, '']);
  };

  // Update a specific line
  const handleItemChange = (index: number, value: string) => {
    const updated = [...pelaksana];
    updated[index] = value;
    onChange(updated);
  };

  // Remove a specific line
  const handleRemove = (index: number) => {
    const updated = pelaksana.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Paste multiple lines handler
  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('\n')) {
      e.preventDefault();
      const lines = pastedText
        .split('\n')
        .map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter((l) => l.length > 0);

      if (lines.length > 0) {
        const updated = [...pelaksana];
        updated.splice(index, 1, ...lines);
        onChange(updated);
      }
    }
  };

  // Roster Management Handlers
  const handleAddNewStaffToRoster = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newStaffName.trim();
    if (clean && !roster.includes(clean)) {
      setRoster([...roster, clean]);
      setNewStaffName('');
    }
  };

  const handleRemoveFromRoster = (nameToRemove: string) => {
    const updated = roster.filter((r) => r !== nameToRemove);
    setRoster(updated);
    // If it was selected in form, also remove it
    if (isStaffSelected(nameToRemove)) {
      onChange(pelaksana.filter((p) => p.trim() !== nameToRemove.trim()));
    }
  };

  const handleResetRosterToDefault = () => {
    setRoster(DEFAULT_P2M_STAFF);
  };

  const selectedCount = activePelaksana.length;

  return (
    <div className="space-y-4">
      
      {/* Quick Select Staff Header & Actions */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className={`w-4 h-4 ${theme.accentText}`} />
            <span className="text-xs font-bold text-slate-800">
              Pilih Cepat Pegawai Seksi P2M
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${theme.badgeBg}`}>
              {selectedCount} dari {roster.length} Dipilih
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`font-semibold ${theme.accentText} hover:underline cursor-pointer`}
            >
              Pilih Semua
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
            >
              Kosongkan
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setShowManageRoster(!showManageRoster)}
              className="text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer font-medium"
              title="Kelola daftar pegawai master"
            >
              <Settings2 className="w-3 h-3" />
              <span>Kelola Daftar</span>
              {showManageRoster ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Staff Selection Cards/Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {roster.map((staffName) => {
            const selected = isStaffSelected(staffName);
            return (
              <button
                key={staffName}
                type="button"
                onClick={() => handleToggleStaff(staffName)}
                className={`p-2.5 rounded-xl text-left text-xs transition cursor-pointer flex items-start gap-2.5 border ${
                  selected
                    ? `${theme.badgeBg} ${theme.accentBorder} shadow-xs font-semibold ring-1 ring-offset-0`
                    : 'bg-white hover:bg-slate-100/70 border-slate-200 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition ${
                    selected
                      ? `${theme.badgeActiveBg} border-transparent`
                      : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <div className="leading-snug break-words flex-1">
                  {staffName}
                </div>
              </button>
            );
          })}
        </div>

        {/* Panel to manage master staff list */}
        {showManageRoster && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5 text-xs animate-fade-in bg-white/70 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Kelola Daftar Master Pegawai P2M
              </span>
              <button
                type="button"
                onClick={handleResetRosterToDefault}
                className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Kembalikan ke 6 Pegawai Bawaan</span>
              </button>
            </div>

            <form onSubmit={handleAddNewStaffToRoster} className="flex gap-2">
              <input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Contoh: Nama Pegawai, S.Si (Jabatan)"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 cursor-pointer text-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah</span>
              </button>
            </form>

            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {roster.map((st) => (
                <div
                  key={st}
                  className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 border border-slate-200 text-[11.5px]"
                >
                  <span className="truncate pr-2">{st}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromRoster(st)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                    title="Hapus dari daftar master"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Pelaksana Section with Auto Numbering */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Daftar Pelaksana di Laporan WhatsApp (Nomor urut otomatis):
            </span>
          </span>
          <button
            type="button"
            onClick={handleAddManual}
            className={`inline-flex items-center gap-1 text-xs font-semibold ${theme.accentText} hover:underline cursor-pointer`}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Baris Manual
          </button>
        </div>

        {pelaksana.length === 0 ? (
          <div className="text-center py-4 px-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500">
            <span>
              Belum ada pelaksana yang dipilih. Klik nama pegawai di atas atau klik{' '}
              <button
                type="button"
                onClick={handleAddManual}
                className={`font-semibold underline ${theme.accentText} cursor-pointer`}
              >
                Tambah Baris Manual
              </button>
              . Jika dikosongkan, laporan akan menampilkan tanda "-".
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {pelaksana.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-6 text-right font-mono text-xs font-bold text-slate-600 select-none">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  onPaste={(e) => handlePaste(index, e)}
                  placeholder={`Nama & jabatan pelaksana ke-${index + 1}`}
                  className={`flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-xs focus:outline-hidden ${theme.accentRing} focus:ring-2 ${theme.accentBorder} transition`}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  title="Hapus pelaksana ini"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-slate-500 italic">
          Nomor urut 1, 2, 3... dibuat otomatis di laporan WhatsApp. Anda juga dapat mengubah atau menambah gelar secara leluasa.
        </p>
      </div>

    </div>
  );
};
