const express = require("express");
const router = express.Router();
const {
  createPlan,
  buyPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} = require("../controllers/plansController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/get-all-plans", getAllPlans);
router.post("/buy/:planId", protect, buyPlan);
router.use(protect, authorize("admin"));
router.post("/create-plans", createPlan);
router.get("/:planId", getPlanById);
router.put("/:planId", updatePlan);
router.delete("/:planId", deletePlan);

module.exports = router;
