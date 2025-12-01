import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./src/routes/auth.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const GITHUB_API_BASE = "https://api.github.com";

async function githubGet(path) {
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitInsights-Pro",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  const url = `${GITHUB_API_BASE}${path}`;
  const res = await axios.get(url, { headers });
  return res.data;
}

import dashboardRoutes from "./src/routes/dashboard.js";

app.use("/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Root API route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GitInsights Pro API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        .route {
          background: white;
          padding: 15px;
          margin: 10px 0;
          border-radius: 5px;
          border-left: 3px solid #4CAF50;
        }
        .method {
          background: #4CAF50;
          color: white;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
          margin-right: 10px;
        }
        .path { font-weight: bold; }
        .desc { color: #666; margin-top: 5px; }
        .status { color: #4CAF50; }
      </style>
    </head>
    <body>
      <h1>GitInsights Pro API</h1>
      <p class="status">✓ Server is running</p>

      <h2>Routes</h2>

      <div class="route">
        <span class="method">GET</span>
        <span class="path">/api/health</span>
        <div class="desc">Health check</div>
      </div>

      <div class="route">
        <span class="method">*</span>
        <span class="path">/auth/*</span>
        <div class="desc">Authentication endpoints</div>
      </div>

      <div class="route">
        <span class="method">GET</span>
        <span class="path">/api/repos/:owner/:repo/stats</span>
        <div class="desc">Get repository statistics</div>
      </div>

      <div class="route">
        <span class="method">GET</span>
        <span class="path">/api/repos/:owner/:repo/languages</span>
        <div class="desc">Get language breakdown</div>
      </div>

      <div class="route">
        <span class="method">GET</span>
        <span class="path">/api/repos/:owner/:repo/contributors</span>
        <div class="desc">Get contributors list</div>
      </div>

      <div class="route">
        <span class="method">GET</span>
        <span class="path">/api/repos/:owner/:repo/commits</span>
        <div class="desc">Get commits (last 28 days)</div>
      </div>

      <h2>Config</h2>
      <p>Port: ${process.env.PORT || 5000}</p>
      <p>GitHub Token: ${process.env.GITHUB_TOKEN ? "✓" : "✗"}</p>
    </body>
    </html>
  `);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/repos/:owner/:repo/languages", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const data = await githubGet(`/repos/${owner}/${repo}/languages`);
    const total = Object.values(data).reduce((s, n) => s + n, 0) || 1;
    const result = Object.entries(data).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Number(((bytes / total) * 100).toFixed(1)),
    }));
    res.json(result);
  } catch (e) {
    res
      .status(e.response?.status || 500)
      .json({ error: e.response?.data?.message || e.message });
  }
});

app.get("/api/repos/:owner/:repo/contributors", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const data = await githubGet(
      `/repos/${owner}/${repo}/contributors?per_page=100&anon=false`
    );
    const result = data.map((c) => ({
      id: c.id,
      login: c.login,
      avatar_url: c.avatar_url,
      contributions: c.contributions,
      html_url: c.html_url,
    }));
    res.json(result);
  } catch (e) {
    res
      .status(e.response?.status || 500)
      .json({ error: e.response?.data?.message || e.message });
  }
});

app.get("/api/repos/:owner/:repo/commits", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const since = fourWeeksAgo.toISOString();
    const data = await githubGet(
      `/repos/${owner}/${repo}/commits?since=${since}&per_page=100`
    );
    const byDate = {};
    for (const c of data) {
      const date = (c.commit?.author?.date || "").slice(0, 10);
      if (!date) continue;
      byDate[date] = (byDate[date] || 0) + 1;
    }
    const result = Object.entries(byDate)
      .map(([date, count]) => ({ date, commits: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(result);
  } catch (e) {
    res
      .status(e.response?.status || 500)
      .json({ error: e.response?.data?.message || e.message });
  }
});

app.get("/api/repos/:owner/:repo/stats", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoInfo = await githubGet(`/repos/${owner}/${repo}`);
    const languages = await githubGet(`/repos/${owner}/${repo}/languages`);
    const contributors = await githubGet(
      `/repos/${owner}/${repo}/contributors?per_page=100&anon=false`
    );
    const result = {
      name: repoInfo.name,
      full_name: repoInfo.full_name,
      description: repoInfo.description,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      watchers: repoInfo.watchers_count,
      open_issues: repoInfo.open_issues_count,
      language: repoInfo.language,
      languages_count: Object.keys(languages).length,
      contributors_count: contributors.length,
      size: repoInfo.size,
      created_at: repoInfo.created_at,
      updated_at: repoInfo.updated_at,
      pushed_at: repoInfo.pushed_at,
    };
    res.json(result);
  } catch (e) {
    res
      .status(e.response?.status || 500)
      .json({ error: e.response?.data?.message || e.message });
  }
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
