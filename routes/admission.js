const express = require("express");
const router = express.Router();
const admissionController = require("../controllers/admission");

router.post("/create", admissionController.createAdmission);
router.get("/getAll", admissionController.getAllAdmissions);
router.get("/get/:id", admissionController.getAdmissionById);
router.put("/update/:id", admissionController.updateAdmission);
router.delete("/delete/:id", admissionController.deleteAdmission);

module.exports = router;
