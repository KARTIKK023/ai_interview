const { GoogleGenerativeAI } = require('@google/generative-ai');


const Groq = require('groq-sdk');

const {
  generateWithRetry,
} = require('./aiRetryService');

const { getRoleEvaluationCriteria } = require('./evaluationService');

/*
|--------------------------------------------------------------------------
| AI PROVIDER CONFIGURATION
|--------------------------------------------------------------------------
|
| Supported providers:
|   - gemini
|   - ollama
|
| Change AI_PROVIDER in .env to switch between them.
|
*/

const AI_PROVIDER = (
  process.env.AI_PROVIDER || 'ollama'
).toLowerCase();


// ============================================================================
// GEMINI CONFIGURATION
// ============================================================================

const getGeminiModel = () => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.error(
      '[AI] Gemini selected but AI_API_KEY is missing.'
    );

    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
  });
};

// ============================================================================
// GROQ CONFIGURATION
// ============================================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const GROQ_MODEL =
  process.env.GROQ_MODEL ||
  'llama-3.1-8b-instant';

const getGroqClient = () => {
  if (!GROQ_API_KEY || GROQ_API_KEY.trim() === '') {
    console.error(
      '[AI] Groq selected but GROQ_API_KEY is missing.'
    );

    return null;
  }

  return new Groq({
    apiKey: GROQ_API_KEY,
  });
};


// ============================================================================
// OLLAMA CONFIGURATION
// ============================================================================

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ||
  'http://127.0.0.1:11434';

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ||
  'llama3.1:8b-instruct-q4_K_M';


const getOllamaModel = () => {
  return {
    baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL,
  };
};


// ============================================================================
// OLLAMA GENERATION
// ============================================================================

const generateWithOllama = async (prompt) => {
  const model = getOllamaModel();

  const response = await fetch(
    `${model.baseUrl}/api/chat`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        model: model.model,

        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],

        stream: false,

        options: {
          temperature: 0.4,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Ollama API error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  return data?.message?.content || '';
};

// ============================================================================
// GROQ GENERATION
// ============================================================================

const generateWithGroq = async (
  prompt,
  options = {}
) => {
  const groq = getGroqClient();

  if (!groq) {
    throw new Error(
      'Groq API key is missing.'
    );
  }

  return generateWithRetry(async () => {
    const request = {
      model: GROQ_MODEL,

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],

      temperature: 0.2,

      max_tokens:
        options.maxTokens || 2000,
    };

    if (options.jsonMode) {
      request.response_format = {
        type: 'json_object',
      };
    }

    const completion =
      await groq.chat.completions.create(
        request
      );

    return (
      completion?.choices?.[0]?.message
        ?.content || ''
    );
  });
};


// ============================================================================
// UNIFIED AI GENERATION
// ============================================================================

const generateWithAI = async (prompt, options = {}) => {

  if (AI_PROVIDER === 'gemini') {
    const model = getGeminiModel();

    if (!model) {
      throw new Error(
        'Gemini provider selected but Gemini model is unavailable.'
      );
    }

    const result = await model.generateContent(prompt);

    return result?.response?.text
      ? result.response.text()
      : '';
  }

  if (AI_PROVIDER === 'ollama') {
    return await generateWithOllama(prompt);
  }

  if (AI_PROVIDER === 'groq') {
    return await generateWithGroq(
      prompt,
      options.jsonMode || false
    );
  }

  throw new Error(
    `Unsupported AI_PROVIDER: "${AI_PROVIDER}"`
  );
};
// ============================================================================
// PROVIDER LOG
// ============================================================================

console.log(
  `[AI] Provider: ${AI_PROVIDER}`
);

if (AI_PROVIDER === 'ollama') {

  console.log(
    `[AI] Ollama Model: ${OLLAMA_MODEL}`
  );

  console.log(
    `[AI] Ollama URL: ${OLLAMA_BASE_URL}`
  );
}

if (AI_PROVIDER === 'gemini') {

  console.log(
    '[AI] Gemini Model: gemini-2.5-flash'
  );
}

if (AI_PROVIDER === 'groq') {

  console.log(
    `[AI] Groq Model: ${GROQ_MODEL}`
  );
}

// Clean JSON response string from Markdown formatting ```json ... ```
const cleanJson = (text) => {
  if (!text || typeof text !== 'string') {
    return null;
  }

  try {
    let cleanText = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // First attempt: response is already valid JSON
    try {
      return JSON.parse(cleanText);
    } catch (firstError) {
      // Continue to extract JSON from surrounding text
    }

    // Try to extract a JSON array
    const arrayStart = cleanText.indexOf('[');
    const arrayEnd = cleanText.lastIndexOf(']');

    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      const jsonArray = cleanText.substring(
        arrayStart,
        arrayEnd + 1
      );

      try {
        return JSON.parse(jsonArray);
      } catch (arrayError) {
        // Continue to object extraction
      }
    }

    // Try to extract a JSON object
    const objectStart = cleanText.indexOf('{');
    const objectEnd = cleanText.lastIndexOf('}');

    if (objectStart !== -1 && objectEnd > objectStart) {
      const jsonObject = cleanText.substring(
        objectStart,
        objectEnd + 1
      );

      try {
        return JSON.parse(jsonObject);
      } catch (objectError) {
        // Final failure
      }
    }

    console.error(
      'Failed to parse AI JSON. Raw response:',
      text
    );

    return null;
  } catch (err) {
    console.error(
      'Failed to clean AI JSON:',
      err.message
    );

    return null;
  }
};

// Sanitize keys for Mongoose Map fields by replacing dots with spaces
const sanitizeMapKeys = (mapObj) => {
  if (!mapObj) return {};
  const cleaned = {};
  if (mapObj instanceof Map) {
    mapObj.forEach((val, key) => {
      const cleanKey = String(key).replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
      cleaned[cleanKey] = typeof val === 'number' ? val : (parseInt(val) || 0);
    });
  } else if (typeof mapObj === 'object') {
    Object.keys(mapObj).forEach((key) => {
      const cleanKey = String(key).replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
      cleaned[cleanKey] = typeof mapObj[key] === 'number' ? mapObj[key] : (parseInt(mapObj[key]) || 0);
    });
  }
  return cleaned;
};

const getLevelComplexityInstruction = (level, difficulty) => {
  const lvl = parseInt(level);
  if (!isNaN(lvl) && lvl >= 1 && lvl <= 10) {
    switch (lvl) {
      case 1:
        return 'Level 1/10 (Basic / Fundamental): Focus STRICTLY on core definitions, basic terminology, entry-level concepts, and primary role duties. Do NOT include advanced scenarios, system design, or complex troubleshooting.';
      case 2:
        return 'Level 2/10 (Basic + Easy Practical): Focus on simple practical tasks, basic tool usage, routine entry-level workflows, and foundational scenarios.';
      case 3:
        return 'Level 3/10 (Intermediate): Focus on standard job processes, common operational challenges, practical execution, and core problem-solving.';
      case 4:
        return 'Level 4/10 (Intermediate Practical): Focus on hands-on practical scenarios, troubleshooting, applied domain knowledge, and process management.';
      case 5:
        return 'Level 5/10 (Intermediate + Advanced Practical): Focus on real-world execution under constraints, technical/operational problem-solving, and cross-functional scenarios.';
      case 6:
        return 'Level 6/10 (Advanced Role-Specific): Focus on domain-specific expertise, advanced tool/framework usage, performance optimization, and industry standards.';
      case 7:
        return 'Level 7/10 (Advanced Scenario / Problem-Solving): Focus on complex multi-variable scenarios, high-stakes troubleshooting, risk mitigation, and stakeholder management.';
      case 8:
        return 'Level 8/10 (Complex Technical / Role-Specific): Focus on deep domain expertise, system/process design, handling edge cases, and complex technical or operational decisions. Do NOT include basic definitions.';
      case 9:
        return 'Level 9/10 (Advanced Real-World Scenarios): Focus on high-risk strategic challenges, enterprise-level scenarios, leadership under crisis, and architectural/business vision. Do NOT include basic or entry-level questions.';
      case 10:
        return 'Level 10/10 (Expert-Level Challenging Questions): Focus on executive-level strategy, industry innovation, complex organizational scaling, expert-level problem solving, and long-term vision. Do NOT include basic or entry-level questions.';
      default:
        break;
    }
  }

  const diffLower = (difficulty || 'Intermediate').toLowerCase();
  if (diffLower.includes('begin') || diffLower.includes('easy') || diffLower.includes('basic')) {
    return 'Basic Level: Focus on core principles, basic terminology, and foundational role duties.';
  } else if (diffLower.includes('advance') || diffLower.includes('hard')) {
    return 'Advanced Level: Focus on complex problem-solving, high-stakes scenarios, and strategic optimization.';
  }
  return 'Intermediate Level: Focus on real-world practical execution, tool application, and situational decision-making.';
};

/**
 * Validate question difficulty against selected Interview Level (1 to 10)
 * Level 1-2: Must be basic/fundamental, no system-design or complex enterprise architecture.
 * Level 8-10: Must be advanced/expert/strategic, no basic definitions.
 */
const validateQuestionDifficulty = (questionText, level) => {
  const lvl = parseInt(level);
  if (isNaN(lvl) || lvl < 1 || lvl > 10) return true;

  const textLower = (questionText || '').toLowerCase();

  // Basic definition indicators
  const isBasicDefinition =
    textLower.startsWith('what is ') ||
    textLower.startsWith('what are basic ') ||
    textLower.startsWith('define ') ||
    textLower.includes('basic syntax') ||
    textLower.includes('basic terminology') ||
    textLower.includes('primary duties') ||
    textLower.includes('basic definition');

  // Advanced / Expert / Enterprise Architecture indicators
  const isAdvancedOrExpert =
    textLower.includes('distributed system') ||
    textLower.includes('microservices vs monolithic') ||
    textLower.includes('database sharding') ||
    textLower.includes('executive strategy') ||
    textLower.includes('organizational scaling') ||
    textLower.includes('disaster recovery') ||
    textLower.includes('high-availability') ||
    textLower.includes('multi-region') ||
    textLower.includes('enterprise-level scenario') ||
    textLower.includes('cross-organizational') ||
    textLower.includes('cost-benefit analysis');

  // Rule 1: Level 1-2 (Basic/Fundamental) MUST NOT contain complex advanced/expert architecture
  if (lvl <= 2 && isAdvancedOrExpert) {
    return false;
  }

  // Rule 2: Level 8-10 (Complex/Expert/Strategic) MUST NOT contain basic definition questions
  if (lvl >= 8 && isBasicDefinition) {
    return false;
  }

  return true;
};

/**
 * Validate question relevance against Target Job context
 */
const validateQuestionRelevance = (questionText, targetJobContext) => {
  if (!questionText || typeof questionText !== 'string' || !questionText.trim()) {
    return false;
  }
  const textLower = questionText.trim().toLowerCase();

  // Reject generic legacy filler strings
  if (
    textLower.includes('what additional skills make you a strong candidate') ||
    textLower.includes('scenario ref #') ||
    textLower.length < 15
  ) {
    return false;
  }

  return true;
};

// Helper: Extract core question tokens (excluding common stopwords & role title boilerplate)
const getCoreQuestionTokens = (text, roleText = '') => {
  const stopWords = new Set([
    'what', 'how', 'why', 'when', 'where', 'which', 'who', 'does', 'do', 'did', 'is', 'are', 'was',
    'were', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'about',
    'your', 'you', 'explain', 'describe', 'tell', 'us', 'me', 'can', 'could', 'would', 'should',
    'role', 'as', 'experience', 'give', 'an', 'example', 'scenario', 'ref', 'aligned', 'level',
    'focus', 'approach', 'work', 'responsibilities', 'accomplishments', 'key', 'methodology',
    'practices', 'standard', 'processes', 'competencies', 'domain', 'within', 'daily', 'execution'
  ]);

  let clean = (text || '').toLowerCase();
  if (roleText) {
    clean = clean.replace(new RegExp(roleText.toLowerCase(), 'g'), '');
  }
  clean = clean.replace(/level \d+\/\d+/gi, '').replace(/scenario ref #\d+/gi, '');

  return clean
    .split(/\W+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
};

// Calculate Jaccard similarity between two question strings focusing on core subject tokens
const calculateSimilarity = (text1, text2, roleText = '') => {
  const t1 = getCoreQuestionTokens(text1, roleText);
  const t2 = getCoreQuestionTokens(text2, roleText);
  if (t1.length === 0 || t2.length === 0) return 0;

  const set1 = new Set(t1);
  const set2 = new Set(t2);

  let intersection = 0;
  set1.forEach(token => {
    if (set2.has(token)) intersection++;
  });

  const union = new Set([...set1, ...set2]).size;
  return union > 0 ? intersection / union : 0;
};

// Check if candidate text is duplicate or highly similar/paraphrased
const isDuplicateOrParaphrased = (candidateText, seenTextsSet, previousQuestionsList = [], roleText = '') => {
  const normCandidate = (candidateText || '').trim().toLowerCase();
  if (!normCandidate) return true;
  if (seenTextsSet.has(normCandidate)) return true;

  // Check similarity against current session questions (>0.65 similarity means paraphrased duplicate)
  for (const existing of seenTextsSet) {
    if (calculateSimilarity(normCandidate, existing, roleText) > 0.65) {
      return true;
    }
  }

  // Check similarity against previous interview history (>0.60 similarity)
  if (Array.isArray(previousQuestionsList)) {
    for (const prev of previousQuestionsList) {
      if (typeof prev === 'string' && prev.trim()) {
        const normPrev = prev.trim().toLowerCase();
        if (normCandidate === normPrev || calculateSimilarity(normCandidate, normPrev, roleText) > 0.60) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * 1. Generate Interview Questions tailored to Category, Job Role, Level & Target Job Context
 */
const generateInterviewQuestions = async ({
  category = 'Technical',
  jobRole = 'Software Engineer',
  difficulty = 'Intermediate',
  level = null,
  questionCount = 5,
  requiredSkills = [],
  jobDescription = '',
  targetJobContext = null,
  previousQuestions = []
} = {}) => {
  const safeCategory = (category || 'Technical').toString();
  const safeRole = (jobRole || targetJobContext?.target_job_role || 'Software Engineer').toString();
  const safeDifficulty = (difficulty || 'Intermediate').toString();
  const numQuestions = parseInt(questionCount) || 5;

  // const model = getGeminiModel();
  // const model = getOllamaModel();
  const model = true;
  
  const criteriaList = getRoleEvaluationCriteria(safeCategory, safeRole, targetJobContext);

  const tjRole = targetJobContext?.target_job_role || safeRole;
  const tjCompany = targetJobContext?.target_company || '';
  const tjIndustry = targetJobContext?.target_industry || '';
  const tjExp = targetJobContext?.experience || '';
  const tjLocation = targetJobContext?.preferred_location || '';
  const tjJobType = targetJobContext?.job_type || '';
  const tjSalary = targetJobContext?.expected_salary || '';
  const tjDesc = targetJobContext?.job_description || jobDescription || '';
  
  let skillsList = requiredSkills;
  if ((!skillsList || skillsList.length === 0) && targetJobContext?.required_skills) {
    skillsList = targetJobContext.required_skills;
  }
  const skillsStr = Array.isArray(skillsList) && skillsList.length > 0 ? skillsList.join(', ') : 'Standard role skills';
  const levelInstruction = getLevelComplexityInstruction(level, safeDifficulty);

  let historyExclusionPrompt = '';
  if (Array.isArray(previousQuestions) && previousQuestions.length > 0) {
    const recentPrev = previousQuestions.slice(0, 40);
    historyExclusionPrompt = `
PREVIOUSLY ASKED QUESTIONS HISTORY (DO NOT REPEAT OR PARAPHRASE ANY OF THESE):
${recentPrev.map((q, idx) => `${idx + 1}. "${q}"`).join('\n')}

STRICT EXCLUSION RULE:
- Do NOT repeat, rephrase, or ask questions that are highly similar to any of the ${recentPrev.length} previously asked questions listed above.
- Generate completely NEW, FRESH, and DISTINCT questions.
`;
  }

  let rawQuestions = [];

  if (model) {
    try {
      const prompt = `You are an expert professional interviewer conducting a personalized interview based strictly on the candidate's Target Job profile.

Target Job Profile & Context:
- Target Job Role: ${tjRole}
- Target Industry: ${tjIndustry || 'N/A'}
- Target Company: ${tjCompany || 'N/A'}
- Candidate Experience Level: ${tjExp || 'N/A'}
- Required Skills: ${skillsStr}
- Preferred Location: ${tjLocation || 'N/A'}
- Job Type: ${tjJobType || 'N/A'}
- Expected Salary: ${tjSalary || 'N/A'}
- Job Description & Responsibilities: ${tjDesc || 'Standard role duties'}

CRITICAL MANDATORY INSTRUCTIONS:
1. QUESTION COUNT REQUIREMENT: You MUST generate EXACTLY ${numQuestions} UNIQUE questions. Do NOT return fewer than ${numQuestions} questions.
2. QUESTION COMPLEXITY LEVEL: ${levelInstruction}
3. DOMAIN CATEGORY: ${safeCategory}
4. DYNAMIC QUESTION MIX: Analyze "${tjRole}", required skills (${skillsStr}), and job description duties. Dynamically generate a balanced mix of question types (Technical, Behavioral, Situational, Practical, Strategic, Analytical, etc.) tailored specifically for this role.
5. DIFFICULTY STRICTNESS: Questions MUST strictly match ${levelInstruction}.
6. FRESHNESS & UNIQNESS: Every question must be completely unique, distinct, and fresh.
${historyExclusionPrompt}

Return ONLY a raw JSON array containing EXACTLY ${numQuestions} question objects matching this exact schema:

[
  {
    "questionText": "Detailed clear question string...",
    "questionType": "Technical | Behavioral | Situational | Practical | Strategic",
    "difficulty": "${safeDifficulty}",
    "evaluationCriteria": ["Criterion 1", "Criterion 2"],
    "expectedCompetencies": ["Competency 1", "Competency 2"]
  }
]
No extra markdown explanations or commentary outside the raw JSON array.`;

      // const result = await model.generateContent(prompt);
      // const responseText = result?.response?.text ? result.response.text() : '';
      const responseText = await generateWithAI(prompt);

      const parsed = cleanJson(responseText);
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        rawQuestions = parsed;
      }
    } catch (err) {
      console.error('Gemini question generation error, fallback engaged:', err.message);
    }
  }

  // Clean, deduplicate, and enforce EXACT requested question count
  return cleanAndDeduplicateQuestions(
    rawQuestions,
    safeCategory,
    safeRole,
    safeDifficulty,
    numQuestions,
    criteriaList,
    targetJobContext,
    level,
    previousQuestions
  );
};

const generateFallbackQuestions = (
  category = 'Technical',
  jobRole = 'Software Engineer',
  difficulty = 'Intermediate',
  count = 5,
  criteria = [],
  targetJobContext = null,
  level = null,
  previousQuestions = []
) => {
  const safeCategory = (category || 'Technical').toString();
  const safeRole = (jobRole || targetJobContext?.target_job_role || 'Professional Role').toString();
  const safeDifficulty = (difficulty || 'Intermediate').toString();
  const safeCriteria = Array.isArray(criteria) && criteria.length > 0
    ? criteria
    : getRoleEvaluationCriteria(safeCategory, safeRole, targetJobContext);

  const skillsList = (targetJobContext?.required_skills || []).filter(Boolean);
  if (skillsList.length === 0) {
    skillsList.push('core principles', 'domain tools', 'workflow management', 'quality standards');
  }

  const lvl = parseInt(level);

  let verbs = [];
  let topics = [];

  if (!isNaN(lvl) && lvl <= 2) {
    // Level 1-2: Basic / Fundamental & Easy Practical
    verbs = [
      'What are the core concepts and primary functions of',
      'Explain the basic workflow and fundamental principles of',
      'What is the basic difference between core methods in',
      'How do you perform routine entry-level tasks involving',
      'What basic tools and primary definitions do you use when working with',
      'Describe the initial setup and basic configurations for',
      'What are the essential rules and syntax guidelines for',
      'How do beginners start implementing foundational procedures in',
      'What common entry-level mistakes should be avoided when using',
      'Walk me through a basic step-by-step example of using'
    ];
    topics = [
      'foundational role responsibilities',
      'basic terminology and primary concepts',
      'routine workplace tasks',
      'entry-level domain tools',
      'standard operational procedures',
      'basic syntax and structural guidelines',
      'entry-level troubleshooting steps',
      'fundamental data inputs and outputs',
      'primary software utilities',
      'basic client and team communication'
    ];
  } else if (!isNaN(lvl) && lvl >= 8) {
    // Level 8-10: Complex Technical / Advanced Real-World Scenarios / Expert Strategic
    verbs = [
      'How do you design a high-availability, fault-tolerant architecture for',
      'What executive frameworks and organizational scaling strategies do you implement when expanding',
      'Describe how you manage critical production outages, disaster recovery, and risk mitigation in',
      'How do you structure cross-organizational technical standards and enterprise vision for',
      'What advanced optimization methodologies do you enforce when scaling',
      'How do you conduct comprehensive threat modeling and security architecture audits for',
      'Describe your methodology for multi-region failover and zero-downtime deployments in',
      'What governance and compliance frameworks do you institute across engineering teams regarding',
      'How do you negotiate high-stakes executive alignment and budget allocations for',
      'What cutting-edge technical innovations and paradigm shifts are you pioneering in'
    ];
    topics = [
      'enterprise-level multi-region systems',
      'organizational scaling and infrastructure architecture',
      'high-risk crisis management and disaster recovery',
      'cross-departmental strategic governance',
      'domain-wide innovation and long-term vision',
      'advanced telemetry, distributed tracing, and observability',
      'zero-trust security architecture and data privacy compliance',
      'high-frequency throughput optimization and caching strategies',
      'multi-tenant isolation and cloud infrastructure cost optimization',
      'executive leadership and team mentorship frameworks'
    ];
  } else {
    // Level 3-7: Intermediate to Advanced Role-Specific Scenarios
    verbs = [
      'Walk me through how you design and implement',
      'What specific strategies do you use when optimizing',
      'Describe a real-world scenario where you troubleshoot',
      'How do you establish quality standards and best practices for',
      'Explain your step-by-step methodology for managing',
      'What approach do you take when evaluating and refining',
      'Describe how you handle unexpected failure cases or bottlenecks in',
      'How do you collaborate with cross-functional stakeholders when executing',
      'What key metrics and performance indicators do you monitor regarding',
      'How do you balance rapid feature delivery with long-term code quality in'
    ];
    topics = [
      'high-impact project deliverables',
      'operational workflows and process automation',
      'resource allocation and task prioritization',
      'risk management and scope change adaptations',
      'stakeholder communication and expectation management',
      'compliance, security, and ethical standards',
      'performance benchmarking and continuous improvement',
      'team onboarding, documentation, and knowledge sharing',
      'cost optimization and budget efficiency',
      'scalability and future growth planning'
    ];
  }

  const questions = [];

  // 1. Skill-specific questions
  skillsList.forEach((skill) => {
    verbs.forEach((verb, idx) => {
      questions.push({
        questionText: `${verb} ${skill} as a ${safeRole}?`,
        questionType: idx % 2 === 0 ? 'Technical' : 'Practical',
        difficulty: safeDifficulty,
        evaluationCriteria: [`${skill} Proficiency`, 'Problem Solving'],
        expectedCompetencies: [`${skill} Application`, 'Domain Execution']
      });
    });
  });

  // 2. Topic-specific questions
  topics.forEach((topic, idx) => {
    verbs.forEach((verb, vIdx) => {
      questions.push({
        questionText: `${verb} ${topic} as a ${safeRole}?`,
        questionType: (idx + vIdx) % 2 === 0 ? 'Behavioral' : 'Situational',
        difficulty: safeDifficulty,
        evaluationCriteria: ['Role Knowledge', 'Problem Solving'],
        expectedCompetencies: ['Operational Excellence']
      });
    });
  });

  return questions;
};

const cleanAndDeduplicateQuestions = (
  rawQuestions = [],
  category = 'Technical',
  jobRole = 'Software Engineer',
  difficulty = 'Intermediate',
  count = 5,
  criteria = [],
  targetJobContext = null,
  level = null,
  previousQuestions = []
) => {
  const safeCategory = (category || 'Technical').toString();
  const safeRole = (jobRole || 'Software Engineer').toString();
  const safeDifficulty = (difficulty || 'Intermediate').toString();
  const safeCriteria = Array.isArray(criteria) && criteria.length > 0
    ? criteria
    : getRoleEvaluationCriteria(safeCategory, safeRole, targetJobContext);

  const seenTexts = new Set();
  const cleaned = [];

  if (Array.isArray(rawQuestions)) {
    for (let i = 0; i < rawQuestions.length; i++) {
      let qObj = rawQuestions[i];
      if (!qObj) continue;
      let qText = typeof qObj === 'string' ? qObj : (qObj.questionText || qObj.question || '');

      if (!validateQuestionRelevance(qText, targetJobContext)) {
        continue;
      }

      if (!validateQuestionDifficulty(qText, level)) {
        continue;
      }

      if (isDuplicateOrParaphrased(qText, seenTexts, previousQuestions, safeRole)) {
        continue;
      }

      seenTexts.add(qText.trim().toLowerCase());
      cleaned.push({
        questionText: qText.trim(),
        questionType: qObj.questionType || 'General',
        difficulty: qObj.difficulty || safeDifficulty,
        evaluationCriteria: Array.isArray(qObj.evaluationCriteria) && qObj.evaluationCriteria.length > 0
          ? qObj.evaluationCriteria
          : safeCriteria,
        expectedCompetencies: Array.isArray(qObj.expectedCompetencies) ? qObj.expectedCompetencies : []
      });
    }
  }

  const targetCount = count ? parseInt(count) : 5;

  // If cleaned array has fewer questions than targetCount, pad with unique level-validated fallbacks
  if (cleaned.length < targetCount) {
    const fallbackPool = generateFallbackQuestions(
      safeCategory,
      safeRole,
      safeDifficulty,
      targetCount + 100,
      safeCriteria,
      targetJobContext,
      level,
      previousQuestions
    );

    for (const candidateQ of fallbackPool) {
      if (cleaned.length >= targetCount) break;
      const candidateText = candidateQ.questionText ? candidateQ.questionText.trim() : '';
      if (
        validateQuestionRelevance(candidateText, targetJobContext) &&
        validateQuestionDifficulty(candidateText, level) &&
        !isDuplicateOrParaphrased(candidateText, seenTexts, previousQuestions, safeRole)
      ) {
        seenTexts.add(candidateText.toLowerCase());
        cleaned.push(candidateQ);
      }
    }
  }

  return cleaned.slice(0, targetCount);
};

/**
 * Helper: Independent Semantic Evaluator when LLM API key is unconfigured or rate limited
 */
const performIndependentSemanticEvaluation = ({
  category = 'Technical',
  jobRole = 'Software Engineer',
  difficulty = 'Intermediate',
  questionText = '',
  answerText = '',
  criteria = [],
  targetJobContext = null
}) => {
  const text = (answerText || '').trim();
  const qText = (questionText || '').trim();
  const safeRole = (jobRole || targetJobContext?.target_job_role || 'Software Engineer').toString();
  const evaluationCriteria = [
    'Answer Relevance',
    'Accuracy',
    'Technical Knowledge',
    'Problem Solving',
    'Answer Quality'
  ];

  const textLower = text.toLowerCase();
  const qLower = qText.toLowerCase();

  // CHECK 1: NO ANSWER (Empty, null, whitespace, or "No answer provided.")
  if (!text || textLower === 'no answer provided.') {
    const criteriaScores = {};
    evaluationCriteria.forEach(crit => { criteriaScores[crit] = 0; });

    return {
      isRelevant: false,
      evaluationReason: 'No Answer Provided',
      score: 0,
      criteriaScores,
      feedback: 'No answer was provided for this question. Submit a response to receive evaluation.',
      strengths: [],
      weaknesses: ['Submit a response to receive evaluation points for this question.'],
      improvements: ['Submit a response to receive evaluation points for this question.']
    };
  }

  // Explicit nonsense / gibberish / random pattern detection
  const nonsensePatterns = [
    'idk', 'dont know', "don't know", 'no idea', 'asdf', 'gdsgg', 'test', 'qwerty',
    'na', 'n/a', 'nothing', 'abc', '123', 'xyz', 'foo', 'bar', 'random', 'gibberish',
    'sdgfsd', 'gdfg', 'whatever', 'abcdxyz'
  ];
  const isExplicitNonsense = nonsensePatterns.some(p => textLower === p || textLower.startsWith(p + ' '));
  const isRepeatingGibberish = /(.)\1{3,}/.test(textLower);

  // Extract key question terms & domain synonyms
  const stopWords = new Set([
    'what', 'how', 'why', 'when', 'where', 'which', 'who', 'does', 'do', 'did', 'is', 'are', 'was',
    'were', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'about',
    'your', 'you', 'explain', 'describe', 'tell', 'us', 'me', 'can', 'could', 'would', 'should'
  ]);
  const qWords = qLower.split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w));
  const aWords = textLower.split(/\W+/).filter(w => w.length > 2);
  const matchedQWords = qWords.filter(w => textLower.includes(w));

  // Skill match from TargetJob
  const skillsList = targetJobContext?.required_skills || [];
  const matchedSkills = skillsList.filter(s => textLower.includes(s.toLowerCase()));

  // Domain synonyms for semantic overlap
  const domainSynonyms = ['price', 'cost', 'budget', 'value', 'roi', 'client', 'customer', 'deal', 'sales', 'revenue', 'system', 'app', 'user', 'team', 'data', 'process', 'method', 'strategy', 'manage', 'solution', 'project', 'approach', 'issue', 'challenge', 'result', 'impact'];
  const matchedSynonyms = domainSynonyms.filter(s => textLower.includes(s));

  // CHECK 2: UNRELATED OR RANDOM ANSWER
  const zeroRelevance = (qWords.length > 0 && matchedQWords.length === 0 && matchedSkills.length === 0 && matchedSynonyms.length === 0);
  const isUnrelatedOrRandom = text.length < 3 ||
    isExplicitNonsense ||
    isRepeatingGibberish ||
    zeroRelevance;

  if (isUnrelatedOrRandom) {
    const criteriaScores = {};
    evaluationCriteria.forEach(crit => { criteriaScores[crit] = 0; });

    const feedback = `The submitted response ("${text.substring(0, 60)}") is gibberish, random, or fails to address the question regarding "${qWords.slice(0, 3).join(' ') || safeRole}". Score is 0.`;
    const weaknesses = [
      `Directly answer the interview question regarding ${qWords.slice(0, 2).join(' ') || safeRole}`,
      'Avoid random, off-topic, or single-word entries'
    ];

    return {
      isRelevant: false,
      evaluationReason: 'Unrelated / Random Answer',
      score: 0,
      criteriaScores,
      feedback,
      strengths: [],
      weaknesses,
      improvements: weaknesses
    };
  }

  // CHECK 3: RELEVANT ANSWER (Calculate 5 specific criteria scores)
  const relevanceRatio = qWords.length > 0 ? (matchedQWords.length / qWords.length) : 0.6;
  const answerRelevanceScore = Math.min(100, Math.max(20, Math.round(relevanceRatio * 70 + (aWords.length > 5 ? 30 : 10))));

  const skillMatchCount = matchedSkills.length;
  const accuracyScore = Math.min(100, Math.max(15, Math.round(answerRelevanceScore * 0.85 + (skillMatchCount * 10))));

  const techKeywords = ['architecture', 'algorithm', 'system', 'code', 'function', 'framework', 'database', 'api', 'server', 'data', 'design', 'process', 'method', 'logic', 'implementation'];
  const matchedTech = techKeywords.filter(k => textLower.includes(k)).length;
  const technicalKnowledgeScore = Math.min(100, Math.max(15, Math.round(50 + (matchedTech * 12) + (skillMatchCount * 8))));

  const problemKeywords = ['because', 'example', 'solution', 'approach', 'solved', 'issue', 'resolved', 'strategy', 'handled', 'optimized', 'result', 'impact'];
  const matchedProblem = problemKeywords.filter(k => textLower.includes(k)).length;
  const problemSolvingScore = Math.min(100, Math.max(15, Math.round(45 + (matchedProblem * 14) + (aWords.length > 15 ? 15 : 5))));

  const answerQualityScore = Math.min(100, Math.max(20, Math.round((answerRelevanceScore + accuracyScore + technicalKnowledgeScore + problemSolvingScore) / 4 + (aWords.length > 20 ? 10 : 0))));

  const criteriaScores = {
    'Answer Relevance': answerRelevanceScore,
    'Accuracy': accuracyScore,
    'Technical Knowledge': technicalKnowledgeScore,
    'Problem Solving': problemSolvingScore,
    'Answer Quality': answerQualityScore
  };

  const calculatedScore = Math.round(
    (answerRelevanceScore + accuracyScore + technicalKnowledgeScore + problemSolvingScore + answerQualityScore) / 5
  );

  let feedback = '';
  let strengths = [];
  let weaknesses = [];

  if (calculatedScore < 50) {
    feedback = `The response touches briefly on ${qWords.slice(0, 2).join(' ')} but lacks depth, accuracy, and technical detail expected for a ${safeRole}.`;
    strengths = [`Attempted to address ${qWords[0] || 'the question'}`];
    weaknesses = [`Elaborate on technical implementation details for ${safeRole}`, 'Include specific tools, frameworks, or methodologies used in your experience'];
  } else if (calculatedScore < 75) {
    feedback = `Solid answer covering fundamental concepts of ${qWords.slice(0, 2).join(' ')}. To reach a top score, provide deeper architectural details and quantifiable outcomes.`;
    strengths = [`Clear understanding of core concepts in ${qWords[0] || safeRole}`, 'Direct response to the prompt'];
    weaknesses = ['Apply the STAR method (Situation, Task, Action, Result) with measurable metrics', `Highlight proficiency in required skills such as ${skillsList.slice(0, 2).join(', ') || 'core tools'}`];
  } else {
    feedback = `Excellent, comprehensive answer demonstrating strong domain expertise in ${safeRole} and direct alignment with required skills (${matchedSkills.join(', ') || 'technical concepts'}).`;
    strengths = [`In-depth knowledge of ${qWords.slice(0, 2).join(' ')}`, `Strong technical communication relevant to ${safeRole}`];
    weaknesses = ['Maintain this structured analytical approach in real interviews'];
  }

  return {
    isRelevant: true,
    evaluationReason: 'Relevant Answer',
    score: calculatedScore,
    criteriaScores,
    feedback,
    strengths,
    weaknesses,
    improvements: weaknesses
  };
};

/**
 * 2. Evaluate Answer against Job Role & Criteria
 */
const evaluateAnswer = async ({
  questionIndex = 0,
  category = 'Technical',
  jobRole = 'Software Engineer',
  difficulty = 'Intermediate',
  questionText = '',
  answerText = '',
  transcript = '',
  criteria = [],
  targetJobContext = null
}) => {
  // const model = getGeminiModel();
  const model = true;
  const evaluationCriteria = criteria && criteria.length > 0 ? criteria : getRoleEvaluationCriteria(category, jobRole);
  const textContent = (answerText || transcript || '').trim();
  const textLower = textContent.toLowerCase();

  const tjRole = targetJobContext?.target_job_role || jobRole || 'Software Engineer';
  const tjCompany = targetJobContext?.target_company || '';
  const tjIndustry = targetJobContext?.target_industry || '';
  const tjExp = targetJobContext?.experience || '';
  const skillsList = targetJobContext?.required_skills || [];
  const skillsStr = Array.isArray(skillsList) && skillsList.length > 0 ? skillsList.join(', ') : 'Standard role skills';

  console.log('\n=================== [AI EVALUATION REQUEST] ===================');
  console.log(`Question Index: ${questionIndex}`);
  console.log(`Question Text: "${questionText}"`);
  console.log(`Candidate Answer: "${textContent}"`);
  console.log(`Target Job Role: ${tjRole}`);
  console.log(`Required Skills: ${skillsStr}`);
  console.log('===============================================================\n');

  // Clean text for placeholder detection
  const cleanTextLower = textLower.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();

  const notAnsweredPlaceholders = [
    '',
    'no answer provided',
    'no answer provided.',
    'spoken video response recorded',
    'spoken video response recorded.',
    'spoken video response',
    'video response recorded',
    'no answer',
    'not answered',
    'no response',
    'none',
    'nothing',
    'n/a',
    'na',
    'idk',
    'dont know',
    "don't know",
    'no idea',
    'click start answer and speak naturally'
  ];

  const isNotAnswered = !textContent ||
    textContent.length < 2 ||
    notAnsweredPlaceholders.includes(cleanTextLower);

  // CASE 1: NOT ANSWERED (Empty, missing, or placeholder response)
  if (isNotAnswered) {
    const noAnsResult = {
      isRelevant: false,
      evaluationReason: 'Not Answered',
      score: 0,
      criteriaScores: Object.fromEntries(evaluationCriteria.map(crit => [crit, 0])),
      feedback: 'No answer was provided for this question. Submit a written or spoken response to receive AI evaluation scores.',
      strengths: [],
      weaknesses: ['Submit a written or spoken response to receive evaluation points for this question.'],
      improvements: ['Submit a written or spoken response to receive evaluation points for this question.']
    };

    console.log('[AI EVALUATION SKIPPED] (Not Answered):', {
      question: questionText,
      answer: textContent,
      isRelevant: false,
      evaluationReason: 'Not Answered',
      score: 0,
      feedback: noAnsResult.feedback
    });

    return noAnsResult;
  }

  // CASE 2: UNRELATED / RANDOM ANSWER PRE-CHECK (Explicit gibberish)
  const explicitNonsense = [
    'gdsgg', 'asdf', '123', 'qwerty', 'abc', 'xyz', 'foo', 'bar', 'abcdxyz',
    'random', 'gibberish', 'sdgfsd', 'gdfg', 'whatever'
  ];
  const isExplicitGibberish = explicitNonsense.some(p => cleanTextLower === p || cleanTextLower.startsWith(p + ' '));

  if (isExplicitGibberish) {
    const gibberishResult = {
      isRelevant: false,
      evaluationReason: 'Unrelated / Random Answer',
      score: 0,
      criteriaScores: Object.fromEntries(evaluationCriteria.map(crit => [crit, 0])),
      feedback: `The submitted response ("${textContent}") is completely unrelated, random text, or fails to address the question. Score is 0.`,
      strengths: [],
      weaknesses: ['Directly address the interview question asked.', 'Avoid submitting random text or gibberish.'],
      improvements: ['Directly address the interview question asked.']
    };

    console.log('[AI PARSED EVALUATION RESULT] (Unrelated / Random Answer):', {
      question: questionText,
      answer: textContent,
      isRelevant: false,
      evaluationReason: 'Unrelated / Random Answer',
      score: 0,
      feedback: gibberishResult.feedback
    });

    return gibberishResult;
  }

  if (model && textContent.length > 0) {
    try {
      const prompt = `You are an expert AI interviewer evaluating a candidate's text answer. Evaluate ONLY against the exact interview question asked and the selected Target Job context.

CRITICAL ANSWER QUALITY RULE:

The candidate must demonstrate actual knowledge or reasoning.

Merely repeating, paraphrasing, or restating the interview question is NOT an answer.

Examples:

Question:
"What is React.js and why is it useful?"

Answer:
"explain what React.js is and why it is useful"

This is NOT a meaningful answer.

Question:
"What is the difference between JavaScript and Python?"

Answer:
"the difference between JavaScript and Python"

This is NOT a meaningful answer.

Question:
"What is Docker?"

Answer:
"Docker is a containerization platform that packages an application and its dependencies into a portable container."

This IS a meaningful answer.

Do not award Technical Knowledge points merely because the candidate mentions keywords from the question.

Do not award Accuracy points when the candidate provides no factual claim that can be evaluated.

Do not award Problem Solving points unless the candidate actually demonstrates reasoning, methodology, or problem-solving.

A candidate who merely repeats the question should receive 0 for all five criteria.

Target Job Context:
- Target Job Role: ${tjRole}
- Target Industry: ${tjIndustry || 'N/A'}
- Target Company: ${tjCompany || 'N/A'}
- Candidate Experience Level: ${tjExp || 'N/A'}
- Required Skills: ${skillsStr}

Exact Interview Question Asked:
"${questionText}"

Candidate's Submitted Answer:
"${textContent}"

EVALUATION CRITERIA (SCORE EACH CRITERION FROM 0 TO 100):
1. "Answer Relevance": How directly and accurately the answer addresses the question.
2. "Accuracy": Technical correctness, precision, and factual validity of the response.
3. "Technical Knowledge": Depth of domain expertise, tools, technologies, and concepts.
4. "Problem Solving": Logical reasoning, structured problem-solving approach, and practical application.
5. "Answer Quality": Structure, completeness, clarity, and articulation of the candidate's text answer.

STRICT EVALUATION INSTRUCTIONS:
1. RELEVANCE GATE:
   - If candidate answer is empty, "No answer provided", random/gibberish (e.g. "gdsgg", "asdf", "123", "abcdxyz"), completely off-topic, or fails to address the question:
     YOU MUST SET "isRelevant": false, ALL 5 CRITERIA SCORES TO 0, AND "score": 0.
2. RELEVANT ANSWER EVALUATION:
   - Score each of the 5 criteria independently (0-100) based on candidate's submitted text.
   - The overall "score" MUST BE EQUAL TO THE AVERAGE OF ALL 5 CRITERIA SCORES: Math.round((Answer Relevance + Accuracy + Technical Knowledge + Problem Solving + Answer Quality) / 5).

REQUIRED JSON SCHEMA RETURN:
{
  "isRelevant": true,
  "evaluationReason": "Relevant Answer",
  "score": 84,
  "criteriaScores": {
    "Answer Relevance": 90,
    "Accuracy": 85,
    "Technical Knowledge": 80,
    "Problem Solving": 80,
    "Answer Quality": 85
  },
  "feedback": "Detailed commentary...",
  "strengths": ["Specific strength 1"],
  "weaknesses": ["Specific area for improvement 1"],
  "improvements": ["Specific area for improvement 1"]
}
  
IMPORTANT SCORING RULES:

- Evaluate ONLY what is asked in the interview question.
- Do NOT penalize the candidate for not mentioning a company unless the question explicitly asks about that company.
- Do NOT invent requirements that are not present in the Target Job context.
- Do NOT assume the candidate is interviewing at Google or any other company unless Target Job Company explicitly says so.
- A short answer should receive a lower Answer Quality/Technical Knowledge score when appropriate, but do not assign high scores merely because the answer repeats the question.
- Do not award Technical Knowledge points unless the candidate demonstrates actual technical knowledge.
- Do not award Problem Solving points unless the answer demonstrates reasoning, methodology, or practical problem solving.
`;

      // const result = await model.generateContent(prompt);
      // const responseText = result?.response?.text ? result.response.text() : '';
      const responseText = await generateWithAI(prompt,{ jsonMode: true });
      console.log('[AI RAW RESPONSE]:', responseText);

      const parsed = cleanJson(responseText);
      if (parsed && typeof parsed.score === 'number') {
        if (parsed.isRelevant === false || parsed.isRelevant === 'false' || parsed.score === 0 || !parsed.isRelevant) {
          parsed.isRelevant = false;
          parsed.evaluationReason = parsed.evaluationReason || 'Unrelated / Random Answer';
          parsed.score = 0;
          parsed.strengths = [];
          parsed.weaknesses = Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
            ? parsed.weaknesses
            : ['Answer does not address the interview question directly.'];
          parsed.improvements = parsed.weaknesses;
        } else {
          parsed.isRelevant = true;
          parsed.evaluationReason = 'Relevant Answer';
          parsed.score = Math.min(100, Math.max(1, Math.round(parsed.score)));
          parsed.strengths = Array.isArray(parsed.strengths) ? parsed.strengths : [];
          parsed.weaknesses = Array.isArray(parsed.weaknesses) ? parsed.weaknesses : (parsed.improvements || []);
          parsed.improvements = parsed.weaknesses;
        }

        parsed.criteriaScores = sanitizeMapKeys(parsed.criteriaScores);
        console.log('[AI PARSED EVALUATION RESULT]:', {
          question: questionText,
          answer: textContent,
          isRelevant: parsed.isRelevant,
          evaluationReason: parsed.evaluationReason,
          score: parsed.score,
          feedback: parsed.feedback,
          strengths: parsed.strengths,
          weaknesses: parsed.weaknesses
        });
        return parsed;
      }
    } catch (err) {
      console.error('[AI EVALUATION FAILURE CAUSE]: Gemini API call failed:', err.message);
    }
  } else if (!model) {
    console.error('[AI EVALUATION FAILURE CAUSE]: Gemini API key (AI_API_KEY) is unconfigured in server/.env');
  }

  // Fallback to independent semantic evaluator
  const evalResult = performIndependentSemanticEvaluation({
    category,
    jobRole: tjRole,
    difficulty,
    questionText,
    answerText: textContent,
    criteria: evaluationCriteria,
    targetJobContext
  });
  evalResult.criteriaScores = sanitizeMapKeys(evalResult.criteriaScores);

  console.log('[AI PARSED EVALUATION RESULT] (Independent Evaluator):', {
    question: questionText,
    answer: textContent,
    isRelevant: evalResult.isRelevant,
    evaluationReason: evalResult.evaluationReason,
    score: evalResult.score,
    feedback: evalResult.feedback,
    strengths: evalResult.strengths,
    weaknesses: evalResult.weaknesses
  });

  return evalResult;
};

/**
 * 2. Evaluate Answer in batch
 */
const evaluateAnswerBatch = async ({
  questions,
  answers,
  targetJob,
}) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('No questions provided for batch evaluation.');
  }

  if (!Array.isArray(answers)) {
    throw new Error('Answers must be an array.');
  }

  /*
   * Keep the batch small.
   *
   * We are targeting 5 questions per AI request.
   */
  const evaluationItems = questions.map((question, index) => {
    const answer = answers[index];

    return {
      questionIndex: index,
      questionText:
        question.questionText ||
        question.question ||
        '',

      candidateAnswer:
        typeof answer === 'string'
          ? answer
          : answer?.answer ||
            answer?.transcript ||
            answer?.text ||
            '',
    };
  });

  console.log(
    `\n=================== [AI BATCH EVALUATION] ===================`
  );

  console.log(
    `Batch size: ${evaluationItems.length}`
  );

  evaluationItems.forEach((item) => {
    console.log(
      `Q${item.questionIndex}: ${item.questionText}`
    );

    console.log(
      `Answer: ${item.candidateAnswer}`
    );
  });

  console.log(
    `==============================================================\n`
  );

  /*
   * Create compact target-job context.
   *
   * We don't need to send the entire job description
   * repeatedly for every answer.
   */
  const jobContext = `
Target Job Role: ${
    targetJob?.target_job_role || 'Not specified'
  }

Target Company: ${
    targetJob?.target_company || 'Not specified'
  }

Target Industry: ${
    targetJob?.target_industry || 'Not specified'
  }

Required Skills: ${
    Array.isArray(targetJob?.required_skills)
      ? targetJob.required_skills.join(', ')
      : targetJob?.required_skills ||
        'Not specified'
  }
`.trim();

  const prompt = `
You are an expert technical and HR interview evaluator.

Evaluate EACH candidate answer independently.

${jobContext}

CRITICAL RULES:

1. Evaluate the candidate's answer against the EXACT question.

2. Merely repeating, paraphrasing, or restating the question
   is NOT a meaningful answer.

3. Mentioning keywords from the question does NOT demonstrate
   technical knowledge.

4. Do not invent requirements that are not present in the
   question or target job context.

5. Do not assume a company-specific requirement unless it is
   explicitly present in the target job context or question.

6. If the candidate gives no meaningful answer:
   - isRelevant = false
   - score = 0
   - all criteria scores = 0

7. Do not give Technical Knowledge points unless the candidate
   demonstrates actual knowledge.

8. Do not give Problem Solving points unless the candidate
   demonstrates reasoning, methodology, troubleshooting,
   decision-making, or practical problem solving.

9. Score each criterion from 0 to 100.

10. The final score MUST be calculated by your backend.
    Do NOT rely on your own calculated overall score.

EVALUATION CRITERIA:

- Answer Relevance
- Accuracy
- Technical Knowledge
- Problem Solving
- Answer Quality

Return ONLY valid JSON.

Return this exact structure:

{
  "evaluations": [
    {
      "questionIndex": 0,
      "isRelevant": true,
      "evaluationReason": "Relevant Answer",
      "criteriaScores": {
        "Answer Relevance": 0,
        "Accuracy": 0,
        "Technical Knowledge": 0,
        "Problem Solving": 0,
        "Answer Quality": 0
      },
      "feedback": "",
      "strengths": [],
      "weaknesses": [],
      "improvements": []
    }
  ]
}

There MUST be exactly one evaluation object for every
question provided.

The questionIndex MUST match the questionIndex supplied
in the input.

INPUT QUESTIONS AND ANSWERS:

${JSON.stringify(evaluationItems, null, 2)}
`.trim();

  try {
    const responseText = await generateWithAI(
      prompt,
      {
        jsonMode: true,
        maxTokens: 3000,
      }
    );

    console.log(
      '[AI BATCH RAW RESPONSE]:',
      responseText
    );

    const parsed = cleanJson(responseText);

    if (
      !parsed ||
      !Array.isArray(parsed.evaluations)
    ) {
      throw new Error(
        'AI batch evaluation returned invalid JSON structure.'
      );
    }

    /*
     * Build a map so that results are always matched
     * with the correct question.
     */
    const resultMap = new Map();

    for (const evaluation of parsed.evaluations) {
      const questionIndex =
        Number(evaluation.questionIndex);

      if (
        Number.isInteger(questionIndex) &&
        questionIndex >= 0 &&
        questionIndex < evaluationItems.length
      ) {
        resultMap.set(
          questionIndex,
          evaluation
        );
      }
    }

    /*
     * Make sure the AI returned every evaluation.
     */
    if (
      resultMap.size !==
      evaluationItems.length
    ) {
      throw new Error(
        `AI returned ${resultMap.size} evaluations, ` +
        `but ${evaluationItems.length} were expected.`
      );
    }

    /*
     * IMPORTANT:
     *
     * We calculate the final score ourselves.
     * The LLM does NOT control the final score.
     */
    const evaluations =
      evaluationItems.map((item) => {
        const aiEvaluation =
          resultMap.get(item.questionIndex);

        const criteria =
          aiEvaluation.criteriaScores || {};

        const scoreValues = [
          Number(
            criteria['Answer Relevance']
          ),
          Number(
            criteria['Accuracy']
          ),
          Number(
            criteria['Technical Knowledge']
          ),
          Number(
            criteria['Problem Solving']
          ),
          Number(
            criteria['Answer Quality']
          ),
        ];

        const validScores =
          scoreValues.filter(
            (score) =>
              Number.isFinite(score) &&
              score >= 0 &&
              score <= 100
          );

        let finalScore = 0;

        if (validScores.length === 5) {
          finalScore = Math.round(
            validScores.reduce(
              (sum, score) =>
                sum + score,
              0
            ) / 5
          );
        }

        /*
         * Protect against the LLM giving high scores
         * to an answer that is essentially empty.
         */
        const candidateAnswer =
          item.candidateAnswer.trim();

        if (!candidateAnswer) {
          finalScore = 0;
        }

        return {
          questionIndex:
            item.questionIndex,

          question:
            item.questionText,

          answer:
            item.candidateAnswer,

          isRelevant:
            Boolean(
              aiEvaluation.isRelevant
            ),

          evaluationReason:
            aiEvaluation.evaluationReason ||
            'Evaluated',

          score:
            finalScore,

          criteriaScores: {
            'Answer Relevance':
              Number.isFinite(
                scoreValues[0]
              )
                ? scoreValues[0]
                : 0,

            Accuracy:
              Number.isFinite(
                scoreValues[1]
              )
                ? scoreValues[1]
                : 0,

            'Technical Knowledge':
              Number.isFinite(
                scoreValues[2]
              )
                ? scoreValues[2]
                : 0,

            'Problem Solving':
              Number.isFinite(
                scoreValues[3]
              )
                ? scoreValues[3]
                : 0,

            'Answer Quality':
              Number.isFinite(
                scoreValues[4]
              )
                ? scoreValues[4]
                : 0,
          },

          feedback:
            aiEvaluation.feedback ||
            '',

          strengths:
            Array.isArray(
              aiEvaluation.strengths
            )
              ? aiEvaluation.strengths
              : [],

          weaknesses:
            Array.isArray(
              aiEvaluation.weaknesses
            )
              ? aiEvaluation.weaknesses
              : [],

          improvements:
            Array.isArray(
              aiEvaluation.improvements
            )
              ? aiEvaluation.improvements
              : [],
        };
      });

    console.log(
      '[AI BATCH PARSED EVALUATIONS]:'
    );

    evaluations.forEach((evaluation) => {
      console.log(
        `Q${evaluation.questionIndex}: ` +
        `Score ${evaluation.score}`
      );
    });

    return evaluations;

  } catch (error) {
    console.error(
      '[AI BATCH EVALUATION FAILED]:',
      error.message
    );

    throw error;
  }
};


/**
 * 3. Generate Follow-up Question dynamically
 */
const generateFollowUpQuestion = async ({
  category,
  jobRole,
  difficulty = 'Intermediate',
  questionText,
  answerText
}) => {
  // const model = getGeminiModel();
  const model = true;

  if (model && answerText && answerText.trim().length > 0) {
    try {
      const prompt = `You are an interactive AI Interviewer.
Job Role: "${jobRole}" (${category}).
Previous Question: "${questionText}"
Candidate Answer: "${answerText}"

Generate ONE sharp, relevant follow-up question based on the candidate's answer to test deeper understanding.
Return JSON ONLY:
{
  "followUpQuestion": "Smart follow up question string..."
}`;

      // const result = await model.generateContent(prompt);
      // const parsed = cleanJson(result.response.text());
      const responseText = await generateWithAI(prompt,{ jsonMode: true });
      const parsed = cleanJson(responseText);
      if (parsed && parsed.followUpQuestion) {
        return parsed.followUpQuestion;
      }
    } catch (err) {
      console.error('Gemini follow-up error, fallback engaged:', err.message);
    }
  }

  // Fallback follow-up
  return `Building on your point about "${answerText ? answerText.substring(0, 30) + '...' : 'that'}": How would you measure the overall impact or outcome of that approach in a fast-paced environment?`;
};

/**
 * 4. Generate Final Detailed Report & Hiring Recommendation
 */
const generateFinalReport = async ({
  category,
  jobRole,
  purpose = 'Practice',
  answers = [],
  duration = 15
}) => {
  const criteriaList = [
    'Answer Relevance',
    'Accuracy',
    'Technical Knowledge',
    'Problem Solving',
    'Answer Quality'
  ];
  
  if (answers.length === 0) {
    const emptyScores = {};
    criteriaList.forEach(c => { emptyScores[c] = 0; });
    return {
      overallScore: 0,
      roleSpecificScores: emptyScores,
      strengths: ["Attempted interview session"],
      weaknesses: ["No answers submitted"],
      recommendations: ["Complete all interview questions to receive full evaluation"],
      summary: "Interview was terminated early without submitted responses.",
      aiRecommendation: purpose === 'Recruitment' ? 'Needs Review' : 'Completed Practice'
    };
  }

  // Aggregate scores for each of the 5 criteria across all answers
  const aggregatedCriteria = {};
  criteriaList.forEach(c => { aggregatedCriteria[c] = 0; });

  answers.forEach(ans => {
    if (ans.criteriaScores) {
      const map = ans.criteriaScores instanceof Map ? Object.fromEntries(ans.criteriaScores) : ans.criteriaScores;
      criteriaList.forEach(crit => {
        const val = typeof map[crit] === 'number' ? map[crit] : (typeof ans.score === 'number' ? ans.score : 0);
        aggregatedCriteria[crit] += val;
      });
    } else {
      const s = typeof ans.score === 'number' ? ans.score : 0;
      criteriaList.forEach(crit => {
        aggregatedCriteria[crit] += s;
      });
    }
  });

  const roleSpecificScores = {};
  criteriaList.forEach(crit => {
    roleSpecificScores[crit] = Math.round(aggregatedCriteria[crit] / answers.length);
  });

  // Overall Score is calculated as average of the 5 criteria scores
  const criteriaValues = Object.values(roleSpecificScores);
  const overallScore = Math.round(criteriaValues.reduce((a, b) => a + b, 0) / criteriaValues.length);

  let aiRecommendation = 'Needs Review';
  if (overallScore >= 80) aiRecommendation = 'Strong Candidate';
  else if (overallScore < 60) aiRecommendation = 'Weak Candidate';
  if (purpose === 'Practice') aiRecommendation = 'Completed Practice';

  const strengths = [];
  const weaknesses = [];

  Object.entries(roleSpecificScores).forEach(([crit, score]) => {
    if (score >= 75) strengths.push(`High proficiency in ${crit} (${score}%)`);
    else weaknesses.push(`Opportunity to strengthen ${crit} (${score}%)`);
  });

  if (strengths.length === 0) strengths.push(`Demonstrated foundation for ${jobRole}`);
  if (weaknesses.length === 0) weaknesses.push("Maintain current performance with advanced mock drills");

  const recommendations = [
    `Practice role-specific scenario questions for ${jobRole}`,
    "Use STAR method (Situation, Task, Action, Result) when answering",
    `Focus on refining ${weaknesses[0] || 'technical knowledge and accuracy'}`
  ];

  const summary = `Candidate completed a ${purpose} ${category} interview for ${jobRole} scoring ${overallScore}%. Evaluated on Answer Relevance, Accuracy, Technical Knowledge, Problem Solving, and Answer Quality.`;

  const sanitizedRoleScores = sanitizeMapKeys(roleSpecificScores);

  return {
    overallScore,
    roleSpecificScores: sanitizedRoleScores,
    strengths,
    weaknesses,
    recommendations,
    summary,
    aiRecommendation
  };
};

module.exports = {
  generateInterviewQuestions,
  cleanAndDeduplicateQuestions,
  evaluateAnswer,
  evaluateAnswerBatch,
  generateFollowUpQuestion,
  generateFinalReport,
  validateQuestionDifficulty,
  validateQuestionRelevance
};
