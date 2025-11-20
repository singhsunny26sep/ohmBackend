const express = require("express");
const router = express.Router();

const {
  createChatMessage,
  updateChatDetails,
  getChatHistory,
  getAllChatHistory,
  getChatHistoryUser,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { validatePlanAndWallet } = require("../helpers/validatePlanAndWallet");

router.get("/get-chats", protect, getChatHistory);
router.get("/get-chats-user", protect, getChatHistoryUser);
router.post("/", protect, validatePlanAndWallet, createChatMessage);
router.put("/:chatId", updateChatDetails);
router.get("/get-history", protect, getAllChatHistory);

module.exports = router;
