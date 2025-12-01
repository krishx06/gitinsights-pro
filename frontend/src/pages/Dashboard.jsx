import React, { useEffect, useState } from 'react';
import { 
  GitCommit, 
  Code,
  Star,
  GitFork,
  Clock,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { cn } from '../lib/utils';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCommits: 0,
    totalRepos: 0,
    totalStars: 0,
    totalForks: 0,
  });
  const [commitActivity, setCommitActivity] = useState([]);
  const [languageStats, setLanguageStats] = useState([]);
  const [recentRepos, setRecentRepos] = useState([]);
  const [allRepos, setAllRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Filter states
  const [repoFilter, setRepoFilter] = useState('30');
  const [dateFilter, setDateFilter] = useState('12weeks');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const CHART_COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{data.value}</span> repositories
            <span className="text-xs ml-2">({data.payload.percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const fetchAllRepos = async (githubToken) => {
    let page = 1;
    let allRepos = [];
    let hasMore = true;

    while (hasMore && (repoFilter === 'all' || allRepos.length < parseInt(repoFilter))) {
      const response = await axios.get(
        `https://api.github.com/user/repos?sort=updated&per_page=100&page=${page}&affiliation=owner,collaborator`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );

      if (response.data.length === 0) {
        hasMore = false;
      } else {
        allRepos = [...allRepos, ...response.data];
        page++;
      }

      if (repoFilter !== 'all' && allRepos.length >= parseInt(repoFilter)) {
        allRepos = allRepos.slice(0, parseInt(repoFilter));
        hasMore = false;
      }
    }

    return allRepos;
  };

const fetchDashboardData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const token = localStorage.getItem("token");
    
    const userResponse = await axios.get(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const githubToken = userResponse.data.accessToken;
    const username = userResponse.data.username;
    
    console.log('Fetching data for user:', username);

    // Fetch repositories - exclude forks to get accurate count
    const repos = await fetchAllRepos(githubToken);
    
    // Filter out forked repos for accurate count
    const ownRepos = repos.filter(repo => !repo.fork);
    
    console.log(`Total repos: ${repos.length}, Own repos (excluding forks): ${ownRepos.length}`);
    
    setAllRepos(ownRepos);
    setRecentRepos(ownRepos.slice(0, 5));

    // Calculate statistics - Stars YOUR repos received, Forks YOUR repos received
    const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0);

    console.log(`Total stars on your repos: ${totalStars}, Total forks of your repos: ${totalForks}`);

    // Get language statistics
    const languageCount = {};
    ownRepos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    const totalLangRepos = Object.values(languageCount).reduce((a, b) => a + b, 0);
    const languageData = Object.entries(languageCount)
      .map(([name, count]) => ({ 
        name, 
        value: count,
        percentage: ((count / totalLangRepos) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    
    setLanguageStats(languageData);

    // Determine weeks based on date filter
    const weeksToFetch = {
      '4weeks': 4,
      '12weeks': 12,
      '6months': 26,
      '1year': 52
    }[dateFilter] || 12;

    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - (weeksToFetch * 7));

    console.log(`Fetching commits from ${cutoffDate.toISOString().split('T')[0]} to now`);

    // Use GitHub Search API to get ALL commits (public + private)
    // Add "is:public OR is:private" to include both
    const searchQuery = `author:${username} committer-date:>=${cutoffDate.toISOString().split('T')[0]}`;
    
    let totalCommits = 0;
    
    try {
      const searchResponse = await axios.get(
        `https://api.github.com/search/commits?q=${encodeURIComponent(searchQuery)}&per_page=1`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );
      
      totalCommits = searchResponse.data.total_count;
      console.log(`Total commits found (public + private): ${totalCommits}`);
      
    } catch (searchError) {
      console.error('Search API error:', searchError.message);
      // If search fails, we'll use contributor stats as fallback
    }

    // Get weekly breakdown for the chart (simplified - only check top 15 repos)
    const topRepos = ownRepos.slice(0, 15);
    console.log(`Fetching weekly stats from top ${topRepos.length} repos...`);
    
    const weeklyData = new Array(weeksToFetch).fill(0).map((_, i) => ({
      week: `W${i + 1}`,
      commits: 0
    }));

    // Fetch contributor stats in smaller batches
    for (const repo of topRepos) {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${repo.full_name}/stats/contributors`,
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: 'application/vnd.github+json',
            },
          }
        );
        
        const userContributions = response.data?.find(
          contributor => contributor.author?.login?.toLowerCase() === username.toLowerCase()
        );
        
        if (userContributions?.weeks) {
          const recentWeeks = userContributions.weeks.slice(-weeksToFetch);
          recentWeeks.forEach((week, idx) => {
            if (weeklyData[idx] && week.c) {
              weeklyData[idx].commits += week.c;
            }
          });
        }
      } catch (error) {
        // Skip repos where stats aren't available
        console.log(`Skipped ${repo.full_name}`);
      }
    }

    const weeklyTotal = weeklyData.reduce((sum, week) => sum + week.commits, 0);
    console.log(`Weekly chart shows ${weeklyTotal} commits from top ${topRepos.length} repos`);

    // Use search API total if available (more accurate), otherwise use weekly
    const finalCommitCount = totalCommits > 0 ? totalCommits : weeklyTotal;

    setCommitActivity(weeklyData);
    setStats({
      totalCommits: finalCommitCount,
      totalRepos: ownRepos.length,
      totalStars,
      totalForks,
    });

  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    setError(err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDashboardData();
  }, [repoFilter, dateFilter]);

  const filterButtons = [
    { value: '30', label: 'Last 30' },
    { value: '100', label: 'Last 100' },
    { value: 'all', label: 'All Repos' }
  ];

  const dateFilterButtons = [
    { value: '4weeks', label: '4 Weeks' },
    { value: '12weeks', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' }
  ];

  const statCards = [
    {
      label: 'Total Commits',
      value: stats.totalCommits.toLocaleString(),
      subtitle: `Public + Private (${dateFilter === '4weeks' ? '4 weeks' : dateFilter === '12weeks' ? '12 weeks' : dateFilter === '6months' ? '6 months' : '1 year'})`,
      icon: GitCommit,
      color: 'text-blue-500',
    },
    {
      label: 'Repositories',
      value: stats.totalRepos.toString(),
      subtitle: 'Your repos (excluding forks)',
      icon: Code,
      color: 'text-purple-500',
    },
    {
      label: 'Stars Received',
      value: stats.totalStars.toLocaleString(),
      subtitle: 'Stars on your repositories',
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      label: 'Times Forked',
      value: stats.totalForks.toLocaleString(),
      subtitle: 'Your repos forked by others',
      icon: GitFork,
      color: 'text-green-500',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Loading your analytics...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 h-32 bg-muted/20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your GitHub activity</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setRepoFilter(btn.value)}
                disabled={loading}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded transition-colors disabled:opacity-50",
                  repoFilter === btn.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            {dateFilterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setDateFilter(btn.value)}
                disabled={loading}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded transition-colors disabled:opacity-50",
                  dateFilter === btn.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {debugInfo && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">
              Debug: {debugInfo.username} | {debugInfo.reposChecked} repos checked | 
              {debugInfo.successfulFetches} successful | Search API: {debugInfo.commitsFromSearch} commits | 
              Weekly: {debugInfo.commitsFromWeekly} commits | Range: {debugInfo.dateRange}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`p-2 bg-muted rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Commit Activity
            </CardTitle>
            <CardDescription>
              Weekly commits - {dateFilter === '4weeks' ? 'Last 4 weeks' : dateFilter === '12weeks' ? 'Last 12 weeks' : dateFilter === '6months' ? 'Last 6 months' : 'Last year'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={commitActivity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="week" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commits" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>
              Programming languages across {stats.totalRepos} repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {languageStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {languageStats.map((lang, index) => (
                <div key={lang.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {lang.name} <span className="font-medium text-foreground">({lang.value})</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Repositories */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Repositories</CardTitle>
          <CardDescription>Your 5 most recently updated repositories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRepos.length > 0 ? (
              recentRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Code size={16} className="text-muted-foreground" />
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {repo.full_name}
                      </a>
                      {repo.private && (
                        <span className="px-2 py-0.5 text-xs bg-muted rounded">Private</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {repo.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          {repo.language}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star size={12} />
                        {repo.stargazers_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork size={12} />
                        {repo.forks_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No repositories found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;