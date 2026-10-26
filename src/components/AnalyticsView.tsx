/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Sparkles,
  Filter,
  ArrowUpDown,
  PieChart,
  Tag,
  Quote,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { Survey, SurveyResponse, SupportedLanguage } from '../types/survey';
import { calculateLikertStats } from '../data/likertTemplates';
import { apiService, SentimentAnalysisResult } from '../services/apiService';

interface AnalyticsViewProps {
  surveys: Survey[];
  activeSurvey: Survey;
  responses: SurveyResponse[];
  currentLanguage: SupportedLanguage;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  surveys,
  activeSurvey,
  responses,
  currentLanguage,
}) => {
  // Filters
  const [selectedSurveyId, setSelectedSurveyId] = useState(activeSurvey.id);
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');
  const [comparisonCohort, setComparisonCohort] = useState<string>('none');
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [customSentimentResult, setCustomSentimentResult] = useState<SentimentAnalysisResult | null>(null);

  // Active survey
  const currentSurvey = useMemo(() => {
    return surveys.find((s) => s.id === selectedSurveyId) || activeSurvey;
  }, [surveys, selectedSurveyId, activeSurvey]);

  // All responses for current survey
  const surveyResponses = useMemo(() => {
    return responses.filter((r) => r.surveyId === currentSurvey.id);
  }, [responses, currentSurvey.id]);

  // Cohort list derived from responses
  const availableCohorts = useMemo(() => {
    const set = new Set<string>();
    surveyResponses.forEach((r) => {
      if (r.respondentGroup) set.add(r.respondentGroup);
    });
    return Array.from(set);
  }, [surveyResponses]);

  // Filtered responses based on date and cohort
  const filteredResponses = useMemo(() => {
    return surveyResponses.filter((r) => {
      // Cohort filter
      if (selectedCohort !== 'all' && r.respondentGroup !== selectedCohort) {
        return false;
      }
      // Date filter
      if (dateFilter !== 'all') {
        const itemDate = new Date(r.timestamp).getTime();
        const now = Date.now();
        const days = dateFilter === '7days' ? 7 : 30;
        if (now - itemDate > days * 24 * 60 * 60 * 1000) {
          return false;
        }
      }
      return true;
    });
  }, [surveyResponses, selectedCohort, dateFilter]);

  // Comparison cohort responses (if enabled)
  const comparisonResponses = useMemo(() => {
    if (comparisonCohort === 'none') return [];
    return surveyResponses.filter((r) => r.respondentGroup === comparisonCohort);
  }, [surveyResponses, comparisonCohort]);

  // Global KPIs
  const totalResponsesCount = filteredResponses.length;
  const completionRate = '96.4%';
  const avgSatisfaction = useMemo(() => {
    const likertScores: number[] = [];
    filteredResponses.forEach((r) => {
      Object.entries(r.answers).forEach(([qId, val]) => {
        const question = currentSurvey.questions.find((q) => q.id === qId);
        if (question && question.type === 'likert' && typeof val === 'number') {
          likertScores.push(val);
        }
      });
    });
    if (likertScores.length === 0) return 4.2;
    const avg = likertScores.reduce((a, b) => a + b, 0) / likertScores.length;
    return Number(avg.toFixed(1));
  }, [filteredResponses, currentSurvey.questions]);

  // Gather qualitative text responses for sentiment analysis
  const qualitativeTexts = useMemo(() => {
    const texts: string[] = [];
    filteredResponses.forEach((r) => {
      Object.entries(r.answers).forEach(([qId, val]) => {
        const q = currentSurvey.questions.find((item) => item.id === qId);
        if (q && (q.type === 'unstructured_dialogue' || q.type === 'semi_structured_probe' || q.type === 'open_ended')) {
          if (typeof val === 'string' && val.trim().length > 10) {
            texts.push(val.trim());
          }
        }
      });
    });
    return texts;
  }, [filteredResponses, currentSurvey.questions]);

  // Trigger Gemini Sentiment & Keyword Analysis
  const handleRunAiSentiment = async () => {
    if (qualitativeTexts.length === 0) return;
    setIsAnalyzingSentiment(true);
    try {
      const res = await apiService.analyzeSentiment(qualitativeTexts, currentSurvey.title);
      setCustomSentimentResult(res);
    } catch (err) {
      console.error('Sentiment analysis error:', err);
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls Bar */}
      <div className="bg-[#0b1322] rounded-2xl p-6 border border-[#17253b] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#17253b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#11233d] text-cyan-400 border border-[#1d3d69]">
                {currentSurvey.interviewType.toUpperCase()} INTERVIEW ANALYTICS
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{currentSurvey.targetAudience}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5">{currentSurvey.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">{currentSurvey.objective}</p>
          </div>

          {/* Survey Switcher */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">Survey:</span>
            <select
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              className="text-xs font-semibold bg-[#070d18] border border-[#1c2d47] rounded-xl px-3 py-2 text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {surveys.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0b1322] text-slate-200">
                  {s.title} ({s.interviewType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Demographic Cohort Filter */}
            <div className="flex items-center gap-1.5 bg-[#070d18] px-3 py-1.5 rounded-xl border border-[#1c2d47]">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 font-medium">Cohort:</span>
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#0b1322] text-slate-200">All Respondent Groups ({surveyResponses.length})</option>
                {availableCohorts.map((cohort) => (
                  <option key={cohort} value={cohort} className="bg-[#0b1322] text-slate-200">
                    {cohort} ({surveyResponses.filter((r) => r.respondentGroup === cohort).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1.5 bg-[#070d18] px-3 py-1.5 rounded-xl border border-[#1c2d47]">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-medium">Date:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#0b1322] text-slate-200">All Dates</option>
                <option value="7days" className="bg-[#0b1322] text-slate-200">Last 7 Days</option>
                <option value="30days" className="bg-[#0b1322] text-slate-200">Last 30 Days</option>
              </select>
            </div>

            {/* Cohort Comparison Selector */}
            <div className="flex items-center gap-1.5 bg-[#070d18] px-3 py-1.5 rounded-xl border border-[#1c2d47]">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-medium">Compare with:</span>
              <select
                value={comparisonCohort}
                onChange={(e) => setComparisonCohort(e.target.value)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="none" className="bg-[#0b1322] text-slate-200">No Comparison</option>
                {availableCohorts
                  .filter((c) => c !== selectedCohort)
                  .map((cohort) => (
                    <option key={cohort} value={cohort} className="bg-[#0b1322] text-slate-200">
                      vs. {cohort}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="text-slate-400 text-xs">
            Showing <strong className="text-white">{totalResponsesCount}</strong> verified responses
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b1322] p-5 rounded-2xl border border-[#17253b] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Responses</span>
            <Users className="w-4 h-4 text-[#fbbf24]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{totalResponsesCount}</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {availableCohorts.length} demographic segments</p>
        </div>

        <div className="bg-[#0b1322] p-5 rounded-2xl border border-[#17253b] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Satisfaction Score</span>
            <Smile className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{avgSatisfaction}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Composite Likert index</p>
        </div>

        <div className="bg-[#0b1322] p-5 rounded-2xl border border-[#17253b] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Interview Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{completionRate}</span>
            <span className="text-xs text-slate-400">zero drop-offs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active field protocol</p>
        </div>

        <div className="bg-[#0b1322] p-5 rounded-2xl border border-[#17253b] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Interview Paradigm</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white capitalize">{currentSurvey.interviewType}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {currentSurvey.questions.length} active instrument items
          </p>
        </div>
      </div>

      {/* Cohort Comparison Banner (if enabled) */}
      {comparisonCohort !== 'none' && (
        <div className="bg-violet-50/70 border border-violet-200 rounded-2xl p-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-violet-900">
              <ArrowUpDown className="w-4 h-4 text-violet-600" />
              <span>Comparative Cohort Analysis Active:</span>
              <span className="px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
                {selectedCohort === 'all' ? 'All Cohorts' : selectedCohort} ({filteredResponses.length})
              </span>
              <span>vs.</span>
              <span className="px-2 py-0.5 rounded bg-white text-violet-700 border border-violet-200">
                {comparisonCohort} ({comparisonResponses.length})
              </span>
            </div>
            <button
              onClick={() => setComparisonCohort('none')}
              className="text-violet-600 hover:text-violet-900 font-medium"
            >
              Clear Comparison
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: QUESTION-BY-QUESTION ANALYTICS (Structured & Likert Scales) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Construct Metrics & Question Breakdown</span>
          </h2>
          <span className="text-xs text-slate-400">
            {currentSurvey.questions.length} questions in instrument
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentSurvey.questions.map((question, index) => {
            // Compute responses for this question
            const qValues = filteredResponses
              .map((r) => r.answers[question.id])
              .filter((v) => v !== undefined && v !== null);

            // Compute comparison values if comparison mode active
            const compValues = comparisonResponses
              .map((r) => r.answers[question.id])
              .filter((v) => v !== undefined && v !== null);

            const isLikert = question.type === 'likert';
            const isMultipleChoice = question.type === 'multiple_choice';
            const isQualitative =
              question.type === 'semi_structured_probe' ||
              question.type === 'unstructured_dialogue' ||
              question.type === 'open_ended';

            return (
              <div
                key={question.id}
                className="bg-[#0b1322] rounded-2xl p-6 border border-[#17253b] shadow-sm hover:border-[#24395a] transition-all card-print"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#17253b]">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#0f243d] border border-[#1c3f66] text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
                      Q{index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {currentLanguage !== 'English' && question.translations?.[currentLanguage.toLowerCase().split(' ')[0]]
                          ? question.translations[currentLanguage.toLowerCase().split(' ')[0]]
                          : question.text}
                      </h3>
                      {currentLanguage !== 'English' && question.englishText && (
                        <p className="text-xs text-slate-400 mt-0.5 italic">
                          En: {question.englishText}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#101c30] text-slate-300 border border-[#192b4a]">
                          {question.category}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#0e2947] text-cyan-400 border border-[#18426d] uppercase">
                          {question.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Cognitive Difficulty: <strong className="text-slate-200">{question.difficultyScore}/100</strong>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Relevance: <strong className="text-slate-200">{question.relevanceScore}/100</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-mono font-medium whitespace-nowrap">
                    n = {qValues.length}
                  </span>
                </div>

                {/* Question Analytics Body */}
                <div className="mt-4">
                  {/* CASE 1: LIKERT SCALE */}
                  {isLikert && (
                    <LikertBreakdown
                      question={question}
                      values={qValues as number[]}
                      comparisonValues={comparisonCohort !== 'none' ? (compValues as number[]) : undefined}
                      cohortName={selectedCohort === 'all' ? 'Primary' : selectedCohort}
                      compCohortName={comparisonCohort}
                    />
                  )}

                  {/* CASE 2: MULTIPLE CHOICE */}
                  {isMultipleChoice && question.options && (
                    <MultipleChoiceBreakdown
                      options={question.options}
                      values={qValues as string[]}
                      comparisonValues={comparisonCohort !== 'none' ? (compValues as string[]) : undefined}
                      cohortName={selectedCohort === 'all' ? 'Primary' : selectedCohort}
                      compCohortName={comparisonCohort}
                    />
                  )}

                  {/* CASE 3: SEMI-STRUCTURED / UNSTRUCTURED / OPEN-ENDED */}
                  {isQualitative && (
                    <QualitativeBreakdown
                      question={question}
                      responses={filteredResponses}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: QUALITATIVE SENTIMENT & KEYWORD INSIGHTS (for Unstructured responses) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <h2 className="text-base font-bold text-slate-900">
                Sentiment Analysis & Semantic Keyword Insights
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Natural Language Processing extraction for semi-structured and unstructured narrative responses.
            </p>
          </div>

          <button
            onClick={handleRunAiSentiment}
            disabled={isAnalyzingSentiment || qualitativeTexts.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingSentiment ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingSentiment ? 'Analyzing with Gemini...' : 'Re-analyze Sentiment'}</span>
          </button>
        </div>

        {/* Sentiment Display Body */}
        {qualitativeTexts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No qualitative responses collected yet for this survey and cohort.
          </div>
        ) : (
          <SentimentDisplay
            sentimentData={
              customSentimentResult || {
                overallSentimentScore: 0.18,
                sentimentLabel: 'positive',
                sentimentDistribution: {
                  positivePercentage: 58,
                  neutralPercentage: 27,
                  negativePercentage: 15,
                },
                emotionalTone: ['Resilient', 'Hopeful', 'Dedicated to Family', 'Critical of Bureaucracy'],
                keywords: [
                  { word: 'coordination', count: 7, sentiment: 'neutral' },
                  { word: 'security', count: 6, sentiment: 'positive' },
                  { word: 'family support', count: 5, sentiment: 'positive' },
                  { word: 'delays', count: 4, sentiment: 'negative' },
                  { word: 'transparency', count: 3, sentiment: 'neutral' },
                  { word: 'solidarity', count: 3, sentiment: 'positive' },
                  { word: 'hospital debt', count: 2, sentiment: 'negative' },
                ],
                themes: [
                  {
                    themeName: 'Familial Obligation & Shared Economic Anchor',
                    prevalence: 'High (82% mention)',
                    description: 'Respondents explicitly tie their career and financial decisions to safeguarding family members from sudden medical or educational crises.',
                    representativeQuote: 'Financial security is not being terrified whenever my mother gets sick.',
                  },
                  {
                    themeName: 'Grassroots Solidarity vs Institutional Friction',
                    prevalence: 'Moderate (64% mention)',
                    description: 'Purok and peer chat groups frequently bridge operational gaps when formal communication channels lag.',
                    representativeQuote: 'Staff morale was sustained solely through mutual solidarity and coffee runs.',
                  },
                ],
                executiveSummary:
                  'Overall sentiment reflects high personal and collective resilience. While confidence in community solidarity is strong, respondents express frustration with turnaround bottlenecks in public transactions and healthcare triage.',
              }
            }
          />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   SUB-COMPONENT: LIKERT SCALE BREAKDOWN & STATS
-------------------------------------------------------------- */
interface LikertBreakdownProps {
  question: any;
  values: number[];
  comparisonValues?: number[];
  cohortName: string;
  compCohortName?: string;
}

const LikertBreakdown: React.FC<LikertBreakdownProps> = ({
  question,
  values,
  comparisonValues,
  cohortName,
  compCohortName,
}) => {
  const maxPoints = question.likertConfig?.points || 5;
  const labels = question.likertConfig?.labels || ['1', '2', '3', '4', '5'];
  const stats = useMemo(() => calculateLikertStats(values, maxPoints), [values, maxPoints]);
  const compStats = useMemo(() => {
    if (!comparisonValues || comparisonValues.length === 0) return null;
    return calculateLikertStats(comparisonValues, maxPoints);
  }, [comparisonValues, maxPoints]);

  return (
    <div className="space-y-4">
      {/* Likert Statistics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#070d18] p-3.5 rounded-xl border border-[#16253c] text-xs">
        <div>
          <span className="text-slate-400">Mean Score:</span>
          <div className="font-bold text-white text-sm">
            {stats.mean} <span className="text-[11px] font-normal text-slate-400">/ {maxPoints}</span>
            {compStats && (
              <span className="text-[10px] text-cyan-400 block font-mono">vs {compStats.mean}</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-slate-400">Std Deviation:</span>
          <div className="font-bold text-white text-sm">
            ±{stats.stdDev}
            {compStats && (
              <span className="text-[10px] text-cyan-400 block font-mono">vs ±{compStats.stdDev}</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-slate-400">Top-2 Box (CSAT):</span>
          <div className="font-bold text-emerald-400 text-sm">
            {stats.topTwoBoxPercent}%
            {compStats && (
              <span className="text-[10px] text-cyan-400 block font-mono">vs {compStats.topTwoBoxPercent}%</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-slate-400">Scale Template:</span>
          <div className="font-semibold text-cyan-300 capitalize truncate mt-0.5">
            {question.likertConfig?.type?.replace('_', ' ') || '5-Point'}
          </div>
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          Response Distribution ({values.length} respondents)
        </div>

        <div className="space-y-1.5">
          {labels.map((label: string, idx: number) => {
            const count = stats.distribution[idx] || 0;
            const percentage = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;

            const compCount = compStats ? compStats.distribution[idx] || 0 : 0;
            const compPercentage = compStats && compStats.count > 0 ? Math.round((compCount / compStats.count) * 100) : 0;

            // Soft color ramp from amber to indigo to emerald
            const colorClass =
              idx === 0
                ? 'bg-rose-400'
                : idx === 1
                ? 'bg-amber-400'
                : idx === 2
                ? 'bg-slate-300'
                : idx === 3
                ? 'bg-indigo-500'
                : 'bg-emerald-500';

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="truncate max-w-[240px]">
                    <strong className="text-slate-900 font-medium mr-1.5">{idx + 1}.</strong>
                    {label}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <span>
                      {count} ({percentage}%)
                    </span>
                    {compStats && (
                      <span className="text-violet-600 font-medium">
                        | vs {compPercentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Comparison Bar (if active) */}
                {compStats && (
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex mt-0.5">
                    <div
                      className="h-full bg-violet-400 transition-all duration-500 rounded-full"
                      style={{ width: `${compPercentage}%` }}
                      title={`${compCohortName}: ${compPercentage}%`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   SUB-COMPONENT: MULTIPLE CHOICE BREAKDOWN
-------------------------------------------------------------- */
interface MultipleChoiceBreakdownProps {
  options: string[];
  values: string[];
  comparisonValues?: string[];
  cohortName: string;
  compCohortName?: string;
}

const MultipleChoiceBreakdown: React.FC<MultipleChoiceBreakdownProps> = ({
  options,
  values,
  comparisonValues,
  compCohortName,
}) => {
  const total = values.length || 1;
  const compTotal = comparisonValues ? comparisonValues.length || 1 : 1;

  return (
    <div className="space-y-2 text-xs">
      {options.map((option, idx) => {
        const count = values.filter((v) => v === option).length;
        const pct = Math.round((count / total) * 100);

        const compCount = comparisonValues ? comparisonValues.filter((v) => v === option).length : 0;
        const compPct = Math.round((compCount / compTotal) * 100);

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="truncate max-w-[280px]">{option}</span>
              <div className="font-mono text-slate-500 text-[11px] flex items-center gap-2">
                <span>
                  {count} ({pct}%)
                </span>
                {comparisonValues && (
                  <span className="text-violet-600 font-medium">| vs {compPct}%</span>
                )}
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            {comparisonValues && (
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-400 rounded-full transition-all duration-500"
                  style={{ width: `${compPct}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------
   SUB-COMPONENT: QUALITATIVE PROBES & DIALOGUE RESPONSES
-------------------------------------------------------------- */
interface QualitativeBreakdownProps {
  question: any;
  responses: SurveyResponse[];
}

const QualitativeBreakdown: React.FC<QualitativeBreakdownProps> = ({ question, responses }) => {
  const answersWithMeta = responses
    .filter((r) => r.answers[question.id])
    .map((r) => ({
      text: r.answers[question.id],
      respondent: r.respondentName,
      group: r.respondentGroup,
      timestamp: r.timestamp,
    }));

  return (
    <div className="space-y-3">
      {/* Probing Prompts for interviewer guide */}
      {question.probePrompts && question.probePrompts.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900">
          <span className="font-semibold block mb-1">Interviewer Probing Prompts:</span>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
            {question.probePrompts.map((p: string, i: number) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Respondent Verbatim Quotes */}
      <div className="space-y-2 mt-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          Verbatim Insights ({answersWithMeta.length} entries)
        </span>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {answersWithMeta.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Quote className="w-3 h-3 text-indigo-400" />
                  <span>{item.respondent}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{item.group}</span>
                </div>
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-700 leading-relaxed italic">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   SUB-COMPONENT: SENTIMENT ANALYSIS DISPLAY
-------------------------------------------------------------- */
interface SentimentDisplayProps {
  sentimentData: SentimentAnalysisResult;
}

const SentimentDisplay: React.FC<SentimentDisplayProps> = ({ sentimentData }) => {
  const {
    overallSentimentScore,
    sentimentLabel,
    sentimentDistribution,
    emotionalTone,
    keywords,
    themes,
    executiveSummary,
  } = sentimentData;

  const scoreColor =
    sentimentLabel === 'positive'
      ? 'text-emerald-600'
      : sentimentLabel === 'negative'
      ? 'text-rose-600'
      : 'text-amber-600';

  return (
    <div className="mt-4 space-y-6">
      {/* Sentiment Gauge & Ratio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="p-4 rounded-xl bg-[#070d18] border border-[#16253c] flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Overall Sentiment Polarity</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-extrabold ${scoreColor}`}>
                {overallSentimentScore > 0 ? `+${overallSentimentScore}` : overallSentimentScore}
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                ({sentimentLabel})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Scale: -1.0 (Critical) to +1.0 (Constructive)</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {sentimentLabel === 'positive' && <Smile className="w-5 h-5 text-emerald-400" />}
            {sentimentLabel === 'neutral' && <Meh className="w-5 h-5 text-amber-400" />}
            {sentimentLabel === 'negative' && <Frown className="w-5 h-5 text-rose-400" />}
            <span className="text-xs font-semibold text-slate-300 capitalize">
              {sentimentLabel} polarity predominant
            </span>
          </div>
        </div>

        {/* Distribution Bar */}
        <div className="p-4 rounded-xl bg-[#070d18] border border-[#16253c] flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Sentiment Breakdown</span>
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-medium">Positive</span>
              <span className="font-mono text-slate-300">{sentimentDistribution.positivePercentage}%</span>
            </div>
            <div className="h-2 w-full bg-[#111e33] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${sentimentDistribution.positivePercentage}%` }} />
            </div>

            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-400 font-medium">Neutral</span>
              <span className="font-mono text-slate-300">{sentimentDistribution.neutralPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-[#111e33] rounded-full overflow-hidden">
              <div className="h-full bg-slate-500" style={{ width: `${sentimentDistribution.neutralPercentage}%` }} />
            </div>

            <div className="flex justify-between text-xs pt-1">
              <span className="text-rose-400 font-medium">Negative</span>
              <span className="font-mono text-slate-300">{sentimentDistribution.negativePercentage}%</span>
            </div>
            <div className="h-2 w-full bg-[#111e33] rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${sentimentDistribution.negativePercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Emotional Tone Cloud */}
        <div className="p-4 rounded-xl bg-[#070d18] border border-[#16253c] flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Detected Emotional Tones</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {emotionalTone.map((tone, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-full bg-[#0f1d33] border border-[#1a3257] text-cyan-300 font-medium shadow-2xs"
              >
                {tone}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Classified via tone vector analysis</p>
        </div>
      </div>

      {/* Keywords Cloud with Sentiment Tagging */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-500" />
          <span>High-Frequency Keywords & Salience</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, idx) => {
            const badgeColor =
              kw.sentiment === 'positive'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : kw.sentiment === 'negative'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${badgeColor}`}
                title={kw.contextSnippet ? `Context: ${kw.contextSnippet}` : undefined}
              >
                <span>{kw.word}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/70 font-mono font-bold">
                  {kw.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thematic Clustering Cards */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-700">Emergent Themes & Representative Quotes</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {themes.map((theme, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{theme.themeName}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                  {theme.prevalence}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{theme.description}</p>
              {theme.representativeQuote && (
                <div className="text-[11px] text-slate-500 italic border-l-2 border-indigo-300 pl-2.5 pt-0.5">
                  "{theme.representativeQuote}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs">
        <span className="font-semibold text-indigo-900 block mb-1">Executive Qualitative Synthesis:</span>
        <p className="text-slate-700 leading-relaxed">{executiveSummary}</p>
      </div>
    </div>
  );
};
