const mongoose = require("mongoose");

const githubRepoSchema = new mongoose.Schema(
  {
    name: String,
    language: String,
    stargazers: Number,
    forks: Number,
    updatedAt: Date,
  },
  { _id: false },
);

const githubDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },

  username: {
    type: String,
    required: true,
  },

  repos: [githubRepoSchema],

  commitStats: {
    totalCommits: Number,
    last30Days: Number,
  },

  fetchedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GitHubData", githubDataSchema);
