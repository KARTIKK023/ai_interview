// client/src/companion/companionIntents.js

export const INTENTS = {
  GREETING: 'greeting',

  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
  PROFILE_PROGRESS: 'profile_progress',
  RESUME: 'resume',
  TARGET_JOB: 'target_job',

  ATS: 'ats',

  INTERVIEW: 'interview',
  AI_MOCK: 'ai_mock',
  QUICK_PRACTICE: 'quick_practice',
  QUESTION_BANK: 'question_bank',

  ANALYTICS: 'analytics',
  ACHIEVEMENTS: 'achievements',
  PLACEMENTS: 'placements',

  HELP: 'help',
  ASK: 'ask',

  GENERAL: 'general',
  UNKNOWN: 'unknown'
};


// ------------------------------------------------------------
// Normalize
// ------------------------------------------------------------

function normalize(text = '') {
  return text
    .toLowerCase()
    .trim()
    .replace(/[?!.,]/g, '')
    .replace(/\s+/g, ' ');
}


// ------------------------------------------------------------
// Keyword groups
// ------------------------------------------------------------

const KEYWORDS = {

  greeting: [
    'hi',
    'hello',
    'hey',
    'hii',
    'hiii',
    'good morning',
    'good afternoon',
    'good evening',
    'namaste'
  ],

  dashboard: [
    'dashboard',
    'home',
    'main page',
    'overview'
  ],

  profileProgress: [
    'profile progress',
    'profile completion',
    'profile complete',
    'complete my profile',
    'complete profile',
    'profile percentage',
    'profile strength'
  ],

  profile: [
    'profile',
    'my profile',
    'personal information',
    'personal details',
    'education details',
    'skills in profile'
  ],

  resume: [
    'resume',
    'cv',
    'curriculum vitae',
    'upload resume',
    'my resume',
    'resume section'
  ],

  targetJob: [
    'target job',
    'target jobs',
    'target role',
    'target company',
    'job preference',
    'job preferences',
    'desired job',
    'desired role'
  ],

  ats: [
    'ats',
    'ats scanner',
    'ats score',
    'resume score',
    'resume scan',
    'scan my resume',
    'resume analysis',
    'resume match',
    'job match'
  ],

  interview: [
    'interview',
    'interviews',
    'interview history',
    'past interview',
    'previous interview',
    'my interviews'
  ],

  aiMock: [
    'mock interview',
    'ai mock',
    'ai interview',
    'practice interview',
    'start interview',
    'start mock'
  ],

  quickPractice: [
    'quick practice',
    'quick practice interview',
    'quick question',
    'quick questions'
  ],

  questionBank: [
    'question bank',
    'interview questions',
    'questions bank',
    'practice questions',
    'question library'
  ],

  analytics: [
    'analytics',
    'statistics',
    'stats',
    'performance',
    'performance analytics',
    'my performance',
    'progress'
  ],

  achievements: [
    'achievement',
    'achievements',
    'certificate',
    'certificates',
    'my certificate',
    'my certificates',
    'badges'
  ],

  placements: [
    'placement',
    'placements',
    'placement opportunities',
    'jobs',
    'job opportunities',
    'available jobs'
  ],

  help: [
    'help',
    'support',
    'help and support',
    'help & support',
    'contact support',
    'technical support',
    'customer support'
  ],

  ask: [
    'ask',
    'ask question',
    'ask a question',
    'question'
  ]
};


// ------------------------------------------------------------
// Technical issue detection
// ------------------------------------------------------------

const TECHNICAL_ISSUE_KEYWORDS = [
  'not working',
  'does not work',
  "doesn't work",
  'dont work',
  "don't work",
  'did not work',
  "didn't work",
  'not loading',
  'does not load',
  "doesn't load",
  'not opening',
  'does not open',
  "doesn't open",
  'not uploading',
  'does not upload',
  "doesn't upload",
  'cannot upload',
  "can't upload",
  'unable to upload',
  'upload failed',
  'failed to upload',
  'error',
  'bug',
  'broken',
  'crash',
  'crashed',
  'failure',
  'failed',
  'problem',
  'issue',
  'technical issue',
  'technical problem',
  'something went wrong',
  'stuck',
  'not responding',
  'not responding'
];


// ------------------------------------------------------------
// Detect technical issue
// ------------------------------------------------------------

export function isTechnicalIssue(input = '') {
  const text = normalize(input);

  return TECHNICAL_ISSUE_KEYWORDS.some(keyword =>
    text.includes(keyword)
  );
}


// ------------------------------------------------------------
// Generic question detection
// ------------------------------------------------------------

const GENERAL_QUESTION_PATTERNS = [
  'what is',
  'what are',
  'what does',
  'how does',
  'why is',
  'why are',
  'why do',
  'explain',
  'tell me about',
  'meaning of',
  'define',
  'can you explain'
];

export function looksLikeGeneralQuestion(input = '') {
  const text = normalize(input);

  return GENERAL_QUESTION_PATTERNS.some(pattern =>
    text.startsWith(pattern) || text.includes(` ${pattern} `)
  );
}


// ------------------------------------------------------------
// Intent detection
// ------------------------------------------------------------

export function detectIntent(input = '') {
  const text = normalize(input);

  if (!text) {
    return INTENTS.UNKNOWN;
  }


  // ----------------------------------------------------------
  // Technical problems get highest priority.
  //
  // Example:
  // "ATS is not working"
  //
  // We don't want this to become simply ATS navigation.
  // ----------------------------------------------------------

  if (isTechnicalIssue(text)) {
    return INTENTS.HELP;
  }


  // ----------------------------------------------------------
  // Greeting
  // ----------------------------------------------------------

  if (
    KEYWORDS.greeting.some(keyword => text === keyword)
  ) {
    return INTENTS.GREETING;
  }


  // ----------------------------------------------------------
  // Profile progress BEFORE profile
  // ----------------------------------------------------------

  if (
    KEYWORDS.profileProgress.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.PROFILE_PROGRESS;
  }


  // ----------------------------------------------------------
  // ATS BEFORE generic resume
  // ----------------------------------------------------------

  if (
    KEYWORDS.ats.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.ATS;
  }


  // ----------------------------------------------------------
  // AI Mock BEFORE generic interview
  // ----------------------------------------------------------

  if (
    KEYWORDS.aiMock.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.AI_MOCK;
  }


  // ----------------------------------------------------------
  // Quick Practice
  // ----------------------------------------------------------

  if (
    KEYWORDS.quickPractice.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.QUICK_PRACTICE;
  }


  // ----------------------------------------------------------
  // Question Bank
  // ----------------------------------------------------------

  if (
    KEYWORDS.questionBank.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.QUESTION_BANK;
  }


  // ----------------------------------------------------------
  // Resume
  // ----------------------------------------------------------

  if (
    KEYWORDS.resume.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.RESUME;
  }


  // ----------------------------------------------------------
  // Target Jobs
  // ----------------------------------------------------------

  if (
    KEYWORDS.targetJob.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.TARGET_JOB;
  }


  // ----------------------------------------------------------
  // Interviews
  // ----------------------------------------------------------

  if (
    KEYWORDS.interview.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.INTERVIEW;
  }


  // ----------------------------------------------------------
  // Analytics
  // ----------------------------------------------------------

  if (
    KEYWORDS.analytics.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.ANALYTICS;
  }


  // ----------------------------------------------------------
  // Achievements
  // ----------------------------------------------------------

  if (
    KEYWORDS.achievements.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.ACHIEVEMENTS;
  }


  // ----------------------------------------------------------
  // Placements
  // ----------------------------------------------------------

  if (
    KEYWORDS.placements.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.PLACEMENTS;
  }


  // ----------------------------------------------------------
  // Profile
  // ----------------------------------------------------------

  if (
    KEYWORDS.profile.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.PROFILE;
  }


  // ----------------------------------------------------------
  // Help
  // ----------------------------------------------------------

  if (
    KEYWORDS.help.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.HELP;
  }


  // ----------------------------------------------------------
  // Ask
  // ----------------------------------------------------------

  if (
    KEYWORDS.ask.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return INTENTS.ASK;
  }


  // ----------------------------------------------------------
  // Generic question
  // ----------------------------------------------------------

  if (looksLikeGeneralQuestion(text)) {
    return INTENTS.GENERAL;
  }


  return INTENTS.UNKNOWN;
}