const express = require("express");
const ngrok = require("ngrok");
const cors = require("cors");
const morgan = require("morgan");
const msg91 = require("msg91");
const { createServer } = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 4500;
const msg91AuthKey = process.env.MSG91_AUTHKEY;
require("dotenv").config();
const app = express();
const connectDB = require("./config/dbConnection.js");
const Astrologer = require("./models/astrologerModel.js");
const chatModel = require("./models/chatModel.js");
const userModel = require("./models/userModel.js");
const planModel = require("./models/plansModel.js");
const sessionModel = require("./models/sessionModel.js");

const userRoutes = require("./routes/userRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const blogRoutes = require("./routes/blogRoutes.js");
const astrologerRoutes = require("./routes/astrologerRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const supportRoutes = require("./routes/supportRoutes.js");
const callHistoryRoutes = require("./routes/callHistoryRoutes.js");
const favoriteAstrologerRoutes = require("./routes/favoriteAstrologerRoutes");
const vendorRoutes = require("./routes/vendorRoutes.js");
const sessionRoutes = require("./routes/sessionRoutes.js");
const appointmentRoutes = require("./routes/appointmentRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const walletRoutes = require("./routes/walletRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes");
const thoughtRoutes = require("./routes/thoughtRoutes.js");
const plansRoutes = require("./routes/plansRoutes");
const bannerRoutes = require("./routes/bannerRoutes.js");
const navgrahRoutes = require("./routes/navgrahRoutes.js");
const horoscopeRoutes = require("./routes/horoscopeRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoutes.js");
const astrologerRequestRoutes = require("./routes/astrologerRequestRoutes.js");
const freeServicesRoutes = require("./routes/FreeServices/freeServicesRoutes.js");
const astroServicesRoutes = require("./routes/astroServices/astroServicesRoutes.js");
const audioVidedoCallingRoutes = require("./routes/audioVideoCallingRoute.js");
const contactMessageRoutes = require("./routes/contactMessage.js");
const admissionRoutes = require("./routes/admission.js");
const enquiryRouter = require("./routes/enquiry.js");
const {
  protect,
  socketAuthenticator,
} = require("./middleware/authMiddleware.js");
const {
  calculateSessionCharge,
} = require("./helpers/calculateSessionCharge.js");

const log = require("./utils/logger/logger.js").logger;
const logger = log.getLogger("AppApi");
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
connectDB();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/astrologers", astrologerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favoriteAstrologer", favoriteAstrologerRoutes);
app.use("/api/free-services", freeServicesRoutes);
app.use("/api/astro-services", astroServicesRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/call", callHistoryRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/thoughts", thoughtRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/navgrah", navgrahRoutes);
app.use("/api/horoscopes", horoscopeRoutes);
app.use("/api/astrologer-requests", astrologerRequestRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/enquiry", enquiryRouter);
app.use("/api/audiovideo", audioVidedoCallingRoutes);
app.use("/api/contact", contactMessageRoutes);
app.use("/api/admission", admissionRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

app.get("/", async (req, res) => {
  res.send("ASTROLOGY APP");
});

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `PORT ${PORT}`;
  switch (error.code) {
    case "EACCES":
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = httpServer.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
}

logger.info(`Server started. Listening on Port ${PORT}`);
httpServer.on("error", onError);
httpServer.on("listening", onListening);

app.use(express.urlencoded({ extended: true }));
io.use((socket, next) => {
  socketAuthenticator(socket, next);
});

const generateRoomId = (user1, user2) => {
  return [user1, user2].sort().join("_");
};

app.post("/api/getRoomId", protect, (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId) {
    return res
      .status(400)
      .json({ success: false, message: "User IDs are required" });
  }
  const userId = req.user._id;
  const roomId = generateRoomId(userId, recipientId);
  res.status(200).json({ success: true, roomId });
});

const sendSMS = (mobile, message) => {
  return new Promise((resolve, reject) => {
    const options = {
      authkey: msg91AuthKey,
      mobiles: mobile,
      message: message,
      sender: "ASTROW",
      route: 4,
      country: 91,
    };
    msg91.send(options, (error, response) => {
      if (error) {
        console.error("MSG91 Error:", error);
        reject(error);
      } else {
        console.log("SMS sent successfully:", response);
        resolve(response);
      }
    });
  });
};

const sendOTP = async (mobile, otp) => {
  const message = `Your OTP for Astrowani is ${otp}. Please do not share this OTP with anyone.`;
  return sendSMS(mobile, message);
};

app.locals.sendSMS = sendSMS;
app.locals.sendOTP = sendOTP;

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  let roomID;
  // ===================== JOIN ROOM =====================
  socket.on("join_room", async (roomId) => {
    try {
      if (!roomId) return socket.emit("error", { message: "Room ID missing" });
      roomID = roomId;
      socket.join(roomID);
      console.log(`🟢 ${socket.id} joined room ${roomID}`);
      const userId = socket?.user?._id;
      if (!userId) return;
      const user = await userModel.findById(userId).select("role");
      if (!user) return;
      if (["customer", "user"].includes(user.role)) {
        const welcomeMessage = {
          sender: "System",
          message:
            "Welcome to Astrowani India! Our expert astrologers are here to guide you through the planets and nakshatras.",
          hindiMessage:
            "ओहम एस्ट्रो में आपका स्वागत है! हमारे विशेषज्ञ ज्योतिषी आपको ग्रहों व नक्षत्रों के माध्यम से मार्गदर्शन करने के लिए तैयार हैं।",
        };
        io.to(roomID).emit("receiveMessage", welcomeMessage);
      }
    } catch (err) {
      console.error("Error in join_room:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  });
  // ===================== SEND MESSAGE =====================
  socket.on("sendMessage", async ({ roomId, sessionId, receiver, message }) => {
    try {
      if (!roomId || !sessionId || !receiver || !message)
        return socket.emit("error", {
          message: "Missing required message fields",
        });
      const sender = await userModel
        .findById(socket.user._id)
        .populate("activePlanId");
      console.log("Sender details:", sender);
      if (!sender) return socket.emit("error", { message: "User not found" });
      if (sender.role === "customer") {
        if (!sender.isPlanActive || !sender.activePlanId)
          return socket.emit("error", {
            message:
              "No active plan found. Please purchase a plan to initiate chat.",
          });
      }
      const chat = await chatModel.create({
        sessionId,
        sender: socket.user._id,
        receiver,
        message,
      });
      console.log("Chat message saved:", chat);
      io.to(roomId).emit("receiveMessage", chat);
      const messageCount = await chatModel.countDocuments({ sessionId });
      if (messageCount === 1 || messageCount % 5 === 0) {
        const thankYouMessage = {
          sender: "System",
          message:
            "Thank you for trusting us! We hope our astrology services have brought positivity and clarity to your life. Wishing you a brighter future!",
          hindiMessage:
            "हम पर विश्वास करने के लिए धन्यवाद! हमें आशा है कि हमारी ज्योतिष सेवाएं आपके जीवन में सकारात्मकता और स्पष्टता लाएंगी। आपका भविष्य उज्ज्वल हो!",
        };
        io.to(roomId).emit("receiveMessage", thankYouMessage);
      }
    } catch (err) {
      console.error("Error in sendMessage:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });
  // ===================== DISCONNECT =====================
  socket.on("disconnect", async () => {
    try {
      const userId = socket?.user?._id;
      if (!userId) {
        console.log(`⚪ Unknown user disconnected: ${socket.id}`);
        return;
      }
      const user = await userModel
        .findById(userId)
        .select("role isPlanActive activePlanId");
      if (!user) {
        console.log(`⚪ Disconnected user not found: ${socket.id}`);
        return;
      }
      if (["customer", "user"].includes(user.role)) {
        const updates = [];
        if (user.isPlanActive || user.activePlanId) {
          updates.push(
            userModel.findByIdAndUpdate(userId, {
              $set: { isPlanActive: false, activePlanId: null },
            })
          );
        }
        let plan;
        if (user.activePlanId) {
          plan = await planModel
            .findById(user.activePlanId)
            .select("name price");
        }
        const sessionUpdate = {
          status: "completed",
          endTime: new Date(),
        };
        // if (plan && plan.name?.toLowerCase() !== "free") {
        const activeSessions = await sessionModel.find({
          clientId: userId,
          sessionType: "chat",
          status: "ongoing",
        });
        for (const session of activeSessions) {
          const totalMessages = await chatModel.countDocuments({
            sessionId: session?._id,
          });
          const duration = Math.ceil(
            (session.endTime - session.startTime) / 60000 // in minutes
          );
          const astrologerUser = await userModel.findById(
            session?.astrologerId
          );
          if (!astrologerUser) {
            return socket.emit("error", {
              message: "Astrologer user not found",
            });
          }
          const astrologer = await Astrologer.findOne({
            userId: astrologerUser?._id,
          });
          if (!astrologer) {
            return socket.emit("error", {
              message: "Astrologer account not found",
            });
          }
          const { dayEarnPercentage, nightEarnPercentage } = astrologer;
          const { isDay, totalCharge } = calculateSessionCharge(
            session.startTime,
            plan.price,
            dayEarnPercentage,
            nightEarnPercentage
          );
          await sessionModel.findByIdAndUpdate(session._id, {
            $set: {
              ...sessionUpdate,
              isDaySession: isDay,
              earnPercentage: isDay ? dayEarnPercentage : nightEarnPercentage,
              totalCharge,
              totalMessages,
              duration,
            },
          });
        }
        // } else {
        //    const messageCount = await chatModel.countDocuments({ sessionId });
        //   updates.push(
        //     sessionModel.updateMany(
        //       { clientId: userId, status: "ongoing" },
        //       { $set: sessionUpdate }
        //     )
        //   );
        // }
        await Promise.all(updates);
        console.log(
          `🔴 ${user.role} (${userId}) disconnected → Plan deactivated & session(s) completed`
        );
      } else {
        console.log(
          `🟠 ${user.role} (${userId}) disconnected — no plan/session updates`
        );
      }
    } catch (err) {
      console.error("❌ Error in disconnect event:", err);
    }
  });
});

const handlePaymentCallback = async (req, res) => {
  try {
    const { merchantId, merchantTransactionId, transactionId } = req.body;
    console.log("Received payment callback:", req.body);
    if (merchantId !== process.env.MERCHANT_ID) {
      console.error("Invalid merchant ID:", merchantId);
      return res.status(400).json({ message: "Invalid merchant ID" });
    }
    const appointment = await Appointment.findById(merchantTransactionId);
    if (!appointment) {
      console.error("Appointment not found:", merchantTransactionId);
      return res.status(404).json({ message: "Appointment not found" });
    }
    const convertedId = `MID${merchantTransactionId}`;
    const checkStatusResponse = await checkPaymentStatus(
      merchantId,
      convertedId,
      appointment.createdBy.mobile
    );
    if (checkStatusResponse.success) {
      appointment.paymentStatus = checkStatusResponse.code;
      appointment.transactionId = transactionId;
      await appointment.save();
      res.json({ status: appointment.paymentStatus });
    } else {
      console.error("Payment verification failed:", checkStatusResponse);
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error processing payment callback:", error);
    res.status(500).json({ message: "Error processing payment" });
  }
};

const checkPaymentStatus = async (
  merchantId,
  merchantTransactionId,
  mobileNumber
) => {
  const saltKey = process.env.SALT_KEY;
  const saltIndex = process.env.SALT_INDEX;
  const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const stringToHash = `${endpoint}${saltKey}${mobileNumber}`;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const xVerify = `${sha256}###${saltIndex}`;
  try {
    const response = await axios.get(
      `https://api-preprod.phonepe.com/apis/pg-sandbox${endpoint}`,
      // `https://api.phonepe.com/apis/hermes/${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error checking payment status:",
      error.response?.data || error.message
    );
    throw new Error("Failed to check payment status with PhonePe");
  }
};

app.post("/api/payment-callback", handlePaymentCallback);

app.get("/", (req, res) => {
  res.send("Hello, your server is running via HTTPS!");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

httpServer.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (process.env.ENABLE_NGROK === "true") {
    const url = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTH_TOKEN,
      // subdomain: process.env.NGROK_SUBDOMAIN // must be set for custom subdomain
    });
    console.log(`Public URL: ${url}`);
  }
});
