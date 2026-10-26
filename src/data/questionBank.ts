/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionBankItem } from '../types/survey';
import { LIKERT_TEMPLATES } from './likertTemplates';

export const QUESTION_BANK: QuestionBankItem[] = [
  // Demographics
  {
    id: 'qb-1',
    text: 'Which stakeholder or demographic group best represents your primary affiliation in this study?',
    category: 'Demographics & Profile',
    interviewType: 'structured',
    questionType: 'multiple_choice',
    difficultyScore: 20,
    relevanceScore: 95,
    tags: ['Demographics', 'Screening', 'Role'],
    options: [
      'Youth & Students',
      'Healthcare & Frontliners',
      'Barangay & Community Leaders',
      'MSME & Business Owners',
      'Academic Faculty & Researchers',
      'General Citizen',
    ],
  },
  {
    id: 'qb-2',
    text: 'How long have you resided or operated within your current community or organization?',
    category: 'Demographics & Profile',
    interviewType: 'structured',
    questionType: 'multiple_choice',
    difficultyScore: 15,
    relevanceScore: 88,
    tags: ['Demographics', 'Tenure', 'Location'],
    options: ['Less than 1 year', '1 to 3 years', '3 to 5 years', '5 to 10 years', 'More than 10 years'],
  },

  // Likert Scale - Service & Satisfaction
  {
    id: 'qb-3',
    text: 'How satisfied are you with the overall accessibility and responsiveness of public assistance programs in your area?',
    category: 'Public Service & Governance',
    interviewType: 'structured',
    questionType: 'likert',
    difficultyScore: 30,
    relevanceScore: 92,
    tags: ['Satisfaction', 'Governance', 'Likert-5'],
    likertConfig: LIKERT_TEMPLATES.satisfaction_5,
  },
  {
    id: 'qb-4',
    text: 'The communication guidelines and procedures provided by management are clear, timely, and actionable.',
    category: 'Workplace & Operations',
    interviewType: 'structured',
    questionType: 'likert',
    difficultyScore: 25,
    relevanceScore: 90,
    tags: ['Agreement', 'Communication', 'Likert-5'],
    likertConfig: LIKERT_TEMPLATES.agreement_5,
  },
  {
    id: 'qb-5',
    text: 'How frequently do you utilize digital or mobile platforms to conduct official community or government transactions?',
    category: 'Digital Adoption & Access',
    interviewType: 'structured',
    questionType: 'likert',
    difficultyScore: 22,
    relevanceScore: 86,
    tags: ['Frequency', 'Digital Transformation', 'Likert-5'],
    likertConfig: LIKERT_TEMPLATES.frequency_5,
  },
  {
    id: 'qb-6',
    text: 'To what extent do you agree that community-level emergency and disaster preparedness protocols are effective?',
    category: 'Public Service & Governance',
    interviewType: 'structured',
    questionType: 'likert',
    difficultyScore: 38,
    relevanceScore: 94,
    tags: ['Safety', 'Governance', 'Likert-7'],
    likertConfig: LIKERT_TEMPLATES.agreement_7,
  },

  // Semi-Structured Interview
  {
    id: 'qb-7',
    text: 'Describe your experience transitioning to hybrid or digital workflows over the past 12 months. What specific bottlenecks did you encounter?',
    category: 'Workplace & Operations',
    interviewType: 'semi-structured',
    questionType: 'semi_structured_probe',
    difficultyScore: 55,
    relevanceScore: 93,
    tags: ['Workflow', 'Technology', 'Semi-Structured'],
    probePrompts: [
      'Can you give a concrete example of a time when connectivity or equipment failed?',
      'How did your team or supervisors assist you during that incident?',
      'What one tool or adjustment made the biggest positive difference?',
    ],
  },
  {
    id: 'qb-8',
    text: 'In your observation, how effectively are local healthcare resources distributed among vulnerable households in your barangay?',
    category: 'Community Health & Governance',
    interviewType: 'semi-structured',
    questionType: 'semi_structured_probe',
    difficultyScore: 60,
    relevanceScore: 96,
    tags: ['Healthcare', 'Equity', 'Community'],
    probePrompts: [
      'What criteria do local officials use to determine priority recipients?',
      'Have you witnessed families who were overlooked, and why?',
      'If you were advising the local health board, what would you change first?',
    ],
  },
  {
    id: 'qb-9',
    text: 'What major financial pressures currently affect your business or household livelihood, and how are you coping?',
    category: 'Economic & Livelihood',
    interviewType: 'semi-structured',
    questionType: 'semi_structured_probe',
    difficultyScore: 50,
    relevanceScore: 91,
    tags: ['Economic', 'MSME', 'Resilience'],
    probePrompts: [
      'Have rising supply costs forced changes in your pricing or inventory?',
      'Have you accessed any formal credit, microfinance, or community loan pools?',
      'What are your expectations for the next six months?',
    ],
  },

  // Unstructured Interview
  {
    id: 'qb-10',
    text: 'Reflecting on your journey as a community advocate or leader, share a formative moment that reshaped how you view public trust and collaboration.',
    category: 'Leadership & Social Impact',
    interviewType: 'unstructured',
    questionType: 'unstructured_dialogue',
    difficultyScore: 70,
    relevanceScore: 89,
    tags: ['Qualitative', 'Narrative', 'Unstructured'],
    probePrompts: [
      'Allow the respondent to share uninterrupted for 3-5 minutes.',
      'Listen for recurring metaphors, emotional shifts, and institutional references.',
      'Gently ask: "How did that experience influence the choices you make today?"',
    ],
  },
  {
    id: 'qb-11',
    text: 'Tell me openly about the unspoken challenges students and young workers face in balancing family responsibilities with modern career ambitions.',
    category: 'Youth & Social Dynamics',
    interviewType: 'unstructured',
    questionType: 'unstructured_dialogue',
    difficultyScore: 65,
    relevanceScore: 92,
    tags: ['Youth', 'Culture', 'Unstructured'],
    probePrompts: [
      'Notice any expressions of burnout, cultural obligations (e.g. utang na loob), or career pressures.',
      'Explore: "Where do you turn for emotional or mentorship support when things get tough?"',
    ],
  },
  {
    id: 'qb-12',
    text: 'What is your vision for your community over the next decade, and what fears or hopes keep you invested in that outcome?',
    category: 'Community & Future Outlook',
    interviewType: 'unstructured',
    questionType: 'unstructured_dialogue',
    difficultyScore: 62,
    relevanceScore: 90,
    tags: ['Vision', 'Community', 'Qualitative'],
    probePrompts: [
      'Encourage rich sensory details (what does it look like, sound like, feel like?).',
      'Follow up on what role the next generation will play.',
    ],
  },
];
