const express = require("express");
const { resolveInitUsername } = require("../services/usernameResolver");

const router = express.Router();

router.get("/:username", async (req, res, next) => {
  try {
    const value = await resolveInitUsername(req.params.username);
    res.json(value);
  } catch (error) {
    next(error);
  }
});

module.exports = router;