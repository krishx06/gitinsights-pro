import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { GitPullRequest, Clock, CheckCircle, XCircle, GitMerge, BarChart2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';

const PullRequests = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('4w'); 
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.getPullRequestStats();
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch PR stats:", err);
        setError("Failed to load pull request data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pull Requests</h1>
          <p className="text-muted-foreground mt-2">Track and analyze pull request metrics across all repositories</p>
        </div>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Fetching your PR data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pull Requests</h1>
          <p className="text-muted-foreground mt-2">Track and analyze pull request metrics across all repositories</p>
        </div>
        <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { metrics, activity, activityAllTime, topRepos, recentPRs, languages } = data;

  const chartData = timeRange === '4w' ? activity : activityAllTime;

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6'];

  const cards = [
    {
      title: "Open PRs",
      value: metrics.open,
      subtitle: "Awaiting review",
      icon: <GitPullRequest className="h-5 w-5 text-blue-500" />,
      trend: "Active",
    },
    {
      title: "Avg Review Time",
      value: `${metrics.avgReviewTime}h`,
      subtitle: "Average time to close",
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      trend: "Speed",
    },
    {
      title: "Merged",
      value: metrics.merged,
      subtitle: "Successfully merged",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      trend: "Completed",
    },
    {
      title: "Closed Unmerged",
      value: metrics.closedUnmerged,
      subtitle: "Closed without merge",
      icon: <XCircle className="h-5 w-5 text-gray-500" />,
      trend: "Archived",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pull Requests</h1>
        <p className="text-muted-foreground mt-2">Track and analyze pull request metrics across all repositories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
              </div>
              <div className="p-2 bg-secondary/50 rounded-lg">
                {card.icon}
              </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="font-medium text-primary mr-2">{card.trend}</span>
              {card.subtitle}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-card border rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">PR Activity</h3>
              <p className="text-sm text-muted-foreground">Breakdown of pull requests</p>
            </div>
            <div className="flex bg-secondary/50 rounded-lg p-1">
              <button
                onClick={() => setTimeRange('4w')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === '4w' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Last 4 Weeks
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === 'all' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey={timeRange === '4w' ? "week" : "month"} 
                  tickFormatter={(value, index) => {
                    if (timeRange === '4w') return `W${index + 1}`;
                    const date = new Date(value + '-01'); 
                    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                  }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                          <p className="font-medium mb-2">{label}</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-[#8B5CF6]">Opened : {payload[0]?.value || 0}</p>
                            <p className="text-[#10B981]">Merged : {payload[1]?.value || 0}</p>
                            <p className="text-[#F59E0B]">Closed : {payload[2]?.value || 0}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="opened" name="Opened" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="merged" name="Merged" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="closed" name="Closed" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Top Contributing Repositories</h3>
            <p className="text-sm text-muted-foreground">Where you are most active</p>
          </div>
          <div className="space-y-6">
            {topRepos.map((repo, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{repo.name}</span>
                  <span className="text-xs text-muted-foreground">{repo.count} PRs</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(repo.count / Math.max(...topRepos.map(r => r.count))) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
            {topRepos.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No repositories found</p>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Languages</h3>
            <p className="text-sm text-muted-foreground">Languages used in PRs</p>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languages}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {languages && languages.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="transition-all duration-300 outline-none"
                      opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.6}
                      stroke={hoveredIndex === index ? 'rgba(255,255,255,0.2)' : 'none'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-sm font-medium text-muted-foreground ml-1.5">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center transition-all duration-200">
                <span className="text-4xl font-bold block tracking-tighter animate-in fade-in zoom-in-95 duration-200" key={hoveredIndex !== null ? 'hover' : 'total'}>
                  {hoveredIndex !== null ? languages[hoveredIndex].value : (languages ? languages.reduce((acc, curr) => acc + curr.value, 0) : 0)}
                </span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {hoveredIndex !== null ? languages[hoveredIndex].name : 'Total'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Pull Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Repository</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentPRs.map((pr) => (
                <tr key={pr.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium truncate max-w-xs">{pr.title}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{pr.repo}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${pr.state === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        pr.state === 'merged' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {pr.state}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {new Date(pr.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <a 
                      href={pr.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PullRequests;