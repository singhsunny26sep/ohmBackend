const { sendSuccess, sendError } = require("../utils/response");
const admissionService = require("../service/admission");

exports.createAdmission = async (req, res) => {
  try {
    const result = await admissionService.createAdmission(req.body);
    return sendSuccess(res, 201, "Application submitted successfully", result);
  } catch (err) {
    console.error("Error creating admission:", err);
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};

exports.getAllAdmissions = async (req, res) => {
  try {
    const result = await admissionService.getAllAdmissions(req.query);
    return sendSuccess(res, 200, "Admissions fetched successfully", result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

exports.getAdmissionById = async (req, res) => {
  try {
    const result = await admissionService.getAdmissionById(req.params.id);
    return sendSuccess(res, 200, "Admission fetched successfully", result);
  } catch (err) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};

exports.updateAdmission = async (req, res) => {
  try {
    const result = await admissionService.updateAdmission(
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, "Admission updated successfully", result);
  } catch (err) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};

exports.deleteAdmission = async (req, res) => {
  try {
    await admissionService.deleteAdmission(req.params.id);
    return sendSuccess(res, 200, "Admission deleted successfully");
  } catch (err) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error"
    );
  }
};
