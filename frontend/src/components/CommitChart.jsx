import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

const CommitChart = ({ commits, repoName, loading, error }) => {
  const [dateRange, setDateRange] = useState('all');

  const filteredCommits = useMemo(() => {
    if (!commits || commits.length === 0) return [];

    const now = new Date();
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': Infinity
    };

    const daysBack = ranges[dateRange];
    if (daysBack === Infinity) return commits;

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return commits.filter(commit => {
      const commitDate = new Date(commit.date);
      return commitDate >= cutoffDate;
    });
  }, [commits, dateRange]);

  const stats = useMemo(() => {
    if (!filteredCommits.length) return { total: 0, average: 0, max: 0 };

    const total = filteredCommits.reduce((sum, c) => sum + c.commits, 0);
    const average = (total / filteredCommits.length).toFixed(1);
    const max = Math.max(...filteredCommits.map(c => c.commits));

    return { total, average, max };
  }, [filteredCommits]);

  const dateRangeButtons = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: 'all', label: 'All time' }
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-1">
            {new Date(data.date).toLocaleDateString('en-US', { 
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{data.commits}</span> commits
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Commit Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading commit data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Commit Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading commits</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!commits || commits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Commit Activity
          </CardTitle>
          <CardDescription>
            No commit data available. Select a repository to view activity.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Commit Activity
            </CardTitle>
            <CardDescription>
              {repoName && `Showing activity for ${repoName}`}
            </CardDescription>
          </div>

          {/* Date Range Filters */}
          <div className="flex gap-1 bg-muted p-1 rounded-md">
            {dateRangeButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setDateRange(btn.value)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  dateRange === btn.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Commits</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg per Day</p>
            <p className="text-2xl font-bold">{stats.average}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Peak Day</p>
            <p className="text-2xl font-bold">{stats.max}</p>
          </div>
        </div>

        {/* Chart */}
        {filteredCommits.length > 0 ? (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredCommits} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" stroke="currentColor" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
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
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No commits found in this date range
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommitChart;