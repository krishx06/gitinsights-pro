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

export default router;
