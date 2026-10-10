import { FormDataState, SumberDanaType } from '../types/report';

/**
 * Formats Sumber Dana value according to civil service specifications:
 * DIPA -> DIPA
 * NON DIPA -> NON DIPA
 * TIDAK_DICANTUMKAN -> -
 */
export function formatSumberDana(sumberDana: SumberDanaType): string {
  switch (sumberDana) {
    case 'DIPA':
      return 'DIPA';
    case 'NON DIPA':
      return 'NON DIPA';
    case 'TIDAK_DICANTUMKAN':
    default:
      return '-';
  }
}

/**
 * Builds the official WhatsApp formatted string exactly per BNN requirements.
 * Raw asterisks are preserved for WhatsApp bold rendering.
 */
export function buildRawReportText(formData: FormDataState, aiResultText: string): string {
  const namaKegiatan = formData.namaKegiatan.trim() || '-';
  const hariTanggal = formData.hariTanggal.trim() || '-';
  const waktu = formData.waktu.trim() || '-';
  const tempat = formData.tempat.trim() || '-';

  // Filter out blank pelaksana lines and auto-number
  const validPelaksana = formData.pelaksana
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  let pelaksanaSection = '-';
  if (validPelaksana.length > 0) {
    pelaksanaSection = validPelaksana
      .map((name, index) => `${index + 1}. ${name}`)
      .join('\n');
  }

  // Hasil Kegiatan: use AI text if available, otherwise original fallback text
  const hasilKegiatan =
    aiResultText.trim() ||
    formData.poinHasil.trim() ||
    '-';

  const sumberDanaText = formatSumberDana(formData.sumberDana);

  // Exact template with raw asterisks and double newlines
  return `*Kepada Yth : Kepala BNN Kabupaten Gorontalo*

*Dari : Seksi P2M BNN Kabupaten Gorontalo*

*A. KEGIATAN*

${namaKegiatan}

*B. WAKTU & TEMPAT PELAKSANAAN*

Hari, Tanggal : ${hariTanggal}

Pukul : ${waktu}

Tempat : ${tempat}

*C. PELAKSANA KEGIATAN*

${pelaksanaSection}

*D. HASIL KEGIATAN*

${hasilKegiatan}

*E. SUMBER DANA*

${sumberDanaText}`;
}
