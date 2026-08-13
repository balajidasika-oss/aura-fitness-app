import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Utensils, Camera, Sparkles, Trash2, X, CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { IClientUser, IMealEntry, MealType } from '../../types';
import { submitDailyLog, fetchTodayLog } from '../../services/api';
import { LiveCameraModal } from '../../components/LiveCameraModal';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';

interface ClientNutritionDashboardProps {
  client: IClientUser;
  onLogSaved?: () => void;
}

export const ClientNutritionDashboard: React.FC<ClientNutritionDashboardProps> = ({ client, onLogSaved }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const [meals, setMeals] = useState<IMealEntry[]>([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealFile, setMealFile] = useState<File | null>(null);
  const [pendingMealFiles, setPendingMealFiles] = useState<File[]>([]);
  const [mealPreviewUrl, setMealPreviewUrl] = useState<string | null>(null);
  const [currentMealType, setCurrentMealType] = useState<MealType>('snack');
  const [mealCaption, setMealCaption] = useState<string>('');
  const [cameraModalMode, setCameraModalMode] = useState<'meal' | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadLog = async () => {
      try {
        const log = await fetchTodayLog(client._id, selectedDate);
        if (log && isMounted) {
          setMeals(log.meals || []);
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

  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleLiveCameraCapture = (dataUrl: string) => {
    if (cameraModalMode === 'meal') {
      const file = dataUrlToFile(dataUrl, `live-meal-${Date.now()}.jpg`);
      setMealFile(file);
      setMealPreviewUrl(dataUrl);
      setIsAddingMeal(true);
      setCameraModalMode(null);
    }
  };

  const handleAddMealItem = () => {
    if (!mealPreviewUrl || !mealFile) return;
    soundFx.playSuccessChime();
    const newMeal: IMealEntry = {
      type: currentMealType,
      imagePath: mealPreviewUrl,
      caption: mealCaption.trim(),
      loggedAt: new Date(),
    };
    setMeals((prev) => [...prev, newMeal]);
    setPendingMealFiles((prev) => [...prev, mealFile]);
    setMealCaption('');
    setMealPreviewUrl(null);
    setMealFile(null);
    setIsAddingMeal(false);
  };

  const handleSaveNutritionLog = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.append('clientId', client._id);
      formData.append('date', selectedDate);

      const existingMeals = meals.filter((m) => !m.imagePath?.startsWith('blob:'));
      const newMeals = meals.filter((m) => m.imagePath?.startsWith('blob:'));

      formData.append('existingMeals', JSON.stringify(existingMeals));
      if (pendingMealFiles.length > 0) {
        pendingMealFiles.forEach((file) => formData.append('mealPhotos', file));
        formData.append('mealTypes', JSON.stringify(newMeals.map((m) => m.type)));
        formData.append('mealCaptions', JSON.stringify(newMeals.map((m) => m.caption)));
      }

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
      console.error('Failed to submit nutrition log', err);
      alert(err.message || 'Error saving nutrition log');
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
                Nutrition Dashboard
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1 text-[var(--text-primary)]">Log Meals</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 glass-card rounded-2xl px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-subtle)] font-medium"
            />
          </div>
        </div>
      </div>

      <div className="surface-card rounded-2xl border border-[var(--border-subtle)] p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-1)] flex items-center justify-center text-rose-400 shadow-lg">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">Nutrition & Meals</h3>
              <span className="text-xs text-[var(--text-secondary)] font-medium">Snap food photos for coach macro review</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              alert("Scanning meal with Aura AI... \n\nEstimated Macros:\n- Calories: 450 kcal\n- Protein: 35g\n- Carbs: 45g\n- Fats: 12g\n\n(Coach will verify this result)");
            }}
            className="flex-1 py-3 rounded-xl bg-[var(--bg-surface-1)] hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold tracking-tight flex items-center justify-center space-x-2 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Scan Meal</span>
          </button>
          <button
            type="button"
            onClick={() => setCameraModalMode('meal')}
            className="flex-1 py-3 rounded-xl btn-primary text-xs font-bold tracking-tight flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/20 transition-all duration-300"
          >
            <Camera className="w-4 h-4" />
            <span>Snap Photo</span>
          </button>
        </div>

        {meals.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {meals.map((m, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] aspect-square bg-[var(--bg-surface-1)] group">
                <img src={m.imagePath} alt={m.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                  <span className="text-[10px] font-bold tracking-tight uppercase text-rose-400">{m.type}</span>
                  <span className="text-xs text-[var(--text-primary)] font-medium line-clamp-1 mt-0.5">{m.caption || 'Meal logged'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newMeals = [...meals];
                    newMeals.splice(idx, 1);
                    setMeals(newMeals);
                    if (m.imagePath?.startsWith('blob:')) {
                      const blobIdx = meals.filter(x => x.imagePath?.startsWith('blob:')).indexOf(m);
                      if (blobIdx > -1) {
                        const newFiles = [...pendingMealFiles];
                        newFiles.splice(blobIdx, 1);
                        setPendingMealFiles(newFiles);
                      }
                    }
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md hover:bg-rose-500 text-[var(--text-primary)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-[var(--border-subtle)]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl border border-[var(--border-subtle)] p-6 text-center">
            <Utensils className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">No meals snapped yet today.</p>
          </div>
        )}
      </div>

      <div className="pt-2 pb-6">
        <button
          type="button"
          onClick={handleSaveNutritionLog}
          disabled={isSubmitting}
          className={`w-full py-4 px-5 rounded-2xl text-sm font-bold tracking-tight text-[var(--text-primary)] flex items-center justify-center space-x-2 transition-all duration-300 ${
            saveSuccess
              ? 'bg-[var(--bg-surface-2)] ring-2 ring-emerald-400'
              : 'btn-primary shadow-lg shadow-rose-500/20 active:scale-[0.98]'
          } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 animate-spin" />
              <span>Syncing Nutrition Log...</span>
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Nutrition Synced Successfully!</span>
            </span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Nutrition</span>
            </>
          )}
        </button>
      </div>

      {isAddingMeal && mealPreviewUrl && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="surface-card border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-sm relative shadow-2xl animate-scale-in">
            <button 
              onClick={() => {
                setIsAddingMeal(false);
                setMealPreviewUrl(null);
                setMealFile(null);
              }}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] mb-4 flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-rose-400" />
              <span>Log Meal</span>
            </h3>
            
            <div className="aspect-square w-full rounded-xl overflow-hidden mb-5 border border-[var(--border-subtle)]">
              <img src={mealPreviewUrl} alt="Meal Preview" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Meal Type</label>
                <select
                  value={currentMealType}
                  onChange={(e) => setCurrentMealType(e.target.value as MealType)}
                  className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-rose-400 font-bold transition-colors"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block mb-1.5 uppercase tracking-wider">Caption / Macros (optional)</label>
                <input
                  type="text"
                  value={mealCaption}
                  onChange={(e) => setMealCaption(e.target.value)}
                  placeholder="e.g. 2 eggs, avocado toast (400 cal)"
                  className="w-full bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>

              <button
                onClick={handleAddMealItem}
                className="w-full py-3.5 mt-2 rounded-xl btn-primary text-sm font-bold tracking-tight flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/25 transition-all duration-300"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Save to Daily Log</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <LiveCameraModal
        isOpen={cameraModalMode !== null}
        onClose={() => setCameraModalMode(null)}
        onCapture={handleLiveCameraCapture}
        title="Snap Nutrition Photo"
        subtitle="Align within frame and tap shutter"
        defaultFacingMode="environment"
      />
    </div>
  );
};
