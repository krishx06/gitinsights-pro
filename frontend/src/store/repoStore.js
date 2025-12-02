import { create } from "zustand";
import { getRepos, syncRepos, toggleFavorite, getRepoAnalytics } from "../lib/api";

const useRepoStore = create((set, get) => ({
    repos: [],
    loading: false,
    syncing: false,
    searchQuery: "",
    selectedRepoIds: [],
    error: null,

    // Analytics state
    analytics: null,
    analyticsLoading: false,
    analyticsError: null,

    setSearchQuery: (query) => set({ searchQuery: query }),

    fetchRepos: async () => {
        set({ loading: true, error: null });
        try {
            const { searchQuery } = get();
            const data = await getRepos(searchQuery);
            set({ repos: data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch repositories", loading: false });
        }
    },

    syncRepositories: async () => {
        set({ syncing: true, error: null });
        try {
            await syncRepos();
            await get().fetchRepos();
            // Also refresh analytics after sync
            await get().fetchAnalytics();
            set({ syncing: false });
        } catch (error) {
            set({ error: "Failed to sync repositories", syncing: false });
        }
    },

    // NEW: Fetch analytics data
    fetchAnalytics: async (months = 6) => {
        set({ analyticsLoading: true, analyticsError: null });
        try {
            const data = await getRepoAnalytics(months);
            set({ analytics: data, analyticsLoading: false });
        } catch (error) {
            set({
                analyticsError: "Failed to fetch analytics",
                analyticsLoading: false
            });
        }
    },

    toggleRepoFavorite: async (id) => {
        set((state) => ({
            repos: state.repos.map((repo) =>
                repo.id === id ? { ...repo, isFavorite: !repo.isFavorite } : repo
            ),
        }));

        try {
            await toggleFavorite(id);
        } catch (error) {
            set((state) => ({
                repos: state.repos.map((repo) =>
                    repo.id === id ? { ...repo, isFavorite: !repo.isFavorite } : repo
                ),
            }));
        }
    },

    toggleRepoSelection: (id) => {
        set((state) => {
            const isSelected = state.selectedRepoIds.includes(id);
            return {
                selectedRepoIds: isSelected
                    ? state.selectedRepoIds.filter((repoId) => repoId !== id)
                    : [...state.selectedRepoIds, id],
            };
        });
    },

    clearSelection: () => set({ selectedRepoIds: [] }),
}));

export default useRepoStore;