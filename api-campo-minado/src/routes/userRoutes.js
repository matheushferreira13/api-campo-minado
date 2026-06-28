const express = require("express");
const userController = require("../controllers/userController");
const { asyncHandler } = require("../modules/http");

const router = express.Router();

router.get("/dashboard", asyncHandler(userController.getDashboard));
router.get("/:id", asyncHandler(userController.getById));
router.put("/:id", asyncHandler(userController.updateSaldo));
router.delete("/:id", asyncHandler(userController.remove));

module.exports = router;