/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  HardDrive,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ConflictStrategy, SupportedLanguage } from '../types/survey';

interface ProfileViewProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>(storageService.getConflictStrategy());
  const [isOnline, setIsOnline] = useState(storageService.isOnline());
  const [offlineCount, setOfflineCount] = useState(storageService.getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleStrategyChange = (strategy: ConflictStrategy) => {
    storageService.setConflictStrategy(strategy);
    setConflictStrategy(strategy);
  };

  const handleToggleOffline = () => {
    const next = !storageService.getSimulatedOffline();
    storageService.setSimulatedOffline(next);
    setIsOnline(storageService.isOnline());
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await storageService.autoSync();
      setSyncMessage(res.message);
      setOfflineCount(0);
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-slate-100">
      {/* Profile Header Card */}
      <div className="bg-[#0b1322] border border-[#17253b] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#17253b]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-cyan-400/30">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">rzl18</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#13233c] text-cyan-400 border border-[#1c385e]">
                  Lead Researcher
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">ongnifrasflorinda@gmail.com</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Authenticated Session
                </span>
                <span>•</span>
                <span>Organization: Enterprise Field Intelligence</span>
              </div>
            </div>
          </div>

          {/* Offline Toggle */}
          <button
            onClick={handleToggleOffline}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-amber-950/50 border-amber-600/50 text-amber-300 hover:bg-amber-900/60'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'Online Connected' : 'Simulated Field Offline'}</span>
          </button>
        </div>

        {/* Sync & Vault Strip */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#070d18] border border-[#16253c] p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Offline Queue</span>
              <HardDrive className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{offlineCount}</div>
            <p className="text-[11px] text-slate-500">Unsynced field responses</p>
          </div>

          <div className="bg-[#070d18] border border-[#16253c] p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Encryption Engine</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-1">AES-256 Enabled</div>
            <p className="text-[11px] text-slate-500">Tamper-proof local hashing</p>
          </div>

          <div className="bg-[#070d18] border border-[#16253c] p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Reconciliation</span>
              <Sliders className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs font-bold text-amber-400 font-mono uppercase mt-1">
              {conflictStrategy.replace('_', ' ')}
            </div>
            <p className="text-[11px] text-slate-500">Conflict resolution policy</p>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 flex items-center justify-between">
            <span>{syncMessage}</span>
            <button onClick={() => setSyncMessage(null)} className="text-cyan-500 font-bold hover:text-white">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Conflict Resolution Settings Card */}
      <div className="bg-[#0b1322] border border-[#17253b] rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Conflict Resolution Protocol (Auto-Sync)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Defines the source-of-truth priority when offline responses merge back into the database.
          </p>
        </div>

        <div className="space-y-2 text-xs">
          {[
            {
              id: 'client_wins',
              title: 'Field Device Wins (Local First)',
              desc: 'Field worker observations supersede server records during conflict.',
            },
            {
              id: 'server_wins',
              title: 'Server Wins (Cloud Master)',
              desc: 'Cloud repository state is preserved if records have diverged.',
            },
            {
              id: 'smart_merge',
              title: 'Smart Merge (Timestamp Union)',
              desc: 'Merges non-overlapping fields and prioritizes the newest timestamp per construct.',
            },
          ].map((strat) => (
            <label
              key={strat.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                conflictStrategy === strat.id
                  ? 'bg-[#0e2238] border-cyan-500/60 text-white'
                  : 'bg-[#070d18] border-[#16253c] text-slate-300 hover:border-[#1e3454]'
              }`}
            >
              <input
                type="radio"
                name="profile_conflict_strat"
                checked={conflictStrategy === strat.id}
                onChange={() => handleStrategyChange(strat.id as ConflictStrategy)}
                className="mt-0.5 text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <div className="font-bold text-sm text-white">{strat.title}</div>
                <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{strat.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || !isOnline}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Force Re-sync Vault Now</span>
          </button>
        </div>
      </div>

      {/* Multilingual Dialect Packages Enabled */}
      <div className="bg-[#0b1322] border border-[#17253b] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Active Philippine Dialect & Localization Engines</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {[
            { name: 'Tagalog (Filipino)', code: 'TL', status: 'Certified' },
            { name: 'Cebuano (Bisaya)', code: 'CEB', status: 'Certified' },
            { name: 'Ilocano', code: 'ILO', status: 'Certified' },
            { name: 'Hiligaynon (Ilonggo)', code: 'HIL', status: 'Certified' },
            { name: 'Bikol', code: 'BIK', status: 'Active' },
            { name: 'Waray', code: 'WAR', status: 'Active' },
            { name: 'Spanish', code: 'ES', status: 'Active' },
            { name: 'English (US/PH)', code: 'EN', status: 'Primary' },
          ].map((lang, idx) => (
            <div key={idx} className="p-3 bg-[#070d18] border border-[#16253c] rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400">{lang.code}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">{lang.status}</span>
              </div>
              <div className="font-medium text-white text-xs mt-1 truncate">{lang.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
