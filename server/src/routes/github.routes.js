const express = require("express");
const GitHubData = require("../models/GitHubData");
const User = require("../models/User");
const protect = require("../middleware/auth.middleware");
const {
  fetchGitHubUser,
  fetchRepos,
  computeCommitStats,
} = require("../services/github.service");

const router = express.Router();

router.post("/connect", protect, async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "GitHub username required" });
  }

  try {
    // 1. Verify GitHub user exists
    await fetchGitHubUser(username);

    // 2. Fetch repos
    const repos = await fetchRepos(username);

    // 3. Compute stats
    const commitStats = computeCommitStats(repos);

    // 4. Store / update GitHubData
    await GitHubData.findOneAndUpdate(
      { user: req.user.id },
      {
        user: req.user.id,
        username,
        repos,
        commitStats,
        fetchedAt: new Date(),
      },
      { upsert: true },
    );

    // 5. Update User
    await User.findByIdAndUpdate(req.user.id, {
      githubUsername: username,
    });

    res.json({
      message: "GitHub account connected",
      reposFetched: repos.length,
    });
  } catch (err) {
    if (err.message === "GITHUB_USER_NOT_FOUND") {
      return res.status(400).json({ message: "Invalid GitHub username" });
    }
    if (err.message === "GITHUB_RATE_LIMIT") {
      return res.status(503).json({ message: "GitHub rate limit exceeded" });
    }

    res.status(500).json({ message: "GitHub integration failed" });
  }
});

module.exports = router;
