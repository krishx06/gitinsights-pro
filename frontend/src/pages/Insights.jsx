import React, { useState, useEffect, useRef } from 'react';
import { getRepos, syncRepos } from '../lib/api';
import api from '../lib/api';
import {
  Activity,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  Search,
  Command,
  RefreshCw
} from 'lucide-react';

const Insights = () => {
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchRepos();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRepos = async () => {
    try {
      let data = await getRepos();

      if (data.length === 0) {
        setSyncing(true);
        try {
          await syncRepos();
          data = await getRepos();
        } catch (syncErr) {
          console.error("Auto-sync failed", syncErr);
        } finally {
          setSyncing(false);
        }
      }

      setRepos(data);
      if (data.length > 0) {
        setSelectedRepo(data[0].fullName);
      }
    } catch (err) {
      console.error("Failed to fetch repos", err);
      setError("Failed to load repositories.");
    }
  };

  const filteredRepos = repos.filter(repo =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const analyzeRepo = async () => {
    if (!selectedRepo) return;

    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      const [owner, repo] = selectedRepo.split('/');
      if (!owner || !repo) {
        throw new Error("Invalid repository format");
      }

      const response = await api.post(`/api/insights/${owner}/${repo}/analyze`);
      setInsights(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Project Insights</h1>
          <p className="text-muted-foreground">Powered by PyTorch & Deep Learning</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center">
          {/* Custom Searchable Combobox */}
          <div className="relative flex-1 md:w-72" ref={dropdownRef}>
            <div
              className="flex items-center justify-between w-full px-4 py-2 bg-secondary rounded-lg cursor-pointer border border-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={`truncate ${!selectedRepo && "text-muted-foreground"}`}>
                {selectedRepo || "Select a repository..."}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
            </div>

            {isOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-card border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 border-b">
                  <div className="flex items-center px-2 py-1 bg-secondary/50 rounded-md">
                    <Search className="w-4 h-4 text-muted-foreground mr-2" />
                    <input
                      type="text"
                      className="w-full bg-transparent border-none focus:outline-none text-sm"
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto p-1">
                  {syncing ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Syncing repositories...
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                      No repositories found
                    </div>
                  ) : (
                    filteredRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center justify-between ${selectedRepo === repo.fullName
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-secondary"
                          }`}
                        onClick={() => {
                          setSelectedRepo(repo.fullName);
                          setIsOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        {repo.fullName}
                        {selectedRepo === repo.fullName && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={analyzeRepo}
            disabled={loading || !selectedRepo}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Project Health Card */}
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Project Health
              </h3>
              <span className={`text-2xl font-bold ${insights.health?.health_score >= 80 ? 'text-green-500' :
                insights.health?.health_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                {insights.health?.health_score || 'N/A'}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consistency</span>
                <span>{insights.health?.consistency || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trend</span>
                <span className="capitalize">{insights.health?.trend || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Days</span>
                <span>{insights.health?.active_days || 0}</span>
              </div>
            </div>
          </div>

          {/* Completion Estimation Card */}
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Completion Est.
              </h3>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Estimated Date</div>
                <div className="text-xl font-medium">
                  {insights.completion?.estimated_completion || 'Insufficient Data'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Days Left</div>
                  <div className="font-semibold">{insights.completion?.days_remaining || '-'}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Daily Velocity</div>
                  <div className="font-semibold">{insights.completion?.avg_daily_commits || 0} commits</div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance Card (Full Width on Mobile) */}
          <div className="bg-card border rounded-xl p-6 md:col-span-2 lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Team Performance Analysis
              </h3>
            </div>

            <div className="overflow-x-auto w-full pb-4">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="pb-3 font-medium text-muted-foreground w-[30%]">Member</th>
                    <th className="pb-3 font-medium text-muted-foreground w-[20%]">Focus Area</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right w-[15%]">Commits</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right w-[20%]">Impact Score</th>
                    <th
                      className="pb-3 font-medium text-muted-foreground text-right w-[15%] cursor-help"
                      title="AI Risk Score: Assessment of contribution risk based on commit size, churn, and documentation quality."
                    >
                      Risk Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {insights.team?.map((member, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium align-top">
                        <div className="text-base">{member.author}</div>
                        {member.feedback && member.feedback.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            {member.feedback.map((tip, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 align-top pt-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${member.focus_area === 'Bug Fixing' ? 'bg-red-500/10 text-red-500' :
                          member.focus_area === 'Feature Work' ? 'bg-green-500/10 text-green-500' :
                            member.focus_area === 'Refactoring' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-gray-500/10 text-gray-500'
                          }`}>
                          {member.focus_area}
                        </span>
                      </td>
                      <td className="py-3 text-right align-top pt-4 font-mono">{member.commits}</td>
                      <td className="py-3 text-right align-top pt-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${member.impact_score}%` }}
                            />
                          </div>
                          <span className="font-mono font-medium">{member.impact_score}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right align-top pt-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${member.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          member.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                          {member.risk_level} ({member.risk_score})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Insights;