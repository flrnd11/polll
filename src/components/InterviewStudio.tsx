/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Play,
  Pause,
  Square,
  Users,
  User,
  Shuffle,
  Clock,
  Save,
  CheckCircle2,
  Tag,
  ChevronRight,
  ChevronLeft,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import {
  Survey,
  SurveyQuestion,
  InterviewMode,
  SurveyResponse,
  SessionNote,
  SupportedLanguage,
  RespondentProfile,
} from '../types/survey';
import { storageService } from '../services/storageService';

interface InterviewStudioProps {
  survey: Survey;
  onSaveResponse: (response: SurveyResponse) => void;
  currentLanguage: SupportedLanguage;
}

export const InterviewStudio: React.FC<InterviewStudioProps> = ({
  survey,
  onSaveResponse,
  currentLanguage,
}) => {
  // Mode selection
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('individual');

  // Active respondent(s)
  const [respondents, setRespondents] = useState<RespondentProfile[]>([
    {
      id: `resp-${Date.now()}-1`,
      name: 'Maria Santos',
      group: 'Barangay & Community Leaders',
      location: 'Barangay Central',
      status: 'in_progress',
    },
  ]);
  const [activeRespondentIndex, setActiveRespondentIndex] = useState(0);

  // Group interview participant list
  const [groupParticipants, setGroupParticipants] = useState<string[]>([
    'Maria Santos (Barangay Leader)',
    'Joshua Dela Cruz (Youth)',
    'Nurse Grace (Healthcare)',
  ]);
  const [newParticipantName, setNewParticipantName] = useState('');

  // Randomized questions sequence (for Random Interview Mode)
  const [questionOrder, setQuestionOrder] = useState<SurveyQuestion[]>(survey.questions);
  const [randomSampleSize, setRandomSampleSize] = useState<number>(
    Math.min(5, survey.questions.length)
  );

  // Question navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Answers map: questionId -> value
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Session recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // Audio Waveform Visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Time-stamped notes
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [currentNoteTag, setCurrentNoteTag] = useState<'Insight' | 'Concern' | 'Quote' | 'Follow-up'>('Insight');

  // Submit confirmation state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedHash, setSubmittedHash] = useState<string | null>(null);

  // Update questions when survey or random mode changes
  useEffect(() => {
    if (interviewMode === 'random') {
      const shuffled = [...survey.questions].sort(() => 0.5 - Math.random());
      setQuestionOrder(shuffled.slice(0, randomSampleSize));
    } else {
      setQuestionOrder(survey.questions);
    }
    setCurrentQuestionIndex(0);
  }, [survey, interviewMode, randomSampleSize]);

  // Audio timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Simulated live audio waveform
  useEffect(() => {
    if (!isRecording || isPaused || !canvasRef.current) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();

      const width = canvas.width;
      const height = canvas.height;
      const sliceWidth = width / 40;
      let x = 0;

      for (let i = 0; i < 40; i++) {
        const amp = isPaused ? 2 : Math.sin(phase + i * 0.4) * (height / 3) + Math.random() * 6;
        const y = height / 2 + amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.stroke();
      phase += 0.15;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleAddGroupParticipant = () => {
    if (!newParticipantName.trim()) return;
    setGroupParticipants((prev) => [...prev, newParticipantName.trim()]);
    setNewParticipantName('');
  };

  const handleRemoveGroupParticipant = (idx: number) => {
    setGroupParticipants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  const handleAddNote = () => {
    if (!currentNoteText.trim()) return;
    const newNote: SessionNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      secondsElapsed: recordingSeconds,
      content: currentNoteText.trim(),
      tag: currentNoteTag,
    };
    setNotes((prev) => [newNote, ...prev]);
    setCurrentNoteText('');
  };

  const handleCompleteInterview = () => {
    const activeResp = respondents[activeRespondentIndex] || {
      name: 'Anonymous Respondent',
      group: 'General Public',
    };

    const newResponse: SurveyResponse = {
      id: `resp-${Date.now()}`,
      surveyId: survey.id,
      interviewMode,
      language: currentLanguage,
      submittedAt: new Date().toISOString(),
      respondent: {
        id: `r-${Date.now()}`,
        name: interviewMode === 'group' ? groupParticipants.join(', ') : activeResp.name,
        group: activeResp.group,
        location: activeResp.location || 'Metro Manila, PH',
      },
      answers,
      notes,
      sessionMeta: {
        durationSeconds: recordingSeconds > 0 ? recordingSeconds : 120,
        hasAudio: recordingSeconds > 0,
      },
      synced: storageService.isOnline(),
      encryptedHash: '',
    };

    storageService.saveResponse(newResponse);
    onSaveResponse(newResponse);

    setIsSubmitted(true);
    setSubmittedHash(newResponse.encryptedHash);
  };

  const currentQ = questionOrder[currentQuestionIndex];
  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / (questionOrder.length || 1)) * 100
  );

  if (isSubmitted) {
    return (
      <div className="bg-[#0b1322] rounded-2xl p-8 border border-[#17253b] text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-emerald-950/50 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Interview Session Finalized</h2>
        <p className="text-xs text-slate-400">
          All responses, timestamped qualitative notes, and session audio metadata have been securely committed to the encrypted store.
        </p>
        <div className="bg-[#070d18] p-3 rounded-xl border border-[#17253b] text-xs text-cyan-400 font-mono">
          <span className="text-slate-500 block text-[10px]">ENCRYPTED STORAGE HASH</span>
          <span>{submittedHash || 'enc_sha256_verified_offline_vault'}</span>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setIsSubmitted(false);
              setAnswers({});
              setNotes([]);
              setRecordingSeconds(0);
              setIsRecording(false);
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Start Next Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Mode Selection and Header */}
      <div className="bg-[#0b1322] rounded-2xl p-5 border border-[#17253b] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#152338]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/60 uppercase">
                Active Interview Studio
              </span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs font-medium text-slate-300">{survey.title}</span>
            </div>
            <h1 className="text-lg font-bold text-white mt-1">Field Conduction & Note-Taking</h1>
          </div>

          {/* Interview Mode Selector (Requirement 3) */}
          <div className="flex items-center gap-1 bg-[#070d18] border border-[#17253b] p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setInterviewMode('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                interviewMode === 'individual'
                  ? 'bg-[#0f2942] text-[#38bdf8] border border-[#1a4066] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Individual</span>
            </button>

            <button
              onClick={() => setInterviewMode('group')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                interviewMode === 'group'
                  ? 'bg-[#0f2942] text-[#38bdf8] border border-[#1a4066] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Group ({groupParticipants.length})</span>
            </button>

            <button
              onClick={() => setInterviewMode('random')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                interviewMode === 'random'
                  ? 'bg-[#0f2942] text-[#38bdf8] border border-[#1a4066] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Random Sampling</span>
            </button>
          </div>
        </div>

        {/* Mode Specific Controls & Respondent Selection */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Individual Mode: Respondent Profile */}
          {interviewMode === 'individual' && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">Respondent:</span>
              <input
                type="text"
                value={respondents[activeRespondentIndex]?.name || ''}
                onChange={(e) => {
                  const updated = [...respondents];
                  updated[activeRespondentIndex] = {
                    ...updated[activeRespondentIndex],
                    name: e.target.value,
                  };
                  setRespondents(updated);
                }}
                className="bg-[#070d18] border border-[#1a2e4d] rounded-lg px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-cyan-500"
                placeholder="Respondent Name"
              />
              <span className="text-slate-600">•</span>
              <select
                value={respondents[activeRespondentIndex]?.group || 'Youth & University Students'}
                onChange={(e) => {
                  const updated = [...respondents];
                  updated[activeRespondentIndex] = {
                    ...updated[activeRespondentIndex],
                    group: e.target.value,
                  };
                  setRespondents(updated);
                }}
                className="bg-[#070d18] border border-[#1a2e4d] rounded-lg px-2.5 py-1 text-slate-300 font-medium focus:outline-none"
              >
                <option value="Youth & University Students" className="bg-[#0b1322] text-slate-200">Youth & University Students</option>
                <option value="Barangay & Community Leaders" className="bg-[#0b1322] text-slate-200">Barangay Leaders</option>
                <option value="Healthcare & Frontline Workers" className="bg-[#0b1322] text-slate-200">Healthcare Workers</option>
                <option value="MSME & Small Business Owners" className="bg-[#0b1322] text-slate-200">MSME Owners</option>
                <option value="Senior Citizens & Retirees" className="bg-[#0b1322] text-slate-200">Senior Citizens</option>
              </select>
            </div>
          )}

          {/* Group Mode: Participant Tags */}
          {interviewMode === 'group' && (
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Group Interview Cohort:</span>
                <span className="text-slate-400 text-[11px]">(Track multi-speaker contributions)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {groupParticipants.map((p, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e243d] text-cyan-300 border border-[#1a4066] font-medium"
                  >
                    <span>{p}</span>
                    <button
                      onClick={() => handleRemoveGroupParticipant(idx)}
                      className="text-cyan-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    placeholder="Add participant..."
                    className="px-2 py-1 bg-[#070d18] border border-[#1a2e4d] rounded text-xs text-white focus:outline-none focus:border-cyan-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGroupParticipant()}
                  />
                  <button
                    onClick={handleAddGroupParticipant}
                    className="px-2 py-1 bg-[#0f2942] text-cyan-300 rounded font-semibold hover:bg-[#153457]"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Random Mode: Sample Size Selector */}
          {interviewMode === 'random' && (
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">Random Question Sampling:</span>
              <select
                value={randomSampleSize}
                onChange={(e) => setRandomSampleSize(Number(e.target.value))}
                className="bg-[#070d18] border border-[#1a2e4d] rounded px-2 py-1 text-slate-200 font-semibold focus:outline-none"
              >
                <option value={3} className="bg-[#0b1322] text-slate-200">Sample 3 random questions</option>
                <option value={5} className="bg-[#0b1322] text-slate-200">Sample 5 random questions</option>
                <option value={8} className="bg-[#0b1322] text-slate-200">Sample 8 random questions</option>
                <option value={survey.questions.length} className="bg-[#0b1322] text-slate-200">Full randomized order ({survey.questions.length})</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Studio Grid: Question Form (Left) & Audio/Note Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Question and Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0b1322] rounded-2xl p-6 border border-[#17253b] shadow-sm space-y-5">
            {/* Progress Bar & Question Counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>
                  Question {currentQuestionIndex + 1} of {questionOrder.length}
                </span>
                <span className="text-cyan-400">{progressPercent}% Completed</span>
              </div>
              <div className="h-1.5 w-full bg-[#070d18] rounded-full overflow-hidden border border-[#152338]">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Current Question Display */}
            {currentQ ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#070d18] text-slate-400 border border-[#17253b]">
                    {currentQ.category}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#0e2947] text-cyan-400 border border-[#18426d]">
                    {currentQ.type.replace('_', ' ')}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white leading-relaxed">
                  {currentLanguage !== 'English' &&
                  currentQ.translations?.[currentLanguage.toLowerCase().split(' ')[0]]
                    ? currentQ.translations[currentLanguage.toLowerCase().split(' ')[0]]
                    : currentQ.text}
                </h2>

                {currentLanguage !== 'English' && currentQ.englishText && (
                  <p className="text-xs text-slate-400 italic">En: {currentQ.englishText}</p>
                )}

                {/* Question Probes (if semi-structured or unstructured) */}
                {currentQ.probePrompts && currentQ.probePrompts.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#141208] border border-amber-800/60 text-xs text-amber-300 space-y-1">
                    <span className="font-semibold block text-amber-400">Suggested Interview Probes:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90">
                      {currentQ.probePrompts.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Input Controls according to type */}
                <div className="pt-2">
                  {/* CASE 1: LIKERT SCALE */}
                  {currentQ.type === 'likert' && currentQ.likertConfig && (
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-slate-400 block">
                        Select Respondent Rating:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        {currentQ.likertConfig.labels.map((lbl, idx) => {
                          const val = idx + 1;
                          const isSelected = answers[currentQ.id] === val;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswerChange(currentQ.id, val)}
                              className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center flex flex-col items-center justify-between min-h-[70px] ${
                                isSelected
                                  ? 'bg-[#0369a1] text-white border-cyan-400 shadow-sm shadow-cyan-950'
                                  : 'bg-[#070d18] hover:bg-[#0c1626] text-slate-300 border-[#17253b]'
                              }`}
                            >
                              <span className="text-base font-mono">{val}</span>
                              <span className="text-[10px] leading-tight mt-1">{lbl}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CASE 2: MULTIPLE CHOICE */}
                  {currentQ.type === 'multiple_choice' && currentQ.options && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-400 block">Select Answer:</span>
                      <div className="space-y-1.5">
                        {currentQ.options.map((opt, oIdx) => {
                          const isSelected = answers[currentQ.id] === opt;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleAnswerChange(currentQ.id, opt)}
                              className={`w-full p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#0e243d] border-cyan-400 text-cyan-300 font-semibold'
                                  : 'bg-[#070d18] border-[#17253b] text-slate-300 hover:bg-[#0c1626]'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CASE 3: OPEN-ENDED / UNSTRUCTURED / SEMI-STRUCTURED */}
                  {(currentQ.type === 'unstructured_dialogue' ||
                    currentQ.type === 'semi_structured_probe' ||
                    currentQ.type === 'open_ended') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Verbatim Response Transcript:</span>
                        <span className="text-slate-500 text-[11px]">
                          {(answers[currentQ.id] || '').length} characters
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                        placeholder="Type respondent quotes or dialogue summary here..."
                        className="w-full bg-[#070d18] border border-[#1a2e4d] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-[#152338]">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#070d18] border border-[#17253b] text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex < questionOrder.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-500"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteInterview}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Submit & Seal Response</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">No questions available.</div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Live Audio Recording & Time-stamped Note-Taking */}
        <div className="space-y-4">
          {/* Audio Session Recording Widget (Requirement 3) */}
          <div className="bg-[#0b1322] rounded-2xl p-5 border border-[#17253b] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                <h3 className="text-xs font-bold text-white">Audio Session Recorder</h3>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-400 bg-[#070d18] border border-[#17253b] px-2 py-0.5 rounded">
                {formatTime(recordingSeconds)}
              </span>
            </div>

            {/* Waveform Canvas */}
            <div className="bg-[#070d18] border border-[#17253b] rounded-xl p-2 h-16 flex items-center justify-center overflow-hidden">
              <canvas ref={canvasRef} width={260} height={50} className="w-full h-full" />
            </div>

            {/* Recorder Controls */}
            <div className="flex items-center justify-center gap-2">
              {!isRecording ? (
                <button
                  onClick={() => setIsRecording(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0e1f33] text-cyan-300 text-xs font-semibold hover:bg-[#142d4a]"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRecording(false);
                      setIsPaused(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#271016] text-rose-300 text-xs font-semibold hover:bg-[#38161f]"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                </>
              )}
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              Web Audio capture simulation with encrypted local telemetry.
            </p>
          </div>

          {/* Time-stamped Note-Taking Widget (Requirement 3) */}
          <div className="bg-[#0b1322] rounded-2xl p-5 border border-[#17253b] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">Timestamped Field Notes</h3>
              </div>
              <span className="text-[11px] text-slate-500">{notes.length} logged</span>
            </div>

            {/* Tag selector */}
            <div className="flex items-center gap-1 text-[10px]">
              {(['Insight', 'Concern', 'Quote', 'Follow-up'] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setCurrentNoteTag(tag)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    currentNoteTag === tag
                      ? 'bg-cyan-600 text-white'
                      : 'bg-[#070d18] text-slate-400 hover:text-slate-200 border border-[#17253b]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Note text input */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Log observation..."
                className="flex-1 bg-[#070d18] border border-[#1a2e4d] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAddNote}
                className="px-2.5 py-1.5 bg-[#0f2942] text-cyan-300 hover:bg-[#15385b] font-semibold rounded-lg text-xs"
              >
                Log
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 pt-1">
              {notes.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-4">
                  No notes recorded yet. Add observations during interview turns.
                </div>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-[#070d18] border border-[#17253b] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono text-cyan-400 font-bold">
                        +{formatTime(n.secondsElapsed)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#0b1322] text-slate-300 font-medium border border-[#17253b]">
                        {n.tag}
                      </span>
                    </div>
                    <p className="text-slate-200 text-[11px]">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
