import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const IssueTrackerWidget = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-muted rounded-lg">
          <AlertCircle size={20} className="mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{data.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="text-center p-3 bg-red-500/10 rounded-lg">
          <Clock size={20} className="mx-auto mb-1 text-red-500" />
          <p className="text-2xl font-bold text-red-500">{data.open}</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
        <div className="text-center p-3 bg-green-500/10 rounded-lg">
          <CheckCircle2 size={20} className="mx-auto mb-1 text-green-500" />
          <p className="text-2xl font-bold text-green-500">{data.closed}</p>
          <p className="text-xs text-muted-foreground">Closed</p>
        </div>
      </div>

      {/* Recent Issues */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Recent Issues</p>
        <div className="space-y-1 max-h-[150px] overflow-y-auto">
          {data.recentIssues?.slice(0, 5).map((issue) => (
            <div key={issue.number} className="p-2 bg-muted/50 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${issue.state === 'open' ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-xs font-medium">#{issue.number}</span>
                <span className="text-xs text-muted-foreground">{issue.user}</span>
              </div>
              <p className="text-xs truncate">{issue.title}</p>
              {issue.labels.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {issue.labels.slice(0, 2).map((label, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IssueTrackerWidget;