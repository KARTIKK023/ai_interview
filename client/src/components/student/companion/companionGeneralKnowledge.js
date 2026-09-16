// client/src/companion/companionGeneralKnowledge.js

export const GENERAL_KNOWLEDGE = [

  // ==========================================================
  // ATS
  // ==========================================================

  {
    id: 'ats',

    keywords: [
      'what is ats',
      'what is an ats',
      'what does ats mean',
      'ats meaning',
      'explain ats'
    ],

    answer:
      'ATS stands for Applicant Tracking System. Companies use ATS software to organize, filter, and manage job applications. HireSmart uses ATS-style analysis to compare your resume with a specific Target Job.',

    tip:
      '💡 Helpful to know: your resume should be tailored to the specific job you are targeting rather than using exactly the same resume for every application.',

    actions: [
      {
        type: 'navigate',
        label: 'Open ATS Scanner',
        route: '/student/ats-scanner'
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: '/student/resume'
      },
      {
        type: 'navigate',
        label: 'Target Jobs',
        route: '/student/target-jobs'
      }
    ]
  },


  // ==========================================================
  // ATS SCORE
  // ==========================================================

  {
    id: 'ats-score',

    keywords: [
      'what is ats score',
      'what does ats score mean',
      'ats score meaning',
      'how is ats score calculated',
      'how does ats score work'
    ],

    answer:
      'An ATS score represents how closely your resume aligns with the requirements of a Target Job. Resume content such as relevant skills, experience, education, keywords, and job-description alignment can affect the analysis.',

    tip:
      '💡 Helpful to know: a higher ATS score does not automatically guarantee an interview. It is better used as feedback for improving your resume-job alignment.',

    actions: [
      {
        type: 'navigate',
        label: 'Run ATS Check',
        route: '/student/ats-scanner'
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: '/student/resume'
      },
      {
        type: 'navigate',
        label: 'Target Jobs',
        route: '/student/target-jobs'
      }
    ]
  },


  // ==========================================================
  // RESUME
  // ==========================================================

  {
    id: 'resume',

    keywords: [
      'what is a resume',
      'what is resume',
      'what does resume mean',
      'resume meaning',
      'explain resume'
    ],

    answer:
      'A resume is a concise document that presents your education, skills, experience, projects, achievements, and other qualifications relevant to a job.',

    tip:
      '💡 Helpful to know: a strong resume focuses on evidence of what you can do rather than simply listing technologies or responsibilities.',

    actions: [
      {
        type: 'navigate',
        label: 'Open My Resume',
        route: '/student/resume'
      },
      {
        type: 'navigate',
        label: 'Target Jobs',
        route: '/student/target-jobs'
      },
      {
        type: 'navigate',
        label: 'ATS Scanner',
        route: '/student/ats-scanner'
      }
    ]
  },


  // ==========================================================
  // TARGET JOB
  // ==========================================================

  {
    id: 'target-job',

    keywords: [
      'what is a target job',
      'what is target job',
      'what are target jobs',
      'what does target job mean',
      'target job meaning'
    ],

    answer:
      'A Target Job is a job role you want to pursue. You can define details such as the role, company, industry, skills, location, job type, salary expectations, and job description.',

    tip:
      '💡 Helpful to know: defining a Target Job allows HireSmart to make your resume and preparation activities more specific to the role you want.',

    actions: [
      {
        type: 'navigate',
        label: 'Open Target Jobs',
        route: '/student/target-jobs'
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: '/student/resume'
      },
      {
        type: 'navigate',
        label: 'ATS Scanner',
        route: '/student/ats-scanner'
      }
    ]
  },


  // ==========================================================
  // AI MOCK INTERVIEW
  // ==========================================================

  {
    id: 'mock-interview',

    keywords: [
      'what is mock interview',
      'what is an ai mock interview',
      'what is ai mock interview',
      'what does mock interview mean',
      'explain mock interview'
    ],

    answer:
      'A mock interview is a practice interview designed to simulate an actual interview. It gives you an opportunity to practice answering questions and evaluate your performance before a real interview.',

    tip:
      '💡 Helpful to know: practicing aloud is useful because interview performance involves more than simply knowing the answer.',

    actions: [
      {
        type: 'navigate',
        label: 'Start Mock Interview',
        route: '/student/interview-preparation/ai-mock'
      },
      {
        type: 'navigate',
        label: 'Quick Practice',
        route: '/student/interview-preparation/quick-practice'
      },
      {
        type: 'navigate',
        label: 'Interview History',
        route: '/student/interviews'
      }
    ]
  },


  // ==========================================================
  // QUICK PRACTICE
  // ==========================================================

  {
    id: 'quick-practice',

    keywords: [
      'what is quick practice',
      'what does quick practice mean',
      'explain quick practice'
    ],

    answer:
      'Quick Practice is designed for short interview-question practice without going through a complete mock interview flow.',

    tip:
      '💡 Helpful to know: Quick Practice can be useful when you want to practice a few questions in a short session.',

    actions: [
      {
        type: 'navigate',
        label: 'Open Quick Practice',
        route: '/student/interview-preparation/quick-practice'
      },
      {
        type: 'navigate',
        label: 'Mock Interview',
        route: '/student/interview-preparation/ai-mock'
      },
      {
        type: 'navigate',
        label: 'Question Bank',
        route: '/student/question-bank'
      }
    ]
  },


  // ==========================================================
  // QUESTION BANK
  // ==========================================================

  {
    id: 'question-bank',

    keywords: [
      'what is question bank',
      'what is the question bank',
      'what does question bank mean',
      'explain question bank'
    ],

    answer:
      'The Question Bank contains interview questions that you can use for preparation and practice.',

    tip:
      '💡 Helpful to know: you can use the Question Bank to identify areas where you need more practice before starting a complete mock interview.',

    actions: [
      {
        type: 'navigate',
        label: 'Open Question Bank',
        route: '/student/question-bank'
      },
      {
        type: 'navigate',
        label: 'Quick Practice',
        route: '/student/interview-preparation/quick-practice'
      },
      {
        type: 'navigate',
        label: 'Mock Interview',
        route: '/student/interview-preparation/ai-mock'
      }
    ]
  },


  // ==========================================================
  // ANALYTICS
  // ==========================================================

  {
    id: 'analytics',

    keywords: [
      'what is analytics',
      'what are analytics',
      'what does analytics mean',
      'explain analytics'
    ],

    answer:
      'Analytics helps you review your interview and preparation activity so you can understand your progress and performance over time.',

    tip:
      '💡 Helpful to know: reviewing your previous performance can help you identify recurring areas that need more practice.',

    actions: [
      {
        type: 'navigate',
        label: 'Open Analytics',
        route: '/student/analytics'
      },
      {
        type: 'navigate',
        label: 'Interview History',
        route: '/student/interviews'
      },
      {
        type: 'navigate',
        label: 'Quick Practice',
        route: '/student/interview-preparation/quick-practice'
      }
    ]
  },


  // ==========================================================
  // PLACEMENTS
  // ==========================================================

  {
    id: 'placements',

    keywords: [
      'what are placement opportunities',
      'what is placement',
      'what are placements',
      'explain placements'
    ],

    answer:
      'Placement Opportunities is where you can explore available opportunities relevant to your career and job-search journey.',

    tip:
      '💡 Helpful to know: keeping your profile, resume, and Target Jobs information updated can make your preparation more useful.',

    actions: [
      {
        type: 'navigate',
        label: 'View Placement Opportunities',
        route: '/student/placement-opportunities'
      },
      {
        type: 'navigate',
        label: 'My Profile',
        route: '/student/profile'
      },
      {
        type: 'navigate',
        label: 'Target Jobs',
        route: '/student/target-jobs'
      }
    ]
  },


  // ==========================================================
  // HIRESMART
  // ==========================================================

  {
    id: 'hiresmart',

    keywords: [
      'what is hiresmart',
      'what is hiresmart ai',
      'how does hiresmart work',
      'what can hiresmart do',
      'what can i do here'
    ],

    answer:
      'HireSmart is a career-preparation platform that brings together resume management, Target Jobs, ATS analysis, interview preparation, practice, analytics, achievements, and placement opportunities.',

    tip:
      '💡 Helpful to know: a good starting point is making sure your profile, resume, and Target Job information are up to date.',

    actions: [
      {
        type: 'navigate',
        label: 'Open Dashboard',
        route: '/student/dashboard'
      },
      {
        type: 'navigate',
        label: 'My Resume',
        route: '/student/resume'
      },
      {
        type: 'navigate',
        label: 'Target Jobs',
        route: '/student/target-jobs'
      }
    ]
  }
];


// ============================================================
// Find generic answer
// ============================================================

export function getGeneralKnowledgeAnswer(input = '') {
  const text = input.toLowerCase().trim();

  const match = GENERAL_KNOWLEDGE.find(item =>
    item.keywords.some(keyword =>
      text.includes(keyword)
    )
  );

  return match || null;
}