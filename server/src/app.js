const express = require("express");
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");
const githubRoutes = require("./routes/github.routes");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/skills", skillRoutes);
app.use("/github", githubRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
