
import React from "react";
import { Star, GitFork, Circle, Check } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const RepoCard = ({ repo, isSelected, onToggleSelect, onToggleFavorite }) => {


    const onSelect = (e) => {
        e.stopPropagation();
        onToggleSelect(repo.id);
    };

    const onFav = (e) => {
        e.stopPropagation();
        onToggleFavorite(repo.id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            className={`relative group p-5 rounded-xl border transition-all duration-200 ${isSelected
                ? "bg-primary/10 border-primary/50"
                : "bg-card border-border hover:border-primary/50 hover:shadow-lg"
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">

                    <div
                        onClick={onSelect}
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-muted-foreground"
                            }`}
                    >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>

                    <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors cursor-pointer">
                        {repo.name}
                    </h3>

                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                        {repo.isPrivate ? "Private" : "Public"}
                    </span>
                </div>


                <button
                    onClick={onFav}
                    className={`p-2 rounded-full transition-all duration-200 ${repo.isFavorite
                        ? "text-yellow-400 bg-yellow-400/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                >
                    <Star size={18} fill={repo.isFavorite ? "currentColor" : "none"} />
                </button>
            </div>

            <p className="text-muted-foreground text-sm mb-6 line-clamp-2 h-10">
                {repo.description || "No description provided."}
            </p>


            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    {repo.language && (
                        <div className="flex items-center gap-1.5">
                            <Circle size={10} className="text-blue-400 fill-blue-400" />
                            <span>{repo.language}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <Star size={14} />
                        <span>{repo.stars}</span>
                    </div>

                    <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                        <GitFork size={14} />
                        <span>{repo.forks}</span>
                    </div>
                </div>

                <span>Updated {formatDistanceToNow(new Date(repo.updatedAt))} ago</span>
            </div>
        </motion.div>
    );
};

export default RepoCard;
