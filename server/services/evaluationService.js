/**
 * Evaluation criteria builder for Text Mock AI-Interview.
 * Uses exact 5 criteria: Answer Relevance, Accuracy, Technical Knowledge, Problem Solving, Answer Quality.
 */
const getRoleEvaluationCriteria = (category = 'Technical', jobRole = '', targetJobContext = null) => {
  return [
    'Answer Relevance',
    'Accuracy',
    'Technical Knowledge',
    'Problem Solving',
    'Answer Quality'
  ];
};

module.exports = {
  getRoleEvaluationCriteria
};
