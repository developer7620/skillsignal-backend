const mongoose = require("mongoose");

const skillClaimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    skill: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    explanation: {
      type: Object,
      default: null,
    },

    proofLinks: {
      type: [String],
      default: [],
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("SkillClaim", skillClaimSchema);
