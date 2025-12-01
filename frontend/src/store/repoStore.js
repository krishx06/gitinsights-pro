import { create } from "zustand";
import { getRepos, syncRepos, toggleFavorite } from "../lib/api";

const useRepoStore = create((set, get) => ({
    repos: [],
    loading: false,
    syncing: false,
    searchQuery: "",
    selectedRepoIds: [],
    error: null,

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
            set({ syncing: false });
        } catch (error) {
            set({ error: "Failed to sync repositories", syncing: false });
        }
    },

    toggleRepoFavorite: async (id) => {
        // Optimistic update
        set((state) => ({
            repos: state.repos.map((repo) =>
                repo.id === id ? { ...repo, isFavorite: !repo.isFavorite } : repo
            ),
        }));

        try {
            await toggleFavorite(id);
        } catch (error) {
            // Revert on failure
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
