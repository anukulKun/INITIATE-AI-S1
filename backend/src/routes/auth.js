const express = require("express");
const { z } = require("zod");
const db = require("../db");
const { makeId } = require("../utils/id");
const { issueToken } = require("../middleware/auth");
const { comparePassword, hashPassword } = require("../services/securityService");
const { validateBody } = require("../middleware/validate");

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  walletAddress: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const now = new Date().toISOString();
    const { email, password, walletAddress } = req.validatedBody;
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = {
      id: makeId("usr"),
      email,
      password_hash: await hashPassword(password),
      wallet_address: walletAddress || null,
      created_at: now,
      updated_at: now,
    };

    db.prepare(
      "INSERT INTO users (id, email, password_hash, wallet_address, created_at, updated_at) VALUES (@id, @email, @password_hash, @wallet_address, @created_at, @updated_at)"
    ).run(user);

    const token = issueToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, walletAddress: user.wallet_address } });
  } catch (error) {
    next(error);
  }
});

router.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = issueToken(user);
    res.json({ token, user: { id: user.id, email: user.email, walletAddress: user.wallet_address } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;