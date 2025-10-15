const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactMessage");

router.post("/create", contactController.createMessage);
router.get("/getAll", contactController.getAllMessages);
router.get("/get/:id", contactController.getMessageById);
router.put("/update/:id", contactController.updateMessage);
router.delete("/delete/:id", contactController.deleteMessage);

module.exports = router;
