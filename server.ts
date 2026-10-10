import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// System instruction exact specification from brief
const SYSTEM_INSTRUCTION = `Anda adalah asisten penyusun laporan harian resmi Seksi P2M BNN Kabupaten Gorontalo. Tugas Anda mengembangkan poin-poin hasil kegiatan menjadi uraian laporan kedinasan dalam Bahasa Indonesia yang formal, natural, runtut, jelas, dan ringkas.

Ketentuan:
- Hasil maksimal 2–3 paragraf.
- Pertahankan seluruh fakta yang diberikan pengguna.
- Jangan mengarang nama orang, jabatan, jumlah peserta, tanggal, angka, lokasi, materi, narasumber, capaian, atau hasil kegiatan.
- Jangan menyimpulkan kegiatan berhasil mencapai target apabila informasi tersebut tidak tersedia.
- Jangan menambahkan pernyataan normatif yang tidak didukung informasi input.
- Gunakan bahasa kedinasan yang wajar dan tidak berlebihan.
- Hindari pengulangan kalimat.
- Jika poin input sangat singkat, kembangkan secara terbatas berdasarkan informasi yang benar-benar tersedia.
- Keluarkan hanya uraian hasil kegiatan final, tanpa judul tambahan, catatan AI, atau penjelasan kepada pengguna.`;

interface ExpandRequestBody {
  namaKegiatan?: string;
  waktuTempat?: {
    hariTanggal?: string;
    waktu?: string;
    tempat?: string;
  };
  pelaksana?: string[];
  poinHasil?: string;
  sumberDana?: string;
}

app.post('/api/expand-results', async (req: Request<{}, {}, ExpandRequestBody>, res: Response) => {
  try {
    const { namaKegiatan, waktuTempat, pelaksana, poinHasil, sumberDana } = req.body;

    // Validation
    const cleanNamaKegiatan = (namaKegiatan || '').trim().slice(0, 300);
    const cleanHariTanggal = (waktuTempat?.hariTanggal || '').trim().slice(0, 150);
    const cleanPoinHasil = (poinHasil || '').trim().slice(0, 5000);

    if (!cleanNamaKegiatan) {
      return res.status(400).json({
        success: false,
        error: 'Nama kegiatan wajib diisi sebelum mengembangkan hasil kegiatan.',
      });
    }

    if (!cleanHariTanggal) {
      return res.status(400).json({
        success: false,
        error: 'Hari dan tanggal pelaksanaan wajib diisi.',
      });
    }

    if (!cleanPoinHasil || cleanPoinHasil.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Poin hasil kegiatan minimal berisi beberapa kata informasi.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY belum dikonfigurasi pada environment server.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const cleanWaktu = (waktuTempat?.waktu || '').trim().slice(0, 100);
    const cleanTempat = (waktuTempat?.tempat || '').trim().slice(0, 200);
    const cleanPelaksana = Array.isArray(pelaksana)
      ? pelaksana.map((p) => String(p).trim()).filter(Boolean).slice(0, 20)
      : [];
    const cleanSumberDana = (sumberDana || '').trim().slice(0, 50);

    const userPrompt = `Data Kegiatan Seksi P2M BNN Kabupaten Gorontalo:
- Nama Kegiatan: ${cleanNamaKegiatan}
- Hari & Tanggal: ${cleanHariTanggal}
- Pukul: ${cleanWaktu || '-'}
- Tempat: ${cleanTempat || '-'}
- Pelaksana Kegiatan: ${cleanPelaksana.length > 0 ? cleanPelaksana.join(', ') : '-'}
- Sumber Dana: ${cleanSumberDana || '-'}

Poin-poin inti hasil kegiatan lapangan yang dicatat pelaksana:
"""
${cleanPoinHasil}
"""

Instruksi: Susun menjadi uraian resmi "D. HASIL KEGIATAN" sebanyak maksimal 2–3 paragraf kedinasan yang runtut, lugas, dan akurat sesuai fakta di atas. Jangan sertakan awalan seperti "D. HASIL KEGIATAN", tanpa tanda bintang ganda Markdown tebal di seluruh uraian, dan jangan berikan catatan pembuka atau penutup.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.25,
      },
    });

    let generatedText = response.text?.trim() || '';

    // Clean up if model accidentally prefixed section header
    generatedText = generatedText
      .replace(/^(\*+)?D\.\s*HASIL\s*KEGIATAN(\*+)?\s*[:\n]*/i, '')
      .replace(/^Uraian\s*Hasil\s*Kegiatan\s*[:\n]*/i, '')
      .trim();

    if (!generatedText) {
      return res.status(502).json({
        success: false,
        error: 'Model tidak mengembalikan respon teks.',
      });
    }

    return res.json({
      success: true,
      text: generatedText,
    });
  } catch (error: unknown) {
    console.error('Gemini expansion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi gangguan saat memproses AI';
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Vite or Static file serving
async function initServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Laporan Harian P2M Server berjalan di port ${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});
