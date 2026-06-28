const express = require("express");
const gameController = require("../controllers/gameController");
const { asyncHandler } = require("../modules/http");

const router = express.Router();

router.post("/start", asyncHandler(gameController.start));
router.post("/:gameId/reveal", asyncHandler(gameController.reveal));
router.post("/:gameId/cashout", asyncHandler(gameController.cashout));

module.exports = router;