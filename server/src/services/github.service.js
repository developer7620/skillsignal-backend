const axios = require("axios");

const GITHUB_API = "https://api.github.com";

async function fetchGitHubUser(username) {
  try {
    const userRes = await axios.get(`${GITHUB_API}/users/${username}`);
    return userRes.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error("GITHUB_USER_NOT_FOUND");
    }
    if (err.response?.status === 403) {
      throw new Error("GITHUB_RATE_LIMIT");
    }
    throw new Error("GITHUB_API_FAILED");
  }
}

async function fetchRepos(username) {
  const res = await axios.get(
    `${GITHUB_API}/users/${username}/repos?per_page=100`,
  );

  return res.data.map((repo) => ({
    name: repo.name,
    language: repo.language,
    stargazers: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
  }));
}

function computeCommitStats(repos) {
  return {
    totalCommits: null,
    last30Days: null,
  };
}

module.exports = {
  fetchGitHubUser,
  fetchRepos,
  computeCommitStats,
};
