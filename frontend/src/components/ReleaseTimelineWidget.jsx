import React from 'react';
import { Tag, Calendar } from 'lucide-react';

const ReleaseTimelineWidget = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Tag size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No releases found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Recent Releases</p>
        <span className="text-xs text-muted-foreground">{data.length} total</span>
      </div>
      
      <div className="space-y-2 max-h-[220px] overflow-y-auto">
        {data.slice(0, 6).map((release) => (
          <div key={release.id} className="p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-green-500" />
                <span className="font-medium text-sm">{release.tag_name}</span>
              </div>
              {release.prerelease && (
                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 rounded">
                  Pre-release
                </span>
              )}
            </div>
            {release.name && (
              <p className="text-xs text-muted-foreground truncate mb-1">{release.name}</p>
            )}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Calendar size={10} />
              {new Date(release.published_at).toLocaleDateString()}
              <span>by {release.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReleaseTimelineWidget;