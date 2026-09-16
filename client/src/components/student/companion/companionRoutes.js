// client/src/companion/companionRoutes.js

export const ROUTES = {
  DASHBOARD: '/student/dashboard',

  PROFILE: '/student/profile',
  PROFILE_PROGRESS: '/student/profile-progress',

  RESUME: '/student/resume',

  TARGET_JOBS: '/student/target-jobs',

  ATS_SCANNER: '/student/ats-scanner',
  ATS_HISTORY: '/student/ats-scanner/history',

  INTERVIEWS: '/student/interviews',

  AI_MOCK: '/student/interview-preparation/ai-mock',
  AI_MOCK_SETUP: '/student/interview-preparation/ai-mock/setup',

  QUICK_PRACTICE: '/student/interview-preparation/quick-practice',

  QUESTION_BANK: '/student/question-bank',

  ANALYTICS: '/student/analytics',

  ACHIEVEMENTS: '/student/achievements',

  PLACEMENTS: '/student/placement-opportunities',

  HELP: '/student/help-support',

  ASK: '/student/ask',
};

export const ROUTE_INFO = {
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Your student dashboard and overall career overview.',
  },

  [ROUTES.PROFILE]: {
    title: 'Profile',
    description: 'Manage your personal, education and professional information.',
  },

  [ROUTES.PROFILE_PROGRESS]: {
    title: 'Profile Progress',
    description: 'See how complete your profile is.',
  },

  [ROUTES.RESUME]: {
    title: 'Resume',
    description: 'Upload, view, update or delete your resume.',
  },

  [ROUTES.TARGET_JOBS]: {
    title: 'Target Jobs',
    description: 'Define your target roles, companies, industries and required skills.',
  },

  [ROUTES.ATS_SCANNER]: {
    title: 'ATS Scanner',
    description: 'Check your resume against a target job.',
  },

  [ROUTES.ATS_HISTORY]: {
    title: 'ATS History',
    description: 'View your previous ATS scans.',
  },

  [ROUTES.INTERVIEWS]: {
    title: 'Interviews',
    description: 'View your previous interview sessions and results.',
  },

  [ROUTES.AI_MOCK]: {
    title: 'AI Mock Interview',
    description: 'Start an AI mock interview.',
  },

  [ROUTES.QUICK_PRACTICE]: {
    title: 'Quick Practice',
    description: 'Practice interview questions quickly.',
  },

  [ROUTES.QUESTION_BANK]: {
    title: 'Question Bank',
    description: 'Browse interview questions.',
  },

  [ROUTES.ANALYTICS]: {
    title: 'Analytics',
    description: 'View interview and career analytics.',
  },

  [ROUTES.ACHIEVEMENTS]: {
    title: 'Achievements',
    description: 'View your certificates and achievements.',
  },

  [ROUTES.PLACEMENTS]: {
    title: 'Placement Opportunities',
    description: 'Browse placement and job opportunities.',
  },

  [ROUTES.HELP]: {
    title: 'Help & Support',
    description: 'Get help or submit a support request.',
  },

  [ROUTES.ASK]: {
    title: 'Ask',
    description: 'Ask questions using the Ask section.',
  },
};