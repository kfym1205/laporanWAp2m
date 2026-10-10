import React, { useState } from 'react';
import { FormDataState, AiStatus } from '../types/report';
import { ThemeConfig } from '../utils/theme';
import { buildRawReportText } from '../utils/reportFormatter';
import {
  Copy,
  Check,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
  Eye,
  Code,
  CheckCheck,
  Edit3,
} from 'lucide-react';

interface PreviewSectionProps {
  formData: FormDataState;
  aiResultText: string;
  aiStatus: AiStatus;
  aiErrorMessage?: string;
  theme: ThemeConfig;
  onManualAiEdit?: (text: string) => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  formData,
  aiResultText,
  aiStatus,
  aiErrorMessage,
  theme,
  onManualAiEdit,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'bubble' | 'raw'>('bubble');
  const [isEditingAiText, setIsEditingAiText] = useState<boolean>(false);

  // Generate exact raw text for clipboard and WhatsApp link
  const rawReportText = buildRawReportText(formData, aiResultText);

  // Copy to clipboard handler
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(rawReportText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = rawReportText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  // Open WhatsApp link handler
  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(rawReportText);
    const waUrl = `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Helper for rendering WhatsApp simulated bold text (*text*)
  const renderWhatsAppFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Check if line is wrapped in *...*
      const trimmed = line.trim();
      const isBold = trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2;

      if (isBold) {
        const innerText = trimmed.slice(1, -1);
        return (
          <p key={lineIdx} className="font-bold text-slate-900 leading-snug">
            {innerText}
          </p>
        );
      }

      if (trimmed === '') {
        return <div key={lineIdx} className="h-2.5" />;
      }

      return (
        <p key={lineIdx} className="text-slate-800 leading-relaxed text-[13.5px]">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col h-full">
      
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Eye className={`w-5 h-5 ${theme.accentText}`} />
          <h2 className="text-base font-bold text-slate-800">
            Pratinjau Laporan WhatsApp
          </h2>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('bubble')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'bubble'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Tampilan WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'raw'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>Teks Mentah (*)</span>
          </button>
        </div>
      </div>

      {/* AI Status Banner */}
      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 text-xs">
        {aiStatus === 'loading' && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-600" />
            <span className="font-semibold">AI sedang menyusun laporan kedinasan...</span>
          </div>
        )}

        {aiStatus === 'success' && (
          <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Laporan berhasil diperbarui oleh Gemini AI.</span>
            </div>
            {onManualAiEdit && (
              <button
                type="button"
                onClick={() => setIsEditingAiText(!isEditingAiText)}
                className={`text-[11px] font-semibold ${theme.accentText} hover:underline cursor-pointer flex items-center gap-1`}
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingAiText ? 'Selesai Edit' : 'Edit Uraian'}</span>
              </button>
            )}
          </div>
        )}

        {aiStatus === 'fallback' && (
          <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-semibold">AI tidak tersedia; menggunakan hasil input asli.</span>
              {aiErrorMessage && (
                <span className="block text-[11px] text-rose-600/90 mt-0.5">
                  ({aiErrorMessage})
                </span>
              )}
            </div>
          </div>
        )}

        {aiStatus === 'idle' && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Menunggu kelengkapan nama kegiatan, hari/tanggal, dan poin hasil untuk aktivasi otomatis AI.
            </span>
          </div>
        )}
      </div>

      {/* Manual edit panel for Bagian D if toggled */}
      {isEditingAiText && onManualAiEdit && (
        <div className="p-4 bg-amber-50/60 border-b border-amber-200 text-xs">
          <label className="font-bold text-amber-950 block mb-1">
            Penyesuaian Manual Uraian Bagian D:
          </label>
          <textarea
            rows={4}
            value={aiResultText}
            onChange={(e) => onManualAiEdit(e.target.value)}
            className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
          <p className="text-[11px] text-amber-800 mt-1">
            Perubahan Anda langsung tersimpan pada pratinjau dan teks yang disalin ke WhatsApp.
          </p>
        </div>
      )}

      {/* Preview Content Area */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-slate-100/70">
        
        {activeTab === 'bubble' ? (
          /* WhatsApp Chat Bubble Simulation */
          <div className="max-w-xl mx-auto space-y-3">
            
            {/* WhatsApp simulated chat bubble container */}
            <div className="bg-[#e7fedb] border border-[#c0e8ad] rounded-2xl rounded-tr-xs p-4 sm:p-5 shadow-xs relative">
              <div className="space-y-0.5 select-text font-sans">
                {renderWhatsAppFormattedText(rawReportText)}
              </div>

              {/* Simulated WhatsApp timestamp and delivery double checkmark */}
              <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-emerald-900/10 text-[11px] text-slate-500 font-mono select-none">
                <span>Siap Kirim</span>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400">
              Pratinjau di atas menampilkan teks tebal seperti tampilan di WhatsApp resmi.
            </p>
          </div>
        ) : (
          /* Raw Monospace WhatsApp Text Area */
          <div className="space-y-2">
            <div className="bg-slate-900 text-emerald-300 font-mono text-xs sm:text-[13px] p-4 rounded-xl shadow-inner overflow-x-auto whitespace-pre-wrap leading-relaxed select-all border border-slate-800">
              {rawReportText}
            </div>
            <p className="text-xs text-slate-500 italic">
              Teks mentah di atas mempertahankan seluruh karakter bintang (*) dan jeda baris untuk ditempel ke WhatsApp.
            </p>
          </div>
        )}

      </div>

      {/* Copy notification popup */}
      {copied && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center animate-fade-in flex items-center justify-center gap-1.5 shadow-md">
          <Check className="w-4 h-4" />
          <span>Laporan berhasil disalin ke clipboard! Siap ditempel di WhatsApp.</span>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          {/* Salin Laporan Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-sm ${theme.primaryButton}`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Laporan Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Laporan</span>
              </>
            )}
          </button>

          {/* Buka WhatsApp Button */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            <Send className="w-4 h-4" />
            <span>Buka WhatsApp</span>
          </button>

        </div>

        <p className="text-center text-[11px] text-slate-500">
          Tombol "Buka WhatsApp" membuka tautan <code>wa.me</code> dengan teks laporan. Pesan tidak dikirim otomatis.
        </p>
      </div>

    </div>
  );
};
