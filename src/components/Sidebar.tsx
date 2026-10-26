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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Survey, SupportedLanguage, ConflictStrategy } from '../types/survey';
import { storageService } from '../services/storageService';

export type AppTab = 'chatbot' | 'analytics' | 'builder' | 'interview' | 'reports';

interface SidebarProps {
  surveys: Survey[];
  activeSurveyId: string;
  onSelectSurvey: (surveyId: string) => void;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenQuickChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  surveys,
  activeSurveyId,
  onSelectSurvey,
  activeTab,
  onSelectTab,
  currentLanguage,
  onLanguageChange,
  onOpenQuickChat,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(storageService.isOnline());
  const [offlineCount, setOfflineCount] = useState(storageService.getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsOnline(storageService.isOnline());
      setOfflineCount(storageService.getOfflineQueue().length);
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const unsubscribe = storageService.subscribe(update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      unsubscribe();
    };
  }, []);

  const handleToggleOffline = () => {
    const next = !storageService.getSimulatedOffline();
    storageService.setSimulatedOffline(next);
    setIsOnline(storageService.isOnline());
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await storageService.autoSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const navItems = [
    {
      id: 'chatbot' as AppTab,
      label: 'AI Chatbot',
      icon: Bot,
      color: 'text-indigo-600',
      badge: 'Gemini',
    },
    {
      id: 'analytics' as AppTab,
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-blue-600',
    },
    {
      id: 'builder' as AppTab,
      label: 'Survey Builder',
      icon: FileEdit,
      color: 'text-violet-600',
    },
    {
      id: 'interview' as AppTab,
      label: 'Interview Studio',
      icon: Mic,
      color: 'text-rose-600',
    },
    {
      id: 'reports' as AppTab,
      label: 'Reports & Export',
      icon: FileSpreadsheet,
      color: 'text-emerald-600',
    },
  ];

  const languages: SupportedLanguage[] = [
    'English',
    'Tagalog',
    'Cebuano (Bisaya)',
    'Ilocano',
    'Hiligaynon (Ilonggo)',
    'Spanish',
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-200 no-print select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Top: Logo & Title */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            AI
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                AI Survey
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                Simple & Minimalist
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Survey Selector (Simple Dropdown) */}
      {!isCollapsed ? (
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
            Active Study
          </label>
          <div className="relative">
            <select
              value={activeSurveyId}
              onChange={(e) => onSelectSurvey(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg py-2 px-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 truncate cursor-pointer shadow-2xs"
            >
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-slate-100 flex justify-center">
          <div
            className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold"
            title="Active Survey"
          >
            <Layers className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Navigation Icons & Links on the Side */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={item.label}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : item.color
                }`}
              />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Launch Floating Chat Drawer Trigger */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onOpenQuickChat}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 transition-colors ${
            isCollapsed ? 'justify-center p-2' : ''
          }`}
          title="Open Quick Chat Slide-Out"
        >
          <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1 text-left">
              <span>Quick Ask AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* Bottom Status & Settings on the Side */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 text-xs">
        {/* Language selector */}
        {!isCollapsed ? (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="w-full bg-transparent text-[11px] font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex justify-center" title={`Language: ${currentLanguage}`}>
            <Globe className="w-4 h-4 text-slate-500" />
          </div>
        )}

        {/* Offline / Online indicator & sync */}
        <div className={`flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
          <button
            onClick={handleToggleOffline}
            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
              isOnline ? 'text-emerald-700 hover:text-emerald-800' : 'text-amber-700 hover:text-amber-800'
            }`}
            title="Click to toggle Field Offline Simulation"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {!isCollapsed && <span>{isOnline ? 'Online' : 'Field Offline'}</span>}
          </button>

          {!isCollapsed && offlineCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync ({offlineCount})</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
