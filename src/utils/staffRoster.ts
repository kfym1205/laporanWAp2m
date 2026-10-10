/**
 * Daftar resmi personil Seksi Pencegahan dan Pemberdayaan Masyarakat (P2M)
 * BNN Kabupaten Gorontalo.
 */
export const DEFAULT_P2M_STAFF: string[] = [
  'Nurlian Jasin, S.Pd., M.M. (Penyuluh Narkoba Ahli Muda)',
  "Ru'yah Sulistianingsih M.D Mali, S.Psi. (Penyuluh Narkoba Ahli Pertama)",
  'Parman Naue, S.K.M (Penyuluh Narkoba Ahli Pertama)',
  'Apriani Igirisa, S.P (Penggerak Swadaya Masyarakat Ahli Pertama)',
  'Kharfian F.Y Mawikere (Operator Layanan Operasional)',
  'Ismiranda Wahyuni Engahu (Tenaga Alih Daya)',
];

export const STAFF_STORAGE_KEY = 'p2m_bnn_gorontalo_staff_roster_v1';

/**
 * Loads staff roster from localStorage or returns default if not set.
 */
export function getSavedStaffRoster(): string[] {
  try {
    const saved = localStorage.getItem(STAFF_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca daftar pegawai tersimpan:', err);
  }
  return DEFAULT_P2M_STAFF;
}

/**
 * Saves staff roster to localStorage.
 */
export function saveStaffRoster(staffList: string[]): void {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffList));
  } catch (err) {
    console.warn('Gagal menyimpan daftar pegawai:', err);
  }
}
