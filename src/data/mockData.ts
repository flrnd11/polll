/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Survey, SurveyResponse, RespondentProfile } from '../types/survey';
import { LIKERT_TEMPLATES } from './likertTemplates';

export const INITIAL_SURVEYS: Survey[] = [
  {
    id: 'survey-structured-1',
    title: 'Community Digital Services & Governance Survey 2026',
    objective: 'Evaluate public adoption, satisfaction, and accessibility of digital barangay and municipal services.',
    interviewType: 'structured',
    targetAudience: 'Community Residents & MSME Operators',
    language: 'English',
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-25T14:30:00Z',
    questions: [
      {
        id: 'q-s1',
        text: 'Which stakeholder category best represents your primary status in this community?',
        englishText: 'Which stakeholder category best represents your primary status in this community?',
        translations: {
          tagalog: 'Aling kategorya ng stakeholder ang pinakamainam na kumakatawan sa iyong katayuan sa komunidad na ito?',
          cebuano: 'Hain nga kategorya sa stakeholder ang labing maayo nga nagrepresentar sa imong kahimtang dinhi sa komunidad?',
          ilocano: 'Ania a kategoria ti stakeholder ti kasayaatan a mangibagi iti kasasaadmo iti daytoy a komunidad?',
          hiligaynon: 'Diin nga kategorya sang stakeholder ang pinakamaayo nga nagarepresentar sang imo kahimtangan sa komunidad?',
        },
        type: 'multiple_choice',
        category: 'Demographics',
        difficultyScore: 18,
        relevanceScore: 95,
        scoringRationale: 'Straightforward demographic categorization with low cognitive burden.',
        options: [
          'Youth & University Students',
          'Barangay & Community Leaders',
          'Healthcare & Frontline Workers',
          'MSME & Small Business Owners',
          'Private Sector Employees',
          'Senior Citizens & Retirees',
        ],
        required: true,
      },
      {
        id: 'q-s2',
        text: 'The municipal digital portal is easy to navigate and complete official document requests.',
        englishText: 'The municipal digital portal is easy to navigate and complete official document requests.',
        translations: {
          tagalog: 'Ang digital portal ng munisipyo ay madaling gamitin at tapusin ang mga kahilingan sa opisyal na dokumento.',
          cebuano: 'Ang digital portal sa munisipyo sayon gamiton ug dali tapuson ang mga hangyo sa opisyal nga dokumento.',
          ilocano: 'Nalaka nga usaren ken pagpatinggaan dagiti dawat iti opisial a dokumento iti digital portal ti munisipio.',
          hiligaynon: 'Ang digital portal sang munisipyo mahapos gamiton kag tapuson ang mga pormal nga dokumento.',
        },
        type: 'likert',
        category: 'Usability & Access',
        difficultyScore: 24,
        relevanceScore: 94,
        scoringRationale: 'Core usability metric using standard 5-point agreement scale.',
        likertConfig: LIKERT_TEMPLATES.agreement_5,
        required: true,
      },
      {
        id: 'q-s3',
        text: 'How satisfied are you with the processing speed of government clearances and certificate issuance?',
        englishText: 'How satisfied are you with the processing speed of government clearances and certificate issuance?',
        translations: {
          tagalog: 'Gaano ka nasisiyahan sa bilis ng pagproseso ng mga clearance at sertipiko ng pamahalaan?',
          cebuano: 'Unsa ka matagbawon sa kapaspas sa pagproseso sa mga clearance ug sertipiko sa gobyerno?',
          ilocano: 'Kasano ti pannakapnekmo iti kapartak ti panangproseso kadagiti clearance ken sertipiko ti gobierno?',
          hiligaynon: 'Daw ano ka kontento sa kadasigon sang pagproseso sang mga clearance kag sertipiko sang gobyerno?',
        },
        type: 'likert',
        category: 'Service Quality',
        difficultyScore: 28,
        relevanceScore: 92,
        scoringRationale: 'Standard 5-point CSAT measure for municipal turnaround time.',
        likertConfig: LIKERT_TEMPLATES.satisfaction_5,
        required: true,
      },
      {
        id: 'q-s4',
        text: 'How frequently do you encounter system downtime, payment gateway errors, or slow loading on local public sites?',
        englishText: 'How frequently do you encounter system downtime, payment gateway errors, or slow loading on local public sites?',
        translations: {
          tagalog: 'Gaano kadalas kang nakakaranas ng downtime sa sistema, error sa pagbabayad, o mabagal na loading sa mga pampublikong website?',
          cebuano: 'Unsa ka subsob nga makasugat ka og downtime sa sistema, error sa bayad, o hinay nga loading sa mga pampublikong site?',
          ilocano: 'Kasano kasansan a makapasarko iti panagsardeng ti sistema, kamali iti panagbayad, wenno nabannayat a panag-load kadagiti pampubliko a website?',
          hiligaynon: 'Daw ano kasunson ikaw nagaatubang sang downtime sa sistema, sala sa bayad, ukon mahinay nga loading sa pampubliko nga mga site?',
        },
        type: 'likert',
        category: 'Technical Reliability',
        difficultyScore: 32,
        relevanceScore: 89,
        scoringRationale: 'Assesses perceived service reliability and disruption frequency.',
        likertConfig: LIKERT_TEMPLATES.frequency_5,
        required: true,
      },
      {
        id: 'q-s5',
        text: 'Data privacy and the security of my submitted personal identity records are strictly protected.',
        englishText: 'Data privacy and the security of my submitted personal identity records are strictly protected.',
        translations: {
          tagalog: 'Ang privacy ng datos at seguridad ng aking mga isinumiteng personal na rekord ng pagkakakilanlan ay mahigpit na pinoprotektahan.',
          cebuano: 'Ang privacy sa datos ug kasegurohan sa akong personal nga rekord sa pagkatawo hugot nga gipanalipdan.',
          ilocano: 'Nairut a maprotektaran ti kinapribado ti datos ken kinatalged dagiti impasdekko a personal a rekord ti kinasiasino.',
          hiligaynon: 'Hugot nga ginaprotektahan ang privacy sang datos kag seguridad sang akon mga personal nga rekord.',
        },
        type: 'likert',
        category: 'Trust & Privacy',
        difficultyScore: 40,
        relevanceScore: 96,
        scoringRationale: 'Evaluates public trust and compliance with Data Privacy standards.',
        likertConfig: LIKERT_TEMPLATES.agreement_7,
        required: true,
      },
      {
        id: 'q-s6',
        text: 'How important is it for the local government to introduce an SMS or offline hotline alternative for residents without stable internet?',
        englishText: 'How important is it for the local government to introduce an SMS or offline hotline alternative for residents without stable internet?',
        translations: {
          tagalog: 'Gaano kahalaga para sa lokal na pamahalaan na magpakilala ng alternatibong SMS o offline hotline para sa mga residenteng walang maayos na internet?',
          cebuano: 'Unsa ka importante alang sa lokal nga kagamhanan ang pagpaila og SMS o offline hotline nga alternatibo alang sa mga residente nga walay lig-on nga internet?',
          ilocano: 'Kasano kapateg para iti lokal a gobierno ti mangipakaammo iti alternatibo nga SMS wenno offline hotline para kadagiti agtataeng nga awanan iti natalged nga internet?',
          hiligaynon: 'Daw ano ka importante para sa lokal nga pangulohan ang pagpatuman sang SMS ukon offline hotline nga alternatibo para sa mga pumuluyo nga wala sang mabaskog nga internet?',
        },
        type: 'likert',
        category: 'Inclusivity',
        difficultyScore: 25,
        relevanceScore: 91,
        scoringRationale: 'Identifies demand for multi-channel communication infrastructure.',
        likertConfig: LIKERT_TEMPLATES.importance_5,
        required: true,
      },
    ],
  },
  {
    id: 'survey-semi-1',
    title: 'Healthcare Frontline Workflow & Resilience Study',
    objective: 'Investigate clinical resource allocations, triage pressure points, and inter-agency coordination through guided probes.',
    interviewType: 'semi-structured',
    targetAudience: 'Community Health Workers, Nurses & Barangay Nutrition Scholars',
    language: 'English',
    createdAt: '2026-10-18T09:15:00Z',
    updatedAt: '2026-10-24T16:00:00Z',
    questions: [
      {
        id: 'q-semi-1',
        text: 'How would you characterize the coordination between primary health units (Barangay Health Centers) and tertiary hospital referral networks during peak health alerts?',
        englishText: 'How would you characterize the coordination between primary health units and tertiary hospital referral networks during peak health alerts?',
        translations: {
          tagalog: 'Paano mo ilalarawan ang koordinasyon sa pagitan ng mga Barangay Health Center at mga panrehiyong ospital kapag may mga alerto sa kalusugan?',
          cebuano: 'Unsaon nimo paghulagway ang koordinasyon tali sa Barangay Health Centers ug mga ospital sa panahon sa mga alerto sa panglawas?',
          ilocano: 'Kasanom a mayladawan ti koordinasion ti Barangay Health Centers ken dagiti ospital bayat ti panawen ti krisis ti salun-at?',
          hiligaynon: 'Paano mo ilaragway ang koordinasyon sa tunga sang Barangay Health Centers kag mga ospital sa ti-on sang emerhensya sa ikaayong lawas?',
        },
        type: 'semi_structured_probe',
        category: 'Inter-Agency Coordination',
        difficultyScore: 58,
        relevanceScore: 97,
        scoringRationale: 'Prompts critical qualitative assessment followed by guided follow-up probes.',
        probePrompts: [
          'What happens when communication channels or ambulance dispatch lag?',
          'How do you personally manage anxious family members during delays?',
          'What single protocol revision would save the most critical minutes?',
        ],
        required: true,
      },
      {
        id: 'q-semi-2',
        text: 'Medical inventory tracking and essential medicine replenishment in our facility are consistent and timely.',
        englishText: 'Medical inventory tracking and essential medicine replenishment in our facility are consistent and timely.',
        translations: {
          tagalog: 'Ang pagsubaybay sa imbentaryo ng gamot at pagdaragdag ng mga pangunahing gamot sa aming pasilidad ay pare-pareho at nasa oras.',
          cebuano: 'Ang pag-ihap sa imbentaryo sa tambal ug pagpuno sa gikinahanglang tambal sa among pasilidad kanunay ug tukma sa panahon.',
        },
        type: 'likert',
        category: 'Resource Logistics',
        difficultyScore: 35,
        relevanceScore: 92,
        scoringRationale: 'Quantitative baseline anchor to contrast with qualitative supply chain narratives.',
        likertConfig: LIKERT_TEMPLATES.agreement_5,
        required: true,
      },
      {
        id: 'q-semi-3',
        text: 'Walk me through a recent instance where your shift was severely strained by staff shortages or patient overcapacity. How did the team adapt?',
        englishText: 'Walk me through a recent instance where your shift was severely strained by staff shortages or patient overcapacity. How did the team adapt?',
        translations: {
          tagalog: 'Ibahagi ang isang kamakailang pagkakataon kung saan nahirapan ang iyong shift dahil sa kakulangan ng tauhan o dami ng pasyente. Paano kayo nakibagay?',
          cebuano: 'Iasoy ang bag-ong hitabo diin naglisod ang inyong shift tungod sa kakuwang sa kawani o kadaghan sa pasyente. Giunsa ninyo pag-atubang?',
        },
        type: 'semi_structured_probe',
        category: 'Staff Resilience & Well-being',
        difficultyScore: 62,
        relevanceScore: 98,
        scoringRationale: 'Narrative probe capturing human factors, coping mechanisms, and unspoken protocols.',
        probePrompts: [
          'Did any staff members step outside their defined role to cover gaps?',
          'What emotional aftermath or fatigue did staff experience after that shift?',
        ],
        required: true,
      },
    ],
  },
  {
    id: 'survey-unstructured-1',
    title: 'Youth Aspirations, Economic Pressures & Social Trust in 2026',
    objective: 'Explore lived experiences, cultural obligations, and emergent perceptions of economic mobility among Gen Z respondents.',
    interviewType: 'unstructured',
    targetAudience: 'Young Adults (18-29) in Urban & Rural Regions',
    language: 'English',
    createdAt: '2026-10-20T11:00:00Z',
    updatedAt: '2026-10-25T18:00:00Z',
    questions: [
      {
        id: 'q-un-1',
        text: 'When you envision your life five years from today, what does genuine financial security look like for you, and what hidden barriers make you feel that path is uncertain?',
        englishText: 'When you envision your life five years from today, what does genuine financial security look like for you, and what hidden barriers make you feel that path is uncertain?',
        translations: {
          tagalog: 'Kapag naiisip mo ang iyong buhay limang taon mula ngayon, ano ang hitsura ng tunay na kapanatagan sa pananalapi para sa iyo, at anong mga nakatagong hadlang ang nagpaparamdam na hindi ito tiyak?',
          cebuano: 'Kung imong handurawon ang imong kinabuhi lima ka tuig gikan karon, unsa ang hitsura sa tinuod nga kalig-on sa pinansyal, ug unsa ang mga babag nga naghimo niini nga dili sigurado?',
          ilocano: 'No panunotem ti biagmo lima a tawen manipud ita, ania ti langa ti pudno a kinatalged iti pinansial, ken ania dagiti nailemmeng a tubeng?',
          hiligaynon: 'Kon imo paminsaron ang imo kabuhi lima ka tuig halin subong, ano ang hitsura sang matuod nga kalig-on sa pinansyal, kag ano ang mga sablag?',
        },
        type: 'unstructured_dialogue',
        category: 'Aspirations & Livelihood',
        difficultyScore: 65,
        relevanceScore: 96,
        scoringRationale: 'Open narrative dialogue prompt encouraging deep personal disclosure without rigid frames.',
        probePrompts: [
          'Give the respondent uninterrupted time to articulate their emotional definition of security.',
          'Note references to family support (e.g. breadwinner expectations, rent, education of siblings).',
          'Probe: "Do you feel this generation faces pressures your parents did not have?"',
        ],
        required: true,
      },
      {
        id: 'q-un-2',
        text: 'How do you navigate the balance between honoring family duties and pursuing your own creative, professional, or independent dreams?',
        englishText: 'How do you navigate the balance between honoring family duties and pursuing your own creative, professional, or independent dreams?',
        translations: {
          tagalog: 'Paano mo binabalanse ang pagtupad sa tungkulin sa pamilya at ang pagtupad sa sarili mong mga pangarap sa trabaho o personal na buhay?',
          cebuano: 'Giunsa nimo pagbalanse ang pagtuman sa obligasyon sa pamilya ug ang pagkab-ot sa imong kaugalingong mga damgo sa trabaho o kinabuhi?',
        },
        type: 'unstructured_dialogue',
        category: 'Family Dynamics & Identity',
        difficultyScore: 68,
        relevanceScore: 94,
        scoringRationale: 'Elicits cultural tensions (utang na loob, family obligations) vs self-determination.',
        probePrompts: [
          'Listen for feelings of guilt, pride, or resilience.',
          'Gently ask: "Have you ever spoken about this directly with your parents or elders?"',
        ],
        required: true,
      },
      {
        id: 'q-un-3',
        text: 'In your honest view, where do you place your trust today—institutions, social media communities, peers, or yourself? What broke or built that trust?',
        englishText: 'In your honest view, where do you place your trust today—institutions, social media communities, peers, or yourself? What broke or built that trust?',
        translations: {
          tagalog: 'Sa iyong tapat na pananaw, saan mo inilalagay ang iyong tiwala ngayon—sa mga institusyon, social media, kaibigan, o sa iyong sarili? Ano ang sumira o nagbuo ng tiwalang iyon?',
          cebuano: 'Sa imong tinuoray nga pagtan-aw, asa nimo gibutang ang imong pagsalig karon—sa mga institusyon, social media, mga higala, o sa imong kaugalingon?',
        },
        type: 'unstructured_dialogue',
        category: 'Social Trust & Epistemology',
        difficultyScore: 72,
        relevanceScore: 95,
        scoringRationale: 'Rich conversational reflection on disinformation, institution fatigue, and peer solidarity.',
        probePrompts: [
          'Observe vocal cadence and hesitation when discussing public institutions.',
          'Ask for a story that crystallized why they became cynical or hopeful.',
        ],
        required: true,
      },
    ],
  },
];

export const INITIAL_RESPONDENTS: RespondentProfile[] = [
  { id: 'resp-1', name: 'Maria Santos', group: 'Barangay & Community Leaders', gender: 'Female', ageRange: '45-54', location: 'Barangay San Antonio', status: 'completed' },
  { id: 'resp-2', name: 'Joshua Dela Cruz', group: 'Youth & University Students', gender: 'Male', ageRange: '18-24', location: 'University District', status: 'completed' },
  { id: 'resp-3', name: 'Dr. Arlene Bautista', group: 'Healthcare & Frontline Workers', gender: 'Female', ageRange: '35-44', location: 'District General Hospital', status: 'completed' },
  { id: 'resp-4', name: 'Rogelio Tan', group: 'MSME & Small Business Owners', gender: 'Male', ageRange: '40-49', location: 'Poblacion Market Center', status: 'completed' },
  { id: 'resp-5', name: 'Krizza Mae Flores', group: 'Youth & University Students', gender: 'Female', ageRange: '18-24', location: 'Subdivision North', status: 'completed' },
  { id: 'resp-6', name: 'Edgar Villanueva', group: 'Barangay & Community Leaders', gender: 'Male', ageRange: '55-64', location: 'Barangay Riverside', status: 'completed' },
  { id: 'resp-7', name: 'Nurse Grace Alcantara', group: 'Healthcare & Frontline Workers', gender: 'Female', ageRange: '25-34', location: 'Rural Health Unit 2', status: 'completed' },
  { id: 'resp-8', name: 'Carlos Mendoza', group: 'MSME & Small Business Owners', gender: 'Male', ageRange: '30-39', location: 'Commercial Strip B', status: 'completed' },
  { id: 'resp-9', name: 'Bea Patricia Lim', group: 'Youth & University Students', gender: 'Female', ageRange: '20-25', location: 'Barangay South Hills', status: 'completed' },
  { id: 'resp-10', name: 'Vicente Soriano', group: 'Senior Citizens & Retirees', gender: 'Male', ageRange: '65+', location: 'Heritage Village', status: 'completed' },
];

export const INITIAL_RESPONSES: SurveyResponse[] = [
  // Structured Survey Responses
  {
    id: 'resp-data-1',
    surveyId: 'survey-structured-1',
    respondentId: 'resp-1',
    respondentName: 'Maria Santos',
    respondentGroup: 'Barangay & Community Leaders',
    interviewType: 'structured',
    interviewMode: 'individual',
    timestamp: '2026-10-21T09:30:00Z',
    answers: {
      'q-s1': 'Barangay & Community Leaders',
      'q-s2': 4, // Agree
      'q-s3': 4, // Satisfied
      'q-s4': 2, // Rarely
      'q-s5': 6, // Agree on 7-pt
      'q-s6': 5, // Extremely Important
    },
    notes: [
      { id: 'n1', timestamp: '2026-10-21T09:35:00Z', secondsElapsed: 300, author: 'Interviewer', content: 'Noted that elderly constituents in her purok still request paper forms.', tag: 'Insight' },
    ],
    synced: true,
    encryptedHash: 'enc_sha256_9f82bc719a0234de1',
  },
  {
    id: 'resp-data-2',
    surveyId: 'survey-structured-1',
    respondentId: 'resp-2',
    respondentName: 'Joshua Dela Cruz',
    respondentGroup: 'Youth & University Students',
    interviewType: 'structured',
    interviewMode: 'individual',
    timestamp: '2026-10-21T11:15:00Z',
    answers: {
      'q-s1': 'Youth & University Students',
      'q-s2': 5, // Strongly Agree
      'q-s3': 4, // Satisfied
      'q-s4': 3, // Sometimes
      'q-s5': 5, // Somewhat Agree
      'q-s6': 4, // Very Important
    },
    synced: true,
    encryptedHash: 'enc_sha256_bb73c9012da74e0f',
  },
  {
    id: 'resp-data-3',
    surveyId: 'survey-structured-1',
    respondentId: 'resp-3',
    respondentName: 'Dr. Arlene Bautista',
    respondentGroup: 'Healthcare & Frontline Workers',
    interviewType: 'structured',
    interviewMode: 'individual',
    timestamp: '2026-10-22T14:00:00Z',
    answers: {
      'q-s1': 'Healthcare & Frontline Workers',
      'q-s2': 3, // Neutral
      'q-s3': 3, // Neutral
      'q-s4': 4, // Often
      'q-s5': 4, // Neutral on 7-pt
      'q-s6': 5, // Extremely Important
    },
    synced: true,
    encryptedHash: 'enc_sha256_10a9cf41d8e20987',
  },
  {
    id: 'resp-data-4',
    surveyId: 'survey-structured-1',
    respondentId: 'resp-4',
    respondentName: 'Rogelio Tan',
    respondentGroup: 'MSME & Small Business Owners',
    interviewType: 'structured',
    interviewMode: 'group',
    timestamp: '2026-10-22T16:20:00Z',
    answers: {
      'q-s1': 'MSME & Small Business Owners',
      'q-s2': 2, // Disagree
      'q-s3': 2, // Dissatisfied
      'q-s4': 4, // Often
      'q-s5': 3, // Somewhat Disagree
      'q-s6': 5, // Extremely Important
    },
    synced: true,
    encryptedHash: 'enc_sha256_77fa2810cd04e1ab',
  },
  {
    id: 'resp-data-5',
    surveyId: 'survey-structured-1',
    respondentId: 'resp-5',
    respondentName: 'Krizza Mae Flores',
    respondentGroup: 'Youth & University Students',
    interviewType: 'structured',
    interviewMode: 'group',
    timestamp: '2026-10-23T10:00:00Z',
    answers: {
      'q-s1': 'Youth & University Students',
      'q-s2': 4,
      'q-s3': 5,
      'q-s4': 2,
      'q-s5': 6,
      'q-s6': 4,
    },
    synced: true,
    encryptedHash: 'enc_sha256_cc3910ffea891024',
  },
  {
    id: 'resp-data-6',
    surveyId: 'survey-structured-1',
    respondentId: 'resp-10',
    respondentName: 'Vicente Soriano',
    respondentGroup: 'Senior Citizens & Retirees',
    interviewType: 'structured',
    interviewMode: 'individual',
    timestamp: '2026-10-23T14:45:00Z',
    answers: {
      'q-s1': 'Senior Citizens & Retirees',
      'q-s2': 1, // Strongly Disagree (finds UI too small and complicated)
      'q-s3': 2,
      'q-s4': 4,
      'q-s5': 3,
      'q-s6': 5,
    },
    synced: true,
    encryptedHash: 'enc_sha256_3399ab71bc9922ff',
  },

  // Semi-Structured Survey Responses
  {
    id: 'resp-data-semi-1',
    surveyId: 'survey-semi-1',
    respondentId: 'resp-3',
    respondentName: 'Dr. Arlene Bautista',
    respondentGroup: 'Healthcare & Frontline Workers',
    interviewType: 'semi-structured',
    interviewMode: 'individual',
    timestamp: '2026-10-22T15:30:00Z',
    answers: {
      'q-semi-1': 'The referral link between RHUs and tertiary hospitals works on paper, but in practice, doctors still rely on informal Viber group chats to verify bed availability. If the network is congested, patients are kept waiting in rural clinics for hours before transfer.',
      'q-semi-2': 3, // Neutral
      'q-semi-3': 'Last dengue surge, we had three nurses managing 40 acute beds. We had to triage based on platelet count trends and set up temporary rehydration cots in the hallway. Staff morale was sustained solely through mutual solidarity and coffee runs.',
    },
    notes: [
      { id: 'sn-1', timestamp: '2026-10-22T15:40:00Z', secondsElapsed: 600, author: 'Field Researcher', content: 'Strong emphasis on informal messaging apps filling institutional coordination gaps.', tag: 'Insight' },
    ],
    sentiment: {
      score: -0.15,
      label: 'neutral',
      tone: ['Dedicated', 'Resourceful', 'Overburdened'],
      keywords: [
        { word: 'coordination', sentiment: 'neutral', count: 3 },
        { word: 'referral', sentiment: 'neutral', count: 2 },
        { word: 'surge', sentiment: 'negative', count: 2 },
        { word: 'solidarity', sentiment: 'positive', count: 1 },
      ],
      themes: ['Informal communication workarounds', 'High frontline dedication during surges'],
    },
    synced: true,
    encryptedHash: 'enc_sha256_78bb912300ffeedd',
  },

  // Unstructured Survey Responses
  {
    id: 'resp-data-un-1',
    surveyId: 'survey-unstructured-1',
    respondentId: 'resp-2',
    respondentName: 'Joshua Dela Cruz',
    respondentGroup: 'Youth & University Students',
    interviewType: 'unstructured',
    interviewMode: 'individual',
    timestamp: '2026-10-24T13:00:00Z',
    answers: {
      'q-un-1': 'Financial security for me is not being terrified whenever my mother gets a minor cough or fever. Right now, a single hospital bill can wipe out three years of family savings. My goal is to build remote freelance income while supporting my younger brother through senior high school.',
      'q-un-2': 'I carry a deep sense of responsibility. In our culture, utang na loob is not a burden you resent; it is an act of love. But when every career choice has to be measured against whether it puts rice on the table next month, you sometimes put your passion for design or photography in a box.',
      'q-un-3': 'I do not trust traditional institutions or politicians anymore because promises are recycled every election cycle. Instead, I trust my circle of creative peers and open-source communities. We teach each other skills and share freelance opportunities directly.',
    },
    notes: [
      { id: 'un-n1', timestamp: '2026-10-24T13:12:00Z', secondsElapsed: 720, author: 'Dr. Santos (Lead Researcher)', content: 'Respondent spoke with emotional vulnerability regarding family medical expenses as the primary financial anxiety.', tag: 'Quote' },
    ],
    sentiment: {
      score: 0.25,
      label: 'positive',
      tone: ['Resilient', 'Loving', 'Pragmatic', 'Skeptical of Institutions'],
      keywords: [
        { word: 'security', sentiment: 'positive', count: 4 },
        { word: 'family', sentiment: 'positive', count: 6 },
        { word: 'hospital', sentiment: 'negative', count: 2 },
        { word: 'utang na loob', sentiment: 'neutral', count: 2 },
        { word: 'open-source', sentiment: 'positive', count: 3 },
      ],
      themes: ['Familial love anchoring economic goals', 'Peer networks replacing institutional trust'],
    },
    synced: true,
    encryptedHash: 'enc_sha256_55eefc891100aa77',
  },
  {
    id: 'resp-data-un-2',
    surveyId: 'survey-unstructured-1',
    respondentId: 'resp-9',
    respondentName: 'Bea Patricia Lim',
    respondentGroup: 'Youth & University Students',
    interviewType: 'unstructured',
    interviewMode: 'individual',
    timestamp: '2026-10-24T15:20:00Z',
    answers: {
      'q-un-1': 'I want to own a home without spending 35 years in crushing debt. Real estate prices in the metro are completely detached from entry-level salaries. Many of my classmates are planning to work abroad, not because they want to leave, but because survival here feels like swimming against the tide.',
      'q-un-2': 'My parents worked so hard to send me to a top university. I want to make them proud, but their advice often belongs to an era of permanent corporate pensions that simply do not exist today.',
      'q-un-3': 'Social media can be toxic, but it is also where we found community-led relief pantries during disasters when bureaucracy was too slow. That showed me collective empathy is real, even if institutions lag behind.',
    },
    sentiment: {
      score: 0.1,
      label: 'neutral',
      tone: ['Critically Minded', 'Empathetic', 'Cautiously Optimistic'],
      keywords: [
        { word: 'debt', sentiment: 'negative', count: 3 },
        { word: 'housing', sentiment: 'neutral', count: 2 },
        { word: 'community', sentiment: 'positive', count: 4 },
        { word: 'empathy', sentiment: 'positive', count: 2 },
      ],
      themes: ['Generational economic divergence', 'Grassroots solidarity'],
    },
    synced: true,
    encryptedHash: 'enc_sha256_8899aabbccddeeff',
  },
];
