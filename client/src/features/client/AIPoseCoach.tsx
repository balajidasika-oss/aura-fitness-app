import React, { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Camera, X, Activity, Maximize2, Minimize2 } from 'lucide-react';
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
        
        // Load MoveNet (fastest for browser)
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
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
        const validKeypoints = keypoints.filter(k => (k.score || 0) > 0.3);
        
        // Determine correctness based on target Asana
        let currentPoseCorrect = false;
        
        if (validKeypoints.length > 10) {
          if (targetAsana.includes('Downward Dog')) {
            // Check shoulder-hip-ankle angle
            const shoulder = keypoints.find(k => k.name === 'left_shoulder' || k.name === 'right_shoulder');
            const hip = keypoints.find(k => k.name === 'left_hip' || k.name === 'right_hip');
            const ankle = keypoints.find(k => k.name === 'left_ankle' || k.name === 'right_ankle');
            
            if (shoulder && hip && ankle && (shoulder.score || 0) > 0.3 && (hip.score || 0) > 0.3 && (ankle.score || 0) > 0.3) {
              const hipAngle = calculateAngle(shoulder, hip, ankle);
              if (hipAngle > 70 && hipAngle < 110) {
                currentPoseCorrect = true;
                setFeedbackMsg('Perfect Downward Dog shape!');
              } else {
                setFeedbackMsg(hipAngle < 70 ? 'Push your hips higher.' : 'Bring your hands and feet closer.');
              }
            } else {
              setFeedbackMsg('Make sure your hips and legs are visible.');
            }
          } 
          else if (targetAsana.includes('Warrior II')) {
            // Check arms are parallel to ground (shoulder-elbow-wrist)
            const lShoulder = keypoints.find(k => k.name === 'left_shoulder');
            const lElbow = keypoints.find(k => k.name === 'left_elbow');
            const lWrist = keypoints.find(k => k.name === 'left_wrist');
            const lHip = keypoints.find(k => k.name === 'left_hip');
            
            if (lShoulder && lElbow && lWrist && lHip && (lShoulder.score||0)>0.3 && (lElbow.score||0)>0.3 && (lWrist.score||0)>0.3) {
              const armAngle = calculateAngle(lHip, lShoulder, lElbow);
              if (armAngle > 80 && armAngle < 100) {
                currentPoseCorrect = true;
                setFeedbackMsg('Great arm extension! Keep your core tight.');
              } else {
                setFeedbackMsg('Raise your arms parallel to the floor.');
              }
            } else {
              setFeedbackMsg('Make sure your upper body is visible.');
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

        // Draw Skeleton
        const connections = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
        const color = currentPoseCorrect ? '#10b981' : '#f43f5e'; // emerald-500 or rose-500
        
        ctx.lineWidth = 4;
        ctx.strokeStyle = color;
        
        connections.forEach(([i, j]) => {
          const kp1 = keypoints[i];
          const kp2 = keypoints[j];
          if ((kp1.score || 0) > 0.3 && (kp2.score || 0) > 0.3) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
          }
        });

        // Draw points
        validKeypoints.forEach(kp => {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = color;
          ctx.stroke();
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`relative bg-zinc-950 border border-zinc-800 flex flex-col overflow-hidden shadow-2xl ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl rounded-3xl aspect-video'}`}>
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">AI Coach Analysis</h3>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">{targetAsana}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { soundFx.playTapSound(); setIsFullscreen(!isFullscreen); }}
              className="p-2 rounded-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 transition backdrop-blur-sm"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => { soundFx.playTapSound(); onClose(); }}
              className="p-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition backdrop-blur-sm border border-rose-500/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video & Canvas Container */}
        <div className="flex-1 relative w-full h-full bg-zinc-900 overflow-hidden flex items-center justify-center">
          {isModelLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-10">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-indigo-400 animate-pulse">Loading AI Vision Model...</p>
            </div>
          )}
          
          <video 
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-contain scale-x-[-1]" 
          />
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-contain scale-x-[-1] z-10"
          />
          
          {/* Feedback Overlay */}
          {!isModelLoading && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md">
              <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 text-center ${
                isCorrect 
                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-emerald-500/20' 
                  : 'bg-zinc-950/80 border-zinc-700'
              }`}>
                <h4 className={`text-lg font-black ${isCorrect ? 'text-emerald-400' : 'text-white'}`}>
                  {isCorrect ? 'Excellent Form!' : 'Adjust Your Pose'}
                </h4>
                <p className={`text-xs mt-1 font-medium ${isCorrect ? 'text-emerald-200' : 'text-zinc-300'}`}>
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
