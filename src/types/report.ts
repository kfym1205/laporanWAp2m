export type ThemeType = 'burgundy' | 'sage' | 'blue';

export type SumberDanaType = 'DIPA' | 'NON DIPA' | 'TIDAK_DICANTUMKAN';

export interface FormDataState {
  namaKegiatan: string;
  hariTanggal: string;
  waktu: string;
  tempat: string;
  pelaksana: string[];
  poinHasil: string;
  sumberDana: SumberDanaType;
}

export type AiStatus =
  | 'idle' // waiting for minimum required fields
  | 'loading' // AI is currently synthesizing report
  | 'success' // AI synthesis completed successfully
  | 'fallback'; // AI failed/offline; using raw original input as fallback

export interface AiGenerationState {
  status: AiStatus;
  aiHasilText: string;
  errorMessage?: string;
  lastUpdated?: Date;
}
