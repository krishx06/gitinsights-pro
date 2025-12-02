import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  GitCommit, 
  Trophy, 
  TrendingUp,
  Plus,
  X,
  Search,
  UserPlus,
  Activity,
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { cn } from '../lib/utils';

const TeamBuilder = () => {
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableContributors, setAvailableContributors] = useState([]);
  const [filteredContributors, setFilteredContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingContributors, setLoadingContributors] = useState(false);
  const [teamAnalytics, setTeamAnalytics] = useState(null);
  const [githubToken, setGithubToken] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const isFetchingRef = useRef(false); // Prevent duplicate fetches

  // Initial load
  useEffect(() => {
    fetchGithubToken();
    loadTeams();
  }, []);

  // Fetch available contributors when modal opens
  useEffect(() => {
    if (showAddMemberModal && !availableContributors.length && githubToken) {
      fetchAvailableContributors();
    }
  }, [showAddMemberModal]);

  // Filter contributors based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = availableContributors.filter(contributor =>
        contributor.login.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContributors(filtered);
    } else {
      setFilteredContributors(availableContributors);
    }
  }, [searchQuery, availableContributors]);

  const fetchGithubToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGithubToken(response.data.accessToken);
    } catch (error) {
      console.error('Failed to fetch GitHub token:', error);
      setError('Failed to authenticate');
    }
  };

  const loadTeams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(response.data);
      if (response.data.length > 0) {
        setCurrentTeam(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableContributors = async () => {
    if (!githubToken || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoadingContributors(true);
    try {
      const reposResponse = await axios.get(
        'https://api.github.com/user/repos?sort=updated&per_page=30&affiliation=owner,collaborator',
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );

      const repos = reposResponse.data;
      const contributorsMap = new Map();

      const topRepos = repos.slice(0, 10);
      const contributorPromises = topRepos.map(async (repo) => {
        try {
          const response = await axios.get(
            `https://api.github.com/repos/${repo.full_name}/contributors?per_page=20`,
            {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github+json',
              },
            }
          );
          return response.data || [];
        } catch (error) {
          console.log(`Skipped ${repo.full_name}`);
          return [];
        }
      });

      const contributorsArrays = await Promise.all(contributorPromises);
      
      contributorsArrays.forEach(contributors => {
        contributors.forEach(contributor => {
          if (!contributorsMap.has(contributor.id)) {
            contributorsMap.set(contributor.id, {
              id: contributor.id,
              login: contributor.login,
              avatar_url: contributor.avatar_url,
              contributions: contributor.contributions,
              html_url: contributor.html_url,
            });
          } else {
            const existing = contributorsMap.get(contributor.id);
            existing.contributions += contributor.contributions;
          }
        });
      });

      const allContributors = Array.from(contributorsMap.values())
        .sort((a, b) => b.contributions - a.contributions);
      
      setAvailableContributors(allContributors);
      setFilteredContributors(allContributors);
    } catch (error) {
      console.error('Failed to fetch contributors:', error);
    } finally {
      setLoadingContributors(false);
      isFetchingRef.current = false;
    }
  };

  const fetchTeamAnalytics = async (team = currentTeam) => {
    if (!team || !team.members || team.members.length === 0 || !githubToken || isRefreshingAnalytics) return;

    setIsRefreshingAnalytics(true);
    try {
      const memberPromises = team.members.map(async (member) => {
        try {
          const since = new Date();
          since.setDate(since.getDate() - 30);
          
          const searchQuery = `author:${member.username} committer-date:>=${since.toISOString().split('T')[0]}`;
          const response = await axios.get(
            `https://api.github.com/search/commits?q=${encodeURIComponent(searchQuery)}&per_page=1`,
            {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github+json',
              },
            }
          );

          return {
            ...member,
            commits: response.data.total_count || 0,
          };
        } catch (error) {
          console.log(`Failed to fetch commits for ${member.username}`);
          return { ...member, commits: member.commits || 0 };
        }
      });

      const updatedMembers = await Promise.all(memberPromises);

      // Calculate analytics WITHOUT updating currentTeam (this was causing the loop!)
      const totalCommits = updatedMembers.reduce((sum, member) => sum + (member.commits || 0), 0);
      const avgVelocity = updatedMembers.length > 0 
        ? Math.round(totalCommits / updatedMembers.length) 
        : 0;

      const leaderboard = [...updatedMembers]
        .sort((a, b) => (b.commits || 0) - (a.commits || 0))
        .slice(0, 5)
        .map((member, index) => ({
          ...member,
          rank: index + 1,
          points: member.commits || 0,
        }));

      const contributionData = updatedMembers
        .map(member => ({
          name: member.login || member.username,
          commits: member.commits || 0,
        }))
        .sort((a, b) => b.commits - a.commits);

      setTeamAnalytics({
        totalMembers: updatedMembers.length,
        totalCommits,
        activeProjects: team.projects?.length || 0,
        avgVelocity,
        leaderboard,
        contributionData,
      });

    } catch (error) {
      console.error('Failed to fetch team analytics:', error);
    } finally {
      setIsRefreshingAnalytics(false);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/api/teams`,
        { name: newTeamName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTeam = response.data;
      setTeams([...teams, newTeam]);
      setCurrentTeam(newTeam);
      setNewTeamName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create team:', error);
      setError('Failed to create team');
    }
  };

  const addMemberToTeam = async (contributor) => {
    if (!currentTeam) return;

    if (currentTeam.members.some(m => m.id === contributor.id)) {
      return;
    }

    const newMember = {
      id: contributor.id,
      login: contributor.login,
      username: contributor.login,
      avatar_url: contributor.avatar_url,
      html_url: contributor.html_url,
      commits: contributor.contributions || 0,
    };

    const updatedMembers = [...currentTeam.members, newMember];

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${backendUrl}/api/teams/${currentTeam.id}`,
        { members: updatedMembers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTeam = response.data;
      setTeams(teams.map(t => t.id === currentTeam.id ? updatedTeam : t));
      setCurrentTeam(updatedTeam);
      
      // Fetch analytics manually after adding (won't trigger useEffect loop)
      setTimeout(() => fetchTeamAnalytics(updatedTeam), 500);
    } catch (error) {
      console.error('Failed to add member:', error);
      setError('Failed to add member');
    }
  };

  const removeMemberFromTeam = async (memberId) => {
    if (!currentTeam) return;

    const updatedMembers = currentTeam.members.filter(m => m.id !== memberId);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${backendUrl}/api/teams/${currentTeam.id}`,
        { members: updatedMembers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTeam = response.data;
      setTeams(teams.map(t => t.id === currentTeam.id ? updatedTeam : t));
      setCurrentTeam(updatedTeam);
      
      // Recalculate analytics
      if (updatedMembers.length > 0) {
        setTimeout(() => fetchTeamAnalytics(updatedTeam), 500);
      } else {
        setTeamAnalytics(null);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      setError('Failed to remove member');
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${backendUrl}/api/teams/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTeams = teams.filter(t => t.id !== teamId);
      setTeams(updatedTeams);
      if (currentTeam?.id === teamId) {
        setCurrentTeam(updatedTeams.length > 0 ? updatedTeams[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
      setError('Failed to delete team');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
          <p className="ml-3 text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Builder</h1>
            <p className="text-muted-foreground">Create and manage your development teams</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Team
          </button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border rounded-xl p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
          <p className="text-muted-foreground mb-6">Get started by creating your first team</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Create Team
          </button>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Create New Team</h2>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring mb-4"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && createTeam()}
              />
              <div className="flex gap-3">
                <button
                  onClick={createTeam}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTeamName('');
                  }}
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Workspace</h1>
          <p className="text-muted-foreground">Collaborate and track progress together</p>
        </div>
        <div className="flex gap-2">
          {currentTeam.members.length > 0 && (
            <button
              onClick={() => fetchTeamAnalytics()}
              disabled={isRefreshingAnalytics}
              className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={isRefreshingAnalytics ? 'animate-spin' : ''} />
              Refresh Analytics
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Team
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Team Selector */}
      {teams.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setCurrentTeam(team)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors",
                currentTeam.id === team.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {team.name}
            </button>
          ))}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                <h3 className="text-3xl font-bold">{currentTeam.members.length}</h3>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Combined Commits</p>
                <h3 className="text-3xl font-bold">
                  {isRefreshingAnalytics ? <Loader2 className="animate-spin" size={32} /> : (teamAnalytics?.totalCommits?.toLocaleString() || 0)}
                </h3>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <GitCommit size={24} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
                <h3 className="text-3xl font-bold">{currentTeam.projects?.length || 0}</h3>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                <Trophy size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Velocity</p>
                <h3 className="text-3xl font-bold">{teamAnalytics?.avgVelocity || 0}</h3>
                <p className="text-sm text-muted-foreground mt-2">commits/member</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <Activity size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {currentTeam.members.length > 0 && teamAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Contributions</CardTitle>
              <CardDescription>Commit activity by team member (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamAnalytics?.contributionData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
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
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                    />
                    <Bar 
                      dataKey="commits" 
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                Leaderboard
              </CardTitle>
              <CardDescription>Top performers (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamAnalytics?.leaderboard?.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-4">
                    <div className={cn(
                      "text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center",
                      index === 0 && "bg-yellow-500/20 text-yellow-500",
                      index === 1 && "bg-gray-400/20 text-gray-400",
                      index === 2 && "bg-orange-600/20 text-orange-600",
                      index > 2 && "bg-muted text-muted-foreground"
                    )}>
                      #{member.rank}
                    </div>
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.login} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{member.login || member.username}</p>
                      <p className="text-sm text-muted-foreground">{member.points} commits</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Health */}
      {currentTeam.projects && currentTeam.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Health</CardTitle>
            <CardDescription>Status of active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTeam.projects.map((project) => (
                <div key={project.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      project.status === 'active' && "bg-green-500/20 text-green-500"
                    )}>
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Health</span>
                        <span className="text-sm font-medium">{project.health}%</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            project.health >= 90 && "bg-green-500",
                            project.health >= 70 && project.health < 90 && "bg-yellow-500",
                            project.health < 70 && "bg-red-500"
                          )}
                          style={{ width: `${project.health}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users size={14} />
                      {project.members} members
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members from GitHub contributors</CardDescription>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              Add Member
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {currentTeam.members.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No team members yet</p>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Add Your First Member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTeam.members.map((member) => (
                <div key={member.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.login} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Users size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{member.login || member.username}</p>
                        <p className="text-sm text-muted-foreground">@{member.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMemberFromTeam(member.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitCommit size={14} />
                    {member.commits || 0} commits
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Team</h2>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name"
              className="w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring mb-4"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && createTeam()}
            />
            <div className="flex gap-3">
              <button
                onClick={createTeam}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTeamName('');
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-card border rounded-xl p-6 max-w-2xl w-full mx-4 my-8">
            <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contributors from your repos..."
                className="w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {loadingContributors ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
                <p className="ml-3 text-muted-foreground">Loading contributors...</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                {filteredContributors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No contributors found</p>
                ) : (
                  filteredContributors.map((contributor) => (
                    <div
                      key={contributor.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={contributor.avatar_url} alt={contributor.login} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-semibold">{contributor.login}</p>
                          <p className="text-sm text-muted-foreground">{contributor.contributions} contributions</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          addMemberToTeam(contributor);
                        }}
                        disabled={currentTeam.members.some(m => m.id === contributor.id)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentTeam.members.some(m => m.id === contributor.id) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSearchQuery('');
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamBuilder;