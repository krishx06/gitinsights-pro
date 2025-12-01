import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
    baseURL: backendUrl,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getRepos = async (search = "") => {
    // If using bypass token, return mock data
    if (localStorage.getItem("token") === "bypass-token") {
        return getMockRepos(search);
    }
    const response = await api.get(`/api/repos${search ? `?search=${search}` : ""}`);
    return response.data;
};

export const syncRepos = async () => {
    if (localStorage.getItem("token") === "bypass-token") {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return getMockRepos();
    }
    const response = await api.post("/api/repos/sync");
    return response.data;
};

export const toggleFavorite = async (id) => {
    if (localStorage.getItem("token") === "bypass-token") {
        return true;
    }
    const response = await api.patch(`/api/repos/${id}/favorite`);
    return response.data;
};

export const getCompareData = async (ids) => {
    if (localStorage.getItem("token") === "bypass-token") {
        // Return mock data for all requested IDs
        const allMock = getMockRepos();
        return allMock.filter((r) => ids.includes(r.id));
    }

    // Backend expects: /api/repos/:id/compare?other=ID2,ID3
    const [mainId, ...otherIds] = ids;
    const response = await api.get(`/api/repos/${mainId}/compare?other=${otherIds.join(",")}`);
    return response.data;
};

// Mock Data Helper
const getMockRepos = (search = "") => {
    const repos = [
        {
            id: "1",
            name: "gitinsights-pro",
            description: "Advanced GitHub analytics dashboard for power users.",
            stars: 120,
            forks: 35,
            openIssues: 12,
            watchers: 45,
            size: 1024,
            license: "MIT",
            topics: ["react", "analytics", "dashboard"],
            language: "JavaScript",
            updatedAt: new Date().toISOString(),
            createdAt: new Date(Date.now() - 1000000000).toISOString(),
            isFavorite: true,
        },
        {
            id: "2",
            name: "react-three-fiber",
            description: "React renderer for Three.js",
            stars: 25000,
            forks: 1200,
            openIssues: 150,
            watchers: 500,
            size: 5000,
            license: "MIT",
            topics: ["3d", "webgl", "react"],
            language: "TypeScript",
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            createdAt: new Date(Date.now() - 5000000000).toISOString(),
            isFavorite: false,
        },
        {
            id: "3",
            name: "tailwindcss",
            description: "A utility-first CSS framework for rapid UI development.",
            stars: 75000,
            forks: 4000,
            openIssues: 20,
            watchers: 1200,
            size: 8000,
            license: "MIT",
            topics: ["css", "framework", "utility-first"],
            language: "CSS",
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
            createdAt: new Date(Date.now() - 8000000000).toISOString(),
            isFavorite: true,
        },
        {
            id: "4",
            name: "next.js",
            description: "The React Framework",
            stars: 110000,
            forks: 25000,
            openIssues: 800,
            watchers: 3000,
            size: 15000,
            license: "MIT",
            topics: ["react", "framework", "server-rendering"],
            language: "JavaScript",
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            createdAt: new Date(Date.now() - 9000000000).toISOString(),
            isFavorite: false,
        },
        {
            id: "5",
            name: "vite",
            description: "Next generation frontend tooling. It's fast!",
            stars: 60000,
            forks: 5000,
            openIssues: 300,
            watchers: 1500,
            size: 4000,
            license: "MIT",
            topics: ["build-tool", "frontend", "fast"],
            language: "TypeScript",
            updatedAt: new Date(Date.now() - 7200000).toISOString(),
            createdAt: new Date(Date.now() - 4000000000).toISOString(),
            isFavorite: false,
        },
    ];

    if (!search) return repos;
    return repos.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
};

export default api;
