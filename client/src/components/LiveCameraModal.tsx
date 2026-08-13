import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, Check, Zap, Image as ImageIcon } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  title: string;
  subtitle?: string;
  defaultFacingMode?: 'user' | 'environment';
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
  subtitle = 'Align within the frame and tap the shutter',
  defaultFacingMode = 'user',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(defaultFacingMode);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [hasGrid, setHasGrid] = useState(true);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by your browser environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Could not connect to camera hardware.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFlipCamera = () => {
    soundFx.playTapSound();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleTakeShutter = () => {
    if (!videoRef.current || !canvasRef.current) return;

    soundFx.playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        // Mirror selfie view
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleUseMockSnapshot = () => {
    soundFx.playShutterSound();
    // High quality realistic snapshot fallback
    const mockShots = [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
    ];
    const picked = mockShots[Math.floor(Math.random() * mockShots.length)];
    setCapturedImage(picked);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      soundFx.playTapSound();
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleRetake = () => {
    soundFx.playTapSound();
    setCapturedImage(null);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-md p-4 animate-scale-in">
      <div className="relative w-full max-w-sm glass-card-elevated border border-[var(--border-medium)] rounded-3xl overflow-hidden flex flex-col">
        {/* Shutter White Flash overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 pointer-events-none opacity-80" />
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between p-4 bg-[var(--bg-glass)] border-b border-[var(--border-subtle)] z-10 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <h3 className="font-bold text-[var(--text-primary)] text-sm">{title}</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full btn-ghost flex items-center justify-center transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center">
          {capturedImage ? (
            /* Review Mode */
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Captured Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 pill-emerald shadow-lg flex items-center gap-1 animate-slide-in-right">
                <Check className="w-3.5 h-3.5" />
                <span>Captured Ready</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Permission or Hardware Error Fallback */
            <div className="p-6 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-primary)] flex items-center justify-center shadow-lg">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">{cameraError}</p>
              <button
                onClick={handleUseMockSnapshot}
                className="mt-2 btn-primary shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Use Instant High-Res Cam Shot</span>
              </button>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Composition Grid Lines */}
              {hasGrid && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
              )}

              {/* Top Viewfinder Controls */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => setHasGrid(!hasGrid)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all duration-300 ${
                    hasGrid
                      ? 'bg-[var(--bg-glass)] text-[var(--text-primary)] border-[var(--border-medium)]'
                      : 'bg-black/30 text-[var(--text-secondary)] border-[var(--border-subtle)]'
                  }`}
                >
                  Grid {hasGrid ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Shutter & Action Bar */}
        <div className="p-4 bg-[var(--bg-glass)] border-t border-[var(--border-subtle)] flex items-center justify-between backdrop-blur-xl pb-safe">
          {capturedImage ? (
            /* Confirm / Retake Actions */
            <div className="flex items-center justify-between w-full gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-2xl btn-ghost text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 rounded-2xl btn-primary text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all duration-300 animate-slide-in-right"
              >
                <Check className="w-4 h-4" />
                <span>Use Photo</span>
              </button>
            </div>
          ) : (
            /* Shutter Trigger & Switch Camera */
            <div className="flex items-center justify-around w-full">
              {/* Quick sample snapshot button */}
              <button
                onClick={handleUseMockSnapshot}
                title="Use instant snapshot"
                className="w-12 h-12 rounded-full btn-icon transition-all duration-300"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Primary Shutter Button */}
              <button
                onClick={handleTakeShutter}
                className="relative group p-1.5 rounded-full border-[3px] border-[var(--border-medium)] hover:border-[var(--text-secondary)] transition-transform active:scale-95"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--bg-surface-2)] group-hover:bg-[var(--bg-surface-1)] transition-colors shadow-lg flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[var(--bg-void)] bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
              </button>

              {/* Flip Front/Back Camera */}
              <button
                onClick={handleFlipCamera}
                title="Flip Camera"
                className="w-12 h-12 rounded-full btn-icon transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
