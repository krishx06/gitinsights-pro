import axios from "axios";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// in-memory guard to prevent reusing OAuth codes
const usedCodes = new Set();

export const loginWithGitHub = (req, res) => {
  const redirectUri =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${process.env.GITHUB_CALLBACK_URL}` +
    `&scope=read:user user:email repo`;

  res.redirect(redirectUri);
};

export const githubCallback = async (req, res) => {
  const code = req.query.code;

  // ✅ guard: invalid or reused code
  if (!code || typeof code !== "string") {
    return res.status(400).send("Invalid OAuth callback");
  }

  if (usedCodes.has(code)) {
    return res.status(400).send("OAuth code already used");
  }

  usedCodes.add(code);
  setTimeout(() => usedCodes.delete(code), 5 * 60 * 1000);

  try {
    // 1️⃣ exchange code → access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    if (!tokenResponse.data?.access_token) {
      console.error("GitHub Token Exchange Failed:", tokenResponse.data);
      return res.status(400).send("GitHub OAuth failed");
    }

    const accessToken = tokenResponse.data.access_token;

    // 2️⃣ fetch GitHub user
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 3️⃣ fetch emails (SAFE)
    let primaryEmail = "no-email@github.com";
    try {
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (Array.isArray(emailResponse.data)) {
        primaryEmail =
          emailResponse.data.find((e) => e.primary && e.verified)?.email ||
          emailResponse.data[0]?.email ||
          primaryEmail;
      }
    } catch (emailErr) {
      // email endpoint can 403 — this is OK
      console.warn("GitHub email fetch skipped:", emailErr.response?.status);
    }

    const {
      id: githubId,
      login: username,
      avatar_url: avatarUrl,
    } = userResponse.data;

    // 4️⃣ upsert user
    const user = await prisma.user.upsert({
      where: { githubId },
      update: { username, avatarUrl, accessToken, email: primaryEmail },
      create: {
        githubId,
        username,
        avatarUrl,
        email: primaryEmail,
        accessToken,
      },
    });

    // 5️⃣ issue JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  } catch (err) {
    console.error("GitHub OAuth Fatal Error:", err.response?.data || err);
    res.status(500).send("Authentication failed");
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        email: true,
        githubId: true,
        accessToken: true,
      },
    });

    res.json(user);
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
