import React, { useState, useEffect } from 'react';
import { Gauge, Timer, RotateCcw, CheckCircle2, Send } from 'lucide-react';
import { IClientUser, CardioActivityType, ICardioLog } from '../../types';
import { submitDailyLog, fetchTodayLog } from '../../services/api';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface ClientCardioDashboardProps {
  client: IClientUser;
  onLogSaved?: () => void;
}

export const ClientCardioDashboard: React.FC<ClientCardioDashboardProps> = ({ client, onLogSaved }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [cardioType, setCardioType] = useState<CardioActivityType>('incline_walk');
  const [cardioDistanceKm, setCardioDistanceKm] = useState<number>(4.2);
  const [cardioDurationMins, setCardioDurationMins] = useState<number>(35);
  const [inclinePercentage, setInclinePercentage] = useState<number>(12);
  const [stairmasterFloors, setStairmasterFloors] = useState<number>(85);
  const [stairmasterLevel, setStairmasterLevel] = useState<number>(8);
  const [heartRateAvg, setHeartRateAvg] = useState<number>(140);
  
  const calculatedCalories = Math.round(
    cardioType === 'stairmaster'
      ? stairmasterFloors * 3.5 + cardioDurationMins * 8
      : cardioDistanceKm * 65 * (1 + inclinePercentage * 0.08)
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadLog = async () => {
      try {
        const log = await fetchTodayLog(client._id, selectedDate);
        if (log && isMounted) {
          const cardio = log.cardio || log.running;
          if (cardio) {
            setCardioType(
              cardio.activityType ||
                (cardio.stairmasterFloors && cardio.stairmasterFloors > 0
                  ? 'stairmaster'
                  : cardio.inclinePercentage && cardio.inclinePercentage > 0
                  ? 'incline_walk'
                  : 'running')
            );
            setCardioDistanceKm(cardio.distanceKm || 0);
            setCardioDurationMins(cardio.durationMinutes || 0);
            setInclinePercentage(cardio.inclinePercentage || 0);
            setStairmasterFloors(cardio.stairmasterFloors || 0);
            setStairmasterLevel(cardio.stairmasterLevel || 0);
            setHeartRateAvg(cardio.heartRateAvg || 0);
          }
        }
      } catch (err) {
        console.error('Failed to load log', err);
      }
    };
    loadLog();
    return () => {
      isMounted = false;
    };
  }, [client._id, selectedDate]);

  const handleSaveCardioLog = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.append('clientId', client._id);
      formData.append('date', selectedDate);

      const cardioPayload: ICardioLog = {
        activityType: cardioType,
        distanceKm: cardioDistanceKm,
        durationMinutes: cardioDurationMins,
        pace: cardioDistanceKm > 0 ? `${(cardioDurationMins / cardioDistanceKm).toFixed(1)} min/km` : '',
        inclinePercentage,
        stairmasterFloors,
        stairmasterLevel,
        heartRateAvg,
        caloriesBurned: calculatedCalories,
      };
      formData.append('cardio', JSON.stringify(cardioPayload));

      await submitDailyLog(formData);

      soundFx.playCheerSound();
      setSaveSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });

      if (onLogSaved) {
        onLogSaved();
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to submit cardio log', err);
      alert(err.message || 'Error saving cardio log');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[var(--bg-surface-1)] rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--bg-surface-2)] transition-colors duration-700" />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                Cardio Dashboard
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1 text-[var(--text-primary)]">Log Conditioning</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 glass-card rounded-2xl px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-subtle)] font-medium"
            />
          </div>
        </div>
      </div>

      <div className="surface-card rounded-2xl border border-[var(--border-subtle)] p-5 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-1)] flex items-center justify-center text-cyan-400 shadow-lg">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Cardio Conditioning</h3>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">Treadmill Incline • StairMaster • Running</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm">
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mb-1">Est. Calories Burned</p>
            <p className="text-2xl font-extrabold text-[var(--text-primary)]">{calculatedCalories} <span className="text-xs text-[var(--text-secondary)] font-bold">kcal</span></p>
          </div>
          <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20">
            <Gauge className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-[var(--bg-surface-1)] p-1.5 rounded-2xl border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setCardioType('incline_walk');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-1 ${
              cardioType === 'incline_walk'
                ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>⛰️ Incline</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setCardioType('stairmaster');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-1 ${
              cardioType === 'stairmaster'
                ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>🪜 Stairs</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              setCardioType('running');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-1 ${
              cardioType === 'running'
                ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>🏃 Run</span>
          </button>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-[var(--border-subtle)] space-y-4">
          {cardioType === 'incline_walk' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Treadmill Incline</span>
                <span className="text-xs font-bold tracking-tight text-[var(--text-primary)] font-mono">{inclinePercentage}% Incline</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={inclinePercentage}
                onChange={(e) => setInclinePercentage(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cardioDistanceKm}
                    onChange={(e) => setCardioDistanceKm(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Duration (min)</label>
                  <input
                    type="number"
                    value={cardioDurationMins}
                    onChange={(e) => setCardioDurationMins(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {cardioType === 'stairmaster' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Floors Climbed</label>
                <input
                  type="number"
                  value={stairmasterFloors}
                  onChange={(e) => setStairmasterFloors(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Speed Level (1-20)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={stairmasterLevel}
                  onChange={(e) => setStairmasterLevel(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          )}

          {cardioType === 'running' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cardioDistanceKm}
                  onChange={(e) => setCardioDistanceKm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Duration (min)</label>
                <input
                  type="number"
                  value={cardioDurationMins}
                  onChange={(e) => setCardioDurationMins(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 pb-6">
        <button
          type="button"
          onClick={handleSaveCardioLog}
          disabled={isSubmitting}
          className={`w-full py-4 px-5 rounded-2xl text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center justify-center space-x-2 transition-all duration-300 ${
            saveSuccess
              ? 'bg-[var(--bg-surface-2)] ring-2 ring-emerald-400'
              : 'btn-primary shadow-lg shadow-cyan-500/20 active:scale-[0.98]'
          } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 animate-spin" />
              <span>Syncing Cardio Log...</span>
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cardio Synced Successfully!</span>
            </span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Cardio Session</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
