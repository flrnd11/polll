/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { Survey, SurveyResponse, SupportedLanguage } from '../types/survey';
import { apiService } from '../services/apiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey;
  responses: SurveyResponse[];
  currentLanguage: SupportedLanguage;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  survey,
  responses,
  currentLanguage,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **Astra**, your AI Survey Copilot. I can assist you with questionnaire design, Likert scale calibrations, Philippine dialect translations (Tagalog, Cebuano, Ilocano), or synthesize insights across your ${survey.interviewType} survey. How can I help today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isWide, setIsWide] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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
          "I'm operating in offline mode. Survey Tip: Ensure Likert questions use balanced anchors (e.g. Strongly Disagree to Strongly Agree) to prevent response acquiescence bias.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat session refreshed. Ready to assist with "${survey.title}" or survey methodology questions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const promptSuggestions = [
    'Analyze current survey responses & key takeaways',
    'Suggest 4 balanced Likert scale questions',
    'How do I translate this to Tagalog & Cebuano respectfully?',
    'What sample size is needed for 95% confidence level?',
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent backdrop to focus on the left-side chatbot */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity no-print"
        onClick={onClose}
      />

      {/* LEFT-SIDE Chatbot Drawer matching the screenshot dark theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${
          isWide ? 'w-full sm:w-[580px]' : 'w-full sm:w-[460px]'
        } bg-[#080d17] shadow-2xl border-r border-[#17253b] flex flex-col no-print animate-in slide-in-from-left duration-200 transition-all text-slate-100`}
        aria-label="AI Survey Copilot Chatbot"
      >
        {/* Drawer Header on the Left Side */}
        <div className="p-4 border-b border-[#17253b] flex items-center justify-between bg-[#0b1322]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Astra AI Copilot</h3>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Gemini 3.8-Flash Survey Analyst</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsWide(!isWide)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#132034] transition-colors hidden sm:inline-flex"
              title={isWide ? 'Normal Width' : 'Expand Width'}
            >
              {isWide ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClearChat}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-[#132034] transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#132034] transition-colors ml-1"
              title="Close Chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Survey Context Bar */}
        <div className="px-4 py-2 bg-[#0c182b] border-b border-[#172d4d] text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate max-w-[280px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              Survey: <strong className="text-white">{survey.title}</strong>
            </span>
          </div>
          <span className="capitalize font-semibold text-[11px] px-2 py-0.5 rounded bg-[#10223d] text-cyan-300 border border-[#1b3d6e]">
            {survey.interviewType}
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#070b13]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-[#0369a1] text-white rounded-br-xs border border-sky-500/30'
                    : 'bg-[#0c1626] text-slate-200 rounded-bl-xs border border-[#1a2d4a]'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>

              {/* Message metadata & quick copy action */}
              <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                <span>{m.timestamp}</span>
                {m.role === 'assistant' && (
                  <button
                    onClick={() => handleCopyMessage(m.id, m.content)}
                    className="opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-opacity flex items-center gap-1"
                    title="Copy response"
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
            <div className="flex items-center gap-2 text-cyan-300 text-xs py-2 bg-[#0c1626] p-3 rounded-xl border border-[#1a2d4a] w-fit">
              <Bot className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Astra is analyzing survey constructs...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-[#17253b] bg-[#09101d] space-y-1.5">
          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
            Quick Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] text-left px-2.5 py-1.5 rounded-lg bg-[#0d182b] border border-[#1b2f50] text-slate-300 hover:bg-[#13233e] hover:border-cyan-500/50 hover:text-cyan-300 transition-colors truncate max-w-full font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Input Field */}
        <div className="p-3.5 border-t border-[#17253b] bg-[#0b1322]">
          <div className="flex items-center gap-2 bg-[#080d17] border border-[#1a2e4d] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-500/30 focus-within:border-cyan-500 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Astra about questions, Likert scales, or analytics..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="p-1.5 rounded-lg bg-cyan-600 text-white disabled:opacity-40 hover:bg-cyan-500 transition-colors shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            Powered by Gemini 3.8-Flash. Designed for psychometric accuracy and Philippine dialect fluency.
          </p>
        </div>
      </aside>
    </>
  );
};
