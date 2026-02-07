const express = require("express");
const SkillClaim = require("../models/SkillClaim");
const User = require("../models/User");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { skill, description, proofLinks } = req.body;

    if (!skill) {
      return res.status(400).json({ message: "Skill is required" });
    }

    const claim = await SkillClaim.create({
      user: req.user.id,
      skill,
      description,
      proofLinks,
    });

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: "Failed to create skill claim" });
  }
});

router.get("/my", protect, async (req, res) => {
  const claims = await SkillClaim.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(claims);
});

router.get("/profiles/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "name role githubUsername",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const claims = await SkillClaim.find({ user: user._id }).sort({
      createdAt: -1,
    });

    res.json({
      user,
      skills: claims,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
