
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useRepoStore from "../store/repoStore";

const RepoCompareBar = () => {
    const { selectedRepoIds, clearSelection } = useRepoStore();
    const navigate = useNavigate();

    const count = selectedRepoIds.length;

    const goToCompare = () => {
        if (count < 2) return;
        navigate(`/compare?ids=${selectedRepoIds.join(",")}`);
    };

    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-[#1E1E1E] border border-gray-700 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 min-w-[320px]">
                        <div className="flex items-center gap-3">
                            <span className="bg-primary text-black font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm">
                                {count}
                            </span>
                            <span className="font-medium">Selected for comparison</span>
                        </div>

                        <div className="h-6 w-px bg-gray-700" />

                        <div className="flex items-center gap-3">
                            <button
                                onClick={clearSelection}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={goToCompare}
                                disabled={count < 2}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${count < 2
                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                    : "bg-white text-black hover:bg-gray-200"
                                    }`}
                            >
                                Compare <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RepoCompareBar;
