import React from 'react';
import { Activity, GitCommit, GitPullRequest, GitBranch, Tag } from 'lucide-react';

const ActivityFeedWidget = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'PushEvent': return <GitCommit size={14} className="text-blue-500" />;
      case 'PullRequestEvent': return <GitPullRequest size={14} className="text-purple-500" />;
      case 'CreateEvent': return <GitBranch size={14} className="text-green-500" />;
      case 'ReleaseEvent': return <Tag size={14} className="text-yellow-500" />;
      default: return <Activity size={14} className="text-muted-foreground" />;
    }
  };

  const formatActivity = (event) => {
    switch (event.type) {
      case 'PushEvent':
        return `pushed ${event.payload.commits} commit${event.payload.commits !== 1 ? 's' : ''}`;
      case 'PullRequestEvent':
        return `${event.payload.action} pull request`;
      case 'CreateEvent':
        return `created ${event.payload.ref_type} ${event.payload.ref}`;
      case 'ReleaseEvent':
        return `published release`;
      default:
        return event.type.replace('Event', '').toLowerCase();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Recent Activity</p>
      <div className="space-y-2 max-h-[220px] overflow-y-auto">
        {data.slice(0, 10).map((event) => (
          <div key={event.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
            <div className="mt-0.5">{getIcon(event.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <img 
                  src={event.actor_avatar} 
                  alt={event.actor}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs font-medium">{event.actor}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatActivity(event)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {new Date(event.created_at).toRelativeTime()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Date.prototype.toRelativeTime = function() {
  const seconds = Math.floor((new Date() - this) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default ActivityFeedWidget;