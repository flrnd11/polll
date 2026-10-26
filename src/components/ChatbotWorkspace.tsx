/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Languages,
  Sliders,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { Survey, SurveyResponse, SupportedLanguage } from '../types/survey';
import { apiService } from '../services/apiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatbotWorkspaceProps {
  survey: Survey;
  responses: SurveyResponse[];
  currentLanguage: SupportedLanguage;
}

export const ChatbotWorkspace: React.FC<ChatbotWorkspaceProps> = ({
  survey,
  responses,
  currentLanguage,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to Astra Survey Copilot
I am your AI Survey Research and Psychometric Assistant powered by **Gemini 3.8-Flash**.

I am synchronized with your active study: **"${survey.title}"** (*${survey.interviewType.toUpperCase()}* paradigm).

Here are things we can do together:
- **Design & Refine Questions:** Formulate balanced Likert scales (5-point, 7-point), eliminate leading bias, and optimize cognitive load.
- **Philippine Dialect Localization:** Context-aware translations into Tagalog, Cebuano (Bisaya), Ilocano, and Hiligaynon preserving respectful cultural honorifics.
- **Qualitative Data Synthesis:** Extract themes, sentiment polarities, and actionable policy insights from field responses.
- **Statistical Methodologies:** Calculate minimum required sample sizes, margin of error, and respondent cohort stratification.

What would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const context = {
        activeSurveyTitle: survey.title,
        interviewType: survey.interviewType,
        questionCount: survey.questions.length,
        responseCount: responses.filter((r) => r.surveyId === survey.id).length,
        language: currentLanguage,
      };

      const reply = await apiService.chatWithCopilot(chatHistory, context);

      const aiMessage: Message = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          "I'm currently assisting in local offline mode. Methodology Tip: When structuring Likert questions, ensure you offer an odd number of choices (like 5 or 7) if a neutral midpoint is theoretically justified for the construct.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptCategories = [
    {
      title: 'Questionnaire Design',
      icon: <Sliders className="w-3.5 h-3.5 text-cyan-400" />,
      prompts: [
        'Suggest 5 high-construct Likert questions on community public safety',
        'How can I convert this survey from Structured to Semi-Structured probes?',
        'Critique my survey questions for double-barreled and leading bias',
      ],
    },
    {
      title: 'Dialect Localization',
      icon: <Languages className="w-3.5 h-3.5 text-emerald-400" />,
      prompts: [
        'Translate the active questionnaire into polite conversational Tagalog',
        'Rephrase the questions into natural Cebuano (Bisaya) with proper context',
        'Provide Ilocano translations for rural agricultural respondents',
      ],
    },
    {
      title: 'Data Insights & Synthesis',
      icon: <BarChart3 className="w-3.5 h-3.5 text-amber-400" />,
      prompts: [
        'Synthesize current response sentiment and list top 3 priority areas',
        'Compare satisfaction ratings across demographic cohorts',
        'What statistical sample size do I need for a population of 25,000?',
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Workspace Header */}
      <div className="bg-[#0b1322] rounded-2xl p-6 border border-[#17253b] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#152338]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Astra AI Survey Copilot</h1>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Intelligent survey copilot powered by Gemini 3.8-Flash for question design, psychometric analysis, and dialect translation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: `welcome-${Date.now()}`,
                    role: 'assistant',
                    content: `New session started. How can I assist with "${survey.title}"?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-[#132034] rounded-lg transition-colors border border-[#1a2e4d]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Study Context Tags */}
        <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
          <span>
            Active Survey: <strong className="text-white">{survey.title}</strong>
          </span>
          <span>•</span>
          <span>
            Paradigm: <strong className="text-cyan-400 uppercase font-semibold">{survey.interviewType}</strong>
          </span>
          <span>•</span>
          <span>
            Instrument Size: <strong className="text-white">{survey.questions.length} / 50 questions</strong>
          </span>
          <span>•</span>
          <span>
            Language: <strong className="text-white">{currentLanguage}</strong>
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column (1 Col): Prompt Playbooks */}
        <div className="space-y-4">
          <div className="bg-[#0b1322] rounded-2xl p-5 border border-[#17253b] shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-xs text-white">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Prompt Playbooks</span>
            </div>

            <div className="space-y-4">
              {promptCategories.map((cat, cIdx) => (
                <div key={cIdx} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                    {cat.icon}
                    <span>{cat.title}</span>
                  </div>
                  <div className="space-y-1">
                    {cat.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(p)}
                        className="w-full text-left p-2 rounded-lg bg-[#0d1626] hover:bg-[#13243f] hover:text-cyan-300 border border-[#182842] text-[11px] text-slate-300 leading-snug transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (3 Cols): Conversational Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0b1322] rounded-2xl border border-[#17253b] shadow-sm flex flex-col h-[640px]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs bg-[#070b13] rounded-t-2xl">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                        m.role === 'user'
                          ? 'bg-[#0369a1] text-white rounded-br-xs border border-sky-500/40'
                          : 'bg-[#0b1524] text-slate-200 rounded-bl-xs border border-[#1a2d4a]'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-10 text-[10px] text-slate-500">
                    <span>{m.timestamp}</span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-opacity flex items-center gap-1"
                        title="Copy message"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2.5 text-xs text-cyan-300 bg-[#0c1626] p-3.5 rounded-xl border border-[#1a2d4a] w-fit">
                  <Bot className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Astra is formulating research recommendations...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[#17253b] bg-[#0b1322] rounded-b-2xl">
              <div className="flex items-center gap-2 bg-[#080d17] border border-[#1a2e4d] rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-cyan-500/30 focus-within:border-cyan-500 transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Astra anything about survey design, Likert metrics, or insights..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold text-xs disabled:opacity-40 hover:bg-cyan-500 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
