import React, { useState, useEffect, useRef } from 'react';
import { Camera, Video, X, RefreshCw, AlertCircle, Play, Square, Circle } from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, dataUrl: string) => void;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, mode]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startCamera = async () => {
    setLoading(true);
    setError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported on this browser or context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: mode === 'video',
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera/Microphone permission denied. Please allow access in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device detected on your system.');
      } else {
        setError(err.message || 'Unable to access camera.');
      }
    }
  };

  const stopCamera = () => {
    if (isRecording && mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_photo_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        onCapture(file, dataUrl);
        stopCamera();
        onClose();
      }
    }, 'image/jpeg', 0.92);
  };

  const handleStartRecording = () => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `camera_video_${Date.now()}.${ext}`, {
          type: mimeType,
          lastModified: Date.now(),
        });
        const videoUrl = URL.createObjectURL(blob);
        onCapture(file, videoUrl);
        stopCamera();
        onClose();
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err: any) {
      console.error('MediaRecorder start error:', err);
      setError('Failed to start video recording on this browser.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleCamera = () => {
    if (isRecording) return;
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              {mode === 'photo' ? <Camera className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                {mode === 'photo' ? 'Live Photo Capture' : 'Live Video Recording'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'photo' ? 'Snap a photo of the symptom area' : 'Record a video clip explaining symptoms'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              disabled={isRecording}
              onClick={() => setMode('photo')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'photo'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white disabled:opacity-50'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo</span>
            </button>
            <button
              type="button"
              disabled={isRecording}
              onClick={() => setMode('video')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === 'video'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white disabled:opacity-50'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport Container */}
        <div className="relative w-full h-80 bg-slate-950 flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-cyan-400 text-xs font-medium animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Initializing Live Stream...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-rose-300 max-w-xs">{error}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700"
              >
                Retry Stream Access
              </button>
            </div>
          )}

          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${
              loading || error ? 'hidden' : 'block'
            }`}
          />

          {/* Live Recording Badge & Timer */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/90 border border-rose-600/80 text-rose-300 text-xs font-mono font-bold shadow-lg animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>● REC {formatSeconds(recordingSeconds)}</span>
            </div>
          )}

          {/* Framing Target Guide */}
          {!loading && !error && !isRecording && (
            <div className="absolute inset-8 border-2 border-dashed border-cyan-400/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="text-[10px] text-cyan-300/80 font-mono uppercase bg-slate-950/70 px-2.5 py-1 rounded border border-cyan-500/30">
                {mode === 'photo' ? 'Align Symptom Area' : 'Record Video Clip'}
              </div>
            </div>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Shutter Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleCamera}
            disabled={loading || !!error || isRecording}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all disabled:opacity-40"
            title="Switch Camera (Front/Rear)"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch Cam</span>
          </button>

          {mode === 'photo' ? (
            <button
              type="button"
              onClick={handleSnap}
              disabled={loading || !!error}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Photo</span>
            </button>
          ) : !isRecording ? (
            <button
              type="button"
              onClick={handleStartRecording}
              disabled={loading || !!error}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition-all transform active:scale-95"
            >
              <Circle className="w-4 h-4 fill-white" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 border border-rose-500 text-rose-400 hover:bg-rose-950 text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all animate-bounce"
            >
              <Square className="w-4 h-4 fill-rose-500" />
              <span>Stop & Save Video</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 text-xs font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
