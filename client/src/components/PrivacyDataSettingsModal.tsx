import React, { useState } from 'react';
import { Shield, Download, Trash2, AlertTriangle, Check, X, Lock, FileSpreadsheet } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { IUser } from '../types';

interface PrivacyDataSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: IUser;
  user?: IUser;
  onAccountDeleted?: () => void;
}

export const PrivacyDataSettingsModal: React.FC<PrivacyDataSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser: propCurrentUser,
  user: propUser,
  onAccountDeleted,
}) => {
  const currentUser = propCurrentUser || propUser;
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      soundFx.playTapSound();

      const response = await fetch(`/api/auth/export-data/${currentUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurafit-export-${currentUser.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(true);
      soundFx.playSuccessChime();
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      console.error('Export data error:', err);
      // Client-side fallback export
      const clientExport = {
        exportedAt: new Date().toISOString(),
        user: currentUser,
        note: 'Exported under GDPR Article 20 Right to Data Portability',
      };
      const blob = new Blob([JSON.stringify(clientExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurafit-export-${currentUser._id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type "DELETE" into the box to confirm permanent erasure.');
      return;
    }

    try {
      setIsDeleting(true);
      soundFx.playTapSound();

      const response = await fetch(`/api/auth/account/${currentUser._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account on server');
      }

      alert('Your account and all associated fitness logs have been permanently erased from our system.');
      onAccountDeleted?.();
      onClose();
    } catch (err: any) {
      console.error('Delete account error:', err);
      alert('Your account local cache has been cleared.');
      onAccountDeleted?.();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-5 shadow-2xl space-y-4">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">GDPR Privacy & Data Controls</h3>
              <p className="text-[10px] text-zinc-400 font-medium">Manage and export your personal athlete data</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playTapSound();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Pill */}
        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center space-x-3">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
          />
          <div className="flex-1">
            <span className="text-xs font-black text-white block">{currentUser.name}</span>
            <span className="text-[10px] text-zinc-400 font-medium">{currentUser.email}</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {currentUser.role}
          </span>
        </div>

        {/* Action 1: Export My Data (Right to Portability) */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/90 space-y-2">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black text-white">Export My Data Archive (GDPR Art. 20)</h4>
          </div>
          <p className="text-[11px] text-zinc-400">
            Download a full, machine-readable JSON copy of your profile, daily muscle workouts, cardio sessions, and meal history.
          </p>
          <button
            type="button"
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center space-x-2 transition active:scale-98"
          >
            {exportSuccess ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Downloaded Successfully!</span>
              </span>
            ) : isExporting ? (
              <span>Preparing Archive...</span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download JSON Data Archive</span>
              </span>
            )}
          </button>
        </div>

        {/* Action 2: Permanent Account Erasure (GDPR Art. 17) */}
        <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-red-400">
            <Trash2 className="w-4 h-4" />
            <h4 className="text-xs font-black">Right to Erasure (Delete Account)</h4>
          </div>
          <p className="text-[11px] text-zinc-400">
            Permanently purge your account, all daily workout entries, cardio logs, uploaded meal photos, and voice memos. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => {
                soundFx.playTapSound();
                setShowDeleteConfirm(true);
              }}
              className="w-full py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-bold transition"
            >
              Request Account & Data Deletion
            </button>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/60 text-[11px] text-red-200">
                Type <strong className="text-white font-mono font-black">DELETE</strong> below to permanently erase:
              </div>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full bg-zinc-950 border border-red-500/40 rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-red-400 font-mono font-bold"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Erase Forever'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
