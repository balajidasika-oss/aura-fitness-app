import React, { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Camera, Activity, Maximize2, Minimize2, ScanEye, CheckCircle2, Info, ArrowLeft } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface AIPoseCoachProps {
  onClose: () => void;
  targetAsana: { name: string; image: string; duration: string; benefits: string };
}

// Utility to calculate angle between three points (A, B, C) where B is the vertex
const calculateAngle = (
  a: {x: number, y: number},
  b: {x: number, y: number},
  c: {x: number, y: number}
): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

export const AIPoseCoach: React.FC<AIPoseCoachProps> = ({ onClose, targetAsana }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('Initializing AI Coach...');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const reqFrameRef = useRef<number>(0);

  // EMA Smoothing State (Shock Absorber)
  const smoothedKeypointsRef = useRef<{ [key: string]: {x: number, y: number} }>({});

  useEffect(() => {
    let mounted = true;

    const setupCameraAndModel = async () => {
      try {
        await tf.ready();
        
        // Load MoveNet Thunder (More accurate for Yoga)
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        
        if (!mounted) return;
        detectorRef.current = detector;

        // Setup Camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false,
        });
        
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsModelLoading(false);
            setFeedbackMsg('Step back so your full body is visible.');
            detectPose();
          };
        }
      } catch (err) {
        console.error('AI Coach Setup Error:', err);
        setFeedbackMsg('Failed to initialize AI Coach. Please check camera permissions.');
      }
    };

    setupCameraAndModel();

    return () => {
      mounted = false;
      if (reqFrameRef.current) cancelAnimationFrame(reqFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const detectPose = async () => {
    if (!videoRef.current || !canvasRef.current || !detectorRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas dimensions match video
    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (poses.length > 0) {
        const rawKeypoints = poses[0].keypoints;
        
        // Apply EMA Smoothing
        const EMA_ALPHA = 0.7; // Increased for faster "smarter" responsiveness
        const keypoints = rawKeypoints.map(kp => {
          if (!kp.name) return kp;
          const prev = smoothedKeypointsRef.current[kp.name];
          if (prev && kp.score && kp.score > 0.2) {
            const newX = prev.x + EMA_ALPHA * (kp.x - prev.x);
            const newY = prev.y + EMA_ALPHA * (kp.y - prev.y);
            smoothedKeypointsRef.current[kp.name] = { x: newX, y: newY };
            return { ...kp, x: newX, y: newY };
          } else if (kp.score && kp.score > 0.2) {
            smoothedKeypointsRef.current[kp.name] = { x: kp.x, y: kp.y };
          }
          return kp;
        });

        const validKeypoints = keypoints.filter(k => (k.score || 0) > 0.4);
        
        // Determine correctness based on target Asana
        let currentPoseCorrect = false;
        
        if (validKeypoints.length > 8) {
          const lShoulder = keypoints.find(k => k.name === 'left_shoulder');
          const rShoulder = keypoints.find(k => k.name === 'right_shoulder');
          const lHip = keypoints.find(k => k.name === 'left_hip');
          const rHip = keypoints.find(k => k.name === 'right_hip');
          const lKnee = keypoints.find(k => k.name === 'left_knee');
          const rKnee = keypoints.find(k => k.name === 'right_knee');
          const lAnkle = keypoints.find(k => k.name === 'left_ankle');
          const rAnkle = keypoints.find(k => k.name === 'right_ankle');
          const lElbow = keypoints.find(k => k.name === 'left_elbow');
          const rElbow = keypoints.find(k => k.name === 'right_elbow');
          const lWrist = keypoints.find(k => k.name === 'left_wrist');
          const rWrist = keypoints.find(k => k.name === 'right_wrist');

          if (targetAsana.name.includes('Downward Dog')) {
            const shoulder = lShoulder || rShoulder;
            const hip = lHip || rHip;
            const ankle = lAnkle || rAnkle;
            
            if (shoulder && hip && ankle && (shoulder.score || 0) > 0.4 && (hip.score || 0) > 0.4 && (ankle.score || 0) > 0.4) {
              const hipAngle = calculateAngle(shoulder, hip, ankle);
              if (hipAngle > 60 && hipAngle < 120) {
                currentPoseCorrect = true;
                setFeedbackMsg('Perfect Downward Dog shape!');
              } else {
                setFeedbackMsg(hipAngle < 60 ? 'Push your hips higher.' : 'Bring your hands and feet closer.');
              }
            } else {
              setFeedbackMsg('Make sure your hips and legs are visible.');
            }
          } 
          else if (targetAsana.name.includes('Warrior II') || targetAsana.name.includes('Triangle')) {
            if (lShoulder && lElbow && lWrist && lHip && (lShoulder.score||0)>0.4 && (lElbow.score||0)>0.4 && (lWrist.score||0)>0.4) {
              const armAngle = calculateAngle(lHip, lShoulder, lElbow);
              if (armAngle > 70 && armAngle < 110) {
                currentPoseCorrect = true;
                setFeedbackMsg('Great arm extension! Keep your core tight.');
              } else {
                setFeedbackMsg('Raise your arms parallel to the floor.');
              }
            } else {
              setFeedbackMsg('Make sure your upper body is visible.');
            }
          }
          else if (targetAsana.name.includes('Plank') || targetAsana.name.includes('Sun Salutation')) {
            const shoulder = lShoulder || rShoulder;
            const hip = lHip || rHip;
            const ankle = lAnkle || rAnkle;
            
            if (shoulder && hip && ankle && (shoulder.score||0)>0.4 && (hip.score||0)>0.4 && (ankle.score||0)>0.4) {
              const hipAngle = calculateAngle(shoulder, hip, ankle);
              if (hipAngle > 150) {
                currentPoseCorrect = true;
                setFeedbackMsg('Strong posture! Keep your back straight.');
              } else {
                setFeedbackMsg('Lower your hips to form a straight line.');
              }
            } else {
              setFeedbackMsg('Full body must be visible.');
            }
          }
          else if (targetAsana.name.includes('Tree')) {
            if (lKnee && rKnee && lAnkle && rAnkle && (lKnee.score||0)>0.4 && (rKnee.score||0)>0.4) {
              // One knee should be bent outwards
              currentPoseCorrect = true;
              setFeedbackMsg('Beautiful Tree pose. Find your balance.');
            } else {
              setFeedbackMsg('Make sure your legs are fully visible.');
            }
          }
          else {
            setFeedbackMsg('Tracking body alignment...');
          }
        } else {
          setFeedbackMsg('Step back to show more of your body.');
          currentPoseCorrect = false;
        }

        setIsCorrect(currentPoseCorrect);

        // Premium Neon Skeleton Drawing
        const connections = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
        const neonColor = currentPoseCorrect ? '#10b981' : '#0ea5e9'; // Emerald or Sky Blue
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw connections with glow
        connections.forEach(([i, j]) => {
          const kp1 = keypoints[i];
          const kp2 = keypoints[j];
          if ((kp1.score || 0) > 0.4 && (kp2.score || 0) > 0.4) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            
            // Glow effect
            ctx.lineWidth = 6;
            ctx.strokeStyle = neonColor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = neonColor;
            ctx.stroke();
            
            // Core line
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        });

        // Draw joint points with pulse effect
        const time = Date.now() / 150;
        const pulse = Math.sin(time) * 3 + 6;

        validKeypoints.forEach(kp => {
          // Outer glow ring
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, pulse, 0, 2 * Math.PI);
          ctx.fillStyle = 'transparent';
          ctx.lineWidth = 2;
          ctx.strokeStyle = neonColor;
          ctx.shadowBlur = 10;
          ctx.shadowColor = neonColor;
          ctx.stroke();

          // Inner solid point
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.fill();
        });
      }

    } catch (e) {
      // ignore
    }

    reqFrameRef.current = requestAnimationFrame(detectPose);
  };

  useEffect(() => {
    if (isCorrect) {
      soundFx.playCheerSound();
    }
  }, [isCorrect]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-2 md:p-6 animate-in fade-in zoom-in-95 duration-500 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`relative bg-zinc-950/80 border border-white/10 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full h-full max-w-7xl max-h-[900px] rounded-[2rem]'}`}>
        
        {/* Header - Glassmorphism */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <ScanEye className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                AuraFit AI Vision <span className="flex w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              </h3>
              <p className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">{targetAsana.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { soundFx.playTapSound(); setIsFullscreen(!isFullscreen); }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition backdrop-blur-sm border border-white/10"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => { soundFx.playTapSound(); onClose(); }}
              className="px-4 py-2 flex items-center gap-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition backdrop-blur-sm border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold text-sm">Back</span>
            </button>
          </div>
        </div>

        {/* Content Body - Split Screen */}
        <div className="flex-1 flex flex-row relative w-full h-full bg-zinc-950 overflow-hidden pt-[88px]">
          
          {/* LEFT PANEL: Reference Image & Instructions */}
          <div className="w-[40%] md:w-1/3 h-full border-r border-white/5 bg-zinc-900/50 flex flex-col overflow-y-auto">
            {/* Reference Image */}
            <div className="relative h-48 md:h-2/5 shrink-0 bg-zinc-900 p-4 flex flex-col justify-center items-center">
              <img 
                src={targetAsana.image} 
                alt={targetAsana.name} 
                className="w-full h-full object-cover rounded-xl shadow-lg border border-white/10"
              />
              <div className="absolute bottom-6 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                Target Reference
              </div>
            </div>

            {/* Coach's Lead Instructions */}
            <div className="flex-1 p-6 flex flex-col">
              <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Coach's Instructions
              </h4>
                <div className="flex-1 mt-auto">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" /> Benefits
                  </h4>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {targetAsana.benefits}
                  </p>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-inner mb-6">
                    <span className="font-bold text-white text-xs block mb-2">Live Alignment Guide:</span>
                    <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                      <li>Align your body exactly like the reference image.</li>
                      <li>Watch the neon skeleton on the right.</li>
                      <li>Wait for the skeleton to turn green.</li>
                    </ul>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <button 
                      onClick={() => {
                        confetti({
                          particleCount: 150,
                          spread: 70,
                          origin: { y: 0.6 },
                          colors: ['#10B981', '#3B82F6', '#8B5CF6']
                        });
                        soundFx.playSuccessChime();
                        setTimeout(() => onClose(), 1500);
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Asana Complete!
                    </button>
                  </div>
                </div>
              </div>
            </div>

          {/* RIGHT PANEL: Live Camera Tracking */}
          <div className="w-[60%] md:w-2/3 h-full relative flex items-center justify-center bg-black">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10" />

            {isModelLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md z-30">
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
                  <ScanEye className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-white tracking-wide">Calibrating AI Model</h2>
                <p className="text-xs font-medium text-indigo-300/80 mt-2">Initializing THUNDER tracking with EMA Smoothing...</p>
              </div>
            )}
            
            <video 
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-contain scale-x-[-1] opacity-70" 
            />
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain scale-x-[-1] z-10 drop-shadow-2xl"
            />
            
            {/* Live Feedback Bubble Overlay */}
            {!isModelLoading && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm">
                <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 flex items-center justify-between gap-4 ${
                  isCorrect 
                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_20px_50px_rgba(16,185,129,0.2)]' 
                    : 'bg-zinc-900/80 border-zinc-700/50'
                }`}>
                  <div className="flex-1">
                    <h4 className={`text-base font-black ${isCorrect ? 'text-emerald-400' : 'text-white'}`}>
                      {isCorrect ? 'Perfect Form!' : 'Adjust Alignment'}
                    </h4>
                    <p className={`text-xs mt-0.5 font-medium ${isCorrect ? 'text-emerald-100' : 'text-zinc-300'}`}>
                      {feedbackMsg}
                    </p>
                  </div>
                  {isCorrect ? (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 shrink-0 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/50">
                      <Activity className="w-5 h-5 text-sky-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
