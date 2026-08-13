import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Flame, 
  Zap, 
  Utensils, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Smile, 
  MessageCircle, 
  Search, 
  ExternalLink, 
  ChevronRight, 
  Filter,
  Camera,
  Volume2,
  Dumbbell,
  Layers,
  TrendingUp,
  Activity,
  Mic,
  Play,
  Pause,
  Award,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { IClientUser, IDailyLog, IUser } from '../../types';
import { fetchClientDetail, sendCoachCheer } from '../../services/api';
import { StoryPreviewModal } from './StoryPreviewModal';
import { ClientDetailDrawer } from './ClientDetailDrawer';
import { speakDailyVoiceFeedback, generateDailyVoiceScript, soundFx } from '../../utils/audio';

interface CoachDashboardProps {
  coachUser?: IUser;
  clients: IClientUser[];
  onRefresh?: () => void;
  onRefreshRoster?: () => void;
  isLoading: boolean;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  coachUser,
  clients,
  onRefresh,
  onRefreshRoster,
  isLoading,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientLogsMap, setClientLogsMap] = useState<{ [clientId: string]: IDailyLog[] }>({});
  const [activeTab, setActiveTab] = useState<'feed' | 'athletes'>('feed');
  const [customNotes, setCustomNotes] = useState<{ [logId: string]: string }>({});
  const [cheerSuccessLogId, setCheerSuccessLogId] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [copiedCode, setCopiedCode] = useState(false);

  // Story Modal State
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [storyInitialIndex, setStoryInitialIndex] = useState(0);

  // Audio Playback State for Voice Memos
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const refreshAction = onRefresh || onRefreshRoster || (() => {});

  // Load latest logs for all athletes in the roster
  useEffect(() => {
    let isMounted = true;
    const loadAllDetails = async () => {
      const map: { [clientId: string]: IDailyLog[] } = {};
      for (const client of clients) {
        try {
          const detail = await fetchClientDetail(client._id);
          if (detail && detail.logs) {
            map[client._id] = detail.logs;
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (isMounted) setClientLogsMap(map);
    };
    if (clients.length > 0) {
      loadAllDetails();
    }
    return () => { 
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [clients]);

  // Handle 1-tap quick cheer reaction
  const handleQuickCheer = async (clientId: string, logId: string, emoji: string, defaultMsg: string) => {
    try {
      soundFx.playCheerSound();
      await sendCoachCheer(clientId, logId, emoji, defaultMsg);
      setCheerSuccessLogId(logId);
      refreshAction();
      setTimeout(() => setCheerSuccessLogId(null), 2500);
    } catch (err) {
      alert('Failed to send cheer');
    }
  };

  const handleCopyCoachCode = () => {
    if (coachUser?.coachCode) {
      try {
        navigator.clipboard.writeText(coachUser.coachCode);
      } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = coachUser.coachCode;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err2) {
          console.error("Fallback copy failed", err2);
        }
        document.body.removeChild(textArea);
      }
      setCopiedCode(true);
      soundFx.playSuccessChime();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const toggleFeedAudio = (url: string) => {
    soundFx.playTapSound();
    if (playingAudioUrl === url) {
      audioRef.current?.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setPlayingAudioUrl(url);
      audio.onended = () => setPlayingAudioUrl(null);
      audio.onerror = () => {
        alert('Could not play voice note audio');
        setPlayingAudioUrl(null);
      };
    }
  };

  const handleOpenStory = (index: number) => {
    soundFx.playTapSound();
    setStoryInitialIndex(index);
    setIsStoryOpen(true);
  };

  const handleSpeakReview = (client: IClientUser, latestLog?: IDailyLog) => {
    soundFx.playTapSound();
    const script = generateDailyVoiceScript({
      clientName: client.name.split(' ')[0],
      workoutTitle: latestLog?.workout?.title,
      workoutExercises: latestLog?.workout?.exercises,
      workoutIntensity: latestLog?.workout?.intensity,
      workoutDuration: latestLog?.workout?.totalSessionDurationMinutes || latestLog?.workout?.durationMinutes,
      activityType: latestLog?.cardio?.activityType || latestLog?.running?.activityType,
      distanceKm: latestLog?.cardio?.distanceKm || latestLog?.running?.distanceKm,
      durationMinutes: latestLog?.cardio?.durationMinutes || latestLog?.running?.durationMinutes,
      pace: latestLog?.cardio?.pace || latestLog?.running?.pace,
      inclinePercentage: latestLog?.cardio?.inclinePercentage || latestLog?.running?.inclinePercentage,
      stairmasterFloors: latestLog?.cardio?.stairmasterFloors || latestLog?.running?.stairmasterFloors,
      stairmasterLevel: latestLog?.cardio?.stairmasterLevel || latestLog?.running?.stairmasterLevel,
      mealCount: latestLog?.meals?.length || 0,
      hasSelfie: Boolean(latestLog?.postWorkoutPhoto),
      streak: client.streak || 0,
      coachName: coachUser?.name || 'Your Coach',
    });
    speakDailyVoiceFeedback(script);
  };

  const filteredClients = clients.filter((c) => {
    if (filterTier === 'all') return true;
    return c.compliance?.tier === filterTier;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Coach Header */}
      <div className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pill-cyan text-[10px] font-bold uppercase tracking-wider">
              Coach Command Center
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {clients.length} Athlete{clients.length === 1 ? '' : 's'} on Roster
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Welcome, {coachUser?.name || 'Coach'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Monitor real daily workouts, listen to live voice memos, and cheer your athletes.
          </p>
        </div>

        {coachUser?.coachCode && (
          <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-2xl flex items-center gap-3 w-full sm:w-auto justify-between">
            <div>
              <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Your Coach Code</div>
              <div className="text-sm font-bold tracking-tight text-[var(--text-primary)] font-mono tracking-wider">{coachUser.coachCode}</div>
            </div>
            <button
              onClick={handleCopyCoachCode}
              className="btn-ghost flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* When no clients connected yet */}
      {clients.length === 0 && !isLoading && (
        <div className="glass-card p-8 text-center space-y-4 max-w-xl mx-auto animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">No Athletes Connected Yet</h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Share your unique Coach Code{' '}
            <strong className="text-[var(--text-primary)] font-mono">{coachUser?.coachCode || 'COACH-CODE'}</strong> with your clients.
            When they enter this code during registration, their workouts, nutrition photos, and voice notes will appear right here in your live stream.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleCopyCoachCode}
              className="btn-primary flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Invite Code</span>
            </button>
            <button
              onClick={refreshAction}
              className="btn-ghost flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Roster</span>
            </button>
          </div>
        </div>
      )}

      {/* If athletes exist: Tab Selector */}
      {clients.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex bg-[var(--bg-surface-1)] p-1 rounded-2xl border border-[var(--border-subtle)]">
            <button
              onClick={() => {
                soundFx.playTapSound();
                setActiveTab('feed');
              }}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ${
                activeTab === 'feed'
                  ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Activity Stream
            </button>
            <button
              onClick={() => {
                soundFx.playTapSound();
                setActiveTab('athletes');
              }}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 ${
                activeTab === 'athletes'
                  ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Athlete Roster ({clients.length})
            </button>
          </div>

          <button
            onClick={refreshAction}
            className="btn-icon"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stories / Athlete Avatars Scroll Bar */}
      {clients.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--text-primary)]" />
              <span>Today's Athlete Stories</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">Tap avatar to view summary</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
            {clients.map((client, idx) => {
              const isGreen = client.compliance?.tier === 'green';
              const isYellow = client.compliance?.tier === 'yellow';

              return (
                <button
                  key={client._id}
                  onClick={() => handleOpenStory(idx)}
                  className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
                >
                  <div
                    className={`p-0.5 rounded-full transition-all duration-300 ${
                      isGreen
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 ring-2 ring-emerald-500/20'
                        : isYellow
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 ring-2 ring-amber-500/20'
                        : 'bg-gradient-to-tr from-rose-500 to-red-400 ring-2 ring-rose-500/20'
                    } group-hover:scale-105 group-active:scale-95`}
                  >
                    <img
                      src={client.avatarUrl}
                      alt={client.name}
                      className="w-13 h-13 rounded-full object-cover border-2 border-[var(--bg-void)]"
                    />
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    <span className="text-[11px] font-bold text-[var(--text-primary)] truncate max-w-[60px]">
                      {client.name.split(' ')[0]}
                    </span>
                    {client.streak && client.streak > 0 ? (
                      <Flame className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 1: DAILY CHECK-IN STREAM FEED */}
      {activeTab === 'feed' && clients.length > 0 && (
        <div className="space-y-4">
          {clients.map((client) => {
            const logs = clientLogsMap[client._id] || [];
            const latestLog = logs[0];
            const logId = latestLog?._id || `temp-${client._id}`;
            const isCheered = Boolean(latestLog?.coachFeedback || cheerSuccessLogId === logId);

            const cardio = latestLog?.cardio || latestLog?.running;
            const workout = latestLog?.workout;

            const totalDuration = workout?.totalSessionDurationMinutes || workout?.durationMinutes || 45;
            const grandTotalReps = workout?.totalWorkoutReps || workout?.muscleGroups?.reduce((a, b) => a + (b.totalMuscleReps || 0), 0) || 0;

            const voiceUrl = latestLog?.voiceNoteUrl || latestLog?.audioVoiceNoteUrl;
            const hasVoiceNote = Boolean(voiceUrl);
            const isAudioPlaying = playingAudioUrl === voiceUrl;

            return (
              <div
                key={client._id}
                className="surface-card overflow-hidden animate-slide-up"
              >
                {/* Athlete Top Bar */}
                <div className="p-3.5 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-1)]">
                  <div 
                    onClick={() => setSelectedClientId(client._id)}
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-all duration-300"
                  >
                    <img
                      src={client.avatarUrl}
                      alt={client.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-[var(--border-subtle)]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight flex items-center gap-1">
                        <span>{client.name}</span>
                        <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                      </h4>
                      <p className="text-[10px] text-[var(--text-secondary)] font-medium">
                        {client.fitnessGoal} · {client.streak || 0}d streak
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSpeakReview(client, latestLog)}
                      title="Audio Voice Coach Synthesis"
                      className="btn-icon"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span
                      className={`text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full ${
                        client.compliance?.tier === 'green'
                          ? 'pill-emerald'
                          : client.compliance?.tier === 'yellow'
                          ? 'pill-amber'
                          : 'pill-rose'
                      }`}
                    >
                      {client.compliance?.score || 100}%
                    </span>
                  </div>
                </div>

                {/* Main Content Area */}
                {latestLog ? (
                  <div className="p-3.5 space-y-3">
                    {/* End of Session Workout Selfie Photo */}
                    {(latestLog.postWorkoutPhoto || latestLog.photoUrl) && (
                      <div className="relative rounded-2xl overflow-hidden h-48 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
                        <img
                          src={latestLog.postWorkoutPhoto || latestLog.photoUrl}
                          alt="End of session selfie"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-2.5 left-2.5 glass-card text-[var(--text-primary)] text-[10px] font-bold tracking-tight px-2.5 py-0.5 rounded-full">
                          📸 Session Selfie Logged
                        </div>
                      </div>
                    )}

                    {/* Workout Breakdown Bar */}
                    {workout && (
                      <div className="p-3 rounded-2xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <Dumbbell className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                            <span>{workout.title || 'Strength Session'}</span>
                          </span>
                          <span className="text-[var(--text-primary)] font-bold tracking-tight text-[11px]">
                            {grandTotalReps > 0 ? `${grandTotalReps} Total Reps` : `${totalDuration} mins`}
                          </span>
                        </div>
                        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {workout.muscleGroups.map((mg, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)]"
                              >
                                {mg.label}: <strong>{mg.totalMuscleReps} reps</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cardio Breakdown */}
                    {cardio && (cardio.distanceKm > 0 || (cardio.stairmasterFloors && cardio.stairmasterFloors > 0)) && (
                      <div className="p-3 rounded-2xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Cardio: {cardio.activityType}</span>
                        </span>
                        <span className="text-cyan-400 font-bold text-[11px]">
                          {cardio.distanceKm > 0 ? `${cardio.distanceKm} km` : `${cardio.stairmasterFloors} floors`}
                        </span>
                      </div>
                    )}

                    {/* Live Voice Note Audio Player */}
                    {hasVoiceNote && voiceUrl && (
                      <div className="p-3 rounded-2xl bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-[var(--text-primary)]" />
                          <span className="text-xs font-bold text-[var(--text-primary)]">Voice Debrief Memo</span>
                        </div>
                        <button
                          onClick={() => toggleFeedAudio(voiceUrl)}
                          className="btn-ghost text-xs flex items-center gap-1"
                        >
                          {isAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isAudioPlaying ? 'Pause' : 'Play Memo'}</span>
                        </button>
                      </div>
                    )}

                    {/* Coach 1-Tap Cheer Reactions Bar */}
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[var(--text-primary)]" />
                          <span>1-Tap Coach Cheer</span>
                        </span>
                        {isCheered && (
                          <span className="text-[10px] font-bold text-[var(--text-primary)] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Cheer Delivered</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() =>
                            handleQuickCheer(client._id, logId, '🔥', 'Crushed your strength & cardio goals today!')
                          }
                          className="py-2 px-2 rounded-2xl bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1 transition-all duration-300 active:scale-95"
                        >
                          <span>🔥</span>
                          <span className="text-[11px]">Crushed It</span>
                        </button>

                        <button
                          onClick={() =>
                            handleQuickCheer(client._id, logId, '💪', 'Incredible lifting volume & cardio pacing!')
                          }
                          className="py-2 px-2 rounded-2xl bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-cyan-500/40 text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1 transition-all duration-300 active:scale-95"
                        >
                          <span>💪</span>
                          <span className="text-[11px]">Heavy Lift</span>
                        </button>

                        <button
                          onClick={() =>
                            handleQuickCheer(client._id, logId, '🥗', 'Spotless meal choices. Keep the fuel clean!')
                          }
                          className="py-2 px-2 rounded-2xl bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1 transition-all duration-300 active:scale-95"
                        >
                          <span>🥗</span>
                          <span className="text-[11px]">Clean Fuel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                    No logs recorded for today yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: ATHLETES ROSTER */}
      {activeTab === 'athletes' && clients.length > 0 && (
        <div className="space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-surface-1)] p-1 rounded-2xl border border-[var(--border-subtle)]">
            {(['all', 'green', 'yellow', 'red'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`flex-1 py-1 text-[11px] font-bold rounded-xl capitalize transition-all duration-300 ${
                  filterTier === tier
                    ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] shadow'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tier === 'all' ? 'All' : tier}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredClients.map((client) => (
              <div
                key={client._id}
                onClick={() => {
                  soundFx.playTapSound();
                  setSelectedClientId(client._id);
                }}
                className="p-3 glass-card-interactive flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={client.avatarUrl}
                    alt={client.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-[var(--border-subtle)]"
                  />
                  <div>
                    <h4 className="text-xs font-bold tracking-tight text-[var(--text-primary)]">{client.name}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                      {client.fitnessGoal} · {client.streak || 0}d streak
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full ${
                      client.compliance?.tier === 'green'
                        ? 'pill-emerald'
                        : client.compliance?.tier === 'yellow'
                        ? 'pill-amber'
                        : 'pill-rose'
                    }`}
                  >
                    {client.compliance?.score || 100}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story Modal */}
      <StoryPreviewModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        clients={clients}
        initialIndex={storyInitialIndex}
      />

      {/* Client Detail Drawer */}
      <ClientDetailDrawer
        clientId={selectedClientId}
        onClose={() => setSelectedClientId(null)}
        onCheerSent={refreshAction}
      />
    </div>
  );
};
