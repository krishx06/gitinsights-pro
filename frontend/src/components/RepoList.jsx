
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import RepoCard from "./RepoCard";
import useRepoStore from "../store/repoStore";


const RepoList = () => {
    const { repos, loading, error, selectedRepoIds, toggleRepoSelection, toggleRepoFavorite } = useRepoStore();


    if (loading) {

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (repos.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No repositories found. Try syncing with GitHub.
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
