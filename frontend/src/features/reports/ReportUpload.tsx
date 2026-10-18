import React, { useState, useRef } from 'react';
import { FileText, Upload, Trash2, Eye, ShieldAlert, AlertCircle, CheckCircle2, FileCode } from 'lucide-react';
import { api } from '../../services/api';
import { SpeakerButton, SupportedLanguage } from '../voice';

interface ReportUploadProps {
  language?: SupportedLanguage;
  onAnalysisResult?: (result: any) => void;
}

export const ReportUpload: React.FC<ReportUploadProps> = ({
  language = 'en',
  onAnalysisResult,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Selected report file exceeds 10 MB limit. Please select a smaller document.');
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    if (!validTypes.includes(file.type.toLowerCase()) && !isPdf) {
      setError('Invalid file format. Allowed formats: PDF, JPEG, PNG, WEBP.');
      return;
    }

    setSelectedFile(file);
    setResult(null);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const langName = language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English';

    try {
      const res = await api.analyzeMedicalReport(selectedFile, langName);
      setResult(res);
      if (onAnalysisResult) {
        onAnalysisResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Report analysis temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOW':
        return <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold text-[10px]">LOW</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold text-[10px]">HIGH</span>;
      case 'NORMAL':
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-[10px]">NORMAL</span>;
      case 'CRITICAL_REPORTED':
        return <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-semibold text-[10px]">CRITICAL</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold text-[10px]">UNKNOWN</span>;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">Medical Report & Lab Test OCR</h3>
            <p className="text-xs text-slate-400">
              Upload CBC, Blood Glucose, Lipid Profile, or Lab Reports (PDF/JPG/PNG, Max 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Legal Notice */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span>
          AI-assisted report interpretation does not replace professional medical review. Original lab ranges are strictly preserved.
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Upload Controls when no file selected */}
      {!selectedFile && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer space-y-2 group"
        >
          <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          <span className="font-semibold text-slate-300 group-hover:text-white">Click to Select Lab Report (PDF / Image)</span>
          <span className="text-[11px] text-slate-500">PDF (Max 10 pages) • JPG • PNG • WEBP • Max 10MB</span>
        </button>
      )}

      {/* Selected File Details & Action Buttons */}
      {selectedFile && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FileCode className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="font-semibold text-white truncate max-w-[250px]">{selectedFile.name}</div>
              <div className="text-[11px] text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'PDF document'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{loading ? 'Extracting Lab Data...' : 'Analyze Report'}</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 transition-all text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Extracted Structured Lab Results Output */}
      {result && (
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Extracted Lab Report: {result.report_type}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Quality: {result.document_quality} • Confidence: {result.extraction_confidence} • Pages: {result.pages_processed}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SpeakerButton textToSpeak={result.explanation} language={language} label="Listen Explanation" />
              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">
                Abnormal Tests: {result.abnormal_test_count} / {result.tests?.length || 0}
              </span>
            </div>
          </div>

          {/* Explanation Text */}
          {result.explanation && (
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {result.explanation}
            </p>
          )}

          {/* Extracted Lab Tests Table */}
          {result.tests && result.tests.length > 0 && (
            <div className="overflow-x-auto space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Structured Test Parameters:</div>
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                    <th className="py-2 px-2">Test Name</th>
                    <th className="py-2 px-2">Result</th>
                    <th className="py-2 px-2">Unit</th>
                    <th className="py-2 px-2">Printed Reference Range</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.tests.map((test: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2 px-2 font-medium text-white">{test.name}</td>
                      <td className="py-2 px-2 font-mono text-cyan-300">{test.raw_value || test.value}</td>
                      <td className="py-2 px-2 text-slate-400">{test.unit || '-'}</td>
                      <td className="py-2 px-2 font-mono text-slate-300">
                        {test.raw_reference_range || (test.reference_min !== null && test.reference_max !== null ? `${test.reference_min} - ${test.reference_max}` : 'Not listed')}
                      </td>
                      <td className="py-2 px-2">{getStatusBadge(test.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Limitations Banner */}
          {result.limitations && result.limitations.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-900 text-[11px] text-amber-300/90 border border-amber-800/40">
              <strong>Limitation: </strong> {result.limitations[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
