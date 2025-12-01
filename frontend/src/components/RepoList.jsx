
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import RepoCard from "./RepoCard";
import useRepoStore from "../store/repoStore";


const RepoList = () => {
    const { repos, loading, selectedRepoIds, toggleRepoSelection, toggleRepoFavorite } = useRepoStore();

    if (loading) {

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="h-48 bg-[#121212] border border-[#1E1E1E] rounded-xl animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!repos?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-[#1E1E1E] rounded-full flex items-center justify-center mb-4">
                    <FolderOpen size={32} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No repositories found</h3>
                <p className="text-gray-400 max-w-sm">
                    Try adjusting your search or sync your repositories from GitHub.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24"
        >
            {repos.map((repo) => (
                <RepoCard
                    key={repo.id}
                    repo={repo}
                    isSelected={selectedRepoIds.includes(repo.id)}
                    onToggleSelect={toggleRepoSelection}
                    onToggleFavorite={toggleRepoFavorite}
                />
            ))}
        </motion.div>
    );
};

export default RepoList;
