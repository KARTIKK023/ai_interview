// client/src/companion/companionApi.js

import API from '../../../services/api.js';

export async function getCompanionUser() {
  try {
    const response = await API.get('/auth/me');

    return response.data?.user || null;
  } catch (error) {
    console.error('Companion user fetch failed:', error);
    return null;
  }
}

export async function getCompanionResume() {
  try {
    const response = await API.get('/resume/my-resume');

    return response.data?.resume || null;
  } catch (error) {
    console.error('Companion resume fetch failed:', error);

    return null;
  }
}

export async function getCompanionTargetJobs() {
  try {
    const response = await API.get('/target-jobs');

    return response.data?.targetJobs || [];
  } catch (error) {
    console.error('Companion target jobs fetch failed:', error);

    return [];
  }
}

export async function getCompanionInterviews() {
  try {
    const response = await API.get('/interviews');

    return response.data?.interviews || [];
  } catch (error) {
    console.error('Companion interviews fetch failed:', error);

    return [];
  }
}

export async function getCompanionAchievements() {
  try {
    const response = await API.get('/interviews/student/certificates');

    return response.data?.certificates || [];
  } catch (error) {
    console.error('Companion achievements fetch failed:', error);

    return [];
  }
}

export async function loadCompanionState() {
  const [
    resume,
    targetJobs,
    interviews,
    achievements,
  ] = await Promise.all([
    getCompanionResume(),
    getCompanionTargetJobs(),
    getCompanionInterviews(),
    getCompanionAchievements(),
  ]);

  return {
    resume,
    targetJobs,
    interviews,
    achievements,
  };
}