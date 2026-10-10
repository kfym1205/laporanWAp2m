const NAMA_HARI = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Formats a YYYY-MM-DD string into an Indonesian date like "Senin, 12 Oktober 2026"
 */
export function formatIndonesianDate(isoDateStr: string): string {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-');
  if (parts.length !== 3) return isoDateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return isoDateStr;

  const hari = NAMA_HARI[date.getDay()];
  const bulan = NAMA_BULAN[month];

  return `${hari}, ${day} ${bulan} ${year}`;
}

/**
 * Returns today's ISO date (YYYY-MM-DD)
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
