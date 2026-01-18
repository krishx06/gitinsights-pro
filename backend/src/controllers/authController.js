import axios from "axios";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loginWithGitHub = (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=read:user,user:email,repo`;

  res.redirect(redirectUri);
};

export const githubCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing authorization code");

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      console.error("GitHub Output:", JSON.stringify(tokenResponse.data));
      throw new Error("No access token received");
    }

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const primaryEmail =
      emailResponse.data.find((e) => e.primary && e.verified)?.email ||
      emailResponse.data[0]?.email ||
      "no-email@github.com";

    const { id: githubId, login: username, avatar_url: avatarUrl } = userResponse.data;

    let user = await prisma.user.upsert({
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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  } catch (err) {
    console.error("GitHub OAuth Error:", err.message);
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
    res.status(500).json({ error: "Failed to fetch user" });
  }
};