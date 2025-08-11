import express from "express";
import { createUser, findUserByUsername } from "../models/user";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  removeRefreshToken,
  verifyRefreshToken,
} from "../utils/auth";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = await createUser(username, password);

    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);

    await storeRefreshToken(user.id, refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "The user was not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);

    await storeRefreshToken(user.id, refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = (req.body ?? {}) as { refreshToken?: string };

    if (!refreshToken)
      return res.status(400).json({ error: "No refresh token provided" });

    await removeRefreshToken(refreshToken);

    return res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Could not logout" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = (req.body ?? {}) as { refreshToken?: string };

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }
  
  try {
    const { userId, username } = await verifyRefreshToken(refreshToken);

    await removeRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken(userId, username);
    const newRefreshToken = generateRefreshToken(userId, username);

    await storeRefreshToken(userId, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

export default router;
