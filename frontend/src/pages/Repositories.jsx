import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import RepoList from "../components/RepoList";
import RepoSearchBar from "../components/RepoSearchBar";
import RepoCompareBar from "../components/RepoCompareBar";
import useRepoStore from "../store/repoStore";

const Repositories = () => {
  const { fetchRepos, syncRepositories, syncing } = useRepoStore();


  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Repositories</h1>
            <p className="text-gray-400">Analytics for all your repositories</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <RepoSearchBar />

            <button
              onClick={syncRepositories}
              disabled={syncing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${syncing
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl"
                }`}
            >
              <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Repositories"}
            </button>
          </div>
        </div>


        <RepoList />


        <RepoCompareBar />
      </div>
    </div>
  );
};

export default Repositories;