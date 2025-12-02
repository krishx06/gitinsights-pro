import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const syncRepos = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.accessToken) {
            return res.status(401).json({ error: "User not authenticated with GitHub" });
        }

        // Fetch repos from GitHub
        const response = await axios.get("https://api.github.com/user/repos?per_page=100&sort=updated", {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        const repos = response.data;
        const syncedRepos = [];

        // Upsert repos to DB
        for (const repo of repos) {
            const savedRepo = await prisma.repository.upsert({
                where: { githubId: repo.id },
                update: {
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    language: repo.language,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    openIssues: repo.open_issues_count,
                    watchers: repo.watchers_count,
                    size: repo.size,
                    license: repo.license?.name || null,
                    topics: repo.topics || [],
                    isPrivate: repo.private,
                    updatedAt: new Date(repo.updated_at),
                    lastSyncedAt: new Date(),
                },
                create: {
                    githubId: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    ownerId: user.id,
                    description: repo.description,
                    language: repo.language,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    openIssues: repo.open_issues_count,
                    watchers: repo.watchers_count,
                    size: repo.size,
                    license: repo.license?.name || null,
                    topics: repo.topics || [],
                    isPrivate: repo.private,
                    updatedAt: new Date(repo.updated_at),
                    lastSyncedAt: new Date(),
                },
            });
            syncedRepos.push(savedRepo);
        }

        res.json(syncedRepos);
    } catch (error) {
        console.error("Sync Repos Error:", error);
        res.status(500).json({ error: "Failed to sync repositories" });
    }
};

export const getRepos = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { search } = req.query;

        const where = {
            ownerId: userId,
        };

        if (search) {
            where.name = {
                contains: search,
            };
        }

        const repos = await prisma.repository.findMany({
            where,
            orderBy: { updatedAt: "desc" },
        });

        res.json(repos);
    } catch (error) {
        console.error("Get Repos Error:", error);
        res.status(500).json({ error: "Failed to fetch repositories" });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const repo = await prisma.repository.findUnique({
            where: { id },
        });

        if (!repo) {
            return res.status(404).json({ error: "Repository not found" });
        }

        if (repo.ownerId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updatedRepo = await prisma.repository.update({
            where: { id },
            data: { isFavorite: !repo.isFavorite },
        });

        res.json(updatedRepo);
    } catch (error) {
        console.error("Toggle Favorite Error:", error);
        res.status(500).json({ error: "Failed to toggle favorite" });
    }
};

export const getCompareData = async (req, res) => {
    try {
        const { id } = req.params;
        const { other } = req.query;
        const otherIds = other ? other.split(",") : [];
        const allIds = [id, ...otherIds];

        const repos = await prisma.repository.findMany({
            where: {
                id: { in: allIds },
            },
        });

        // Fetch additional details from GitHub for comparison if needed
        // For now, return what we have in DB
        res.json(repos);
    } catch (error) {
        console.error("Compare Data Error:", error);
        res.status(500).json({ error: "Failed to fetch comparison data" });
    }
};
