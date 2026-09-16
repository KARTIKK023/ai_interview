// client/src/companion/companionEngine.js

import {
  detectIntent,
  INTENTS
} from './companionIntents';

import {
  getGeneralKnowledgeAnswer
} from './companionGeneralKnowledge';

import {
  ROUTES
} from './companionRoutes';


// ============================================================
// Helpers
// ============================================================

function firstName(user) {
  if (!user) return 'there';

  if (user.firstName) {
    return user.firstName;
  }

  if (user.name) {
    return user.name.split(' ')[0];
  }

  if (user.fullName) {
    return user.fullName.split(' ')[0];
  }

  return 'there';
}


function getProfile(user) {
  return user || {};
}


function response(text, actions = []) {
  return {
    text,
    actions
  };
}


// ============================================================
// Universal navigation suggestions
//
// Even when we don't understand a question, the user should
// still have somewhere useful to go.
// ============================================================

function defaultActions() {
  return [
    {
      type: 'navigate',
      label: 'Dashboard',
      route: ROUTES.DASHBOARD
    },
    {
      type: 'navigate',
      label: 'Help & Support',
      route: ROUTES.HELP
    }
  ];
}


// ============================================================
// Make sure every response contains navigation suggestions.
//
// This is intentionally centralized so we don't have to
// remember it in every single handler.
// ============================================================

function withNavigation(result, fallbackActions = []) {
  const existingActions = result?.actions || [];

  if (existingActions.length > 0) {
    return result;
  }

  if (fallbackActions.length > 0) {
    return {
      ...result,
      actions: fallbackActions
    };
  }

  return {
    ...result,
    actions: defaultActions()
  };
}


// ============================================================
// Initial conversation
// ============================================================

export function createInitialConversation(user) {
  return [
    {
      id: `welcome-${Date.now()}`,
      sender: 'ai',
      text:
        `Hi ${firstName(user)}! 👋 I’m HireSmart AI. How can I help you today?`,
      timestamp: new Date()
    }
  ];
}


// ============================================================
// GREETING
// ============================================================

function handleGreeting(user) {
  return response(
    `Hi ${firstName(user)}! 👋 I’m here to help you navigate HireSmart, understand your career tools, and work with the information already available in your account.

💡 You can ask me things like “What is ATS?”, “Do I have a resume?”, “What should I do next?”, or “How do I start a mock interview?”

What would you like to work on?`,
    [
      {
        type: 'navigate',
        label: 'Dashboard',
        route: ROUTES.DASHBOARD
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: ROUTES.RESUME
      },
      {
        type: 'navigate',
        label: 'Mock Interview',
        route: ROUTES.AI_MOCK
      }
    ]
  );
}


// ============================================================
// PROFILE
// ============================================================

function handleProfile(state) {
  const user = getProfile(state.user);

  const name =
    user.name ||
    user.fullName ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return response(
    `Your profile contains the information HireSmart can use to personalize your career-preparation experience.

💡 Helpful to know: keeping your profile information current can make your preparation and job-search workflow more useful.

${name ? `Your account is currently set up for ${name}.` : ''}

If you'd like, I can also help you check your profile progress.`,
    [
      {
        type: 'navigate',
        label: 'Open My Profile',
        route: ROUTES.PROFILE
      },
      {
        type: 'navigate',
        label: 'Profile Progress',
        route: ROUTES.PROFILE_PROGRESS
      },
      {
        type: 'navigate',
        label: 'Dashboard',
        route: ROUTES.DASHBOARD
      }
    ]
  );
}


// ============================================================
// PROFILE PROGRESS
// ============================================================

function handleProfileProgress() {
  return response(
    `Your Profile Progress section helps you see how complete your profile is.

💡 Helpful to know: completing important profile information can make the rest of your HireSmart experience more useful.

I can take you directly to your profile progress page.`,
    [
      {
        type: 'navigate',
        label: 'Check Profile Progress',
        route: ROUTES.PROFILE_PROGRESS
      },
      {
        type: 'navigate',
        label: 'Edit My Profile',
        route: ROUTES.PROFILE
      },
      {
        type: 'navigate',
        label: 'Dashboard',
        route: ROUTES.DASHBOARD
      }
    ]
  );
}


// ============================================================
// DASHBOARD
// ============================================================

function handleDashboard() {
  return response(
    `Your Dashboard is the central place to see your HireSmart activity and access your main career-preparation tools.

💡 Helpful to know: if you're unsure where to start, checking your resume and Target Jobs first is a useful way to set up the rest of your workflow.

I can take you there now.`,
    [
      {
        type: 'navigate',
        label: 'Open Dashboard',
        route: ROUTES.DASHBOARD
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: ROUTES.RESUME
      },
      {
        type: 'navigate',
        label: 'Target Jobs',
        route: ROUTES.TARGET_JOBS
      }
    ]
  );
}


// ============================================================
// RESUME
// ============================================================

function handleResume(state) {
  const hasResume = Boolean(state.resume);

  if (hasResume) {
    return response(
      `You already have a resume available in your HireSmart account.

💡 Helpful to know: keeping your resume updated for the roles you're targeting can improve the usefulness of job-specific analysis.

If you want, you can open your resume or run it through the ATS Scanner.`,
      [
        {
          type: 'navigate',
          label: 'Open My Resume',
          route: ROUTES.RESUME
        },
        {
          type: 'navigate',
          label: 'ATS Scanner',
          route: ROUTES.ATS_SCANNER
        },
        {
          type: 'navigate',
          label: 'Target Jobs',
          route: ROUTES.TARGET_JOBS
        }
      ]
    );
  }

  return response(
    `I don't see a resume available in your current HireSmart account.

💡 Helpful to know: uploading a resume is useful because several career-preparation features can use it as part of their workflow.

I can take you to the Resume section so you can add one.`,
    [
      {
        type: 'navigate',
        label: 'Upload Resume',
        route: ROUTES.RESUME
      },
      {
        type: 'navigate',
        label: 'My Profile',
        route: ROUTES.PROFILE
      },
      {
        type: 'navigate',
        label: 'Dashboard',
        route: ROUTES.DASHBOARD
      }
    ]
  );
}


// ============================================================
// TARGET JOB
// ============================================================

function handleTargetJob(state) {
  const jobs = state.targetJobs || [];

  if (jobs.length === 0) {
    return response(
      `You don't have a Target Job configured yet.

💡 Helpful to know: a Target Job gives HireSmart a specific role to work against when you're preparing your resume and evaluating job alignment.

I can take you to the Target Jobs section to create one.`,
      [
        {
          type: 'navigate',
          label: 'Create Target Job',
          route: ROUTES.TARGET_JOBS
        },
        {
          type: 'navigate',
          label: 'My Resume',
          route: ROUTES.RESUME
        },
        {
          type: 'navigate',
          label: 'Dashboard',
          route: ROUTES.DASHBOARD
        }
      ]
    );
  }

  const latestJob = jobs[0];

  const role =
    latestJob?.target_job_role ||
    latestJob?.role ||
    'your selected role';

  return response(
    `You currently have ${jobs.length} Target Job${jobs.length === 1 ? '' : 's'} configured. Your ${jobs.length === 1 ? 'current' : 'available'} role includes **${role}**.

💡 Helpful to know: keeping your Target Job details accurate makes resume and preparation workflows more relevant to the role you're pursuing.

I can take you to your Target Jobs.`,
    [
      {
        type: 'navigate',
        label: 'View Target Jobs',
        route: ROUTES.TARGET_JOBS
      },
      {
        type: 'navigate',
        label: 'ATS Scanner',
        route: ROUTES.ATS_SCANNER
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: ROUTES.RESUME
      }
    ]
  );
}


// ============================================================
// ATS
// ============================================================

function handleATS(state) {
  const hasResume = Boolean(state.resume);
  const jobs = state.targetJobs || [];

  // ----------------------------------------------------------
  // No resume
  // ----------------------------------------------------------

  if (!hasResume) {
    return response(
      `Before you run an ATS check, you need a resume available in your account.

💡 Helpful to know: the ATS workflow compares your resume against a Target Job, so both pieces are important.

I can help you start by opening your Resume section.`,
      [
        {
          type: 'navigate',
          label: 'Upload Resume',
          route: ROUTES.RESUME
        },
        {
          type: 'navigate',
          label: 'Target Jobs',
          route: ROUTES.TARGET_JOBS
        },
        {
          type: 'navigate',
          label: 'Dashboard',
          route: ROUTES.DASHBOARD
        }
      ]
    );
  }


  // ----------------------------------------------------------
  // No Target Job
  // ----------------------------------------------------------

  if (jobs.length === 0) {
    return response(
      `Your resume is available, but you don't have a Target Job configured yet.

💡 Helpful to know: ATS analysis is most useful when your resume is compared against a specific role and its requirements.

Create a Target Job first, and then you can run the ATS check.`,
      [
        {
          type: 'navigate',
          label: 'Create Target Job',
          route: ROUTES.TARGET_JOBS
        },
        {
          type: 'navigate',
          label: 'My Resume',
          route: ROUTES.RESUME
        },
        {
          type: 'navigate',
          label: 'Dashboard',
          route: ROUTES.DASHBOARD
        }
      ]
    );
  }


  // ----------------------------------------------------------
  // One Target Job
  // ----------------------------------------------------------

  if (jobs.length === 1) {
    const job = jobs[0];

    const role =
      job?.target_job_role ||
      job?.role ||
      'your Target Job';

    return response(
      `Your resume and Target Job are both ready.

💡 Helpful to know: running an ATS check can show where your resume aligns with the selected role and where it may need improvement.

Your current Target Job is **${role}**. You can start the ATS workflow now.`,
      [
        {
          type: 'navigate',
          label: 'Run ATS Check',
          route: ROUTES.ATS_SCANNER
        },
        {
          type: 'navigate',
          label: 'My Resume',
          route: ROUTES.RESUME
        },
        {
          type: 'navigate',
          label: 'Target Jobs',
          route: ROUTES.TARGET_JOBS
        }
      ]
    );
  }


  // ----------------------------------------------------------
  // Multiple Target Jobs
  // ----------------------------------------------------------

  const jobActions = jobs
    .slice(0, 3)
    .map((job, index) => ({
      type: 'navigate',
      label:
        job?.target_job_role ||
        job?.role ||
        `Target Job ${index + 1}`,
      route: ROUTES.ATS_SCANNER
    }));

  return response(
    `Your resume is ready and you have ${jobs.length} Target Jobs configured.

💡 Helpful to know: the ATS result depends on which role you're comparing your resume against, so make sure you choose the Target Job that matches the application you're preparing for.

You can open the ATS Scanner and choose the relevant job.`,
    [
      ...jobActions,
      {
        type: 'navigate',
        label: 'View Target Jobs',
        route: ROUTES.TARGET_JOBS
      }
    ]
  );
}


// ============================================================
// INTERVIEWS
// ============================================================

function handleInterviews(state) {
  const interviews = state.interviews || [];

  if (interviews.length === 0) {
    return response(
      `You don't have any completed interviews in your history yet.

💡 Helpful to know: practicing before a real interview can help you become more comfortable with answering questions under interview conditions.

You can start with a Mock Interview or Quick Practice.`,
      [
        {
          type: 'navigate',
          label: 'Start Mock Interview',
          route: ROUTES.AI_MOCK
        },
        {
          type: 'navigate',
          label: 'Quick Practice',
          route: ROUTES.QUICK_PRACTICE
        },
        {
          type: 'navigate',
          label: 'Question Bank',
          route: ROUTES.QUESTION_BANK
        }
      ]
    );
  }

  return response(
    `You have ${interviews.length} interview${interviews.length === 1 ? '' : 's'} in your history.

💡 Helpful to know: reviewing previous interviews can help you identify patterns in your performance and decide what to practice next.

I can take you to your interview history or analytics.`,
    [
      {
        type: 'navigate',
        label: 'Interview History',
        route: ROUTES.INTERVIEWS
      },
      {
        type: 'navigate',
        label: 'Analytics',
        route: ROUTES.ANALYTICS
      },
      {
        type: 'navigate',
        label: 'Practice Again',
        route: ROUTES.AI_MOCK
      }
    ]
  );
}


// ============================================================
// AI MOCK
// ============================================================

function handleAIMock(state) {
  const hasResume = Boolean(state.resume);
  const jobs = state.targetJobs || [];

  if (!hasResume) {
    return response(
      `You need a resume before starting the complete AI Mock Interview workflow.

💡 Helpful to know: having your resume ready can give your interview preparation better context.

I can take you to the Resume section first.`,
      [
        {
          type: 'navigate',
          label: 'Upload Resume',
          route: ROUTES.RESUME
        },
        {
          type: 'navigate',
          label: 'My Profile',
          route: ROUTES.PROFILE
        },
        {
          type: 'navigate',
          label: 'Dashboard',
          route: ROUTES.DASHBOARD
        }
      ]
    );
  }

  if (jobs.length === 0) {
    return response(
      `Your resume is ready, but you don't have a Target Job configured yet.

💡 Helpful to know: setting a Target Job first lets your preparation be centered around the role you're pursuing.

I can take you to Target Jobs.`,
      [
        {
          type: 'navigate',
          label: 'Create Target Job',
          route: ROUTES.TARGET_JOBS
        },
        {
          type: 'navigate',
          label: 'My Resume',
          route: ROUTES.RESUME
        },
        {
          type: 'navigate',
          label: 'Dashboard',
          route: ROUTES.DASHBOARD
        }
      ]
    );
  }

  return response(
    `You're ready to start an AI Mock Interview.

💡 Helpful to know: try answering naturally rather than memorizing perfect sentences. The goal of practice is to become comfortable explaining your experience and thinking through questions.

I can take you to the mock interview setup.`,
    [
      {
        type: 'navigate',
        label: 'Start Mock Interview',
        route: ROUTES.AI_MOCK
      },
      {
        type: 'navigate',
        label: 'Quick Practice',
        route: ROUTES.QUICK_PRACTICE
      },
      {
        type: 'navigate',
        label: 'Question Bank',
        route: ROUTES.QUESTION_BANK
      }
    ]
  );
}


// ============================================================
// QUICK PRACTICE
// ============================================================

function handleQuickPractice() {
  return response(
    `Quick Practice lets you work on interview questions without going through a complete mock interview.

💡 Helpful to know: it's useful when you want a short practice session or want to focus on a particular type of question.

I can take you there.`,
    [
      {
        type: 'navigate',
        label: 'Open Quick Practice',
        route: ROUTES.QUICK_PRACTICE
      },
      {
        type: 'navigate',
        label: 'Question Bank',
        route: ROUTES.QUESTION_BANK
      },
      {
        type: 'navigate',
        label: 'Mock Interview',
        route: ROUTES.AI_MOCK
      }
    ]
  );
}


// ============================================================
// QUESTION BANK
// ============================================================

function handleQuestionBank() {
  return response(
    `The Question Bank gives you access to interview questions for preparation and practice.

💡 Helpful to know: use it to identify questions you find difficult before attempting a complete mock interview.

I can open it for you.`,
    [
      {
        type: 'navigate',
        label: 'Open Question Bank',
        route: ROUTES.QUESTION_BANK
      },
      {
        type: 'navigate',
        label: 'Quick Practice',
        route: ROUTES.QUICK_PRACTICE
      },
      {
        type: 'navigate',
        label: 'Mock Interview',
        route: ROUTES.AI_MOCK
      }
    ]
  );
}


// ============================================================
// ANALYTICS
// ============================================================

function handleAnalytics() {
  return response(
    `Your Analytics section helps you review your preparation and interview performance.

💡 Helpful to know: don't only look at a single result. Comparing performance across multiple sessions can give you more useful feedback.

I can take you to Analytics.`,
    [
      {
        type: 'navigate',
        label: 'Open Analytics',
        route: ROUTES.ANALYTICS
      },
      {
        type: 'navigate',
        label: 'Interview History',
        route: ROUTES.INTERVIEWS
      },
      {
        type: 'navigate',
        label: 'Quick Practice',
        route: ROUTES.QUICK_PRACTICE
      }
    ]
  );
}


// ============================================================
// ACHIEVEMENTS
// ============================================================

function handleAchievements(state) {
  const achievements = state.achievements || [];

  if (achievements.length === 0) {
    return response(
      `You don't have any certificates or achievements available yet.

💡 Helpful to know: your achievements section can become more useful as you complete relevant activities on the platform.

I can take you to the Achievements section.`,
      [
        {
          type: 'navigate',
          label: 'Open Achievements',
          route: ROUTES.ACHIEVEMENTS
        },
        {
          type: 'navigate',
          label: 'Mock Interview',
          route: ROUTES.AI_MOCK
        },
        {
          type: 'navigate',
          label: 'Dashboard',
          route: ROUTES.DASHBOARD
        }
      ]
    );
  }

  return response(
    `You currently have ${achievements.length} achievement${achievements.length === 1 ? '' : 's'} available.

💡 Helpful to know: keeping track of your completed activities can help you see your progress over time.

I can open your Achievements section.`,
    [
      {
        type: 'navigate',
        label: 'View Achievements',
        route: ROUTES.ACHIEVEMENTS
      },
      {
        type: 'navigate',
        label: 'Analytics',
        route: ROUTES.ANALYTICS
      },
      {
        type: 'navigate',
        label: 'Dashboard',
        route: ROUTES.DASHBOARD
      }
    ]
  );
}


// ============================================================
// PLACEMENTS
// ============================================================

function handlePlacements() {
  return response(
    `The Placement Opportunities section is designed to help you explore available career opportunities.

💡 Helpful to know: before applying, make sure your resume and Target Job information are aligned with the type of role you're pursuing.

I can take you to Placement Opportunities.`,
    [
      {
        type: 'navigate',
        label: 'View Opportunities',
        route: ROUTES.PLACEMENTS
      },
      {
        type: 'navigate',
        label: 'Target Jobs',
        route: ROUTES.TARGET_JOBS
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: ROUTES.RESUME
      }
    ]
  );
}


// ============================================================
// TECHNICAL SUPPORT
// ============================================================

function handleHelp() {
  return response(
    `It sounds like you may need help with something on HireSmart.

💡 Before contacting support, I can help you check the relevant section and make sure the basic setup is correct.

If the issue is a technical problem, error, failed upload, page that isn't loading, or something behaving unexpectedly, Help & Support is the right place to report it.

I can take you there.`,
    [
      {
        type: 'navigate',
        label: 'Help & Support',
        route: ROUTES.HELP
      },
      {
        type: 'navigate',
        label: 'Open Dashboard',
        route: ROUTES.DASHBOARD
      }
    ]
  );
}


// ============================================================
// ASK
// ============================================================

function handleAsk() {
  return response(
    `You can ask me about HireSmart's features, your available account information, navigation, resume preparation, ATS analysis, interviews, and career-preparation workflows.

💡 Helpful to know: I can also use the information already available in your account instead of asking you for something I already know.

What would you like to know?`,
    [
      {
        type: 'navigate',
        label: 'Dashboard',
        route: ROUTES.DASHBOARD
      },
      {
        type: 'navigate',
        label: 'Help & Support',
        route: ROUTES.HELP
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: ROUTES.RESUME
      }
    ]
  );
}


// ============================================================
// GENERAL KNOWLEDGE
// ============================================================

function handleGeneral(input) {
  const knowledge = getGeneralKnowledgeAnswer(input);

  if (!knowledge) {
    return response(
      `I don't have a specific answer for that yet.

💡 I can currently help with HireSmart features, resume preparation, ATS, Target Jobs, interviews, practice, analytics, achievements, and navigation.

If your question is about using HireSmart, tell me what you're trying to do and I'll guide you.`,
      defaultActions()
    );
  }

  return response(
    `${knowledge.tip}

${knowledge.answer}

If you'd like, I can help you take the next step or explain this in more detail.`,
    knowledge.actions
  );
}


// ============================================================
// UNKNOWN
// ============================================================

function handleUnknown() {
  return response(
    `I can help you navigate HireSmart and work with the information already available in your account.

💡 Try asking me something specific, such as “Do I have a resume?”, “What is ATS?”, “How do I start a mock interview?”, or “What should I do next?”

If you're experiencing a technical problem, I can also take you to Help & Support.`,
    [
      {
        type: 'navigate',
        label: 'Dashboard',
        route: ROUTES.DASHBOARD
      },
      {
        type: 'navigate',
        label: 'Help & Support',
        route: ROUTES.HELP
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: ROUTES.RESUME
      }
    ]
  );
}


// ============================================================
// MAIN INTENT HANDLER
// ============================================================

function handleIntent(intent, input, state) {

  switch (intent) {

    case INTENTS.GREETING:
      return handleGreeting(state.user);

    case INTENTS.DASHBOARD:
      return handleDashboard();

    case INTENTS.PROFILE:
      return handleProfile(state);

    case INTENTS.PROFILE_PROGRESS:
      return handleProfileProgress();

    case INTENTS.RESUME:
      return handleResume(state);

    case INTENTS.TARGET_JOB:
      return handleTargetJob(state);

    case INTENTS.ATS:
      return handleATS(state);

    case INTENTS.INTERVIEW:
      return handleInterviews(state);

    case INTENTS.AI_MOCK:
      return handleAIMock(state);

    case INTENTS.QUICK_PRACTICE:
      return handleQuickPractice();

    case INTENTS.QUESTION_BANK:
      return handleQuestionBank();

    case INTENTS.ANALYTICS:
      return handleAnalytics();

    case INTENTS.ACHIEVEMENTS:
      return handleAchievements(state);

    case INTENTS.PLACEMENTS:
      return handlePlacements();

    case INTENTS.HELP:
      return handleHelp();

    case INTENTS.ASK:
      return handleAsk();

    case INTENTS.GENERAL:
      return handleGeneral(input);

    case INTENTS.UNKNOWN:
    default:
      return handleUnknown();
  }
}


// ============================================================
// PUBLIC API
// ============================================================

export function processCompanionMessage(input, state = {}) {

  const safeState = {
    user: state.user || null,
    resume: state.resume || null,
    targetJobs: Array.isArray(state.targetJobs)
      ? state.targetJobs
      : [],
    interviews: Array.isArray(state.interviews)
      ? state.interviews
      : [],
    achievements: Array.isArray(state.achievements)
      ? state.achievements
      : []
  };


  const intent = detectIntent(input);

  const result = handleIntent(
    intent,
    input,
    safeState
  );


  // ----------------------------------------------------------
  // Absolute guarantee:
  //
  // Every answer gets navigation suggestions.
  // ----------------------------------------------------------

  return withNavigation(result);
}