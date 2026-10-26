/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X, ChevronRight } from 'lucide-react';
import { Survey, SurveyResponse, SupportedLanguage } from './types/survey';
import { storageService } from './services/storageService';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { SurveyBuilder } from './components/SurveyBuilder';
import { InterviewStudio } from './components/InterviewStudio';
import { ReportExportView } from './components/ReportExportView';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { ChatbotWorkspace } from './components/ChatbotWorkspace';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeSurveyId, setActiveSurveyId] = useState<string>('');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('English');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Load surveys and responses on mount
  useEffect(() => {
    const loadedSurveys = storageService.getSurveys();
    const loadedResponses = storageService.getResponses();

    setSurveys(loadedSurveys);
    setResponses(loadedResponses);

    if (loadedSurveys.length > 0) {
      setActiveSurveyId(loadedSurveys[0].id);
    }

    const unsubscribe = storageService.subscribe(() => {
      setSurveys(storageService.getSurveys());
      setResponses(storageService.getResponses());
    });

    return unsubscribe;
  }, []);

  const activeSurvey = surveys.find((s) => s.id === activeSurveyId) || surveys[0];

  const handleUpdateSurvey = (updated: Survey) => {
    storageService.saveSurvey(updated);
    setSurveys((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleSaveResponse = (newResponse: SurveyResponse) => {
    setResponses((prev) => [newResponse, ...prev]);
  };

  if (!activeSurvey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-slate-400 text-xs">
        Loading survey environment...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-cyan-900/60 selection:text-cyan-200">
      {/* 1. LEFT SIDEBAR (Matching user screenshot!) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        surveys={surveys}
        activeSurveyId={activeSurveyId}
        onSelectSurvey={setActiveSurveyId}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onToggleChatbotDrawer={() => setIsChatbotOpen(!isChatbotOpen)}
        isChatbotDrawerOpen={isChatbotOpen}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Subtle Top Breadcrumb & Status Header */}
        <header className="h-14 border-b border-[#141f33] bg-[#080d17]/80 backdrop-blur-md px-6 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-slate-300">AI InsightHub</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-cyan-400 capitalize">{activeTab}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-400 truncate max-w-xs">{activeSurvey.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-400">
              Language: <strong className="text-white">{currentLanguage}</strong>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0d182b] text-cyan-400 border border-[#172c4d]">
              v2.6 Enterprise
            </span>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Screenshot 1-to-1 Match: Welcome, 4 KPI cards, Create New Interview banner */}
              <DashboardView
                surveys={surveys}
                activeSurvey={activeSurvey}
                responses={responses}
                onSelectSurvey={setActiveSurveyId}
                onNavigateTab={(t) => setActiveTab(t as SidebarTab)}
                currentLanguage={currentLanguage}
              />

              {/* Deep Construct & Question Analytics */}
              <div className="pt-4 border-t border-[#142033]">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Active Study Construct Breakdown & Psychometrics
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time distributions, Likert mean/stddev, and sentiment polarity for "{activeSurvey.title}"
                  </p>
                </div>
                <AnalyticsView
                  surveys={surveys}
                  activeSurvey={activeSurvey}
                  responses={responses}
                  currentLanguage={currentLanguage}
                />
              </div>
            </div>
          )}

          {activeTab === 'chatbot' && (
            <ChatbotWorkspace
              survey={activeSurvey}
              responses={responses}
              currentLanguage={currentLanguage}
            />
          )}

          {activeTab === 'builder' && (
            <SurveyBuilder
              survey={activeSurvey}
              onUpdateSurvey={handleUpdateSurvey}
              currentLanguage={currentLanguage}
            />
          )}

          {activeTab === 'interview' && (
            <InterviewStudio
              survey={activeSurvey}
              onSaveResponse={handleSaveResponse}
              currentLanguage={currentLanguage}
            />
          )}

          {activeTab === 'reports' && (
            <ReportExportView
              survey={activeSurvey}
              responses={responses}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
          )}
        </main>
      </div>

      {/* 3. PERSISTENT FLOATING BUTTON ON THE LEFT SIDE */}
      <div className="fixed bottom-6 left-6 z-40 no-print flex items-center gap-2">
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl border transition-all duration-200 group ${
            isChatbotOpen
              ? 'bg-cyan-600 text-white border-cyan-500 ring-4 ring-cyan-500/20'
              : 'bg-[#0b1322] hover:bg-[#0e1a2f] text-white border-[#1c3052] hover:border-cyan-500 hover:shadow-cyan-950/40'
          }`}
          aria-label="Open AI Chatbot"
          title="Open AI Survey Copilot Chatbot"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight">AI Chatbot</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {/* 4. LEFT-SIDE SLIDE-OUT CHATBOT DRAWER */}
      <ChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        survey={activeSurvey}
        responses={responses}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
