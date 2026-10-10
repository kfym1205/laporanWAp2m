import { FormDataState } from '../types/report';

export const SAMPLE_REPORT: FormDataState = {
  namaKegiatan: 'Sosialisasi Pencegahan Pemberantasan Penyalahgunaan dan Peredaran Gelap Narkotika (P4GN) Lingkungan Masyarakat di Desa Bersinar',
  hariTanggal: 'Senin, 12 Oktober 2026',
  waktu: '09.00 - 12.00 WITA',
  tempat: 'Aula Kantor Desa Hunto Barat, Kec. Bulango Selatan, Kab. Gorontalo',
  pelaksana: [
    'Nurlian Jasin, S.Pd., M.M. (Penyuluh Narkoba Ahli Muda)',
    'Parman Naue, S.K.M (Penyuluh Narkoba Ahli Pertama)',
    'Apriani Igirisa, S.P (Penggerak Swadaya Masyarakat Ahli Pertama)',
  ],
  poinHasil: `- Pembukaan kegiatan oleh Kepala Desa Hunto Barat dihadiri Babinsa dan Bhabinkamtibmas.
- Peserta kegiatan berjumlah 35 orang terdiri atas remaja Karang Taruna dan aparat desa.
- Pemaparan materi P4GN oleh Tim Seksi P2M BNN Kabupaten Gorontalo mengenai jenis-jenis narkoba, bahaya kecanduan, serta aspek hukum UU No. 35 Tahun 2009.
- Sesi tanya jawab membahas mekanisme layanan rehabilitasi sukarela di Klinik Pratama BNN Kab. Gorontalo tanpa dipidana.
- Kesepakatan pembentukan jejaring relawan anti narkoba pemuda desa untuk mendukung program Desa Bersinar.`,
  sumberDana: 'DIPA',
};

export const INITIAL_FORM_STATE: FormDataState = {
  namaKegiatan: '',
  hariTanggal: '',
  waktu: '',
  tempat: '',
  pelaksana: [],
  poinHasil: '',
  sumberDana: 'DIPA',
};
