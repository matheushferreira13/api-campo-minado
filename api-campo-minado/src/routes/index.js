const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const gameRoutes = require("./gameRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/games", gameRoutes);

module.exports = router;