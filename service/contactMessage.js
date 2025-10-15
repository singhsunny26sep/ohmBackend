const mongoose = require("mongoose");
const ContactMessage = require("../models/ContactMessage");
const { throwError } = require("../utils/CustomError");

exports.createMessage = async (data) => {
  let { name, email, mobileNumber, message, subject } = data;
  if (!name || !email || !mobileNumber || !message) {
    throwError(422, "please fill all required fields");
  }
  name = name?.toLowerCase();
  email = email?.toLowerCase();
  message = message?.toLowerCase();
  subject = subject?.toLowerCase();
  const contactData = {
    name: name,
    email: email,
    message: message,
    mobileNumber: mobileNumber,
    subject: subject,
  };
  return await ContactMessage.create(contactData);
};

exports.getAllMessages = async (filters, pagination) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const matchStage = {};
  if (filters.name) matchStage.name = { $regex: filters.name, $options: "i" };
  if (filters.email)
    matchStage.email = { $regex: filters.email, $options: "i" };
  if (filters.mobileNumber)
    matchStage.mobileNumber = { $regex: filters.mobileNumber, $options: "i" };
  if (filters.subject)
    matchStage.subject = { $regex: filters.subject, $options: "i" };
  if (filters.status) matchStage.status = filters.status;
  if (filters.isRead !== undefined)
    matchStage.isRead = filters.isRead === "true";
  const pipeline = [
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
    {
      $project: {
        total: { $arrayElemAt: ["$totalCount.count", 0] },
        data: 1,
      },
    },
  ];
  const result = await ContactMessage.aggregate(pipeline);
  const total = result[0]?.total || 0;
  const data = result[0]?.data || [];
  if (total === 0) throwError(404, "No any message found!");
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    messages: data,
  };
};

exports.getMessageById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throwError(400, "Invalid ID");
  const msg = await ContactMessage.findById(id);
  if (!msg) throwError(404, "Message not found");
  return msg;
};

exports.updateMessage = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throwError(400, "Invalid ID");
  let { name, email, mobileNumber, message, subject } = data;
  if (name) {
    name = name?.toLowerCase();
    data.name = name;
  }
  if (email) {
    email = email?.toLowerCase();
    data.email = email;
  }
  if (message) {
    message = message?.toLowerCase();
    data.message = message;
  }
  if (subject) {
    subject = subject?.toLowerCase();
    data.subject = subject;
  }
  const updated = await ContactMessage.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!updated) throwError(404, "Message not found");
  return updated;
};

exports.deleteMessage = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throwError(400, "Invalid ID");
  const deleted = await ContactMessage.findByIdAndDelete(id);
  if (!deleted) throwError(404, "Message not found");
};
