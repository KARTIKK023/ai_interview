const mongoose = require('mongoose');

const AskChat = require('../models/AskChat');
const AskMessage = require('../models/AskMessage');

const {
  streamChat,
  checkOllama,
  OLLAMA_MODEL,
} = require('../services/askAIService');

const getUserId = (req) => {
  return req.user?._id;
};

const generateChatTitle = (message) => {
  if (!message) {
    return 'New Chat';
  }

  const cleaned = message
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return 'New Chat';
  }

  if (cleaned.length <= 55) {
    return cleaned;
  }

  return `${cleaned.substring(0, 55).trim()}...`;
};

/**
 * GET /api/ask/chats
 */
const getChats = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const chats = await AskChat.find({
      user: userId,
    })
      .sort({
        lastMessageAt: -1,
      })
      .lean();

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ask/chats
 */
const createChat = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const chat = await AskChat.create({
      user: userId,
      title: 'New Chat',
      lastMessageAt: new Date(),
    });

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ask/chats/:chatId/messages
 */
const getMessages = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID.',
      });
    }

    const chat = await AskChat.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const messages = await AskMessage.find({
      chat: chatId,
      user: userId,
    })
      .sort({
        createdAt: 1,
      })
      .lean();

    res.json({
      success: true,
      chat,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/ask/chats/:chatId
 */
const deleteChat = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID.',
      });
    }

    const chat = await AskChat.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    await AskMessage.deleteMany({
      chat: chatId,
      user: userId,
    });

    await chat.deleteOne();

    res.json({
      success: true,
      message: 'Chat deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ask/chats/:chatId/stream
 */
const streamMessage = async (req, res, next) => {
  const userId = getUserId(req);

  const { chatId } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Message is required.',
    });
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return res.status(400).json({
      success: false,
      message: 'Message cannot be empty.',
    });
  }

  if (trimmedMessage.length > 10000) {
    return res.status(400).json({
      success: false,
      message: 'Message is too long.',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid chat ID.',
    });
  }

  try {
    const chat = await AskChat.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    /**
     * Get previous conversation.
     */
    const previousMessages = await AskMessage.find({
      chat: chatId,
      user: userId,
    })
      .sort({
        createdAt: 1,
      })
      .lean();

    /**
     * Limit context so very old conversations don't
     * grow the Ollama prompt indefinitely.
     */
    const contextMessages = previousMessages
      .slice(-40)
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    /**
     * Save user's message first.
     */
    await AskMessage.create({
      chat: chatId,
      user: userId,
      role: 'user',
      content: trimmedMessage,
      model: OLLAMA_MODEL,
      completed: true,
    });

    /**
     * First user message becomes chat title.
     */
    if (
      chat.title === 'New Chat' ||
      !chat.title
    ) {
      chat.title = generateChatTitle(
        trimmedMessage
      );
    }

    chat.lastMessageAt = new Date();

    await chat.save();

    /**
     * Add current message to context.
     */
    contextMessages.push({
      role: 'user',
      content: trimmedMessage,
    });

    /**
     * SSE headers.
     */
    res.status(200);

    res.setHeader(
      'Content-Type',
      'text/event-stream'
    );

    res.setHeader(
      'Cache-Control',
      'no-cache, no-transform'
    );

    res.setHeader(
      'Connection',
      'keep-alive'
    );

    res.setHeader(
      'X-Accel-Buffering',
      'no'
    );

    if (res.flushHeaders) {
      res.flushHeaders();
    }

    let assistantResponse = '';

    let clientDisconnected = false;

    req.on('close', () => {
      clientDisconnected = true;
    });

    /**
     * Tell frontend streaming has started.
     */
    res.write(
      `data: ${JSON.stringify({
        type: 'start',
        model: OLLAMA_MODEL,
        chatId,
      })}\n\n`
    );

    try {
      await streamChat({
        messages: contextMessages,

        signal: req.signal,

        onToken: (token) => {
          if (clientDisconnected) {
            return;
          }

          assistantResponse += token;

          res.write(
            `data: ${JSON.stringify({
              type: 'token',
              content: token,
            })}\n\n`
          );
        },

        onDone: async (fullResponse) => {
          assistantResponse = fullResponse;

          if (!clientDisconnected) {
            /**
             * Save ONE complete assistant message.
             */
            if (assistantResponse.trim()) {
              await AskMessage.create({
                chat: chatId,
                user: userId,
                role: 'assistant',
                content: assistantResponse,
                model: OLLAMA_MODEL,
                completed: true,
              });
            }

            chat.lastMessageAt = new Date();

            await chat.save();

            res.write(
              `data: ${JSON.stringify({
                type: 'done',
                message: {
                  role: 'assistant',
                  content: assistantResponse,
                },
              })}\n\n`
            );

            res.write(
              `data: ${JSON.stringify({
                type: 'complete',
              })}\n\n`
            );

            res.end();
          }
        },

        onError: (error) => {
          if (!clientDisconnected) {
            res.write(
              `data: ${JSON.stringify({
                type: 'error',
                message:
                  error.message ||
                  'AI generation failed.',
              })}\n\n`
            );

            res.end();
          }
        },
      });
    } catch (error) {
      console.error(
        '[ASK AI STREAM ERROR]',
        error
      );

      if (!clientDisconnected) {
        res.write(
          `data: ${JSON.stringify({
            type: 'error',
            message:
              error.message ||
              'Failed to generate response.',
          })}\n\n`
        );

        res.end();
      }
    }
  } catch (error) {
    console.error(
      '[ASK CONTROLLER ERROR]',
      error
    );

    if (!res.headersSent) {
      next(error);
    }
  }
};

/**
 * GET /api/ask/health
 */
const askHealth = async (req, res) => {
  try {
    const data = await checkOllama();

    const models =
      data?.models || [];

    const modelAvailable =
      models.some(
        (model) =>
          model.name === OLLAMA_MODEL ||
          model.model === OLLAMA_MODEL
      );

    res.json({
      success: true,
      ollama: true,
      model: OLLAMA_MODEL,
      modelAvailable,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      ollama: false,
      model: OLLAMA_MODEL,
      modelAvailable: false,
      message:
        'Unable to connect to Ollama.',
    });
  }
};

module.exports = {
  getChats,
  createChat,
  getMessages,
  deleteChat,
  streamMessage,
  askHealth,
};