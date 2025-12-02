import express from "express";
import axios from "axios";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/stats", authenticateJWT, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!user || !user.accessToken) {
            return res.status(401).json({ error: "User not authenticated with GitHub" });
        }

        const headers = {
            Authorization: `token ${user.accessToken}`,
            Accept: "application/vnd.github.v3+json",
        };


        // Fetch user profile
        const userProfile = await axios.get("https://api.github.com/user", { headers });

        // Fetch user repositories
        const reposResponse = await axios.get("https://api.github.com/user/repos?per_page=100&type=all", { headers });
        const repos = reposResponse.data;

        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);

        const stats = [
            {
                label: "Total Repositories",
                value: userProfile.data.total_private_repos + userProfile.data.public_repos,
                icon: "📦",
                change: "Active",
                trend: "up",
                subtitle: "Public & Private",
            },
            {
                label: "Total Stars",
                value: totalStars,
                icon: "⭐",
                change: "Lifetime",
                trend: "up",
                subtitle: "Across all repos",
            },
            {
                label: "Total Forks",
                value: totalForks,
                icon: "🍴",
                change: "Lifetime",
                trend: "up",
                subtitle: "Across all repos",
            },
            {
                label: "Followers",
                value: userProfile.data.followers,
                icon: "👥",
                change: "Community",
                trend: "up",
                subtitle: "People following you",
            },
        ];

        res.json(stats);
    } catch (error) {
        console.error("Dashboard Stats Error:", error.message);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
});

router.get("/pull-requests", authenticateJWT, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!user || !user.accessToken) {
            return res.status(401).json({ error: "User not authenticated with GitHub" });
        }

        const headers = {
            Authorization: `token ${user.accessToken}`,
            Accept: "application/vnd.github.v3+json",
        };

        const userProfile = await axios.get("https://api.github.com/user", { headers });
        const username = userProfile.data.login;

        const [createdRes, mergedRes, closedUnmergedRes] = await Promise.all([
            axios.get(`https://api.github.com/search/issues?q=type:pr+author:${username}&per_page=100&sort=created&order=desc`, { headers }),
            axios.get(`https://api.github.com/search/issues?q=type:pr+author:${username}+is:merged&per_page=100&sort=updated&order=desc`, { headers }),
            axios.get(`https://api.github.com/search/issues?q=type:pr+author:${username}+is:closed+is:unmerged&per_page=100&sort=updated&order=desc`, { headers })
        ]);

        const allCreated = createdRes.data.items;
        const allMerged = mergedRes.data.items;
        const allClosedUnmerged = closedUnmergedRes.data.items;

        const openTotal = createdRes.data.total_count - (mergedRes.data.total_count + closedUnmergedRes.data.total_count); 
        const [openCountRes] = await Promise.all([
            axios.get(`https://api.github.com/search/issues?q=type:pr+author:${username}+is:open`, { headers })
        ]);

        const metrics = {
            open: openCountRes.data.total_count,
            merged: mergedRes.data.total_count,
            closedUnmerged: closedUnmergedRes.data.total_count,
            avgReviewTime: 0 
        };

        const activityMap = {};

        const getWeekKey = (dateStr) => {
            const date = new Date(dateStr);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
            const monday = new Date(date.setDate(diff));
            return monday.toISOString().split('T')[0];
        };

        for (let i = 0; i < 4; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (i * 7));
            const key = getWeekKey(d.toISOString());
            activityMap[key] = { week: key, opened: 0, merged: 0, closed: 0 };
        }

        allCreated.forEach(pr => {
            const key = getWeekKey(pr.created_at);
            if (activityMap[key]) activityMap[key].opened++;
        });

        allMerged.forEach(pr => {
            if (pr.closed_at) {
                const key = getWeekKey(pr.closed_at);
                if (activityMap[key]) activityMap[key].merged++;
            }
        });
        allMerged.forEach(pr => {
            if (pr.closed_at) {
                const key = getWeekKey(pr.closed_at);
                if (activityMap[key]) activityMap[key].merged++;
            }
        });

        allClosedUnmerged.forEach(pr => {
            if (pr.closed_at) {
                const key = getWeekKey(pr.closed_at);
                if (activityMap[key]) activityMap[key].closed++;
            }
        });

        let totalTimeMs = 0;
        let countTime = 0;
        allMerged.forEach(pr => {
            if (pr.created_at && pr.closed_at) {
                totalTimeMs += new Date(pr.closed_at) - new Date(pr.created_at);
                countTime++;
            }
        });
        metrics.avgReviewTime = countTime > 0 ? (totalTimeMs / countTime / (1000 * 60 * 60)).toFixed(1) : 0;

        const activityAllTimeMap = {};
        const getMonthKey = (dateStr) => dateStr.slice(0, 7); 

        allCreated.forEach(pr => {
            const key = getMonthKey(pr.created_at);
            if (!activityAllTimeMap[key]) activityAllTimeMap[key] = { month: key, opened: 0, merged: 0, closed: 0 };
            activityAllTimeMap[key].opened++;
        });

        allMerged.forEach(pr => {
            if (pr.closed_at) {
                const key = getMonthKey(pr.closed_at);
                if (!activityAllTimeMap[key]) activityAllTimeMap[key] = { month: key, opened: 0, merged: 0, closed: 0 };
                activityAllTimeMap[key].merged++;
            }
        });

        allClosedUnmerged.forEach(pr => {
            if (pr.closed_at) {
                const key = getMonthKey(pr.closed_at);
                if (!activityAllTimeMap[key]) activityAllTimeMap[key] = { month: key, opened: 0, merged: 0, closed: 0 };
                activityAllTimeMap[key].closed++;
            }
        });

        const activityAllTimeChart = Object.values(activityAllTimeMap)
            .sort((a, b) => a.month.localeCompare(b.month));

        const topReposMap = {};
        allCreated.forEach(pr => {
            const repoUrlParts = pr.repository_url.split('/');
            const repoName = `${repoUrlParts[repoUrlParts.length - 2]}/${repoUrlParts[repoUrlParts.length - 1]}`;
            if (!topReposMap[repoName]) topReposMap[repoName] = { name: repoName, count: 0 };
            topReposMap[repoName].count++;
        });

        const topContributingRepos = Object.values(topReposMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const activityChart = Object.values(activityMap)
            .sort((a, b) => new Date(a.week) - new Date(b.week));

        const mergedIds = new Set(allMerged.map(pr => pr.id));

        const repoPrCounts = {};
        const repoUrls = new Set();

        allCreated.forEach(pr => {
            const url = pr.repository_url;
            repoPrCounts[url] = (repoPrCounts[url] || 0) + 1;
            repoUrls.add(url);
        });

        const sortedRepoUrls = Array.from(repoUrls).sort((a, b) => repoPrCounts[b] - repoPrCounts[a]).slice(0, 10);

        const languageCounts = {};

        await Promise.all(sortedRepoUrls.map(async (url) => {
            try {
                const repoRes = await axios.get(url, { headers });
                const lang = repoRes.data.language;
                if (lang) {
                    languageCounts[lang] = (languageCounts[lang] || 0) + repoPrCounts[url];
                }
            } catch (err) {
                console.error(`Failed to fetch repo details for ${url}:`, err.message);
            }
        }));

        const languagesData = Object.entries(languageCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        res.json({
            metrics,
            activity: activityChart,
            activityAllTime: activityAllTimeChart,
            languages: languagesData,
            topRepos: topContributingRepos,
            recentPRs: allCreated.slice(0, 5).map(pr => {
                let state = pr.state;
                if (state === 'closed' && mergedIds.has(pr.id)) {
                    state = 'merged';
                }

                return {
                    id: pr.id,
                    title: pr.title,
                    state: state,
                    html_url: pr.html_url,
                    created_at: pr.created_at,
                    repo: pr.repository_url.split('/').slice(-2).join('/')
                };
            })
        });

    } catch (error) {
        console.error("Pull Requests Stats Error:", error.message);
        res.status(500).json({ error: "Failed to fetch pull request stats" });
    }
});


export default router;
