const Groq = require('groq-sdk');

const GROQ_API_KEY =
  process.env.ASK_GROQ_API_KEY ||
  process.env.GROQ_API_KEY ||
  '';

const GROQ_MODEL =
  process.env.ASK_GROQ_MODEL ||
  process.env.GROQ_MODEL ||
  'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `
You are Ask, the AI assistant inside HireSmart AI.

You are helpful, accurate, concise, and conversational.

Your job is to help students with:
- Programming
- Software development
- Interview preparation
- Career questions
- Resume and placement guidance
- Technical concepts
- General learning
- Problem solving

Rules:
1. Answer the user's actual question directly.
2. Explain difficult concepts simply when appropriate.
3. Use Markdown when it improves readability.
4. Use fenced code blocks for programming code.
5. Never pretend to have access to information you do not have.
6. If you are uncertain, clearly say so.
7. Do not unnecessarily repeat the user's question.
8. Keep responses useful rather than excessively verbose.
9. For coding questions, provide practical examples.
10. Maintain context from previous messages in the conversation.
`;

const getGroqClient = () => {
  if (!GROQ_API_KEY || GROQ_API_KEY.trim() === '') {
    throw new Error(
      'Ask AI: GROQ_API_KEY is missing. Set GROQ_API_KEY (or ASK_GROQ_API_KEY) in server/.env.'
    );
  }

  return new Groq({
    apiKey: GROQ_API_KEY,
  });
};

const normalizeMessages = (messages = []) => {
  return messages
    .filter(
      (message) =>
        message &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim()
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
};

/**
 * Streams a Groq chat completion response.
 *
 * onToken(token)
 * onDone(fullResponse)
 * onError(error)
 */
const streamChat = async ({
  messages,
  onToken,
  onDone,
  onError,
  signal,
}) => {
  const controller = new AbortController();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener(
        'abort',
        () => controller.abort(),
        { once: true }
      );
    }
  }

  const groq = getGroqClient();

  const groqMessages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...normalizeMessages(messages),
  ];

  let fullResponse = '';

  try {
    const stream = await groq.chat.completions.create(
      {
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
        stream: true,
      },
      {
        signal: controller.signal,
      }
    );

    for await (const chunk of stream) {
      const token = chunk?.choices?.[0]?.delta?.content;

      if (!token) {
        continue;
      }

      fullResponse += token;

      if (onToken) {
        onToken(token);
      }
    }

    if (onDone) {
      onDone(fullResponse);
    }

    return {
      response: fullResponse,
      model: GROQ_MODEL,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        response: fullResponse,
        model: GROQ_MODEL,
        aborted: true,
      };
    }

    if (onError) {
      onError(error);
    }

    throw error;
  }
};

/**
 * Checks that a Groq API key is configured.
 */
const checkGroq = async () => {
  try {
    const groq = getGroqClient();

    const response = await groq.models.list();

    const models = Array.isArray(response?.data)
      ? response.data
      : [];

    return {
      models,
    };
  } catch (error) {
    throw new Error(
      `Unable to connect to Groq: ${error.message}`
    );
  }
};

module.exports = {
  streamChat,
  checkGroq,
  GROQ_MODEL,
  GROQ_API_KEY,
};