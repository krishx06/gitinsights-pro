import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const TopContributorsChart = ({ contributors, loading }) => {
  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            {data.avatar_url && (
              <img 
                src={data.avatar_url} 
                alt={data.login}
                className="w-8 h-8 rounded-full"
              />
            )}
            <p className="text-sm font-medium">{data.login}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{data.contributions.toLocaleString()}</span> contributions
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Axis Tick Component
  const CustomAxisTick = ({ x, y, payload, axis }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={axis === 'x' ? 16 : 4}
          dx={axis === 'y' ? -8 : 0}
          textAnchor={axis === 'x' ? 'middle' : 'end'}
          fill="hsl(var(--muted-foreground))"
          fontSize={12}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading contributors...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contributors || contributors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Contributors
          </CardTitle>
          <CardDescription>
            No contributor data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Take top 10 contributors
  const topContributors = contributors.slice(0, 10);
  const totalContributions = topContributors.reduce((sum, c) => sum + c.contributions, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Top Contributors
        </CardTitle>
        <CardDescription>
          Most active contributors by commits
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Total Contributions */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Total Contributions</p>
          <p className="text-2xl font-bold">{totalContributions.toLocaleString()}</p>
        </div>

        {/* Bar Chart */}
        <div className="w-full h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topContributors} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis 
                dataKey="login" 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickMargin={8}
                tick={(props) => <CustomAxisTick {...props} axis="x" />}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickMargin={8}
                tick={(props) => <CustomAxisTick {...props} axis="y" />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="contributions" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contributors List */}
        <div className="space-y-3">
          {topContributors.slice(0, 5).map((contributor, index) => (
            <div key={contributor.login} className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-muted-foreground w-5">
                  #{index + 1}
                </span>
                {contributor.avatar_url && (
                  <img 
                    src={contributor.avatar_url} 
                    alt={contributor.login}
                    className="w-8 h-8 rounded-full ring-2 ring-border"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contributor.login}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{contributor.contributions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">commits</p>
              </div>
            </div>
          ))}
        </div>

        {contributors.length > 5 && (
          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              +{contributors.length - 5} more contributors
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopContributorsChart;