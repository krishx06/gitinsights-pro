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
    const response = await api.get(`/api/repos${search ? `?search=${search}` : ""}`);
    return response.data;
};

export const syncRepos = async () => {
    const response = await api.post("/api/repos/sync");
    return response.data;
};

export const toggleFavorite = async (id) => {
    const response = await api.patch(`/api/repos/${id}/favorite`);
    return response.data;
};

export const getCompareData = async (ids) => {
    const [mainId, ...otherIds] = ids;
    const response = await api.get(`/api/repos/${mainId}/compare?other=${otherIds.join(",")}`);
    return response.data;
};

// NEW: Get repository analytics
export const getRepoAnalytics = async (months = 6) => {
    const response = await api.get(`/api/repos/analytics/activity?months=${months}`);
    return response.data;
};

export default api;