/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FormDataState, ThemeType, AiStatus } from './types/report';
import { THEMES } from './utils/theme';
import { INITIAL_FORM_STATE, SAMPLE_REPORT } from './utils/sampleData';
import { Header } from './components/Header';
import { FormSection } from './components/FormSection';
import { PreviewSection } from './components/PreviewSection';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { InfoBanner } from './components/InfoBanner';

const DRAFT_STORAGE_KEY = 'p2m_bnn_gorontalo_draft_v1';
const THEME_STORAGE_KEY = 'p2m_bnn_gorontalo_theme_v1';

export default function App() {
  // Theme state with localStorage recovery
  const [themeId, setThemeId] = useState<ThemeType>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'burgundy' || saved === 'sage' || saved === 'blue') {
      return saved;
    }
    return 'burgundy';
  });

  // Form data state with localStorage recovery
  const [formData, setFormData] = useState<FormDataState>(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return {
          namaKegiatan: parsed.namaKegiatan || '',
          hariTanggal: parsed.hariTanggal || '',
          waktu: parsed.waktu || '',
          tempat: parsed.tempat || '',
          pelaksana: Array.isArray(parsed.pelaksana) ? parsed.pelaksana : [],
          poinHasil: parsed.poinHasil || '',
          sumberDana: parsed.sumberDana || 'DIPA',
        };
      }
    } catch (e) {
      console.warn('Gagal memuat draf dari localStorage:', e);
    }
    return INITIAL_FORM_STATE;
  });

  // AI Generation State
  const [aiResultText, setAiResultText] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [aiErrorMessage, setAiErrorMessage] = useState<string>('');

  // Confirmation Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Background health check status for deployment diagnostics
  const [backendHealth, setBackendHealth] = useState<{
    checked: boolean;
    hasKey: boolean;
    environment?: string;
    error?: string;
  }>({ checked: false, hasKey: true });

  // References for debounce and race-condition cancellation
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const lastProcessedKeyRef = useRef<string>('');
  const requestIdCounterRef = useRef<number>(0);

  // Active theme configuration
  const currentTheme = THEMES[themeId];

  // Save theme to localStorage
  const handleThemeChange = (newTheme: ThemeType) => {
    setThemeId(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // Check backend health on initial load to verify API key presence
  useEffect(() => {
    let isMounted = true;
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setBackendHealth({
            checked: true,
            hasKey: Boolean(data.hasGeminiKey),
            environment: data.environment,
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setBackendHealth({
            checked: true,
            hasKey: false,
            error: err.message,
          });
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Form field updater with automatic draft persistence
  const handleFormChange = (updatedFields: Partial<FormDataState>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updatedFields };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Gagal menyimpan draf:', err);
      }
      return next;
    });
  };

  // Load sample report data
  const handleLoadSample = () => {
    setFormData(SAMPLE_REPORT);
    setAiResultText('');
    setAiStatus('idle');
    setAiErrorMessage('');
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(SAMPLE_REPORT));
    } catch (err) {
      console.warn('Gagal menyimpan sample:', err);
    }
  };

  // Reset form handler
  const handleConfirmReset = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setFormData(INITIAL_FORM_STATE);
    setAiResultText('');
    setAiStatus('idle');
    setAiErrorMessage('');
    lastProcessedKeyRef.current = '';

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (err) {
      console.warn('Gagal membersihkan draf:', err);
    }

    setIsResetModalOpen(false);
  };

  // Check if minimum fields are populated
  const isMinimumRequirementMet = useCallback((data: FormDataState) => {
    const hasNama = data.namaKegiatan.trim().length >= 3;
    const hasTanggal = data.hariTanggal.trim().length >= 3;
    const hasPoin = data.poinHasil.trim().length >= 10;
    return hasNama && hasTanggal && hasPoin;
  }, []);

  // Main automatic AI expansion caller
  const triggerAiExpansion = useCallback(
    async (currentData: FormDataState) => {
      if (!isMinimumRequirementMet(currentData)) {
        setAiStatus('idle');
        return;
      }

      // Generate a fingerprint key to avoid redundant API calls if unchanged
      const currentPayloadKey = JSON.stringify({
        k: currentData.namaKegiatan.trim(),
        t: currentData.hariTanggal.trim(),
        w: currentData.waktu.trim(),
        loc: currentData.tempat.trim(),
        p: currentData.pelaksana.filter((x) => x.trim().length > 0),
        h: currentData.poinHasil.trim(),
        s: currentData.sumberDana,
      });

      if (currentPayloadKey === lastProcessedKeyRef.current) {
        // Data has not changed since last successful processing
        return;
      }

      // Cancel any ongoing inflight request
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      activeAbortControllerRef.current = abortController;

      const currentRequestId = ++requestIdCounterRef.current;

      setAiStatus('loading');
      setAiErrorMessage('');

      try {
        const response = await fetch('/api/expand-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            namaKegiatan: currentData.namaKegiatan,
            waktuTempat: {
              hariTanggal: currentData.hariTanggal,
              waktu: currentData.waktu,
              tempat: currentData.tempat,
            },
            pelaksana: currentData.pelaksana,
            poinHasil: currentData.poinHasil,
            sumberDana: currentData.sumberDana,
          }),
          signal: abortController.signal,
        });

        // Check if request is obsolete due to newer requests
        if (currentRequestId !== requestIdCounterRef.current) {
          return;
        }

        const contentType = response.headers.get('content-type') || '';
        let data: any = null;

        if (contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (jsonErr) {
            console.error('Gagal parsing JSON respons:', jsonErr);
          }
        } else {
          const rawText = await response.text();
          console.warn('Respons non-JSON diterima dari server:', response.status, rawText.slice(0, 100));
        }

        if (response.ok && data?.success && data?.text) {
          setAiResultText(data.text);
          setAiStatus('success');
          lastProcessedKeyRef.current = currentPayloadKey;
        } else {
          setAiStatus('fallback');
          let friendlyError = data?.error;
          if (!friendlyError) {
            if (response.status === 404) {
              friendlyError = 'Endpoint backend /api/expand-results tidak ditemukan (404). Pastikan deployment Vercel memiliki folder /api.';
            } else if (response.status === 503) {
              friendlyError = 'GEMINI_API_KEY belum dikonfigurasi di Environment Variables Vercel (Project Settings > Environment Variables).';
            } else if (response.status === 429) {
              friendlyError = 'Batas kuota Gemini API tercapai (Rate Limit 429). Silakan tunggu sebentar.';
            } else if (response.status === 401 || response.status === 403) {
              friendlyError = 'GEMINI_API_KEY tidak valid atau izin akses ditolak oleh Google AI Studio.';
            } else if (response.status >= 500) {
              friendlyError = `Server backend mengalami gangguan (HTTP ${response.status}).`;
            } else {
              friendlyError = `Gagal memproses AI (Status ${response.status}). Menggunakan poin asli.`;
            }
          }
          setAiErrorMessage(friendlyError);
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Request was aborted cleanly, ignore
          return;
        }
        if (currentRequestId === requestIdCounterRef.current) {
          console.error('Error saat menghubungi backend AI:', error);
          setAiStatus('fallback');
          setAiErrorMessage('Gagal terhubung ke endpoint backend AI. Periksa koneksi internet atau status deployment Vercel.');
        }
      } finally {
        if (currentRequestId === requestIdCounterRef.current) {
          activeAbortControllerRef.current = null;
        }
      }
    },
    [isMinimumRequirementMet]
  );

  // Debounced watcher for automatic AI execution
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!isMinimumRequirementMet(formData)) {
      setAiStatus('idle');
      return;
    }

    // 1350ms debounce (within 1000 - 1500ms range required)
    debounceTimerRef.current = setTimeout(() => {
      triggerAiExpansion(formData);
    }, 1350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, isMinimumRequirementMet, triggerAiExpansion]);

  // Allow manual edit on Bagian D text if officer chooses
  const handleManualAiEdit = (editedText: string) => {
    setAiResultText(editedText);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      
      {/* Top Application Header */}
      <Header
        currentTheme={themeId}
        onThemeChange={handleThemeChange}
        onLoadSample={handleLoadSample}
        isDraftSaved={Boolean(formData.namaKegiatan || formData.poinHasil)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        
        {/* Informational civil service notice */}
        <InfoBanner theme={currentTheme} />

        {/* Warning if backend reported missing key on deployment */}
        {backendHealth.checked && !backendHealth.hasKey && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="font-bold text-amber-800 shrink-0">Perhatian Konfigurasi Vercel:</span>
            <span>
              Variabel <code>GEMINI_API_KEY</code> belum terdeteksi di server Vercel. Fitur AI akan menggunakan poin asli sebagai cadangan sampai Anda menambahkan API Key di dashboard Vercel (<strong>Project Settings &gt; Environment Variables</strong>).
            </span>
          </div>
        )}

        {/* 2-Column Responsive Layout: Left Form, Right WhatsApp Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Input Form (lg:col-span-6 or 7) */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            <FormSection
              formData={formData}
              onChange={handleFormChange}
              onResetClick={() => setIsResetModalOpen(true)}
              theme={currentTheme}
              aiStatus={aiStatus}
            />
          </div>

          {/* Right Column: WhatsApp Live Preview (lg:col-span-6 or 5) sticky on desktop */}
          <div className="lg:col-span-6 xl:col-span-5 lg:sticky lg:top-6">
            <PreviewSection
              formData={formData}
              aiResultText={aiResultText}
              aiStatus={aiStatus}
              aiErrorMessage={aiErrorMessage}
              theme={currentTheme}
              onManualAiEdit={handleManualAiEdit}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Seksi Pencegahan & Pemberdayaan Masyarakat (P2M) — BNN Kabupaten Gorontalo
          </p>
          <p className="text-slate-400">
            Format laporan sesuai standar WhatsApp kedinasan Kepala BNNK Gorontalo
          </p>
        </div>
      </footer>

      {/* Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />

    </div>
  );
}
