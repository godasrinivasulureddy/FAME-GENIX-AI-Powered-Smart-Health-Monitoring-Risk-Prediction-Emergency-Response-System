import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Camera, Trash2, Eye, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUploadProps {
  textContext?: string;
  language?: string;
  onAnalysisResult?: (result: any) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  textContext = '',
  language = 'English',
  onAnalysisResult,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image exceeds 5 MB limit. Please select a smaller photo.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Invalid file type. Please upload a JPEG, PNG, or WEBP photo.');
      return;
    }

    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.analyzeHealthImage(selectedFile, textContext, language);
      setResult(res);
      if (onAnalysisResult) {
        onAnalysisResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Image analysis temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5 text-xs">
      {/* Privacy Notice */}
      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
        <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span>
          Image analysis is optional and provides AI-assisted visual observations only. It does not confirm a diagnosis.
        </span>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Upload Controls when no file selected */}
      {!previewUrl && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Photo (JPG/PNG/WEBP, Max 5MB)</span>
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-all font-medium"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Capture Photo</span>
          </button>
        </div>
      )}

      {/* Selected Image Preview & Action Buttons */}
      {previewUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img src={previewUrl} alt="Selected preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
            <div className="space-y-1">
              <div className="font-medium text-white truncate max-w-[200px]">{selectedFile?.name}</div>
              <div className="text-[11px] text-slate-400">
                {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB • {selectedFile?.type}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{loading ? 'Analyzing Vision...' : 'Analyze Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 transition-all text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Structured Visual Findings Result Card */}
      {result && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-800/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>AI Visual Findings ({result.source})</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-300">
              Quality: {result.image_quality} • Area: {result.body_area}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {result.explanation}
          </p>

          {/* Observed Findings List */}
          {result.visual_findings && result.visual_findings.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Observed Features:</div>
              {result.visual_findings.map((f: any, idx: number) => (
                <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>
                    <strong className="text-white">{f.finding}</strong> ({f.severity || 'mild'}, {f.location || 'localized'})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Limitations Banner */}
          {result.limitations && result.limitations.length > 0 && (
            <div className="p-2 rounded bg-slate-950 text-[11px] text-amber-300/90 border border-amber-800/40">
              <strong>Limitation: </strong> {result.limitations[0]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
