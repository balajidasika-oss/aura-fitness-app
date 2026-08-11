import React, { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Camera, X, Activity, Maximize2, Minimize2, ScanEye } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AIPoseCoachProps {
  onClose: () => void;
  targetAsana: string;
}

// Utility to calculate angle between three points (A, B, C) where B is the vertex
const calculateAngle = (
  a: poseDetection.Keypoint,
  b: poseDetection.Keypoint,
  c: poseDetection.Keypoint
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
        const keypoints = poses[0].keypoints;
        // Filter out low confidence keypoints
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

          if (targetAsana.includes('Downward Dog')) {
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
          else if (targetAsana.includes('Warrior II') || targetAsana.includes('Triangle')) {
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
          else if (targetAsana.includes('Plank')) {
            const shoulder = lShoulder || rShoulder;
            const hip = lHip || rHip;
            const ankle = lAnkle || rAnkle;
            
            if (shoulder && hip && ankle && (shoulder.score||0)>0.4 && (hip.score||0)>0.4 && (ankle.score||0)>0.4) {
              const hipAngle = calculateAngle(shoulder, hip, ankle);
              if (hipAngle > 150) {
                currentPoseCorrect = true;
                setFeedbackMsg('Strong plank! Keep your back straight.');
              } else {
                setFeedbackMsg('Lower your hips to form a straight line.');
              }
            } else {
              setFeedbackMsg('Full body must be visible for Plank.');
            }
          }
          else if (targetAsana.includes('Tree')) {
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-500 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`relative bg-zinc-950 border border-white/10 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl rounded-[2rem] aspect-video'}`}>
        
        {/* Header - Glassmorphism */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <ScanEye className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                AuraFit AI Vision <span className="flex w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              </h3>
              <p className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">{targetAsana}</p>
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
              className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition backdrop-blur-sm border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video & Canvas Container */}
        <div className="flex-1 relative w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center">
          {/* Ambient background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10" />

          {isModelLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-30">
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
                <ScanEye className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-white tracking-wide">Calibrating AI Model</h2>
              <p className="text-xs font-medium text-indigo-300/80 mt-2">Loading high-accuracy Thunder Network...</p>
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
          
          {/* Feedback Overlay */}
          {!isModelLoading && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md">
              <div className={`p-5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-500 text-center flex flex-col items-center gap-2 ${
                isCorrect 
                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_20px_50px_rgba(16,185,129,0.2)]' 
                  : 'bg-zinc-900/60 border-zinc-700/50'
              }`}>
                <div className={`w-10 h-1 rounded-full ${isCorrect ? 'bg-emerald-400' : 'bg-white/20'}`} />
                <h4 className={`text-xl font-black ${isCorrect ? 'text-emerald-400' : 'text-white'}`}>
                  {isCorrect ? 'Excellent Form!' : 'Adjust Your Pose'}
                </h4>
                <p className={`text-sm font-medium ${isCorrect ? 'text-emerald-100' : 'text-zinc-300'}`}>
                  {feedbackMsg}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
