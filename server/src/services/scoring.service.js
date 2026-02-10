/**
 * Explainable, deterministic scoring engine
 * Input: SkillClaim + GitHubData
 * Output: { confidence, signals }
 */

const SKILL_SIGNAL_MAP = {
  backend: ["JavaScript", "TypeScript"],
  frontend: ["JavaScript", "HTML", "CSS"],
  general: [], // fallback
};

function detectCategory(skillName) {
  const name = skillName.toLowerCase();

  if (name.includes("backend")) return "backend";
  if (name.includes("frontend")) return "frontend";

  return "general";
}

function calculateSkillScore(skillClaim, githubData) {
  if (!githubData) {
    return {
      confidence: 0,
      signals: { reason: "No GitHub data available" },
    };
  }

  const category = detectCategory(skillClaim.skill);
  const relevantLanguages = SKILL_SIGNAL_MAP[category];

  const repos = githubData.repos || [];
  const relevantRepos = repos.filter((repo) =>
    relevantLanguages.includes(repo.language),
  );
  const totalCommits = githubData.commitStats?.totalCommits || 0;
  const recentCommits = githubData.commitStats?.last30Days || 0;
  const now = Date.now();
  const recentRepoCount = repos.filter((repo) => {
    const updated = new Date(repo.updatedAt).getTime();
    return now - updated < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const commitScore = Math.min((recentCommits / 30) * 100, 100);
  const repoScore = Math.min((relevantRepos.length / 5) * 100, 100);
  const recencyScore = Math.min((recentRepoCount / 5) * 100, 100);

  const confidence = Math.round(
    0.4 * commitScore + 0.3 * repoScore + 0.3 * recencyScore,
  );
  return {
    confidence,
    signals: {
      category,
      relevantRepos: relevantRepos.length,
      recentCommits,
      activeReposLast30Days: recentRepoCount,
    },
  };
}

module.exports = { calculateSkillScore };
