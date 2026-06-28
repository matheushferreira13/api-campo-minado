const express = require("express");
const authController = require("../controllers/authController");
const { asyncHandler } = require("../modules/http");

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.patch("/reset-password", asyncHandler(authController.resetPassword));

module.exports = router;