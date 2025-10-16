const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Admission = require("../models/Admission");
const { throwError } = require("../utils/CustomError");

async function sendAdmissionMail(admission) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin:auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;">
      <h2 style="text-align:center; color:#1a73e8;">🎓 New Admission Application</h2>
      <p><strong>Program:</strong> ${admission.program}</p>
      <p><strong>Duration:</strong> ${admission.duration}</p>
      <p><strong>Fee:</strong> ₹${admission.fee}</p>
      <hr>
      <h3>Student Details</h3>
      <p><strong>Full Name:</strong> ${admission.fullName}</p>
      <p><strong>Email:</strong> ${admission.email}</p>
      <p><strong>Mobile Number:</strong> ${admission.mobileNumber}</p>
      <p><strong>Course Selected:</strong> ${admission.courseSelection}</p>
      <hr>
      <p style="color: #666;">This admission request was submitted on ${new Date(
        admission.createdAt
      ).toLocaleString()}.</p>
      <p style="font-size:13px; color:#888;">Please reply to this email if follow-up is needed.</p>
    </div>
  `;
  await transporter.sendMail({
    from: admission.email,
    to: "rdsirsa@gmail.com",
    subject: `New Admission Application - ${admission.fullName}`,
    html: htmlTemplate,
  });
  console.log("email sent to rdsirsa@gmail.com");
}

exports.createAdmission = async (data) => {
  let {
    fullName,
    email,
    mobileNumber,
    courseSelection,
    program,
    duration,
    fee,
  } = data;
  if (
    !fullName ||
    !email ||
    !mobileNumber ||
    !courseSelection ||
    !program ||
    !duration ||
    !fee
  ) {
    throwError(422, "please fill all required fields");
  }
  fullName = fullName?.toLowerCase();
  email = email?.toLowerCase();
  courseSelection = courseSelection?.toLowerCase();
  program = program?.toLowerCase();
  if (fee !== undefined && fee !== null) {
    fee = parseInt(fee, 10);
    if (isNaN(fee) || fee <= 0)
      throw new Error("Fee must be a valid positive number");
  }
  if (duration !== undefined && duration !== null) {
    duration = parseInt(duration, 10);
    if (isNaN(duration) || duration <= 0)
      throw new Error("Duration must be a valid positive number");
  }
  const admissionData = {
    fullName: fullName,
    email: email,
    courseSelection: courseSelection,
    mobileNumber: mobileNumber,
    program: program,
    duration: duration,
    fee: fee,
  };
  const admission = await Admission.create(admissionData);
  await sendAdmissionMail(admission);
  return admission;
};

exports.getAllAdmissions = async (query) => {
  let {
    search,
    program,
    courseSelection,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = query;
  const filter = {};
  if (courseSelection) filter.courseSelection = courseSelection;
  if (program) filter.program = program;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };
  const [data, total] = await Promise.all([
    Admission.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
    Admission.countDocuments(filter),
  ]);
  if (!data || total === 0) throwError(404, "No Admission found!");
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data,
  };
};

exports.getAdmissionById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throwError(400, "Invalid ID");
  const admission = await Admission.findById(id);
  if (!admission) throwError(404, "Admission not found");
  return admission;
};

exports.updateAdmission = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throwError(400, "Invalid ID");
  const updated = await Admission.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throwError(404, "Admission not found");
  return updated;
};

exports.deleteAdmission = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throwError(400, "Invalid ID");
  const deleted = await Admission.findByIdAndDelete(id);
  if (!deleted) throwError(404, "Admission not found");
};
