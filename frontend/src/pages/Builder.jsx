import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  Users,
  Settings,
  X,
  GitPullRequest,
  AlertCircle,
  Tag,
  Activity,
  TrendingUp,
  Trash2,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import CommitChart from '../components/CommitChart';
import LanguageChart from '../components/LanguageChart';
import TopContributorsChart from '../components/TopContributorsChart';
import PullRequestWidget from '../components/PullRequestWidget';
import IssueTrackerWidget from '../components/IssueTrackerWidget';
import ReleaseTimelineWidget from '../components/ReleaseTimelineWidget';
import ActivityFeedWidget from '../components/ActivityFeedWidget';
import CodeFrequencyWidget from '../components/CodeFrequencyWidget';
import api from '../lib/api';
import { cn } from '../lib/utils';

const Builder = () => {
  const [widgets, setWidgets] = useState([]);
  const [dashboardName, setDashboardName] = useState('My Custom Dashboard');
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  
  // Widget data states
  const [repoData, setRepoData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDashboards, setLoadingDashboards] = useState(true);

  // Available widget types
  const widgetTypes = [
    {
      id: 'commit-timeline',
      name: 'Commit Timeline',
      iconName: 'LineChart',
      description: 'Line chart showing commit activity over time',
      color: 'text-blue-500',
      component: 'CommitChart'
    },
    {
      id: 'language-distribution',
      name: 'Language Distribution',
      iconName: 'PieChart',
      description: 'Pie chart of programming languages used',
      color: 'text-green-500',
      component: 'LanguageChart'
    },
    {
      id: 'top-contributors',
      name: 'Top Contributors',
      iconName: 'Users',
      description: 'Bar chart of most active contributors',
      color: 'text-purple-500',
      component: 'TopContributorsChart'
    },
    {
      id: 'repository-stats',
      name: 'Repository Stats',
      iconName: 'BarChart',
      description: 'Key metrics: stars, forks, issues',
      color: 'text-orange-500',
      component: 'RepoStats'
    },
    {
      id: 'pull-requests',
      name: 'Pull Requests',
      iconName: 'GitPullRequest',
      description: 'PR metrics and recent pull requests',
      color: 'text-purple-500',
      component: 'PullRequestWidget'
    },
    {
      id: 'issue-tracker',
      name: 'Issue Tracker',
      iconName: 'AlertCircle',
      description: 'Issue trends and recent issues',
      color: 'text-red-500',
      component: 'IssueTrackerWidget'
    },
    {
      id: 'release-timeline',
      name: 'Release Timeline',
      iconName: 'Tag',
      description: 'Recent releases and versions',
      color: 'text-yellow-500',
      component: 'ReleaseTimelineWidget'
    },
    {
      id: 'activity-feed',
      name: 'Activity Feed',
      iconName: 'Activity',
      description: 'Recent repository activity',
      color: 'text-cyan-500',
      component: 'ActivityFeedWidget'
    },
    {
      id: 'code-frequency',
      name: 'Code Frequency',
      iconName: 'TrendingUp',
      description: 'Code additions and deletions',
      color: 'text-pink-500',
      component: 'CodeFrequencyWidget'
    },
  ];

  // Icon mapping
  const iconMap = {
    'LineChart': LineChartIcon,
    'PieChart': PieChartIcon,
    'Users': Users,
    'BarChart': BarChart3,
    'GitPullRequest': GitPullRequest,
    'AlertCircle': AlertCircle,
    'Tag': Tag,
    'Activity': Activity,
    'TrendingUp': TrendingUp
  };

  // Load saved dashboards from backend
  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    setLoadingDashboards(true);
    try {
      const response = await api.get('/api/dashboards');
      setSavedDashboards(response.data);
      
      // Load the most recent dashboard
      if (response.data.length > 0) {
        loadDashboard(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
    } finally {
      setLoadingDashboards(false);
    }
  };

  const addWidget = (widgetType) => {
    const newWidget = {
      id: Date.now(),
      type: widgetType.id,
      name: widgetType.name,
      iconName: widgetType.iconName,
      color: widgetType.color,
      component: widgetType.component,
      config: {
        repos: [],
        dateRange: '30d',
        limit: 10
      }
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetLibrary(false);
  };

  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const openWidgetConfig = (widget) => {
    setCurrentWidget(widget);
    setShowConfigModal(true);
  };

  const updateWidgetConfig = (config) => {
    setWidgets(widgets.map(w => 
      w.id === currentWidget.id 
        ? { ...w, config: { ...w.config, ...config } }
        : w
    ));
  };

  const saveDashboard = async () => {
    if (!dashboardName.trim()) {
      alert('Please enter a dashboard name');
      return;
    }

    if (widgets.length === 0) {
      alert('Please add at least one widget');
      return;
    }

    setSaving(true);
    try {
      const dashboardData = {
        name: dashboardName,
        widgets: widgets
      };

      let response;
      if (currentDashboardId) {
        // Update existing dashboard
        response = await api.put(`/api/dashboards/${currentDashboardId}`, dashboardData);
      } else {
        // Create new dashboard
        response = await api.post('/api/dashboards', dashboardData);
        setCurrentDashboardId(response.data.id);
      }

      // Refresh dashboards list
      await fetchDashboards();
      alert('Dashboard saved successfully!');
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      alert('Failed to save dashboard. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadDashboard = (dashboard) => {
    setDashboardName(dashboard.name);
    setCurrentDashboardId(dashboard.id);
    
    // Ensure widgets have proper structure
    const cleanedWidgets = (dashboard.widgets || []).map(w => ({
      ...w,
      iconName: w.iconName || 'Activity'
    }));
    setWidgets(cleanedWidgets);
  };

  const createNewDashboard = () => {
    setDashboardName('New Dashboard');
    setWidgets([]);
    setCurrentDashboardId(null);
  };

  const deleteDashboard = async (dashboardId) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) {
      return;
    }

    try {
      await api.delete(`/api/dashboards/${dashboardId}`);

      // If deleting current dashboard, clear it
      if (currentDashboardId === dashboardId) {
        createNewDashboard();
      }

      // Refresh dashboards list
      await fetchDashboards();
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
      alert('Failed to delete dashboard. Please try again.');
    }
  };

  const fetchRepoData = async (owner, repo) => {
    const key = `${owner}/${repo}`;
    if (repoData[key]) return;

    setLoading(true);
    try {
      const [statsRes, commitsRes, langsRes, contribRes, pullsRes, issuesRes, releasesRes, activityRes, codeFreqRes] = await Promise.all([
        api.get(`/api/repos/${owner}/${repo}/stats`),
        api.get(`/api/repos/${owner}/${repo}/commits`),
        api.get(`/api/repos/${owner}/${repo}/languages`),
        api.get(`/api/repos/${owner}/${repo}/contributors`),
        api.get(`/api/repos/${owner}/${repo}/pulls`).catch(() => ({ data: null })),
        api.get(`/api/repos/${owner}/${repo}/issues`).catch(() => ({ data: null })),
        api.get(`/api/repos/${owner}/${repo}/releases`).catch(() => ({ data: [] })),
        api.get(`/api/repos/${owner}/${repo}/activity`).catch(() => ({ data: [] })),
        api.get(`/api/repos/${owner}/${repo}/code-frequency`).catch(() => ({ data: [] })),
      ]);

      setRepoData(prev => ({
        ...prev,
        [key]: {
          stats: statsRes.data,
          commits: commitsRes.data,
          languages: langsRes.data,
          contributors: contribRes.data,
          pulls: pullsRes.data,
          issues: issuesRes.data,
          releases: releasesRes.data,
          activity: activityRes.data,
          codeFrequency: codeFreqRes.data
        }
      }));
    } catch (error) {
      console.error('Failed to fetch repo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (widget) => {
    if (!widget || !widget.component) {
      return (
        <Card className="relative">
          <CardContent className="py-8 text-center text-muted-foreground">
            Invalid widget configuration
          </CardContent>
        </Card>
      );
    }

    const IconComponent = iconMap[widget.iconName] || Activity;
    const repoKey = widget.config?.repos?.[0];
    const data = repoData[repoKey];

    const widgetWrapper = (content) => (
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconComponent size={18} className={widget.color} />
            {widget.name}
          </CardTitle>
          <div className="flex gap-1">
            <button
              onClick={() => openWidgetConfig(widget)}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Configure"
            >
              <Settings size={16} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1 hover:bg-destructive/10 rounded transition-colors"
              title="Remove"
            >
              <X size={16} className="text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );

    if (!widget.config.repos || widget.config.repos.length === 0) {
      return widgetWrapper(
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center">
            <IconComponent size={48} className={`${widget.color} mb-3 mx-auto opacity-50`} />
            <p className="text-sm text-muted-foreground mb-3">
              Configure this widget to select a repository
            </p>
            <button
              onClick={() => openWidgetConfig(widget)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
            >
              Configure Widget
            </button>
          </div>
        </div>
      );
    }

    if (!data) {
      return widgetWrapper(
        <div className="h-[250px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        </div>
      );
    }

    switch (widget.component) {
      case 'CommitChart':
        return <CommitChart commits={data.commits} repoName={repoKey} />;
      
      case 'LanguageChart':
        return <LanguageChart languages={data.languages} />;
      
      case 'TopContributorsChart':
        return <TopContributorsChart contributors={data.contributors} />;
      
      case 'PullRequestWidget':
        return widgetWrapper(<PullRequestWidget data={data.pulls} />);
      
      case 'IssueTrackerWidget':
        return widgetWrapper(<IssueTrackerWidget data={data.issues} />);
      
      case 'ReleaseTimelineWidget':
        return widgetWrapper(<ReleaseTimelineWidget data={data.releases} />);
      
      case 'ActivityFeedWidget':
        return widgetWrapper(<ActivityFeedWidget data={data.activity} />);
      
      case 'CodeFrequencyWidget':
        return widgetWrapper(<CodeFrequencyWidget data={data.codeFrequency} />);
      
      case 'RepoStats':
        return widgetWrapper(
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Stars</p>
              <p className="text-2xl font-bold">⭐ {data.stats.stars?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Forks</p>
              <p className="text-2xl font-bold">🍴 {data.stats.forks?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Issues</p>
              <p className="text-2xl font-bold">🐛 {data.stats.open_issues?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Watchers</p>
              <p className="text-2xl font-bold">👁️ {data.stats.watchers?.toLocaleString()}</p>
            </div>
          </div>
        );
      
      default:
        return widgetWrapper(
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Widget not implemented
          </div>
        );
    }
  };

  if (loadingDashboards) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Builder</h1>
          <p className="text-muted-foreground">Create and manage custom dashboards</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={createNewDashboard}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Dashboard
          </button>
          
          <button
            onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            {showWidgetLibrary ? 'Hide' : 'Show'} Widgets
          </button>
          
          <button
            onClick={saveDashboard}
            disabled={widgets.length === 0 || saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Dashboard
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dashboard Name */}
      <Card>
        <CardContent className="pt-6">
          <label className="text-sm font-medium mb-2 block">Dashboard Name</label>
          <input
            type="text"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="My Custom Dashboard"
          />
        </CardContent>
      </Card>

      {/* Saved Dashboards */}
      {savedDashboards.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedDashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  dashboard.id === currentDashboardId && "border-primary"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1"
                      onClick={() => loadDashboard(dashboard)}
                    >
                      <h3 className="font-semibold mb-1">{dashboard.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {dashboard.widgets?.length || 0} widgets • Updated {new Date(dashboard.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDashboard(dashboard.id);
                      }}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      title="Delete dashboard"
                    >
                      <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Widget Library */}
      {showWidgetLibrary && (
        <div>
          <h2 className="text-xl font-bold mb-4">Widget Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgetTypes.map((widget) => {
              const IconComponent = iconMap[widget.iconName] || Activity;
              return (
                <Card 
                  key={widget.id}
                  className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                  onClick={() => addWidget(widget)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`p-3 bg-muted rounded-lg ${widget.color}`}>
                        <IconComponent size={32} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{widget.name}</h3>
                        <p className="text-xs text-muted-foreground">{widget.description}</p>
                      </div>
                      <button className="w-full mt-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                        <Plus size={14} />
                        Add Widget
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Dashboard Canvas */}
      <div>
        <h2 className="text-xl font-bold mb-4">Dashboard Canvas</h2>
        
        {widgets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Plus size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Start Building</h3>
              <p className="text-muted-foreground mb-4">
                Add widgets from the library above to create your custom dashboard
              </p>
              {!showWidgetLibrary && (
                <button
                  onClick={() => setShowWidgetLibrary(true)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Show Widget Library
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgets.map((widget) => (
              <div key={widget.id}>
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Configuration Modal */}
      {showConfigModal && currentWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Configure {currentWidget.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Repository</label>
                <input
                  type="text"
                  placeholder="owner/repo (e.g., facebook/react)"
                  defaultValue={currentWidget.config.repos[0] || ''}
                  onBlur={(e) => {
                    if (e.target.value) {
                      const parts = e.target.value.split('/');
                      if (parts.length === 2) {
                        updateWidgetConfig({ repos: [e.target.value] });
                        fetchRepoData(parts[0], parts[1]);
                      }
                    }
                  }}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {currentWidget.component === 'CommitChart' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <select
                    value={currentWidget.config.dateRange}
                    onChange={(e) => updateWidgetConfig({ dateRange: e.target.value })}
                    className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>
              )}

              {(currentWidget.component === 'TopContributorsChart' || currentWidget.component === 'LanguageChart') && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Show Top</label>
                  <select
                    value={currentWidget.config.limit}
                    onChange={(e) => updateWidgetConfig({ limit: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="5">Top 5</option>
                    <option value="10">Top 10</option>
                    <option value="20">Top 20</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Done
              </button>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setCurrentWidget(null);
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Builder;