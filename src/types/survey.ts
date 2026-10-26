/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InterviewType = 'structured' | 'semi-structured' | 'unstructured';

export type InterviewMode = 'individual' | 'group' | 'random';

export type QuestionType =
  | 'likert'
  | 'multiple_choice'
  | 'open_ended'
  | 'rating_scale'
  | 'semi_structured_probe'
  | 'unstructured_dialogue';

export type LikertScaleType =
  | 'agreement_5'
  | 'agreement_7'
  | 'satisfaction_5'
  | 'frequency_5'
  | 'importance_5'
  | 'custom';

export interface LikertConfig {
  type: LikertScaleType;
  points: number;
  labels: string[];
  anchors: {
    low: string;
    high: string;
  };
}

export interface SurveyQuestion {
  id: string;
  text: string;
  englishText?: string;
  translations?: Record<string, string>; // e.g. { tagalog: '...', cebuano: '...', ilocano: '...', hiligaynon: '...' }
  type: QuestionType;
  category: string;
  difficultyScore: number; // 1-100 cognitive load
  relevanceScore: number; // 1-100 alignment
  scoringRationale?: string;
  options?: string[]; // for multiple_choice
  likertConfig?: LikertConfig;
  probePrompts?: string[]; // For semi-structured or unstructured interviews
  required?: boolean;
}

export interface Survey {
  id: string;
  title: string;
  objective: string;
  interviewType: InterviewType;
  targetAudience: string;
  language: string;
  questions: SurveyQuestion[]; // Up to 50 questions
  createdAt: string;
  updatedAt: string;
}

export interface SessionNote {
  id: string;
  timestamp: string;
  secondsElapsed: number;
  author: string;
  content: string;
  tag?: 'Insight' | 'Concern' | 'Quote' | 'Follow-up';
}

export interface RespondentProfile {
  id: string;
  name: string;
  group: string; // e.g., 'University Students', 'Healthcare Frontliners', 'Barangay Leaders', 'MSME Entrepreneurs'
  gender?: string;
  ageRange?: string;
  location?: string;
  status: 'completed' | 'in_progress' | 'scheduled';
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  respondentName: string;
  respondentGroup: string;
  interviewType: InterviewType;
  interviewMode: InterviewMode;
  timestamp: string;
  answers: Record<string, any>; // questionId -> response value
  notes?: SessionNote[];
  audioRecording?: {
    durationSeconds: number;
    recordedAt: string;
    hasAudio: boolean;
  };
  sentiment?: {
    score: number; // -1 to 1
    label: 'positive' | 'neutral' | 'negative';
    tone: string[];
    keywords: { word: string; sentiment: 'positive' | 'neutral' | 'negative'; count: number }[];
    themes?: string[];
  };
  synced: boolean;
  encryptedHash: string;
}

export interface QuestionBankItem {
  id: string;
  text: string;
  category: string;
  interviewType: InterviewType;
  questionType: QuestionType;
  difficultyScore: number;
  relevanceScore: number;
  tags: string[];
  likertConfig?: LikertConfig;
  options?: string[];
  probePrompts?: string[];
}

export interface ReportConfig {
  template: 'summary' | 'detailed' | 'comparative';
  includeDemographics: boolean;
  includeCharts: boolean;
  includeSentiment: boolean;
  includeRawResponses: boolean;
  filterCohort?: string;
  dateRange?: 'all' | '7days' | '30days' | '90days';
}

export interface ScheduledReport {
  id: string;
  title: string;
  surveyId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string;
  format: 'PDF' | 'Excel' | 'Word';
  lastRun?: string;
  nextRun: string;
  enabled: boolean;
}

export type SupportedLanguage =
  | 'English'
  | 'Tagalog'
  | 'Cebuano (Bisaya)'
  | 'Ilocano'
  | 'Hiligaynon (Ilonggo)'
  | 'Bikol'
  | 'Waray'
  | 'Spanish'
  | 'Japanese';

export type ConflictStrategy = 'client_wins' | 'server_wins' | 'smart_merge';
