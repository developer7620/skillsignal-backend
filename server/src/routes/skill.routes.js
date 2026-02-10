const express = require("express");
const SkillClaim = require("../models/SkillClaim");
const User = require("../models/User");
const protect = require("../middleware/auth.middleware");
const { calculateSkillScore } = require("../services/scoring.service");
const GitHubData = require("../models/GitHubData");
const authMiddleware = require("../middleware/auth.middleware");

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
      "_id name role githubUsername",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const claims = await SkillClaim.find({ user: user._id })
      .select("_id skill description proofLinks confidence createdAt")
      .sort({ createdAt: -1 });

    const profile = {
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        githubUsername: user.githubUsername ?? null,
      },
      skills: claims.map((c) => ({
        _id: c._id,
        skill: c.skill,
        description: c.description,
        proofLinks: c.proofLinks,
        confidence: c.confidence,
        createdAt: c.createdAt,
      })),
    };

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.get("/profiles/username/:name", async (req, res) => {
  try {
    const user = await User.findOne({
      name: { $regex: `^${req.params.name}$`, $options: "i" },
    }).select("_id name role githubUsername");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const claims = await SkillClaim.find({ user: user._id })
      .select("_id skill description proofLinks confidence createdAt")
      .sort({ createdAt: -1 });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        githubUsername: user.githubUsername ?? null,
      },
      skills: claims.map((c) => ({
        _id: c._id,
        skill: c.skill,
        description: c.description,
        proofLinks: c.proofLinks,
        confidence: c.confidence,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.post("/:id/evaluate", authMiddleware, async (req, res) => {
  try {
    const skillClaim = await SkillClaim.findById(req.params.id);

    if (!skillClaim) {
      return res.status(404).json({ message: "Skill claim not found" });
    }

    if (skillClaim.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const githubData = await GitHubData.findOne({ user: req.user.id });

    const result = calculateSkillScore(skillClaim, githubData);

    skillClaim.confidence = result.confidence;
    skillClaim.explanation = result.signals; // optional but strong

    await skillClaim.save();

    res.json(result);
  } catch (err) {
    console.error("EVALUATION ERROR:", err);
    res.status(500).json({ message: "Skill evaluation failed" });
  }
});

module.exports = router;
