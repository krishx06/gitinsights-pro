import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./src/routes/auth.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import teamsRoutes from "./src/routes/teams.js";
import dashboardsRoutes from "./src/routes/dashboards.js";

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

async function githubGet(path, token = null) {
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitInsights-Pro",
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  } else if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  const url = `${GITHUB_API_BASE}${path}`;
  const res = await axios.get(url, { headers });
  return res.data;
}

app.use("/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teams", teamsRoutes);

// Root API route (updated with new endpoints)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GitInsights Pro API</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        .route { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #4CAF50; }
        .method { background: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; margin-right: 10px; }
        .new { background: #FF9800; }
        .path { font-weight: bold; }
        .desc { color: #666; margin-top: 5px; }
        .status { color: #4CAF50; }
      </style>
    </head>
    <body>
      <h1>GitInsights Pro API</h1>
      <p class="status">✓ Server running on port ${process.env.PORT || 5000}</p>
      
      <h2>Repository Routes</h2>
      <div class="route"><span class="method">GET</span><span class="path">/api/repos/:owner/:repo/stats</span><div class="desc">Repository statistics</div></div>
      <div class="route"><span class="method">GET</span><span class="path">/api/repos/:owner/:repo/languages</span><div class="desc">Language breakdown</div></div>
      <div class="route"><span class="method">GET</span><span class="path">/api/repos/:owner/:repo/contributors</span><div class="desc">Contributors list</div></div>
      <div class="route"><span class="method">GET</span><span class="path">/api/repos/:owner/:repo/commits</span><div class="desc">Commit history (last 28 days)</div></div>
      <div class="route"><span class="method new">GET</span><span class="path">/api/repos/:owner/:repo/pulls</span><div class="desc">Pull requests with metrics</div></div>
      <div class="route"><span class="method new">GET</span><span class="path">/api/repos/:owner/:repo/issues</span><div class="desc">Issues with trends</div></div>
      <div class="route"><span class="method new">GET</span><span class="path">/api/repos/:owner/:repo/releases</span><div class="desc">Release history</div></div>
      <div class="route"><span class="method new">GET</span><span class="path">/api/repos/:owner/:repo/activity</span><div class="desc">Recent activity feed</div></div>
      <div class="route"><span class="method new">GET</span><span class="path">/api/repos/:owner/:repo/code-frequency</span><div class="desc">Code additions/deletions</div></div>
      
      <h2>Dashboard Routes</h2>
      <div class="route"><span class="method">GET</span><span class="path">/api/dashboard/stats</span><div class="desc">User dashboard stats</div></div>
      
      <h2>Team Routes</h2>
      <div class="route"><span class="method">GET</span><span class="path">/api/teams</span><div class="desc">Get all teams</div></div>
      <div class="route"><span class="method">POST</span><span class="path">/api/teams</span><div class="desc">Create team</div></div>
      <div class="route"><span class="method">PUT</span><span class="path">/api/teams/:id</span><div class="desc">Update team</div></div>
      <div class="route"><span class="method">DELETE</span><span class="path">/api/teams/:id</span><div class="desc">Delete team</div></div>
    </body>
    </html>
  `);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// EXISTING ENDPOINTS
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
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

app.get("/api/repos/:owner/:repo/contributors", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const data = await githubGet(`/repos/${owner}/${repo}/contributors?per_page=100&anon=false`);
    const result = data.map((c) => ({
      id: c.id,
      login: c.login,
      avatar_url: c.avatar_url,
      contributions: c.contributions,
      html_url: c.html_url,
    }));
    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

app.get("/api/repos/:owner/:repo/commits", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const since = fourWeeksAgo.toISOString();
    const data = await githubGet(`/repos/${owner}/${repo}/commits?since=${since}&per_page=100`);
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
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

app.get("/api/repos/:owner/:repo/stats", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoInfo = await githubGet(`/repos/${owner}/${repo}`);
    const languages = await githubGet(`/repos/${owner}/${repo}/languages`);
    const contributors = await githubGet(`/repos/${owner}/${repo}/contributors?per_page=100&anon=false`);
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
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

// NEW ENDPOINTS FOR WIDGETS

// Pull Requests with metrics
app.get("/api/repos/:owner/:repo/pulls", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'all' } = req.query;
    
    const pulls = await githubGet(`/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`);
    
    const metrics = {
      total: pulls.length,
      open: pulls.filter(p => p.state === 'open').length,
      closed: pulls.filter(p => p.state === 'closed').length,
      avgTimeToMerge: 0,
      recentPRs: pulls.slice(0, 10).map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: pr.user.login,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        html_url: pr.html_url
      }))
    };
    
    res.json(metrics);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

// Issues with trends
app.get("/api/repos/:owner/:repo/issues", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'all' } = req.query;
    
    const issues = await githubGet(`/repos/${owner}/${repo}/issues?state=${state}&per_page=100`);
    
    // Filter out pull requests (GitHub API includes PRs in issues)
    const actualIssues = issues.filter(issue => !issue.pull_request);
    
    const metrics = {
      total: actualIssues.length,
      open: actualIssues.filter(i => i.state === 'open').length,
      closed: actualIssues.filter(i => i.state === 'closed').length,
      recentIssues: actualIssues.slice(0, 10).map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        user: issue.user.login,
        created_at: issue.created_at,
        labels: issue.labels.map(l => l.name),
        html_url: issue.html_url
      }))
    };
    
    res.json(metrics);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

// Releases
app.get("/api/repos/:owner/:repo/releases", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const releases = await githubGet(`/repos/${owner}/${repo}/releases?per_page=20`);
    
    const result = releases.map(release => ({
      id: release.id,
      name: release.name,
      tag_name: release.tag_name,
      published_at: release.published_at,
      author: release.author?.login,
      html_url: release.html_url,
      prerelease: release.prerelease,
      draft: release.draft
    }));
    
    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

// Recent Activity Feed
app.get("/api/repos/:owner/:repo/activity", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const events = await githubGet(`/repos/${owner}/${repo}/events?per_page=50`);
    
    const activities = events.map(event => ({
      id: event.id,
      type: event.type,
      actor: event.actor.login,
      actor_avatar: event.actor.avatar_url,
      created_at: event.created_at,
      payload: {
        action: event.payload.action,
        ref: event.payload.ref,
        ref_type: event.payload.ref_type,
        size: event.payload.size,
        commits: event.payload.commits?.length || 0
      }
    }));
    
    res.json(activities);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

// Code Frequency (additions/deletions)
app.get("/api/repos/:owner/:repo/code-frequency", async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    try {
      const data = await githubGet(`/repos/${owner}/${repo}/stats/code_frequency`);
      
      if (!data || data.length === 0) {
        return res.json([]);
      }
      
      const result = data.slice(-12).map(week => ({
        week: new Date(week[0] * 1000).toISOString().split('T')[0],
        additions: week[1],
        deletions: Math.abs(week[2]),
        net: week[1] + week[2]
      }));
      
      res.json(result);
    } catch (statsError) {
      console.log('Code frequency not ready yet, returning empty');
      res.json([]);
    }
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.message || e.message });
  }
});

app.use("/api/dashboards", dashboardsRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));