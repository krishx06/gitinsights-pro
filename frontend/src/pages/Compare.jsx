import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, GitFork, AlertCircle, Eye, HardDrive, Scale, Calendar } from "lucide-react";
import { getCompareData } from "../lib/api";
import { formatDistanceToNow } from "date-fns";

const Compare = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ids = searchParams.get("ids")?.split(",") || [];

        if (ids.length < 2) {
            navigate("/repositories");
            return;
        }

        const loadData = async () => {
            try {
                const data = await getCompareData(ids);
                setRepos(data);
            } catch (error) {
                console.error("Failed to load compare data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0D0D] text-white p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    // Helper to find the best value for highlighting
    const getBest = (key, type = "max") => {
        const values = repos.map(r => r[key] || 0);
        return type === "max" ? Math.max(...values) : Math.min(...values);
    };

    const maxStars = getBest("stars");
    const maxForks = getBest("forks");
    const minIssues = getBest("openIssues", "min");
    const maxWatchers = getBest("watchers");

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate("/repositories")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Repositories
                </button>

                <h1 className="text-3xl font-bold mb-8">Repository Comparison</h1>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 text-left bg-[#121212] border-b border-[#1E1E1E] w-48">Feature</th>
                                {repos.map(repo => (
                                    <th key={repo.id} className="p-4 text-left bg-[#121212] border-b border-[#1E1E1E] min-w-[250px]">
                                        <div className="text-xl font-bold">{repo.name}</div>
                                        <div className="text-sm text-gray-400 font-normal mt-1 line-clamp-1">{repo.description}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E1E1E]">
                            {/* Stars */}
                            <tr>
                                <td className="p-4 text-gray-400 flex items-center gap-2">
                                    <Star size={18} /> Stars
                                </td>
                                {repos.map(repo => (
                                    <td key={repo.id} className={`p-4 ${repo.stars === maxStars ? "text-yellow-400 font-bold bg-yellow-400/5" : ""}`}>
                                        {repo.stars.toLocaleString()}
                                    </td>
                                ))}
                            </tr>

                            {/* Forks */}
                            <tr>
                                <td className="p-4 text-gray-400 flex items-center gap-2">
                                    <GitFork size={18} /> Forks
                                </td>
                                {repos.map(repo => (
                                    <td key={repo.id} className={`p-4 ${repo.forks === maxForks ? "text-blue-400 font-bold bg-blue-400/5" : ""}`}>
                                        {repo.forks.toLocaleString()}
                                    </td>
                                ))}
                            </tr>

                            {/* Open Issues */}
                            <tr>
                                <td className="p-4 text-gray-400 flex items-center gap-2">
                                    <AlertCircle size={18} /> Open Issues
                                </td>
                                {repos.map(repo => (
                                    <td key={repo.id} className={`p-4 ${repo.openIssues === minIssues ? "text-green-400 font-bold bg-green-400/5" : ""}`}>
                                        {repo.openIssues.toLocaleString()}
                                    </td>
                                ))}
                            </tr>

                            {/* Watchers */}
                            <tr>
                                <td className="p-4 text-gray-400 flex items-center gap-2">
                                    <Eye size={18} /> Watchers
                                </td>
                                {repos.map(repo => (
                                    <td key={repo.id} className={`p-4 ${repo.watchers === maxWatchers ? "text-purple-400 font-bold bg-purple-400/5" : ""}`}>
                                        {repo.watchers.toLocaleString()}
                                    </td>
                                ))}
                            </tr>

                            {/* Size */}
                            <tr>
                                <td className="p-4 text-gray-400 flex items-center gap-2">
                                    <HardDrive size={18} /> Size
                                </td>
                                {repos.map(repo => (
                                    <td key={repo.id} className="p-4">
                                        {(repo.size / 1024).toFixed(2)} MB
                                    </td>
                                ))}
                            </tr>

                            {/* License */}
                            <tr>
                                <td className="p-4 text-gray-400 flex items-center gap-2">
                                    <Scale size={18} /> License
                                </td>
                                {repos.map(repo => (
                                    <td key={repo.id} className="p-4">
                                        {repo.license || "None"}
                                    </td>
                                ))}
                            </tr>

                            {/* Created At */}
                            <tr>
                                <td className="p-4 text-gray-400 flex items-center gap-2">
                                    <Calendar size={18} /> Age
                                </td>
                                {repos.map(repo => (
                                    <td key={repo.id} className="p-4">
                                        {repo.createdAt ? formatDistanceToNow(new Date(repo.createdAt)) : "Unknown"}
                                    </td>
                                ))}
                            </tr>

                            {/* Topics */}
                            <tr>
                                <td className="p-4 text-gray-400 align-top pt-6">Topics</td>
                                {repos.map(repo => (
                                    <td key={repo.id} className="p-4 align-top">
                                        <div className="flex flex-wrap gap-2">
                                            {repo.topics?.map(topic => (
                                                <span key={topic} className="px-2 py-1 bg-[#1E1E1E] rounded-md text-xs text-gray-300 border border-gray-800">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Compare;
