/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Trash2,
  Copy,
  Languages,
  BookOpen,
  Sliders,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Layers,
  Wand2,
  Save,
  Search,
  Tag,
  ChevronDown,
  Settings2,
} from 'lucide-react';
import {
  Survey,
  SurveyQuestion,
  InterviewType,
  QuestionType,
  LikertScaleType,
  SupportedLanguage,
  LikertConfig,
} from '../types/survey';
import { LIKERT_TEMPLATES } from '../data/likertTemplates';
import { QUESTION_BANK } from '../data/questionBank';
import { apiService } from '../services/apiService';

interface SurveyBuilderProps {
  survey: Survey;
  onUpdateSurvey: (updated: Survey) => void;
  currentLanguage: SupportedLanguage;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  survey,
  onUpdateSurvey,
  currentLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'bank' | 'ai_generator'>('editor');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // AI Generator state
  const [aiObjective, setAiObjective] = useState(survey.objective);
  const [aiCategory, setAiCategory] = useState('Public Health & Governance');
  const [aiCount, setAiCount] = useState(4);
  const [aiLang, setAiLang] = useState<SupportedLanguage>('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<SurveyQuestion[]>([]);

  // Multilingual translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationSuccess, setTranslationSuccess] = useState<string | null>(null);

  // Question bank search/filter
  const [bankSearch, setBankSearch] = useState('');
  const [bankCategory, setBankCategory] = useState('All');

  const questionCount = survey.questions.length;
  const maxQuestions = 50;
  const isAtLimit = questionCount >= maxQuestions;

  // Survey metadata updater
  const handleUpdateTitle = (title: string) => {
    onUpdateSurvey({ ...survey, title });
  };

  const handleUpdateObjective = (objective: string) => {
    onUpdateSurvey({ ...survey, objective });
  };

  const handleUpdateInterviewType = (interviewType: InterviewType) => {
    onUpdateSurvey({ ...survey, interviewType });
  };

  // Add a blank question
  const handleAddQuestion = (type: QuestionType = 'likert') => {
    if (isAtLimit) return;
    const newQ: SurveyQuestion = {
      id: `q-${Date.now()}`,
      text: 'New inquiry for respondent evaluation',
      englishText: 'New inquiry for respondent evaluation',
      type,
      category: 'General',
      difficultyScore: 25,
      relevanceScore: 90,
      scoringRationale: 'Configured with moderate cognitive complexity.',
      required: true,
      likertConfig: type === 'likert' ? { ...LIKERT_TEMPLATES.agreement_5 } : undefined,
      options: type === 'multiple_choice' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      probePrompts:
        type === 'semi_structured_probe' || type === 'unstructured_dialogue'
          ? ['Can you elaborate on your experience?']
          : undefined,
    };

    onUpdateSurvey({
      ...survey,
      questions: [...survey.questions, newQ],
    });
    setEditingQuestionId(newQ.id);
  };

  // Remove question
  const handleDeleteQuestion = (id: string) => {
    onUpdateSurvey({
      ...survey,
      questions: survey.questions.filter((q) => q.id !== id),
    });
  };

  // Duplicate question
  const handleDuplicateQuestion = (q: SurveyQuestion) => {
    if (isAtLimit) return;
    const duplicated: SurveyQuestion = {
      ...q,
      id: `q-${Date.now()}`,
      text: `${q.text} (Copy)`,
    };
    onUpdateSurvey({
      ...survey,
      questions: [...survey.questions, duplicated],
    });
  };

  // Reorder questions
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= survey.questions.length) return;
    const items = [...survey.questions];
    const [moved] = items.splice(index, 1);
    items.splice(newIdx, 0, moved);
    onUpdateSurvey({ ...survey, questions: items });
  };

  // Update specific question field
  const handleUpdateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    onUpdateSurvey({
      ...survey,
      questions: survey.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    });
  };

  // Insert from Question Bank
  const handleInsertBankItem = (item: any) => {
    if (isAtLimit) return;
    const newQ: SurveyQuestion = {
      id: `q-bank-${Date.now()}-${item.id}`,
      text: item.text,
      englishText: item.text,
      type: item.questionType,
      category: item.category,
      difficultyScore: item.difficultyScore,
      relevanceScore: item.relevanceScore,
      scoringRationale: `Imported from certified Question Bank [${item.category}]`,
      likertConfig: item.likertConfig ? { ...item.likertConfig } : undefined,
      options: item.options ? [...item.options] : undefined,
      probePrompts: item.probePrompts ? [...item.probePrompts] : undefined,
      required: true,
    };

    onUpdateSurvey({
      ...survey,
      questions: [...survey.questions, newQ],
    });
  };

  // Run AI Question Generation
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const generated = await apiService.generateQuestions({
        surveyTitle: survey.title,
        objective: aiObjective,
        interviewType: survey.interviewType,
        targetLanguage: aiLang,
        category: aiCategory,
        count: aiCount,
      });
      setGeneratedQuestions(generated);
    } catch (err) {
      console.error('Error generating questions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add AI generated questions to survey
  const handleAcceptGeneratedQuestions = () => {
    const spaceLeft = maxQuestions - survey.questions.length;
    const toAdd = generatedQuestions.slice(0, spaceLeft);
    onUpdateSurvey({
      ...survey,
      questions: [...survey.questions, ...toAdd],
    });
    setGeneratedQuestions([]);
    setActiveTab('editor');
  };

  // Translate all survey questions into Philippine Dialects or other languages
  const handleTranslateAll = async (targetLang: SupportedLanguage) => {
    setIsTranslating(true);
    setTranslationSuccess(null);
    try {
      const texts = survey.questions.map((q) => q.englishText || q.text);
      const translated = await apiService.translate(texts, targetLang, 'English');

      const updated = survey.questions.map((q, idx) => {
        const transMap = { ...(q.translations || {}) };
        const key = targetLang.toLowerCase().split(' ')[0]; // 'tagalog', 'cebuano', etc.
        transMap[key] = translated[idx] || q.text;
        return {
          ...q,
          translations: transMap,
        };
      });

      onUpdateSurvey({ ...survey, questions: updated });
      setTranslationSuccess(`Successfully translated ${texts.length} questions to ${targetLang}!`);
      setTimeout(() => setTranslationSuccess(null), 4000);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Filtered Question Bank
  const filteredBank = QUESTION_BANK.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(bankSearch.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(bankSearch.toLowerCase()));
    const matchesCat = bankCategory === 'All' || item.category === bankCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Survey Header & Metadata Config */}
      <div className="bg-[#0b1322] rounded-2xl p-6 border border-[#17253b] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#17253b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#101d33] text-cyan-400 border border-[#193259] uppercase tracking-wider">
                Questionnaire Designer
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  questionCount >= 45
                    ? 'bg-rose-950/50 text-rose-400 border border-rose-800'
                    : 'bg-[#0e243d] text-cyan-300 border border-[#1a426e]'
                }`}
              >
                {questionCount} / {maxQuestions} Questions
              </span>
            </div>
            <input
              type="text"
              value={survey.title}
              onChange={(e) => handleUpdateTitle(e.target.value)}
              className="text-xl font-bold text-white mt-2 w-full bg-transparent hover:bg-[#070d18] focus:bg-[#070d18] border-b border-transparent focus:border-cyan-500 rounded px-1 -mx-1 py-1 focus:outline-none transition-colors"
              placeholder="Survey Title..."
            />
          </div>

          {/* Interview Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Interview Paradigm:</span>
            <select
              value={survey.interviewType}
              onChange={(e) => handleUpdateInterviewType(e.target.value as InterviewType)}
              className="text-xs font-semibold bg-[#070d18] border border-[#1c2d47] rounded-xl px-3 py-2 text-cyan-400 focus:outline-none capitalize"
            >
              <option value="structured" className="bg-[#0b1322] text-slate-200">Structured Interview</option>
              <option value="semi-structured" className="bg-[#0b1322] text-slate-200">Semi-Structured Interview</option>
              <option value="unstructured" className="bg-[#0b1322] text-slate-200">Unstructured Interview</option>
            </select>
          </div>
        </div>

        {/* Objective & Description */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Research Objective & Construct Scope:
            </label>
            <input
              type="text"
              value={survey.objective}
              onChange={(e) => handleUpdateObjective(e.target.value)}
              className="text-xs text-slate-200 w-full bg-[#070d18] border border-[#1c2d47] rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Gather field data on public transport reliability..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Target Audience:</label>
            <input
              type="text"
              value={survey.targetAudience}
              onChange={(e) => onUpdateSurvey({ ...survey, targetAudience: e.target.value })}
              className="text-xs text-slate-200 w-full bg-[#070d18] border border-[#1c2d47] rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Commuters & Drivers"
            />
          </div>
        </div>

        {/* Dialect / Multilingual Quick Action Bar */}
        <div className="mt-4 pt-3 border-t border-[#17253b] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Translate Entire Instrument:</span>
            <div className="flex items-center gap-1.5">
              {(['Tagalog', 'Cebuano (Bisaya)', 'Ilocano', 'Hiligaynon (Ilonggo)', 'Spanish'] as SupportedLanguage[]).map(
                (lang) => (
                  <button
                    key={lang}
                    onClick={() => handleTranslateAll(lang)}
                    disabled={isTranslating}
                    className="px-2 py-1 bg-[#0e1c30] hover:bg-[#142947] text-cyan-300 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50 border border-[#173357]"
                  >
                    {lang.split(' ')[0]}
                  </button>
                )
              )}
            </div>
            {isTranslating && <span className="text-cyan-400 animate-pulse text-[11px]">Translating...</span>}
            {translationSuccess && <span className="text-emerald-400 text-[11px] font-medium">{translationSuccess}</span>}
          </div>

          {/* Builder Sub-Navigation */}
          <div className="flex items-center gap-1 bg-[#070d18] p-1 rounded-xl border border-[#17253b]">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'editor' ? 'bg-[#0f2942] text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Questions ({questionCount})
            </button>
            <button
              onClick={() => setActiveTab('ai_generator')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                activeTab === 'ai_generator'
                  ? 'bg-[#0f2942] text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>AI Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                activeTab === 'bank'
                  ? 'bg-[#0f2942] text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Question Bank ({QUESTION_BANK.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: QUESTION LIST & INLINE EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Survey Questions ({questionCount} of {maxQuestions})
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddQuestion('likert')}
                disabled={isAtLimit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Likert Scale</span>
              </button>
              <button
                onClick={() => handleAddQuestion('multiple_choice')}
                disabled={isAtLimit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-violet-600" />
                <span>+ Choice</span>
              </button>
              <button
                onClick={() =>
                  handleAddQuestion(
                    survey.interviewType === 'unstructured'
                      ? 'unstructured_dialogue'
                      : 'semi_structured_probe'
                  )
                }
                disabled={isAtLimit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Open Probe</span>
              </button>
            </div>
          </div>

          {questionCount === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">Your Survey is Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Add questions manually, import validated constructs from the Question Bank, or use AI generation.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setActiveTab('ai_generator')}
                  className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                >
                  Generate with AI
                </button>
                <button
                  onClick={() => setActiveTab('bank')}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200"
                >
                  Browse Bank
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {survey.questions.map((q, idx) => (
                <QuestionEditorCard
                  key={q.id}
                  question={q}
                  index={idx}
                  total={questionCount}
                  currentLanguage={currentLanguage}
                  onUpdate={(updates) => handleUpdateQuestion(q.id, updates)}
                  onDelete={() => handleDeleteQuestion(q.id)}
                  onDuplicate={() => handleDuplicateQuestion(q)}
                  onMoveUp={() => handleMoveQuestion(idx, 'up')}
                  onMoveDown={() => handleMoveQuestion(idx, 'down')}
                  isEditing={editingQuestionId === q.id}
                  onToggleEdit={() => setEditingQuestionId(editingQuestionId === q.id ? null : q.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI QUESTION GENERATOR */}
      {activeTab === 'ai_generator' && (
        <div className="bg-[#0b1322] rounded-2xl p-6 border border-[#17253b] shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                AI Question Generator with Scoring & Dialect Support
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gemini will generate construct-aligned questions with Cognitive Difficulty (1-100) and Relevance Scoring (1-100) tailored to your interview paradigm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Target Language / Dialect:</label>
              <select
                value={aiLang}
                onChange={(e) => setAiLang(e.target.value as SupportedLanguage)}
                className="w-full bg-[#070d18] border border-[#1c2d47] rounded-xl p-2.5 font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="English" className="bg-[#0b1322] text-slate-200">English</option>
                <option value="Tagalog" className="bg-[#0b1322] text-slate-200">Tagalog (Filipino)</option>
                <option value="Cebuano (Bisaya)" className="bg-[#0b1322] text-slate-200">Cebuano (Bisaya)</option>
                <option value="Ilocano" className="bg-[#0b1322] text-slate-200">Ilocano</option>
                <option value="Hiligaynon (Ilonggo)" className="bg-[#0b1322] text-slate-200">Hiligaynon (Ilonggo)</option>
                <option value="Bikol" className="bg-[#0b1322] text-slate-200">Bikol</option>
                <option value="Waray" className="bg-[#0b1322] text-slate-200">Waray</option>
                <option value="Spanish" className="bg-[#0b1322] text-slate-200">Spanish</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Domain Category:</label>
              <select
                value={aiCategory}
                onChange={(e) => setAiCategory(e.target.value)}
                className="w-full bg-[#070d18] border border-[#1c2d47] rounded-xl p-2.5 font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Public Health & Governance" className="bg-[#0b1322] text-slate-200">Public Health & Governance</option>
                <option value="Customer Experience & UX" className="bg-[#0b1322] text-slate-200">Customer Experience & UX</option>
                <option value="Employee Engagement & Ops" className="bg-[#0b1322] text-slate-200">Employee Engagement & Ops</option>
                <option value="Youth Aspirations & Education" className="bg-[#0b1322] text-slate-200">Youth Aspirations & Education</option>
                <option value="Disaster Preparedness" className="bg-[#0b1322] text-slate-200">Disaster Preparedness</option>
                <option value="Digital Accessibility" className="bg-[#0b1322] text-slate-200">Digital Accessibility</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Number of Questions:</label>
              <select
                value={aiCount}
                onChange={(e) => setAiCount(Number(e.target.value))}
                className="w-full bg-[#070d18] border border-[#1c2d47] rounded-xl p-2.5 font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={3} className="bg-[#0b1322] text-slate-200">3 Questions</option>
                <option value={4} className="bg-[#0b1322] text-slate-200">4 Questions</option>
                <option value={5} className="bg-[#0b1322] text-slate-200">5 Questions</option>
                <option value={8} className="bg-[#0b1322] text-slate-200">8 Questions</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating...' : 'Generate Questions'}</span>
              </button>
            </div>
          </div>

          {/* Generated Preview */}
          {generatedQuestions.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  AI-Suggested Candidates ({generatedQuestions.length})
                </span>
                <button
                  onClick={handleAcceptGeneratedQuestions}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Add All to Survey</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#17253b] bg-[#070d18] text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-white text-sm">{q.text}</p>
                        {q.englishText && q.englishText !== q.text && (
                          <p className="text-slate-400 italic">En: {q.englishText}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#0f2742] text-cyan-400 border border-[#1a426d] font-bold">
                          Rel: {q.relevanceScore}/100
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#16253c] text-slate-300 border border-[#1f3554] font-bold">
                          Diff: {q.difficultyScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 italic">
                      Rationale: {q.scoringRationale}
                    </div>

                    {q.probePrompts && q.probePrompts.length > 0 && (
                      <div className="text-[11px] text-slate-300 bg-[#0b1322] p-2.5 rounded-lg border border-[#17253b]">
                        <strong className="text-cyan-400">Suggested Probes:</strong> {q.probePrompts.join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUESTION BANK */}
      {activeTab === 'bank' && (
        <div className="bg-[#0b1322] rounded-2xl p-6 border border-[#17253b] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#17253b]">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Question Bank & Construct Repository</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-calibrated and scored questions ready for 1-click addition into your survey.
              </p>
            </div>

            {/* Bank Search & Category */}
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions or tags..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#070d18] border border-[#1c2d47] rounded-xl focus:outline-none focus:border-cyan-500 text-xs w-48 text-slate-200"
                />
              </div>

              <select
                value={bankCategory}
                onChange={(e) => setBankCategory(e.target.value)}
                className="bg-[#070d18] border border-[#1c2d47] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none"
              >
                <option value="All" className="bg-[#0b1322] text-slate-200">All Categories</option>
                <option value="Demographics & Profile" className="bg-[#0b1322] text-slate-200">Demographics</option>
                <option value="Public Service & Governance" className="bg-[#0b1322] text-slate-200">Governance</option>
                <option value="Workplace & Operations" className="bg-[#0b1322] text-slate-200">Workplace</option>
                <option value="Community Health & Governance" className="bg-[#0b1322] text-slate-200">Community Health</option>
                <option value="Leadership & Social Impact" className="bg-[#0b1322] text-slate-200">Leadership</option>
                <option value="Youth & Social Dynamics" className="bg-[#0b1322] text-slate-200">Youth</option>
              </select>
            </div>
          </div>

          {/* Bank Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBank.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#17253b] bg-[#070d18] hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">{item.category}</span>
                    <span className="capitalize px-1.5 py-0.2 rounded bg-[#0f243d] text-cyan-400 border border-[#1a3d66]">
                      {item.interviewType}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-snug">{item.text}</p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#0b1322] border border-[#17253b] text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#17253b] text-[11px]">
                  <div className="text-slate-400">
                    Difficulty: <strong className="text-slate-200">{item.difficultyScore}/100</strong> • Rel:{' '}
                    <strong className="text-slate-200">{item.relevanceScore}/100</strong>
                  </div>
                  <button
                    onClick={() => handleInsertBankItem(item)}
                    disabled={isAtLimit}
                    className="px-2.5 py-1 rounded-lg bg-[#0e243d] text-cyan-300 hover:bg-[#153457] font-semibold transition-colors disabled:opacity-50 border border-[#1a4066]"
                  >
                    + Add to Survey
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
   SUB-COMPONENT: QUESTION CARD & INLINE EDITOR
-------------------------------------------------------------- */
interface QuestionEditorCardProps {
  question: SurveyQuestion;
  index: number;
  total: number;
  currentLanguage: SupportedLanguage;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
}

const QuestionEditorCard: React.FC<QuestionEditorCardProps> = ({
  question,
  index,
  total,
  currentLanguage,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isEditing,
  onToggleEdit,
}) => {
  const activeDialectKey = currentLanguage.toLowerCase().split(' ')[0];
  const translatedText = question.translations?.[activeDialectKey];

  return (
    <div className="bg-[#0b1322] rounded-2xl border border-[#17253b] shadow-sm hover:border-[#22395c] transition-all p-5 space-y-3">
      {/* Top Bar: Question Index, Type badge, Reorder & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[#0f243d] border border-[#1c3f66] font-mono text-xs font-bold text-cyan-400 flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#0e2947] text-cyan-400 border border-[#18426d]">
            {question.type.replace('_', ' ')}
          </span>
          <span className="text-[11px] text-slate-400">{question.category}</span>
        </div>

        {/* Action Buttons: Move, Duplicate, Edit, Delete */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-[#13233c]"
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-[#13233c]"
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 hover:text-cyan-400 rounded hover:bg-[#13233c]"
            title="Duplicate Question"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleEdit}
            className={`p-1 rounded ${isEditing ? 'text-cyan-400 bg-[#0e243d]' : 'hover:text-white hover:bg-[#13233c]'}`}
            title="Configure Scale & Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:text-rose-400 rounded hover:bg-[#13233c]"
            title="Delete Question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Question Input */}
      <div>
        <textarea
          rows={2}
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value, englishText: e.target.value })}
          className="w-full text-xs font-semibold text-slate-100 bg-[#070d18] border border-[#1c2d47] focus:border-cyan-500 rounded-xl p-3 focus:outline-none transition-colors"
          placeholder="Write your survey question..."
        />

        {/* Dialect translation preview if active dialect is not English */}
        {currentLanguage !== 'English' && (
          <div className="mt-1 flex items-start gap-1.5 text-[11px] text-amber-300 bg-[#161208] p-2 rounded-lg border border-amber-800/50">
            <span className="font-semibold text-amber-400">{currentLanguage}:</span>
            <input
              type="text"
              value={translatedText || ''}
              onChange={(e) => {
                const transMap = { ...(question.translations || {}) };
                transMap[activeDialectKey] = e.target.value;
                onUpdate({ translations: transMap });
              }}
              placeholder={`Add ${currentLanguage} phrasing...`}
              className="w-full bg-transparent border-b border-amber-600/60 focus:outline-none text-slate-100 placeholder-amber-700"
            />
          </div>
        )}
      </div>

      {/* EXPANDED SETTINGS (Likert Config, Options, Probes, Scoring) */}
      {isEditing && (
        <div className="pt-3 border-t border-[#17253b] space-y-3 bg-[#080e1a] -mx-5 -mb-5 p-5 rounded-b-2xl text-xs">
          {/* Question Type & Category Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Type:</label>
              <select
                value={question.type}
                onChange={(e) => {
                  const newType = e.target.value as QuestionType;
                  onUpdate({
                    type: newType,
                    likertConfig: newType === 'likert' ? { ...LIKERT_TEMPLATES.agreement_5 } : undefined,
                  });
                }}
                className="w-full bg-[#0b1424] border border-[#1a2d48] rounded-xl p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="likert">Likert Scale</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="semi_structured_probe">Semi-Structured Probe</option>
                <option value="unstructured_dialogue">Unstructured Dialogue</option>
                <option value="open_ended">Open-Ended</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Category:</label>
              <input
                type="text"
                value={question.category}
                onChange={(e) => onUpdate({ category: e.target.value })}
                className="w-full bg-[#0b1424] border border-[#1a2d48] rounded-xl p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="rounded text-cyan-500 bg-[#070b12] border-[#1a2d48]"
                />
                <span>Required Field</span>
              </label>
            </div>
          </div>

          {/* LIKERT SCALE CONFIGURATOR (Requirement 5) */}
          {question.type === 'likert' && (
            <div className="p-3.5 bg-[#0b1322] rounded-xl border border-[#17253b] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Likert Scale Setup</span>
                </span>
                <select
                  value={question.likertConfig?.type || 'agreement_5'}
                  onChange={(e) => {
                    const templateKey = e.target.value as LikertScaleType;
                    const template = LIKERT_TEMPLATES[templateKey];
                    onUpdate({ likertConfig: { ...template } });
                  }}
                  className="bg-[#070d18] border border-[#1a2d48] rounded-lg px-2.5 py-1 text-slate-300 text-xs font-medium focus:outline-none"
                >
                  <option value="agreement_5">5-Point Agreement (Strongly Disagree → Agree)</option>
                  <option value="agreement_7">7-Point Agreement (Detailed Nuance)</option>
                  <option value="satisfaction_5">5-Point Satisfaction (Dissatisfied → Satisfied)</option>
                  <option value="frequency_5">5-Point Frequency (Never → Always)</option>
                  <option value="importance_5">5-Point Importance (Not Important → Extremely)</option>
                  <option value="custom">Custom Scale</option>
                </select>
              </div>

              {/* Editable Scale Labels */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">
                  Scale Labels ({question.likertConfig?.points || 5} points):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                  {question.likertConfig?.labels.map((lbl, lIdx) => (
                    <input
                      key={lIdx}
                      type="text"
                      value={lbl}
                      onChange={(e) => {
                        const newLabels = [...(question.likertConfig?.labels || [])];
                        newLabels[lIdx] = e.target.value;
                        onUpdate({
                          likertConfig: {
                            ...question.likertConfig!,
                            labels: newLabels,
                          },
                        });
                      }}
                      className="bg-[#070d18] border border-[#1a2d48] rounded-lg p-1.5 text-[11px] text-slate-200 font-medium focus:border-cyan-500 focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MULTIPLE CHOICE OPTIONS */}
          {question.type === 'multiple_choice' && (
            <div className="p-3.5 bg-[#0b1322] rounded-xl border border-[#17253b] space-y-2">
              <label className="font-semibold text-slate-300 block">Choice Options:</label>
              {question.options?.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">{oIdx + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(question.options || [])];
                      newOpts[oIdx] = e.target.value;
                      onUpdate({ options: newOpts });
                    }}
                    className="flex-1 bg-[#070d18] border border-[#1a2d48] rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => {
                      const newOpts = question.options?.filter((_, i) => i !== oIdx);
                      onUpdate({ options: newOpts });
                    }}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => onUpdate({ options: [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`] })}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold"
              >
                + Add Option
              </button>
            </div>
          )}

          {/* PROBING PROMPTS FOR SEMI-STRUCTURED / UNSTRUCTURED */}
          {(question.type === 'semi_structured_probe' || question.type === 'unstructured_dialogue') && (
            <div className="p-3.5 bg-[#0b1322] rounded-xl border border-[#17253b] space-y-2">
              <label className="font-semibold text-slate-300 block">Interviewer Probing Prompts:</label>
              {question.probePrompts?.map((probe, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={probe}
                    onChange={(e) => {
                      const newProbes = [...(question.probePrompts || [])];
                      newProbes[pIdx] = e.target.value;
                      onUpdate({ probePrompts: newProbes });
                    }}
                    className="flex-1 bg-[#070d18] border border-[#1a2d48] rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => {
                      const newProbes = question.probePrompts?.filter((_, i) => i !== pIdx);
                      onUpdate({ probePrompts: newProbes });
                    }}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => onUpdate({ probePrompts: [...(question.probePrompts || []), 'What was the immediate outcome?'] })}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold"
              >
                + Add Probe Prompt
              </button>
            </div>
          )}

          {/* Difficulty and Relevance Scoring Display & Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Cognitive Difficulty:</span>
                <span className="font-bold text-slate-200">{question.difficultyScore} / 100</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={question.difficultyScore}
                onChange={(e) => onUpdate({ difficultyScore: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Relevance Score:</span>
                <span className="font-bold text-emerald-400">{question.relevanceScore} / 100</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={question.relevanceScore}
                onChange={(e) => onUpdate({ relevanceScore: Number(e.target.value) })}
                className="w-full accent-emerald-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
