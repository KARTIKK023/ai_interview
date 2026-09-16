// client/src/companion/companionFlows.js

import { ROUTES } from './companionRoutes';

export const createAction = (label, route) => ({
  type: 'navigate',
  label,
  route,
});

export const FLOWS = {
  ATS: {
    id: 'ats',

    start: (state) => {
      if (!state.resume) {
        return {
          step: 'missing_resume',
          message:
            "You don't have a resume uploaded yet. The ATS scanner needs your stored resume first.",
          actions: [
            createAction('Upload Resume →', ROUTES.RESUME),
          ],
        };
      }

      if (!state.targetJobs.length) {
        return {
          step: 'missing_target_job',
          message:
            'Your resume is ready, but you do not have a Target Job yet. Create one first so I can help you run an ATS check against it.',
          actions: [
            createAction('Create Target Job →', ROUTES.TARGET_JOBS),
          ],
        };
      }

      if (state.targetJobs.length === 1) {
        const job = state.targetJobs[0];

        return {
          step: 'ready',
          message:
            `Your resume and target job are ready. Your selected target is "${job.target_job_role || 'Target Job'}". You can run the ATS check now.`,
          actions: [
            createAction('Run ATS Check →', ROUTES.ATS_SCANNER),
          ],
        };
      }

      return {
        step: 'choose_target_job',
        message:
          'Your resume is ready. Which target job would you like to use for the ATS check?',
        choices: state.targetJobs.map((job) => ({
          id: String(job._id),
          label:
            job.target_job_role ||
            job.target_company ||
            'Target Job',
          value: job,
        })),
      };
    },
  },

  RESUME: {
    id: 'resume',

    start: (state) => {
      if (state.resume) {
        return {
          step: 'resume_exists',
          message:
            'Your resume is already uploaded. You can view it, replace it with an updated version, or manage it from the Resume page.',
          actions: [
            createAction('Open My Resume →', ROUTES.RESUME),
          ],
        };
      }

      return {
        step: 'missing_resume',
        message:
          "You don't have a resume uploaded yet. Upload it from the Resume page and then you can use it for ATS checking and interview preparation.",
        actions: [
          createAction('Upload Resume →', ROUTES.RESUME),
        ],
      };
    },
  },

  TARGET_JOB: {
    id: 'target_job',

    start: (state) => {
      if (state.targetJobs.length) {
        return {
          step: 'target_jobs_exist',
          message:
            `You currently have ${state.targetJobs.length} target job${state.targetJobs.length === 1 ? '' : 's'}. You can manage them from the Target Jobs page.`,
          actions: [
            createAction('Manage Target Jobs →', ROUTES.TARGET_JOBS),
          ],
        };
      }

      return {
        step: 'missing_target_job',
        message:
          'You do not have a Target Job yet. A Target Job defines the role, industry, company and skills you want to prepare for.',
        actions: [
          createAction('Create Target Job →', ROUTES.TARGET_JOBS),
        ],
      };
    },
  },

  AI_MOCK: {
    id: 'ai_mock',

    start: (state) => {
      if (!state.resume) {
        return {
          step: 'missing_resume',
          message:
            "Before starting your mock interview, you should upload your resume so your preparation can use your profile information.",
          actions: [
            createAction('Upload Resume →', ROUTES.RESUME),
          ],
        };
      }

      if (!state.targetJobs.length) {
        return {
          step: 'missing_target_job',
          message:
            'Your resume is ready. You still need a Target Job before configuring your mock interview.',
          actions: [
            createAction('Create Target Job →', ROUTES.TARGET_JOBS),
          ],
        };
      }

      return {
        step: 'ready',
        message:
          'You have the required resume and target-job information. You can configure your AI mock interview now.',
        actions: [
          createAction('Start Mock Interview →', ROUTES.AI_MOCK),
        ],
      };
    },
  },

  QUICK_PRACTICE: {
    id: 'quick_practice',

    start: () => ({
      step: 'ready',
      message:
        'Quick Practice lets you jump directly into interview-question practice without going through the full interview flow.',
      actions: [
        createAction('Open Quick Practice →', ROUTES.QUICK_PRACTICE),
      ],
    }),
  },

  INTERVIEWS: {
    id: 'interviews',

    start: (state) => {
      if (!state.interviews.length) {
        return {
          step: 'no_interviews',
          message:
            "You don't have any completed interview sessions yet. You can start preparing with a mock interview or Quick Practice.",
          actions: [
            createAction('Mock Interview →', ROUTES.AI_MOCK),
            createAction('Quick Practice →', ROUTES.QUICK_PRACTICE),
          ],
        };
      }

      return {
        step: 'has_interviews',
        message:
          `You have ${state.interviews.length} interview session${state.interviews.length === 1 ? '' : 's'} in your history.`,
        actions: [
          createAction('View Interview History →', ROUTES.INTERVIEWS),
          createAction('View Analytics →', ROUTES.ANALYTICS),
        ],
      };
    },
  },

  ACHIEVEMENTS: {
    id: 'achievements',

    start: (state) => {
      if (!state.achievements.length) {
        return {
          step: 'no_achievements',
          message:
            "You don't have any certificates recorded yet. Keep completing eligible interview activities and check your achievements here.",
          actions: [
            createAction('Open Achievements →', ROUTES.ACHIEVEMENTS),
          ],
        };
      }

      return {
        step: 'has_achievements',
        message:
          `You have ${state.achievements.length} achievement${state.achievements.length === 1 ? '' : 's'} recorded.`,
        actions: [
          createAction('View Achievements →', ROUTES.ACHIEVEMENTS),
        ],
      };
    },
  },
};