const Plan = require("../models/plansModel");
const userModel = require("../models/userModel");

exports.createPlan = async (req, res) => {
  try {
    const { name, price, noOfQuestions, includesRemedies } = req.body;
    const newPlan = await Plan.create({
      name,
      price,
      noOfQuestions,
      includesRemedies,
    });
    res.status(201).json({ success: true, data: newPlan });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create plan.",
    });
  }
};

exports.buyPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user._id;
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found." });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    // const startDate = new Date();
    // const endDate = new Date(
    //   startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000
    // );
    user.activePlanId = plan._id;
    user.isPlanActive = true;
    //   startDate: startDate,
    //   endDate: endDate,
    //   remainingMessages: plan.maxMessages || 0,
    //   remainingSize: plan.maxMessageSize || 0,
    // };
    await user.save();
    res.status(200).json({
      success: true,
      message: `You have successfully purchased the plan: ${plan.name}.`,
      //  activePlan: plan,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans.",
    });
  }
};

exports.getPlanById = async (req, res) => {
  const { planId } = req.params;
  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found.",
      });
    }
    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan.",
    });
  }
};

exports.updatePlan = async (req, res) => {
  const { planId } = req.params;
  const { name, price, noOfQuestions, includesRemedies } = req.body;
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { name, price, noOfQuestions, includesRemedies },
      { new: true }
    );
    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found.",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update plan.",
    });
  }
};

exports.deletePlan = async (req, res) => {
  const { planId } = req.params;
  try {
    const deletedPlan = await Plan.findByIdAndDelete(planId);
    if (!deletedPlan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Plan deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete plan.",
    });
  }
};
