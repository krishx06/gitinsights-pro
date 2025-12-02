import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const RepositoryActivityChart = ({ data, loading, error }) => {
  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{data.month}</p>
          <p className="text-sm text-primary">
            <span className="font-bold">{data.commits}</span> Commits
          </p>
          <p className="text-sm text-chart-2">
            <span className="font-bold">{data.pullRequests}</span> Pull Requests
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Axis Tick
  const CustomAxisTick = ({ x, y, payload, axis }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={axis === "x" ? 16 : 4}
          dx={axis === "y" ? -8 : 0}
          textAnchor={axis === "x" ? "middle" : "end"}
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
            <TrendingUp className="h-5 w-5" />
            Repository Activity
          </CardTitle>
          <CardDescription>Commits and pull requests over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading analytics...
              </p>
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
            <TrendingUp className="h-5 w-5" />
            Repository Activity
          </CardTitle>
          <CardDescription>Commits and pull requests over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading analytics</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Repository Activity
          </CardTitle>
          <CardDescription>Commits and pull requests over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No activity data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Repository Activity
        </CardTitle>
        <CardDescription>Commits and pull requests over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickMargin={8}
                tick={(props) => <CustomAxisTick {...props} axis="x" />}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickMargin={8}
                tick={(props) => <CustomAxisTick {...props} axis="y" />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="commits"
                name="Commits"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
              <Line
                type="monotone"
                dataKey="pullRequests"
                name="Pull Requests"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--chart-2))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepositoryActivityChart;