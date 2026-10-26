/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  Clock,
  Users,
  Check,
  Plus,
  ChevronRight,
  Sparkles,
  BarChart3,
  Mic,
  ArrowUpRight,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { Survey, SurveyResponse, SupportedLanguage } from '../types/survey';

interface DashboardViewProps {
  surveys: Survey[];
  activeSurvey: Survey;
  responses: SurveyResponse[];
  onSelectSurvey: (surveyId: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'chatbot' | 'builder' | 'interview' | 'reports') => void;
  currentLanguage: SupportedLanguage;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  surveys,
  activeSurvey,
  responses,
  onSelectSurvey,
  onNavigateTab,
  currentLanguage,
}) => {
  // Compute KPI metrics matching screenshot
  const totalInterviewsCount = surveys.length;
  const activeCount = surveys.filter((s) => s.questions.length > 0).length;
  const totalResponsesCount = responses.length;
  const completedCount = responses.filter((r) => r.synced || Object.keys(r.answers).length > 0).length;

  return (
    <div className="space-y-7 max-w-6xl">
      {/* 1. Header matching screenshot */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome back, rzl18
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your interview projects and review insights
        </p>
      </div>

      {/* 2. Top 4 Metric KPI Cards (Exact match to screenshot!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Interviews */}
        <div className="bg-[#0b1322] border border-[#17253b] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-[#223757] transition-all">
          <div className="flex items-center justify-between">
            <FileText className="w-5 h-5 text-[#38bdf8]" />
            <span className="text-3xl font-bold text-white font-mono">{totalInterviewsCount}</span>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-4">Total Interviews</span>
        </div>

        {/* Card 2: Active */}
        <div className="bg-[#0b1322] border border-[#17253b] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-[#223757] transition-all">
          <div className="flex items-center justify-between">
            <Clock className="w-5 h-5 text-[#34d399]" />
            <span className="text-3xl font-bold text-white font-mono">{activeCount}</span>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-4">Active</span>
        </div>

        {/* Card 3: Responses */}
        <div className="bg-[#0b1322] border border-[#17253b] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-[#223757] transition-all">
          <div className="flex items-center justify-between">
            <Users className="w-5 h-5 text-[#fbbf24]" />
            <span className="text-3xl font-bold text-white font-mono">{totalResponsesCount}</span>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-4">Responses</span>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-[#0b1322] border border-[#17253b] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-[#223757] transition-all">
          <div className="flex items-center justify-between">
            <Check className="w-5 h-5 text-slate-200" />
            <span className="text-3xl font-bold text-white font-mono">{completedCount}</span>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-4">Completed</span>
        </div>
      </div>

      {/* 3. "Create New Interview" Banner Card (Matches screenshot exactly!) */}
      <div
        onClick={() => onNavigateTab('builder')}
        className="bg-[#0b1322] border border-[#17253b] hover:border-[#2a456e] rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-cyan-950/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0f243d] border border-[#1c3f66] flex items-center justify-center text-[#38bdf8] group-hover:scale-105 transition-transform shrink-0">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base group-hover:text-[#38bdf8] transition-colors">
              Create New Interview
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Generate AI-powered questions and share with interviewees
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#38bdf8] group-hover:translate-x-1 transition-all" />
      </div>

      {/* 4. "Your Interviews" Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Your Interviews</h2>
          <span className="text-xs text-slate-400">{surveys.length} projects registered</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {surveys.map((survey) => {
            const surveyRespCount = responses.filter((r) => r.surveyId === survey.id).length;
            const isCurrent = survey.id === activeSurvey.id;

            return (
              <div
                key={survey.id}
                onClick={() => onSelectSurvey(survey.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isCurrent
                    ? 'bg-[#0e182b] border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                    : 'bg-[#0b1322] border-[#17253b] hover:border-[#253a5e] hover:bg-[#0d1627]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#13233c] text-cyan-400 border border-[#1e3b63]">
                      {survey.interviewType}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {survey.questions.length} / 50 Qs
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">
                    {survey.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {survey.objective}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#17253b] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>{surveyRespCount} responses</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSurvey(survey.id);
                        onNavigateTab('interview');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#142845] hover:bg-[#1a355c] text-cyan-300 font-semibold text-[11px] transition-colors"
                    >
                      Conduct
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSurvey(survey.id);
                        onNavigateTab('builder');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#142236] hover:bg-[#192c47] text-slate-300 font-semibold text-[11px] transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Launch Actions: Interview Studio, Analytics & Copilot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Card A: Interview Studio */}
        <div
          onClick={() => onNavigateTab('interview')}
          className="bg-[#0b1322] border border-[#17253b] hover:border-[#2a456e] rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm group-hover:text-rose-300 transition-colors">
                Launch Interview Studio
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Group, Individual, & Random mode with audio recording
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
        </div>

        {/* Card B: Data Analytics & Sentiment */}
        <div
          onClick={() => onNavigateTab('dashboard')}
          className="bg-[#0b1322] border border-[#17253b] hover:border-[#2a456e] rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm group-hover:text-cyan-300 transition-colors">
                View Deep Data Analytics
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Likert distributions, cohort comparison & sentiment
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};
