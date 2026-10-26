import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize shared Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Question Generation with Difficulty & Relevance Scoring
app.post('/api/gemini/generate-questions', async (req, res) => {
  try {
    const {
      surveyTitle = 'Community & User Survey',
      objective = 'Gather comprehensive feedback and insights',
      interviewType = 'structured', // 'structured' | 'semi-structured' | 'unstructured'
      targetLanguage = 'English',
      category = 'General Feedback',
      count = 5,
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Please check GEMINI_API_KEY.',
      });
    }

    const systemPrompt = `You are an expert psychometrician and survey researcher specializing in questionnaire design across three interview paradigms:
1. Structured Interview: Clear, closed-ended, multiple choice, or Likert scale questions with well-defined response boundaries.
2. Semi-Structured Interview: A solid core inquiry followed by customizable conversational probing prompts ("Can you elaborate on...", "Why do you feel...").
3. Unstructured Interview: Deep, open-ended thematic dialogue starters and narrative invitations allowing rich organic qualitative exploration.

Generate ${count} exceptional survey questions specifically for the interview type "${interviewType}", with target language "${targetLanguage}".
Ensure cultural nuance, tone appropriateness (e.g., if Tagalog/Filipino or Philippine dialects like Cebuano/Ilocano/Hiligaynon, use respectful, conversational phrasing).
For each question, compute:
- difficultyScore: 1 to 100 (cognitive load, comprehension level)
- relevanceScore: 1 to 100 (alignment with the objective)
- scoringRationale: brief 1-sentence justification.
- questionType: 'likert' | 'multiple_choice' | 'open_ended' | 'rating_scale' | 'semi_structured_probe' | 'unstructured_dialogue'`;

    const userPrompt = `Survey Title: "${surveyTitle}"
Research Objective: "${objective}"
Interview Type: "${interviewType}"
Category: "${category}"
Language: "${targetLanguage}"
Count: ${count} questions.

Return a JSON array of questions matching this schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: 'Question text in target language' },
              englishText: { type: Type.STRING, description: 'English translation or equivalent' },
              questionType: { type: Type.STRING, description: 'likert, multiple_choice, open_ended, semi_structured_probe, or unstructured_dialogue' },
              category: { type: Type.STRING, description: 'Domain category' },
              difficultyScore: { type: Type.INTEGER, description: '1-100 cognitive load score' },
              relevanceScore: { type: Type.INTEGER, description: '1-100 relevance score' },
              scoringRationale: { type: Type.STRING, description: 'Why this question received these scores' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Pre-defined response options if multiple_choice or likert'
              },
              probePrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Suggested conversational probes for semi-structured or unstructured depth'
              },
              likertScaleType: {
                type: Type.STRING,
                description: 'agreement_5, agreement_7, satisfaction_5, frequency_5, importance_5 if likert'
              }
            },
            required: ['text', 'englishText', 'questionType', 'category', 'difficultyScore', 'relevanceScore', 'scoringRationale']
          }
        }
      }
    });

    const jsonText = response.text?.trim() || '[]';
    const questions = JSON.parse(jsonText);
    res.json({ questions });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: error.message || 'Failed to generate questions' });
  }
});

// 2. Multilingual Context-Aware Translation
app.post('/api/gemini/translate', async (req, res) => {
  try {
    const {
      texts = [],
      sourceLang = 'English',
      targetLang = 'Tagalog',
      context = 'Survey questionnaire for field respondents',
    } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not available' });
    }

    const systemPrompt = `You are a professional linguist and translator specializing in Southeast Asian and Philippine languages (Tagalog/Filipino, Cebuano/Bisaya, Ilocano, Hiligaynon/Ilonggo, Waray, Bikol, Kapampangan, Pangasinan) as well as global languages (Spanish, Japanese, Chinese, French, German).
Preserve natural conversational flow, respectfulness (e.g. appropriate honorifics like po/opo in Tagalog when suitable), clarity, and survey measurement accuracy. Avoid overly archaic or robotic machine translations.`;

    const userPrompt = `Translate the following ${texts.length} survey items from ${sourceLang} to ${targetLang}.
Context: ${context}.

Items to translate:
${JSON.stringify(texts, null, 2)}

Return a JSON array of strings containing the translated texts in exact order.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const translations = JSON.parse(response.text?.trim() || '[]');
    res.json({ translations });
  } catch (error: any) {
    console.error('Error translating texts:', error);
    res.status(500).json({ error: error.message || 'Translation failed' });
  }
});

// 3. Sentiment Analysis and Keyword Insights for Unstructured Responses
app.post('/api/gemini/sentiment', async (req, res) => {
  try {
    const { responses = [], surveyTitle = 'Survey' } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not available' });
    }

    const systemPrompt = `You are an expert qualitative researcher and NLP sentiment analyst.
Analyze the provided unstructured qualitative responses.
1. Provide overall sentiment score between -1.0 (strongly negative) and +1.0 (strongly positive).
2. Sentiment label: 'positive', 'neutral', or 'negative'.
3. Key emotional tags/moods detected.
4. Top keywords with frequency, sentiment alignment ('positive' | 'neutral' | 'negative'), and context.
5. Key themes and actionable executive takeaways.`;

    const userPrompt = `Survey: "${surveyTitle}"
Respondent feedback items:
${JSON.stringify(responses, null, 2)}

Provide structured JSON analysis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSentimentScore: { type: Type.NUMBER, description: '-1.0 to 1.0' },
            sentimentLabel: { type: Type.STRING, description: 'positive, neutral, negative' },
            sentimentDistribution: {
              type: Type.OBJECT,
              properties: {
                positivePercentage: { type: Type.NUMBER },
                neutralPercentage: { type: Type.NUMBER },
                negativePercentage: { type: Type.NUMBER }
              },
              required: ['positivePercentage', 'neutralPercentage', 'negativePercentage']
            },
            emotionalTone: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'e.g. Optimistic, Critical, Anxious, Satisfied'
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  sentiment: { type: Type.STRING, description: 'positive, neutral, negative' },
                  contextSnippet: { type: Type.STRING }
                },
                required: ['word', 'count', 'sentiment']
              }
            },
            themes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  themeName: { type: Type.STRING },
                  prevalence: { type: Type.STRING, description: 'High, Moderate, Low' },
                  description: { type: Type.STRING },
                  representativeQuote: { type: Type.STRING }
                },
                required: ['themeName', 'prevalence', 'description']
              }
            },
            executiveSummary: { type: Type.STRING }
          },
          required: ['overallSentimentScore', 'sentimentLabel', 'sentimentDistribution', 'keywords', 'themes', 'executiveSummary']
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: error.message || 'Sentiment analysis failed' });
  }
});

// 4. Survey Copilot Chatbot
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages = [], context = {} } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not available' });
    }

    const systemPrompt = `You are "Astra", an intelligent AI Survey Research Copilot built into the AI Survey Instrument.
You assist survey designers, researchers, and field interviewers with:
- Optimizing question clarity, reducing leading questions, and minimizing bias.
- Recommending the best interview type (Structured vs Semi-Structured vs Unstructured) for their study.
- Interpreting live analytics, Likert distributions, response anomalies, and respondent group comparisons.
- Suggesting statistical sample sizes, target demographics, and Philippine dialect localizations (Tagalog, Cebuano, Ilocano, etc.).
- Providing constructive, concise, insightful answers with clear headings and bullet points.
Tone: Knowledgeable, friendly, concise, clean minimalist aesthetic.

Current System Context:
- Active Survey: "${context.activeSurveyTitle || 'General Survey'}"
- Current Interview Type: "${context.interviewType || 'Structured'}"
- Total Questions: ${context.questionCount || 0}
- Total Responses Collected: ${context.responseCount || 0}
- Current Language: "${context.language || 'English'}"`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message || 'Chatbot request failed' });
  }
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
