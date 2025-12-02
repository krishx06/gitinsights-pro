import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import RepoList from "../components/RepoList";
import RepoSearchBar from "../components/RepoSearchBar";
import RepoCompareBar from "../components/RepoCompareBar";
import RepositoryActivityChart from "../components/RepositoryActivityChart";
import useRepoStore from "../store/repoStore";

const Repositories = () => {
  const { 
    fetchRepos, 
    syncRepositories, 
    syncing,
    fetchAnalytics,
    analytics,
    analyticsLoading,
    analyticsError
  } = useRepoStore();

  useEffect(() => {
    fetchRepos();
    fetchAnalytics(); // Fetch analytics on mount
  }, [fetchRepos, fetchAnalytics]);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Repositories</h1>
            <p className="text-muted-foreground">Analytics for all your repositories</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <RepoSearchBar />

            <button
              onClick={syncRepositories}
              disabled={syncing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                syncing
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
              }`}
            >
              <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Repositories"}
            </button>
          </div>
        </div>

        {/* Analytics Chart */}
        <RepositoryActivityChart 
          data={analytics}
          loading={analyticsLoading}
          error={analyticsError}
        />

        {/* Repository List */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-6">Your Repositories</h2>
          <RepoList />
        </div>

        {/* Compare Bar */}
        <RepoCompareBar />
      </div>
    </div>
  );
};

export default Repositories;