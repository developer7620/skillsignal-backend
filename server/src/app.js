const express = require("express");
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/skills", skillRoutes);

module.exports = app;
