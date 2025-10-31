import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repoInput, setRepoInput] = useState("");
  const [repoData, setRepoData] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [commits, setCommits] = useState([]);
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = searchParams.get("token") || localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    if (searchParams.get("token")) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/dashboard");
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${backendUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [searchParams, navigate, backendUrl]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const analyzeRepo = async () => {
    if (!repoInput.trim()) return;

    const parts = repoInput.trim().split("/");
    if (parts.length !== 2) {
      setError(
        "Please enter a valid format: owner/repo (e.g., facebook/react)"
      );
      return;
    }

    const [owner, repo] = parts;
    setLoadingRepo(true);
    setError(null);
    setRepoData(null);
    setLanguages([]);
    setContributors([]);
    setCommits([]);

    try {
      // Fetch all data in parallel
      const [statsRes, langsRes, contribRes, commitsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/repos/${owner}/${repo}/stats`),
        axios.get(`${backendUrl}/api/repos/${owner}/${repo}/languages`),
        axios.get(`${backendUrl}/api/repos/${owner}/${repo}/contributors`),
        axios.get(`${backendUrl}/api/repos/${owner}/${repo}/commits`),
      ]);

      setRepoData(statsRes.data);
      setLanguages(langsRes.data);
      setContributors(contribRes.data.slice(0, 10)); // Top 10 contributors
      setCommits(commitsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch repository data");
      console.error("Error fetching repo data:", err);
    } finally {
      setLoadingRepo(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      analyzeRepo();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1116] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1116] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#161b22] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              alt="GitHub"
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-bold">GitInsights Pro</h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="text-sm hidden md:block">
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-gray-400">{user.email}</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.username}! 👋
          </h2>
          <p className="text-gray-400">
            Search for any GitHub repository to view detailed analytics and
            insights.
          </p>
        </div>

        {/* Repository Search */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">🔍 Search Repository</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., facebook/react"
              className="flex-1 px-4 py-3 bg-[#0f1116] border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              disabled={loadingRepo}
            />
            <button
              onClick={analyzeRepo}
              disabled={loadingRepo}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingRepo ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Repository Data */}
        {repoData && (
          <div className="space-y-6">
            {/* Repository Overview */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {repoData.full_name}
                  </h2>
                  <p className="text-gray-400">
                    {repoData.description || "No description provided"}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                  {repoData.language || "N/A"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-[#0f1116] p-4 rounded-lg">
                  <div className="text-3xl mb-1">⭐</div>
                  <div className="text-2xl font-bold">
                    {repoData.stars.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Stars</div>
                </div>
                <div className="bg-[#0f1116] p-4 rounded-lg">
                  <div className="text-3xl mb-1">🍴</div>
                  <div className="text-2xl font-bold">
                    {repoData.forks.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Forks</div>
                </div>
                <div className="bg-[#0f1116] p-4 rounded-lg">
                  <div className="text-3xl mb-1">👁️</div>
                  <div className="text-2xl font-bold">
                    {repoData.watchers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Watchers</div>
                </div>
                <div className="bg-[#0f1116] p-4 rounded-lg">
                  <div className="text-3xl mb-1">🐛</div>
                  <div className="text-2xl font-bold">
                    {repoData.open_issues.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Open Issues</div>
                </div>
              </div>
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">💻 Languages</h3>
                <div className="space-y-3">
                  {languages.slice(0, 5).map((lang) => (
                    <div key={lang.name}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-gray-400">
                          {lang.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#0f1116] rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${lang.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contributors */}
            {contributors.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">👥 Top Contributors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contributors.map((contributor) => (
                    <div
                      key={contributor.id}
                      className="flex items-center gap-3 bg-[#0f1116] p-3 rounded-lg"
                    >
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <a
                          href={contributor.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:text-blue-400 transition-colors"
                        >
                          {contributor.login}
                        </a>
                        <div className="text-sm text-gray-400">
                          {contributor.contributions} contributions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commit Activity */}
            {commits.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">
                  📈 Commit Activity (Last 28 Days)
                </h3>
                <div className="space-y-2">
                  {commits.slice(-14).map((commit) => (
                    <div key={commit.date} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-24">
                        {commit.date}
                      </span>
                      <div className="flex-1 bg-[#0f1116] rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-green-600 h-full rounded-full flex items-center px-3 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (commit.commits /
                                Math.max(...commits.map((c) => c.commits))) *
                                100,
                              100
                            )}%`,
                            minWidth: "40px",
                          }}
                        >
                          <span className="text-xs font-semibold">
                            {commit.commits}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Total commits:{" "}
                  {commits.reduce((sum, c) => sum + c.commits, 0)}
                </div>
              </div>
            )}

            {/* Repository Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">
                ℹ️ Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="ml-2 font-semibold">
                    {(repoData.size / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Languages:</span>
                  <span className="ml-2 font-semibold">
                    {repoData.languages_count}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Contributors:</span>
                  <span className="ml-2 font-semibold">
                    {repoData.contributors_count}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(repoData.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(repoData.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Last Push:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(repoData.pushed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!repoData && !loadingRepo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-xl font-semibold mb-1">Repository Stats</h3>
              <p className="text-gray-400 text-sm">
                View stars, forks, watchers, and open issues
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-4xl mb-2">💻</div>
              <h3 className="text-xl font-semibold mb-1">Language Breakdown</h3>
              <p className="text-gray-400 text-sm">
                See the languages used in the repository
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-4xl mb-2">📈</div>
              <h3 className="text-xl font-semibold mb-1">Commit Activity</h3>
              <p className="text-gray-400 text-sm">
                Track commit history over the last 28 days
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
