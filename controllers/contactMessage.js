const { sendSuccess, sendError } = require("../utils/response");
const contactService = require("../service/contactMessage");

exports.createMessage = async (req, res) => {
  try {
    const result = await contactService.createMessage(req.body);
    return sendSuccess(res, 201, "Message sent successfully", result);
  } catch (err) {
    console.error("Error creating message:", err);
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
      email: req.query.email,
      mobileNumber: req.query.mobileNumber,
      subject: req.query.subject,
      status: req.query.status,
      isRead: req.query.isRead,
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };
    const result = await contactService.getAllMessages(filters, pagination);
    return sendSuccess(res, 200, "Messages fetched successfully", result);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const result = await contactService.getMessageById(req.params.id);
    return sendSuccess(res, 200, "Message fetched successfully", result);
  } catch (err) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const result = await contactService.updateMessage(req.params.id, req.body);
    return sendSuccess(res, 200, "Message updated successfully", result);
  } catch (err) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await contactService.deleteMessage(req.params.id);
    return sendSuccess(res, 200, "Message deleted successfully");
  } catch (err) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};
