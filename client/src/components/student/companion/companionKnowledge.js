// client/src/companion/companionKnowledge.js

import { ROUTES } from './companionRoutes';

export const SITE_KNOWLEDGE = {
  dashboard: {
    keywords: ['dashboard', 'home', 'overview'],
    route: ROUTES.DASHBOARD,
    title: 'Dashboard',
    description:
      'Your dashboard gives you an overview of your interview activity, profile progress and career preparation.',
  },

  profile: {
    keywords: ['profile', 'personal information', 'education'],
    route: ROUTES.PROFILE,
    title: 'Profile',
    description:
      'Your profile contains your personal information, education, professional links, skills and career preferences.',
  },

  profileProgress: {
    keywords: ['profile progress', 'profile completeness'],
    route: ROUTES.PROFILE_PROGRESS,
    title: 'Profile Progress',
    description:
      'This page shows how complete your student profile is.',
  },

  resume: {
    keywords: ['resume', 'cv'],
    route: ROUTES.RESUME,
    title: 'Resume',
    description:
      'Upload, view, update or delete your resume from here.',
  },

  targetJobs: {
    keywords: ['target job', 'target role', 'career goal'],
    route: ROUTES.TARGET_JOBS,
    title: 'Target Jobs',
    description:
      'Create target jobs with role, industry, company, skills, location, job type and other details.',
  },

  ats: {
    keywords: ['ats', 'ats scanner', 'resume score'],
    route: ROUTES.ATS_SCANNER,
    title: 'ATS Scanner',
    description:
      'The ATS scanner checks your stored resume against a selected target job.',
  },

  interviews: {
    keywords: ['interviews', 'interview history'],
    route: ROUTES.INTERVIEWS,
    title: 'Interviews',
    description:
      'View your previous interview sessions.',
  },

  aiMock: {
    keywords: ['ai mock', 'mock interview'],
    route: ROUTES.AI_MOCK,
    title: 'AI Mock Interview',
    description:
      'Configure and start an AI mock interview.',
  },

  quickPractice: {
    keywords: ['quick practice'],
    route: ROUTES.QUICK_PRACTICE,
    title: 'Quick Practice',
    description:
      'Start a quick interview practice session.',
  },

  questionBank: {
    keywords: ['question bank', 'interview questions'],
    route: ROUTES.QUESTION_BANK,
    title: 'Question Bank',
    description:
      'Browse and read interview questions.',
  },

  analytics: {
    keywords: ['analytics', 'performance'],
    route: ROUTES.ANALYTICS,
    title: 'Analytics',
    description:
      'Review your interview and performance analytics.',
  },

  achievements: {
    keywords: ['achievements', 'certificates'],
    route: ROUTES.ACHIEVEMENTS,
    title: 'Achievements',
    description:
      'View your certificates and achievements.',
  },

  placements: {
    keywords: ['placements', 'opportunities'],
    route: ROUTES.PLACEMENTS,
    title: 'Placement Opportunities',
    description:
      'Browse placement and job opportunities.',
  },

  help: {
    keywords: ['help', 'support'],
    route: ROUTES.HELP,
    title: 'Help & Support',
    description:
      'Get assistance or submit a support request.',
  },

  ask: {
    keywords: ['ask'],
    route: ROUTES.ASK,
    title: 'Ask',
    description:
      'Use the Ask section to ask questions.',
  },
};

export const QUICK_ACTIONS = [
  {
    label: 'My Resume',
    route: ROUTES.RESUME,
  },
  {
    label: 'Target Jobs',
    route: ROUTES.TARGET_JOBS,
  },
  {
    label: 'ATS Scanner',
    route: ROUTES.ATS_SCANNER,
  },
  {
    label: 'Mock Interview',
    route: ROUTES.AI_MOCK,
  },
  {
    label: 'Analytics',
    route: ROUTES.ANALYTICS,
  },
];