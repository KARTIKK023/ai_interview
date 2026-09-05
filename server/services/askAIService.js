const OLLAMA_BASE_URL =
  process.env.ASK_OLLAMA_BASE_URL ||
  process.env.OLLAMA_BASE_URL ||
  'http://127.0.0.1:11434';

const OLLAMA_MODEL =
  process.env.ASK_OLLAMA_MODEL ||
  'llama3.1:8b-instruct-q4_K_M';

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
 * Streams Ollama response.
 *
 * onToken(token)
 * onDone(fullResponse)
 * onError(error)
 *
 * Returns an AbortController so the caller can cancel the request.
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

  const ollamaMessages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...normalizeMessages(messages),
  ];

  let fullResponse = '';

  try {
    const response = await fetch(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: ollamaMessages,
          stream: true,

          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),

        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama returned ${response.status}: ${errorText}`
      );
    }

    if (!response.body) {
      throw new Error(
        'Ollama did not return a streaming response.'
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      const lines = buffer.split('\n');

      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        let data;

        try {
          data = JSON.parse(line);
        } catch (parseError) {
          continue;
        }

        if (data.message?.content) {
          const token = data.message.content;

          fullResponse += token;

          if (onToken) {
            onToken(token);
          }
        }

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.done) {
          break;
        }
      }
    }

    if (onDone) {
      onDone(fullResponse);
    }

    return {
      response: fullResponse,
      model: OLLAMA_MODEL,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        response: fullResponse,
        model: OLLAMA_MODEL,
        aborted: true,
      };
    }

    if (onError) {
      onError(error);
    }

    throw error;
  };
};

const checkOllama = async () => {
  const response = await fetch(
    `${OLLAMA_BASE_URL}/api/tags`
  );

  if (!response.ok) {
    throw new Error(
      `Unable to connect to Ollama (${response.status})`
    );
  }

  return response.json();
};

module.exports = {
  streamChat,
  checkOllama,
  OLLAMA_MODEL,
  OLLAMA_BASE_URL,
};