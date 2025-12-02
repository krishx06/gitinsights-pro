import React from 'react';
import { GitPullRequest, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PullRequestWidget = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const openPercentage = data.total > 0 ? ((data.open / data.total) * 100).toFixed(0) : 0;
  const closedPercentage = data.total > 0 ? ((data.closed / data.total) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-muted rounded-lg">
          <GitPullRequest size={20} className="mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{data.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="text-center p-3 bg-green-500/10 rounded-lg">
          <CheckCircle size={20} className="mx-auto mb-1 text-green-500" />
          <p className="text-2xl font-bold text-green-500">{data.closed}</p>
          <p className="text-xs text-muted-foreground">Closed</p>
        </div>
        <div className="text-center p-3 bg-blue-500/10 rounded-lg">
          <Clock size={20} className="mx-auto mb-1 text-blue-500" />
          <p className="text-2xl font-bold text-blue-500">{data.open}</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Open: {openPercentage}%</span>
          <span className="text-muted-foreground">Closed: {closedPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-blue-500" 
            style={{ width: `${openPercentage}%` }}
          />
          <div 
            className="h-full bg-green-500" 
            style={{ width: `${closedPercentage}%` }}
          />
        </div>
      </div>

      {/* Recent PRs */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Recent Pull Requests</p>
        <div className="space-y-1 max-h-[120px] overflow-y-auto">
          {data.recentPRs?.slice(0, 4).map((pr) => (
            <div key={pr.number} className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded">
              <span className={`w-2 h-2 rounded-full ${pr.state === 'open' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <span className="font-medium">#{pr.number}</span>
              <span className="flex-1 truncate">{pr.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PullRequestWidget;