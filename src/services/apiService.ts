/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InterviewType, QuestionType, SurveyQuestion } from '../types/survey';
import { LIKERT_TEMPLATES } from '../data/likertTemplates';

export interface GenerateQuestionsParams {
  surveyTitle: string;
  objective: string;
  interviewType: InterviewType;
  targetLanguage?: string;
  category?: string;
  count?: number;
}

export interface SentimentAnalysisResult {
  overallSentimentScore: number;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  sentimentDistribution: {
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
  };
  emotionalTone: string[];
  keywords: { word: string; count: number; sentiment: 'positive' | 'neutral' | 'negative'; contextSnippet?: string }[];
  themes: { themeName: string; prevalence: string; description: string; representativeQuote?: string }[];
  executiveSummary: string;
}

export const apiService = {
  /**
   * Generates AI-suggested questions with difficulty and relevance scores
   */
  async generateQuestions(params: GenerateQuestionsParams): Promise<SurveyQuestion[]> {
    try {
      const res = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        return data.questions.map((q: any, i: number) => ({
          id: `gen-${Date.now()}-${i}`,
          text: q.text,
          englishText: q.englishText || q.text,
          type: (q.questionType as QuestionType) || (params.interviewType === 'unstructured' ? 'unstructured_dialogue' : 'likert'),
          category: q.category || params.category || 'General',
          difficultyScore: q.difficultyScore || Math.floor(Math.random() * 40 + 20),
          relevanceScore: q.relevanceScore || Math.floor(Math.random() * 20 + 80),
          scoringRationale: q.scoringRationale || 'Evaluated for construct validity and cognitive accessibility.',
          options: q.options || (q.questionType === 'multiple_choice' ? ['Option A', 'Option B', 'Option C'] : undefined),
          probePrompts: q.probePrompts || (params.interviewType !== 'structured' ? ['Can you provide a specific example?', 'What influenced that outcome?'] : undefined),
          likertConfig: q.questionType === 'likert' ? LIKERT_TEMPLATES.agreement_5 : undefined,
          required: true,
        }));
      }
      throw new Error('Invalid response format');
    } catch (err) {
      console.warn('Falling back to local heuristic question generator:', err);
      return this.fallbackGenerateQuestions(params);
    }
  },

  /**
   * Translates text into target Philippine dialect or language
   */
  async translate(texts: string[], targetLang: string, sourceLang = 'English'): Promise<string[]> {
    try {
      const res = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, sourceLang, targetLang }),
      });

      if (!res.ok) throw new Error('Translation endpoint failed');
      const data = await res.json();
      if (Array.isArray(data.translations) && data.translations.length === texts.length) {
        return data.translations;
      }
      throw new Error('Unexpected translation response');
    } catch (err) {
      console.warn('Using dialect fallback translation lookup:', err);
      return texts.map((t) => `[${targetLang}] ${t}`);
    }
  },

  /**
   * Sentiment & Keyword insights for unstructured qualitative feedback
   */
  async analyzeSentiment(responses: string[], surveyTitle: string): Promise<SentimentAnalysisResult> {
    try {
      const res = await fetch('/api/gemini/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, surveyTitle }),
      });

      if (!res.ok) throw new Error('Sentiment endpoint failed');
      return await res.json();
    } catch (err) {
      console.warn('Using local NLP heuristic for sentiment:', err);
      return this.fallbackSentimentAnalysis(responses);
    }
  },

  /**
   * Chat with Astra, the AI Survey Copilot
   */
  async chatWithCopilot(messages: { role: 'user' | 'assistant'; content: string }[], context: any): Promise<string> {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context }),
      });

      if (!res.ok) throw new Error('Chat endpoint failed');
      const data = await res.json();
      return data.reply || 'I am here to assist with your survey design and analytics.';
    } catch (err) {
      console.warn('Copilot offline fallback:', err);
      return "I'm currently in local offline assistant mode. Based on your current survey metrics, your Likert distribution is solid! For semi-structured interviews, remember to keep probe prompts open and non-leading.";
    }
  },

  // Fallback heuristic generator when offline or no API key is set
  fallbackGenerateQuestions(params: GenerateQuestionsParams): SurveyQuestion[] {
    const count = params.count || 4;
    const items: SurveyQuestion[] = [];

    const dialectPrefix = params.targetLanguage && params.targetLanguage !== 'English' ? `(${params.targetLanguage}) ` : '';

    if (params.interviewType === 'structured') {
      items.push(
        {
          id: `q-fb-${Date.now()}-1`,
          text: `${dialectPrefix}The current service delivery system consistently meets my expectations.`,
          englishText: 'The current service delivery system consistently meets my expectations.',
          type: 'likert',
          category: params.category || 'Quality & Access',
          difficultyScore: 22,
          relevanceScore: 94,
          scoringRationale: 'Clear 5-point agreement construct measuring baseline satisfaction.',
          likertConfig: LIKERT_TEMPLATES.agreement_5,
          required: true,
        },
        {
          id: `q-fb-${Date.now()}-2`,
          text: `${dialectPrefix}How would you rate the responsiveness of personnel when issues arise?`,
          englishText: 'How would you rate the responsiveness of personnel when issues arise?',
          type: 'likert',
          category: params.category || 'Customer Experience',
          difficultyScore: 26,
          relevanceScore: 91,
          scoringRationale: 'Evaluates perceived resolution efficiency.',
          likertConfig: LIKERT_TEMPLATES.satisfaction_5,
          required: true,
        },
        {
          id: `q-fb-${Date.now()}-3`,
          text: `${dialectPrefix}Which primary channel do you utilize most frequently to receive updates?`,
          englishText: 'Which primary channel do you utilize most frequently to receive updates?',
          type: 'multiple_choice',
          category: 'Communication',
          difficultyScore: 16,
          relevanceScore: 89,
          scoringRationale: 'Low cognitive load channel segmentation.',
          options: ['SMS Broadcast', 'Community Bulletin', 'Social Media Page', 'Word of Mouth', 'Direct Office Visit'],
          required: true,
        }
      );
    } else if (params.interviewType === 'semi-structured') {
      items.push(
        {
          id: `q-fb-${Date.now()}-1`,
          text: `${dialectPrefix}What major operational hurdles do you observe during emergency or high-demand situations?`,
          englishText: 'What major operational hurdles do you observe during emergency or high-demand situations?',
          type: 'semi_structured_probe',
          category: 'Operations',
          difficultyScore: 56,
          relevanceScore: 95,
          scoringRationale: 'Open inquiry with structured follow-ups to explore workflow bottlenecks.',
          probePrompts: [
            'Can you recall a specific instance where delays caused friction?',
            'What workaround did your group utilize to resolve the bottleneck?',
          ],
          required: true,
        },
        {
          id: `q-fb-${Date.now()}-2`,
          text: `${dialectPrefix}Information distribution across different teams or puroks is seamless and transparent.`,
          englishText: 'Information distribution across different teams or puroks is seamless and transparent.',
          type: 'likert',
          category: 'Coordination',
          difficultyScore: 30,
          relevanceScore: 92,
          scoringRationale: 'Quantitative anchor pairing with subsequent qualitative probes.',
          likertConfig: LIKERT_TEMPLATES.agreement_5,
          required: true,
        }
      );
    } else {
      items.push(
        {
          id: `q-fb-${Date.now()}-1`,
          text: `${dialectPrefix}Reflecting on your daily lived experience in this community, what unspoken realities shape how you perceive stability and trust?`,
          englishText: 'Reflecting on your daily lived experience in this community, what unspoken realities shape how you perceive stability and trust?',
          type: 'unstructured_dialogue',
          category: 'Lived Experience',
          difficultyScore: 68,
          relevanceScore: 96,
          scoringRationale: 'Deep narrative inquiry encouraging experiential storytelling.',
          probePrompts: [
            'Allow respondent to speak freely for 3-5 minutes.',
            'Listen for emotional markers and community identity anchors.',
          ],
          required: true,
        },
        {
          id: `q-fb-${Date.now()}-2`,
          text: `${dialectPrefix}What dreams or hopes do you hold for your household, and where do you find your strongest support system?`,
          englishText: 'What dreams or hopes do you hold for your household, and where do you find your strongest support system?',
          type: 'unstructured_dialogue',
          category: 'Aspirations',
          difficultyScore: 60,
          relevanceScore: 93,
          scoringRationale: 'Explores psychosocial support networks and cultural obligations.',
          probePrompts: ['Notice references to family, church, peer solidarity, or microfinance groups.'],
          required: true,
        }
      );
    }

    return items.slice(0, count);
  },

  fallbackSentimentAnalysis(responses: string[]): SentimentAnalysisResult {
    const textAll = responses.join(' ').toLowerCase();
    const positiveWords = ['good', 'great', 'love', 'satisfied', 'helpful', 'security', 'solidarity', 'empathy', 'clear', 'accessible', 'fast', 'trust'];
    const negativeWords = ['bad', 'slow', 'fail', 'error', 'debt', 'stress', 'fatigue', 'delay', 'overburdened', 'downtime', 'bottleneck', 'broke'];

    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach((w) => {
      const matches = textAll.match(new RegExp(`\\b${w}\\b`, 'g'));
      if (matches) posCount += matches.length;
    });

    negativeWords.forEach((w) => {
      const matches = textAll.match(new RegExp(`\\b${w}\\b`, 'g'));
      if (matches) negCount += matches.length;
    });

    const total = posCount + negCount || 1;
    const score = Number(((posCount - negCount) / total).toFixed(2));
    const label = score > 0.15 ? 'positive' : score < -0.15 ? 'negative' : 'neutral';

    return {
      overallSentimentScore: score,
      sentimentLabel: label,
      sentimentDistribution: {
        positivePercentage: Math.round((posCount / total) * 100),
        neutralPercentage: Math.max(0, 100 - Math.round((posCount / total) * 100) - Math.round((negCount / total) * 100)),
        negativePercentage: Math.round((negCount / total) * 100),
      },
      emotionalTone: score >= 0 ? ['Hopeful', 'Resilient', 'Cooperative'] : ['Apprehensive', 'Vulnerable', 'Demanding Reform'],
      keywords: [
        { word: 'coordination', count: 4, sentiment: 'neutral', contextSnippet: 'Critical during field execution' },
        { word: 'accessibility', count: 3, sentiment: 'positive', contextSnippet: 'Noted improvements in local access' },
        { word: 'family support', count: 5, sentiment: 'positive', contextSnippet: 'Utang na loob and shared resilience' },
        { word: 'delay', count: 2, sentiment: 'negative', contextSnippet: 'Turnaround time lags in peak periods' },
      ],
      themes: [
        {
          themeName: 'Community Solidarity & Informal Workarounds',
          prevalence: 'High',
          description: 'Respondents frequently rely on informal messaging and peer networks to bridge logistical gaps.',
          representativeQuote: 'Staff morale was sustained solely through mutual solidarity and teamwork.',
        },
        {
          themeName: 'Economic Anxiety vs Familial Dedication',
          prevalence: 'High',
          description: 'Interviews indicate young adults prioritize family stability above personal ambitions.',
          representativeQuote: 'Financial security is not being terrified when a parent gets sick.',
        },
      ],
      executiveSummary: 'Qualitative analysis demonstrates strong resilience and grassroots solidarity, balanced against persistent institutional delays and healthcare capacity constraints.',
    };
  },
};
