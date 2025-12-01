import React, { useState } from 'react';
import axios from 'axios';
import { Search as SearchIcon } from 'lucide-react';
import CommitChart from '../components/CommitChart';
import LanguageChart from '../components/LanguageChart';
import TopContributorsChart from '../components/TopContributorsChart';

const Search = () => {
  const [repoInput, setRepoInput] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [commits, setCommits] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const analyzeRepo = async () => {
    if (!repoInput.trim()) return;

    const parts = repoInput.trim().split('/');
    if (parts.length !== 2) {
      setError('Please enter a valid format: owner/repo (e.g., facebook/react)');
      return;
    }

    const [owner, repo] = parts;
    setLoading(true);
    setError(null);
    setRepoData(null);
    setCommits([]);
    setLanguages([]);
    setContributors([]);

    try {
      const [statsRes, commitsRes, langsRes, contributorsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/repos/${owner}/${repo}/stats`),
        axios.get(`${backendUrl}/api/repos/${owner}/${repo}/commits`),
        axios.get(`${backendUrl}/api/repos/${owner}/${repo}/languages`),
        axios.get(`${backendUrl}/api/repos/${owner}/${repo}/contributors`),
      ]);

      setRepoData(statsRes.data);
      setCommits(commitsRes.data);
      setLanguages(langsRes.data);
      setContributors(contributorsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch repository data');
      console.error('Error fetching repo data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      analyzeRepo();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Repository Analytics</h1>
        <p className="text-muted-foreground">
          Search and analyze any GitHub repository
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="owner/repository (e.g., facebook/react)"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
          <button
            onClick={analyzeRepo}
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Charts Section */}
      {repoData && (
        <div className="space-y-6">
          {/* Commit Activity Chart - Full Width */}
          <CommitChart 
            commits={commits}
            repoName={repoData.full_name}
            loading={loading}
            error={null}
          />
          
          {/* Language and Contributors - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LanguageChart 
              languages={languages}
              loading={loading}
            />
            
            <TopContributorsChart 
              contributors={contributors}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Repository Stats */}
      {repoData && (
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">{repoData.full_name}</h2>
          <p className="text-muted-foreground mb-6">{repoData.description || 'No description'}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold">{repoData.stars.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Stars</div>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <div className="text-3xl mb-2">🍴</div>
              <div className="text-2xl font-bold">{repoData.forks.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Forks</div>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <div className="text-3xl mb-2">👁️</div>
              <div className="text-2xl font-bold">{repoData.watchers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Watchers</div>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <div className="text-3xl mb-2">🐛</div>
              <div className="text-2xl font-bold">{repoData.open_issues.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Issues</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!repoData && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-semibold mb-2">Commit Activity</h3>
            <p className="text-muted-foreground text-sm">
              View commit history with interactive charts
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="text-4xl mb-3">💻</div>
            <h3 className="text-xl font-semibold mb-2">Language Breakdown</h3>
            <p className="text-muted-foreground text-sm">
              Analyze programming languages used
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-semibold mb-2">Top Contributors</h3>
            <p className="text-muted-foreground text-sm">
              See who's contributing the most
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;