const mongoose = require("mongoose");
const Session = require("../models/sessionModel");
const User = require("../models/userModel");
const Plan = require("../models/plansModel");
const { pagination } = require("../utils/pagination");

exports.createSession = async (req, res) => {
  try {
    const clientId = req.user?._id;
    const { sessionType, astrologerId /* startTime, chargePerMinute */ } =
      req.body;
    const client = await User.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const activePlanId = client.activePlanId;
    if (!client.isPlanActive || !activePlanId) {
      return res.status(403).json({
        success: false,
        message:
          "No active plan found. Please purchase a plan to initiate call.",
      });
    }
    const activePlan = await Plan.findById(activePlanId);
    if (!activePlan) {
      return res.status(404).json({
        success: false,
        message: "Sorry unavailable plan service! try again later",
      });
    }
    const astrologer = await User.findById(astrologerId);
    if (!astrologer) {
      return res
        .status(404)
        .json({ success: false, message: "Astrologer not found" });
    }
    const newSession = await Session.create({
      sessionType,
      astrologerId,
      clientId,
      plandId: activePlanId,
      startTime: new Date(), // startTime ? startTime :
      // chargePerMinute,
      status: "ongoing",
    });
    res.status(201).json({ success: true, data: newSession });
  } catch (error) {
    console.log("error on creating session", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const { limit = 10, offset = 0, sessionType } = req.query;
    const filter = {};
    if (req.user.role === "astrologer") {
      filter.astrologerId = req.user._id;
    } else if (req.user.role === "customer") {
      filter.clientId = req.user._id;
    } else {
      return res.status(403).json({
        success: false,
        message: "User role is not authorized to access this route",
      });
    }
    if (sessionType) filter.sessionType = sessionType;
    const sessions = await Session.find(filter)
      .populate("astrologerId", "firstName lastName email")
      .populate("clientId", "firstName lastName email")
      .skip(Number(offset))
      .limit(Number(limit))
      .sort({ startTime: -1 });
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSession = async (req, res, next) => {
  const { endTime, status, isPaid } = req.body;
  const sessionId = req.params.id;
  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    session.endTime = endTime || session.endTime;
    session.status = status || session.status;
    session.isPaid = isPaid !== undefined ? isPaid : session.isPaid;
    if (session.endTime && session.status === "completed") {
      session.duration =
        (new Date(session.endTime) - new Date(session.startTime)) / 60000; // in minutes
      session.totalCharge = session.duration * session.chargePerMinute;
      session.earnings = session.totalCharge;
    }
    const updatedSession = await session.save();
    res.status(200).json({ success: true, data: updatedSession });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getConnectedClients = async (req, res) => {
  try {
    const astrologerId = req.user._id;
    console.log("astrologerId", astrologerId);
    const sessionsWithClientDetails = await Session.aggregate([
      {
        $match: { astrologerId: astrologerId },
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "clientDetails",
        },
      },
      {
        $unwind: "$clientDetails",
      },
      {
        $project: {
          sessionId: "$_id",
          sessionType: 1,
          duration: 1,
          status: 1,
          startTime: 1,
          endTime: 1,
          price: 1,
          clientId: "$customerId",
          firstName: "$clientDetails.firstName",
          lastName: "$clientDetails.lastName",
          email: "$clientDetails.email",
          profilePic: "$clientDetails.profilePic",
        },
      },
    ]);
    res.status(200).json({ success: true, data: sessionsWithClientDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConnectedAstrologers = async (req, res) => {
  try {
    const clientId = req.user._id;
    console.log("clientId", clientId);
    const sessionsWithAstrologerDetails = await Session.aggregate([
      {
        $match: { customerId: clientId },
      },
      {
        $lookup: {
          from: "users",
          localField: "astrologerId",
          foreignField: "_id",
          as: "astrologerDetails",
        },
      },
      {
        $unwind: "$astrologerDetails",
      },
      {
        $project: {
          sessionId: "$_id",
          sessionType: 1,
          duration: 1,
          status: 1,
          startTime: 1,
          endTime: 1,
          price: 1,
          astrologerId: "$astrologerId",
          firstName: "$astrologerDetails.firstName",
          lastName: "$astrologerDetails.lastName",
          email: "$astrologerDetails.email",
          profilePic: "$astrologerDetails.profilePic",
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: sessionsWithAstrologerDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSessionsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required." });
    }
    const sessions = await Session.find({ clientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("astrologerId", "name")
      .populate("clientId", "name")
      .exec();
    const totalSessions = await Session.countDocuments({ clientId });
    res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      date,
      sessionType,
      isDaySession,
      isPaid,
      status,
      rating,
      minRating,
      maxRating,
      duration,
      minDuration,
      maxDuration,
      clientId,
      astrologerId,
      planId,
    } = req.query;
    console.log(req.query);
    const matchStage = {};
    if (req.user?.role === "customer") {
      matchStage.clientId = new mongoose.Types.ObjectId(req.user._id);
      if (astrologerId) {
        matchStage.astrologerId = new mongoose.Types.ObjectId(astrologerId);
      }
    } else if (req.user?.role === "astrologer") {
      matchStage.astrologerId = new mongoose.Types.ObjectId(req.user._id);
      if (clientId) matchStage.clientId = new mongoose.Types.ObjectId(clientId);
    } else {
      if (clientId) matchStage.clientId = new mongoose.Types.ObjectId(clientId);
      if (astrologerId) {
        matchStage.astrologerId = new mongoose.Types.ObjectId(astrologerId);
      }
    }
    if (planId) matchStage.planId = new mongoose.Types.ObjectId(planId);
    if (sessionType) matchStage.sessionType = sessionType;
    if (typeof isDaySession !== "undefined")
      matchStage.isDaySession = isDaySession === "true";
    if (typeof isPaid !== "undefined") matchStage.isPaid = isPaid === "true";
    if (status) matchStage.status = status;
    if (date) {
      const exactDate = new Date(date);
      const nextDay = new Date(exactDate);
      nextDay.setDate(nextDay.getDate() + 1);
      matchStage.startTime = { $gte: exactDate, $lt: nextDay };
    } else if (startDate || endDate) {
      matchStage.startTime = {};
      if (startDate) matchStage.startTime.$gte = new Date(startDate);
      if (endDate) matchStage.startTime.$lte = new Date(endDate);
    }
    if (rating) matchStage.rating = Number(rating);
    else if (minRating || maxRating) {
      matchStage.rating = {};
      if (minRating) matchStage.rating.$gte = Number(minRating);
      if (maxRating) matchStage.rating.$lte = Number(maxRating);
    }
    if (duration) matchStage.duration = Number(duration);
    else if (minDuration || maxDuration) {
      matchStage.duration = {};
      if (minDuration) matchStage.duration.$gte = Number(minDuration);
      if (maxDuration) matchStage.duration.$lte = Number(maxDuration);
    }
    console.log("match", matchStage);
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "astrologerId",
          foreignField: "_id",
          as: "astrologer",
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "planId",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$astrologer", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: -1 },
      },
    ];
    const data = await pagination(Session, pipeline, page, limit);
    // ------------------------- STATS CALCULATION -------------------------
    const statsPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCalls: {
            $sum: {
              $cond: [{ $ne: ["$sessionType", "chat"] }, 1, 0],
            },
          },
          totalDuration: { $sum: "$duration" },
          dayCalls: {
            $sum: {
              $cond: [{ $eq: ["$isDaySession", true] }, 1, 0],
            },
          },
          dayDuration: {
            $sum: {
              $cond: [{ $eq: ["$isDaySession", true] }, "$duration", 0],
            },
          },
          nightCalls: {
            $sum: {
              $cond: [{ $eq: ["$isDaySession", false] }, 1, 0],
            },
          },
          nightDuration: {
            $sum: {
              $cond: [{ $eq: ["$isDaySession", false] }, "$duration", 0],
            },
          },
        },
      },
    ];
    const statsResult = await Session.aggregate(statsPipeline);
    const stats = statsResult[0] || {
      totalCalls: 0,
      totalDuration: 0,
      dayCalls: 0,
      dayDuration: 0,
      nightCalls: 0,
      nightDuration: 0,
    };
    const result = { ...data, stats };
    return res.status(200).json({
      success: true,
      message: "Sessions fetched successfully",
      result,
    });
  } catch (error) {
    console.log("error on fetching session", error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Failed to end call" });
  }
};
