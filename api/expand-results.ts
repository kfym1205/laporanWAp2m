import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

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

// Helper to safely send JSON response across Vercel and Express
function sendJsonResponse(
  res: ServerResponse & {
    status?: (code: number) => any;
    json?: (data: any) => any;
  },
  statusCode: number,
  data: Record<string, any>
) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Helper to read and parse body if not pre-parsed
async function parseRequestBody(req: IncomingMessage & { body?: any }): Promise<ExpandRequestBody> {
  // If already parsed by Express or Vercel body parser
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') {
      return req.body;
    }
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
  }

  // If the stream has already been consumed/ended by middleware, return body or empty
  if ((req as any).readableEnded || (req as any)._readableState?.ended) {
    return (req.body as ExpandRequestBody) || {};
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        req.destroy();
        resolve({});
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(
  req: IncomingMessage & { body?: any; method?: string },
  res: ServerResponse & {
    status?: (code: number) => any;
    json?: (data: any) => any;
  }
) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      res.status(200).end();
    } else {
      res.statusCode = 200;
      res.end();
    }
    return;
  }

  if (req.method !== 'POST') {
    return sendJsonResponse(res, 405, {
      success: false,
      error: 'Metode HTTP tidak diizinkan. Gunakan POST untuk endpoint ini.',
    });
  }

  try {
    const body = await parseRequestBody(req);
    const { namaKegiatan, waktuTempat, pelaksana, poinHasil, sumberDana } = body;

    // Field sanitization & validation
    const cleanNamaKegiatan = (namaKegiatan || '').trim().slice(0, 300);
    const cleanHariTanggal = (waktuTempat?.hariTanggal || '').trim().slice(0, 150);
    const cleanPoinHasil = (poinHasil || '').trim().slice(0, 6000);

    if (!cleanNamaKegiatan) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Nama kegiatan wajib diisi sebelum mengembangkan hasil kegiatan.',
      });
    }

    if (!cleanHariTanggal) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Hari dan tanggal pelaksanaan wajib diisi.',
      });
    }

    if (!cleanPoinHasil || cleanPoinHasil.length < 5) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Poin hasil kegiatan minimal berisi beberapa kata keterangan kegiatan.',
      });
    }

    // Support GEMINI_API_KEY or GOOGLE_API_KEY
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return sendJsonResponse(res, 503, {
        success: false,
        error: 'GEMINI_API_KEY belum dikonfigurasi di Environment Variables Vercel (Project Settings > Environment Variables).',
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
      ? pelaksana.map((p) => String(p).trim()).filter(Boolean).slice(0, 30)
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

    const candidateModels = [
      process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];

    let response;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.25,
          },
        });
        if (response) {
          break;
        }
      } catch (modelError: any) {
        lastError = modelError;
        const errStr = modelError?.message || String(modelError);
        console.warn(`Model ${modelName} kendala (${errStr.slice(0, 80)}), mencoba model berikutnya...`);
      }
    }

    if (!response) {
      throw lastError || new Error('Semua model AI sedang sibuk.');
    }

    let generatedText = response.text?.trim() || '';

    // Clean up if model accidentally prefixed section headers
    generatedText = generatedText
      .replace(/^(\*+)?D\.\s*HASIL\s*KEGIATAN(\*+)?\s*[:\n]*/i, '')
      .replace(/^Uraian\s*Hasil\s*Kegiatan\s*[:\n]*/i, '')
      .trim();

    if (!generatedText) {
      return sendJsonResponse(res, 502, {
        success: false,
        error: 'Model AI tidak mengembalikan respon teks yang valid.',
      });
    }

    return sendJsonResponse(res, 200, {
      success: true,
      text: generatedText,
    });
  } catch (error: any) {
    console.error('Gemini expansion error:', error);
    let rawMsg = error instanceof Error ? error.message : String(error);

    // Extract inner message if error string is JSON from Google API
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed?.error?.message) {
        rawMsg = parsed.error.message;
      }
    } catch {
      // keep rawMsg
    }

    let friendlyMsg = 'Terjadi gangguan saat memproses AI kedinasan.';
    let statusCode = 500;

    if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('API key not valid')) {
      friendlyMsg = 'GEMINI_API_KEY tidak valid. Silakan periksa kembali API Key Anda di pengaturan Vercel.';
      statusCode = 401;
    } else if (
      rawMsg.includes('RESOURCE_EXHAUSTED') ||
      rawMsg.includes('429') ||
      rawMsg.includes('Quota exceeded')
    ) {
      friendlyMsg = 'Batas kuota penggunaan Gemini API telah tercapai (Rate Limit 429). Silakan tunggu beberapa saat lagi.';
      statusCode = 429;
    } else if (rawMsg.includes('PERMISSION_DENIED') || rawMsg.includes('403')) {
      friendlyMsg = 'Akses Gemini API ditolak (403). Pastikan API key Anda aktif di Google AI Studio.';
      statusCode = 403;
    } else if (
      rawMsg.includes('high demand') ||
      rawMsg.includes('Spikes in demand') ||
      rawMsg.includes('503') ||
      rawMsg.includes('overloaded')
    ) {
      friendlyMsg = 'Layanan Gemini AI sedang mengalami lonjakan trafik tinggi dari server Google. Silakan tunggu beberapa saat lagi.';
      statusCode = 503;
    } else if (rawMsg.includes('DEADLINE_EXCEEDED') || rawMsg.includes('timeout')) {
      friendlyMsg = 'Waktu permintaan AI habis (Timeout). Silakan periksa koneksi internet Anda.';
      statusCode = 504;
    } else if (rawMsg.includes('not found') || rawMsg.includes('404')) {
      friendlyMsg = 'Model Gemini tidak ditemukan (404). Silakan hubungi administrator.';
      statusCode = 404;
    } else {
      friendlyMsg = `Gagal memproses AI: ${rawMsg.replace(/key=[^&\s]+/gi, 'key=***').slice(0, 150)}`;
    }

    return sendJsonResponse(res, statusCode, {
      success: false,
      error: friendlyMsg,
    });
  }
}
