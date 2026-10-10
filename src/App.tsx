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
    // Cancel any active AI request
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

        const data = await response.json();

        // Check if request is obsolete due to newer requests
        if (currentRequestId !== requestIdCounterRef.current) {
          return;
        }

        if (response.ok && data.success && data.text) {
          setAiResultText(data.text);
          setAiStatus('success');
          lastProcessedKeyRef.current = currentPayloadKey;
        } else {
          setAiStatus('fallback');
          setAiErrorMessage(data.error || 'Gagal memproses hasil kegiatan melalui AI');
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Request was aborted cleanly, ignore
          return;
        }
        if (currentRequestId === requestIdCounterRef.current) {
          console.error('Error saat menghubungi backend AI:', error);
          setAiStatus('fallback');
          setAiErrorMessage('Koneksi ke backend AI terputus. Menggunakan poin asli.');
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

    // 1300ms debounce (within 1200 - 1500ms range required)
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
