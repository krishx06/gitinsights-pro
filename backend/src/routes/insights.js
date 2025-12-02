import express from "express";
import axios from "axios";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
const AI_SERVICE_URL = "http://localhost:8000";

async function fetchAllCommits(accessToken, owner, repo) {
    let commits = [];
    let page = 1;
    const limit = 200;

    try {
        while (commits.length < limit) {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`,
                {
                    headers: {
                        Authorization: `token ${accessToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );

            if (response.data.length === 0) break;

            const formatted = response.data.map(c => ({
                date: c.commit.author.date,
                message: c.commit.message,
                additions: 0,
                deletions: 0,
                author: c.commit.author.name
            }));

            commits = [...commits, ...formatted];
            page++;
            if (response.data.length < 100) break;
        }
        return commits;
    } catch (error) {
        console.error("Error fetching commits:", error.message);
        return [];
    }
}

router.post("/:owner/:repo/analyze", authenticateJWT, async (req, res) => {
    try {
        const { owner, repo } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!user || !user.accessToken) {
            return res.status(401).json({ error: "User not authenticated with GitHub" });
        }

        const commits = await fetchAllCommits(user.accessToken, owner, repo);

        if (commits.length === 0) {
            return res.json({ health: null, completion: null, team: [] });
        }

        const payload = { commits };

        const [healthRes, completionRes, teamRes] = await Promise.all([
            axios.post(`${AI_SERVICE_URL}/analyze/health`, payload),
            axios.post(`${AI_SERVICE_URL}/analyze/completion`, payload),
            axios.post(`${AI_SERVICE_URL}/analyze/team`, payload)
        ]);

        res.json({
            health: healthRes.data,
            completion: completionRes.data,
            team: teamRes.data
        });

    } catch (error) {
        console.error("Insight Error:", error.message);
        res.status(500).json({ error: "Failed to generate insights. Ensure AI service is running." });
    }
});

export default router;
