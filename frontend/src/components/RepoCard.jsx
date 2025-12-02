import React from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Eye, Code2, ExternalLink, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RepoCard = ({ repo, isSelected, onToggleSelect, onToggleFavorite }) => {
    const navigate = useNavigate();

    const handleViewAnalytics = (e) => {
        e.stopPropagation();
        navigate(`/insights?repo=${repo.fullName}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4 }}
            onClick={() => onToggleSelect(repo.id)}
            className={`relative bg-card border rounded-xl p-6 cursor-pointer transition-all ${
                isSelected
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/50 hover:shadow-md"
            }`}
        >
            {/* Favorite Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(repo.id);
                }}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                    repo.isFavorite
                        ? "bg-red-500/20 text-red-500"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
            >
                <Heart size={16} className={repo.isFavorite ? "fill-current" : ""} />
            </button>

            {/* Repository Name */}
            <div className="mb-3 pr-8">
                <h3 className="text-lg font-semibold text-foreground truncate mb-1">
                    {repo.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{repo.fullName}</p>
            </div>

            {/* Description */}
            {repo.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                    {repo.description}
                </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Star size={14} />
                    <span>{repo.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                    <GitFork size={14} />
                    <span>{repo.forks}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{repo.watchers}</span>
                </div>
            </div>

            {/* Language & Topics */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                {repo.language && (
                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                        <Code2 size={12} />
                        {repo.language}
                    </span>
                )}
                {repo.isPrivate && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                        Private
                    </span>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={handleViewAnalytics}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
            >
                <ExternalLink size={14} />
                View Analytics
            </button>

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute top-4 left-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg
                        className="w-3 h-3 text-primary-foreground"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            )}
        </motion.div>
    );
};

export default RepoCard;