/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileEdit,
  Mic,
  FileSpreadsheet,
  Bot,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Survey, SupportedLanguage, ConflictStrategy } from '../types/survey';
import { storageService } from '../services/storageService';

export type AppTab = 'analytics' | 'builder' | 'interview' | 'reports' | 'chatbot';

interface NavbarProps {
  surveys: Survey[];
  activeSurveyId: string;
  onSelectSurvey: (surveyId: string) => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onToggleChatbot: () => void;
  isChatbotOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  activeTab,
  onSelectTab,
  currentLanguage,
  onLanguageChange,
  onToggleChatbot,
  isChatbotOpen,
}) => {
  const [isOnline, setIsOnline] = useState(storageService.isOnline());
  const [offlineCount, setOfflineCount] = useState(storageService.getOfflineQueue().length);
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>(storageService.getConflictStrategy());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(storageService.isOnline());
      setOfflineCount(storageService.getOfflineQueue().length);
      setConflictStrategy(storageService.getConflictStrategy());
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    const unsubscribe = storageService.subscribe(updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      unsubscribe();
    };
  }, []);

  const handleToggleOffline = () => {
    const nextState = !storageService.getSimulatedOffline();
    storageService.setSimulatedOffline(nextState);
    setIsOnline(storageService.isOnline());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await storageService.autoSync();
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback('Sync failed. Please retry.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConflictStrategyChange = (strategy: ConflictStrategy) => {
    storageService.setConflictStrategy(strategy);
    setConflictStrategy(strategy);
  };

  const languages: SupportedLanguage[] = [
    'English',
    'Tagalog',
    'Cebuano (Bisaya)',
    'Ilocano',
    'Hiligaynon (Ilonggo)',
    'Bikol',
    'Waray',
    'Spanish',
    'Japanese',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT SIDE: Brand + AI CHATBOT BUTTON ON THE LEFT SIDE */}
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold shadow-xs">
              <span className="text-sm tracking-tight text-white font-mono">AI</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-base tracking-tight">Survey Instrument</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                  v2.6 Enterprise
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Active Study:</span>
                <select
                  value={activeSurveyId}
                  onChange={(e) => onSelectSurvey(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 hover:text-indigo-600 cursor-pointer focus:outline-none max-w-[180px] truncate"
                >
                  {surveys.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.interviewType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PROMINENT AI CHATBOT BUTTON ON THE LEFT SIDE (User Request) */}
            <button
              onClick={onToggleChatbot}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs border ${
                isChatbotOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/30'
                  : 'bg-indigo-50/90 text-indigo-700 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-300'
              }`}
              title="Open AI Chatbot on Left Side"
            >
              <Bot className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="font-bold">AI Chatbot</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
          </div>

          {/* Navigation Tabs (includes AI Chatbot tab on the left) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onSelectTab('chatbot')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'chatbot'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-indigo-700 hover:text-indigo-900 hover:bg-white/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chatbot Workspace</span>
            </button>

            <button
              onClick={() => onSelectTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Data Analytics</span>
            </button>

            <button
              onClick={() => onSelectTab('builder')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'builder'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5 text-violet-600" />
              <span>Survey Builder & Bank</span>
            </button>

            <button
              onClick={() => onSelectTab('interview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'interview'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-rose-600" />
              <span>Interview Studio</span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'reports'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reports & Export</span>
            </button>
          </nav>

          {/* Right Controls: Offline Sync, Language, Settings */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs text-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                  className="bg-transparent font-medium cursor-pointer focus:outline-none pr-1"
                  title="Select survey language and dialect"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Offline Status & Sync Badge */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleOffline}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
                title={isOnline ? 'Online mode. Click to simulate Field Offline Mode.' : 'Offline mode active. Data saved locally with encryption.'}
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isOnline ? 'Online' : 'Field Offline'}</span>
              </button>

              {/* Sync Action & Pending Count */}
              {offlineCount > 0 && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing || !isOnline}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  title="Click to sync offline responses"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync ({offlineCount})</span>
                </button>
              )}

              {/* Conflict Settings Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  title="Sync Conflict Settings"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>

                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 text-xs">
                    <div className="font-semibold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Conflict Resolution</span>
                      <span className="text-[10px] text-slate-500">Auto-Sync</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mb-2.5">
                      Strategy applied when local offline responses reconcile with cloud data:
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { id: 'client_wins', label: 'Field Device Wins (Local First)' },
                        { id: 'server_wins', label: 'Server Wins (Cloud Master)' },
                        { id: 'smart_merge', label: 'Smart Merge (Timestamp Union)' },
                      ].map((strat) => (
                        <label
                          key={strat.id}
                          className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="conflict_strategy"
                            checked={conflictStrategy === strat.id}
                            onChange={() => handleConflictStrategyChange(strat.id as ConflictStrategy)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium">{strat.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Local Hash: AES-256</span>
                      <button
                        onClick={() => setShowSettingsDropdown(false)}
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sync notification message banner if any */}
        {syncFeedback && (
          <div className="py-1 px-3 text-xs bg-indigo-50 text-indigo-800 border-t border-indigo-100 flex items-center justify-between">
            <span>{syncFeedback}</span>
            <button onClick={() => setSyncFeedback(null)} className="text-indigo-500 hover:text-indigo-900 font-bold ml-2">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 px-1">
        <button
          onClick={onToggleChatbot}
          className="flex flex-col items-center gap-0.5 text-[11px] text-indigo-600 font-bold"
        >
          <Bot className="w-4 h-4" />
          <span>Chatbot</span>
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            activeTab === 'analytics' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => onSelectTab('builder')}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            activeTab === 'builder' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Builder</span>
        </button>
        <button
          onClick={() => onSelectTab('interview')}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            activeTab === 'interview' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Interview</span>
        </button>
        <button
          onClick={() => onSelectTab('reports')}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            activeTab === 'reports' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports</span>
        </button>
      </div>
    </header>
  );
};
