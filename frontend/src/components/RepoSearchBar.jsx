
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import useRepoStore from "../store/repoStore";

const RepoSearchBar = () => {
    const { setSearchQuery, fetchRepos } = useRepoStore();
    const [val, setVal] = useState("");


    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(val);
            fetchRepos();
        }, 300);

        return () => clearTimeout(timer);
    }, [val, setSearchQuery, fetchRepos]);

    return (
        <div className="relative w-full max-w-md">
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
            />
            <input
                type="text"
                placeholder="Search repositories..."
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full bg-[#121212] border border-[#1E1E1E] text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
            />
        </div>
    );
};

export default RepoSearchBar;
