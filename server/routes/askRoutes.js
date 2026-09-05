const express = require("express");

const router = express.Router();

const {
  createChat,
  getChats,
  getMessages,
  deleteChat,
  streamMessage,
  askHealth,
} = require("../controllers/askController");

const { protect } = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| ASK AI ROUTES
|--------------------------------------------------------------------------
*/

/*
 * GET /api/ask/health
 * Check Ollama + model availability
 */
router.get("/health", protect, askHealth);

/*
 * GET /api/ask/chats
 * Get all chats for logged-in user
 */
router.get("/chats", protect, getChats);

/*
 * POST /api/ask/chats
 * Create a new chat
 */
router.post("/chats", protect, createChat);

/*
 * GET /api/ask/chats/:chatId/messages
 * Get messages of a specific chat
 */
router.get(
  "/chats/:chatId/messages",
  protect,
  getMessages
);

/*
 * POST /api/ask/chats/:chatId/stream
 * Stream AI response
 */
router.post(
  "/chats/:chatId/stream",
  protect,
  streamMessage
);

/*
 * DELETE /api/ask/chats/:chatId
 * Delete a chat
 */
router.delete(
  "/chats/:chatId",
  protect,
  deleteChat
);

module.exports = router;