import React, { useState } from 'react';
import { Search, Github, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

const RepoSelector = ({ onRepoSelect, loading }) => {
  const [repoInput, setRepoInput] = useState('');
  const [error, setError] = useState('');

  const validateAndSelect = () => {
    setError('');
    
    if (!repoInput.trim()) {
      setError('Please enter a repository');
      return;
    }

    const parts = repoInput.trim().split('/');
    
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setError('Format: owner/repo (e.g., facebook/react)');
      return;
    }

    const [owner, repo] = parts;
    onRepoSelect(owner, repo);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      validateAndSelect();
    }
  };

  const popularRepos = [
    'facebook/react',
    'microsoft/vscode',
    'vercel/next.js',
    'tensorflow/tensorflow',
    'nodejs/node'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Select Repository
        </CardTitle>
        <CardDescription>
          Enter a GitHub repository to analyze commit activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Field */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="owner/repository (e.g., facebook/react)"
              disabled={loading}
              className={cn(
                "w-full px-4 py-2 pl-10 rounded-md border bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error && "border-destructive"
              )}
            />
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" 
            />
          </div>
          
          <button
            onClick={validateAndSelect}
            disabled={loading}
            className={cn(
              "px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium",
              "hover:bg-primary/90 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Analyze'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Popular Repos */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Try these popular repositories:
          </p>
          <div className="flex flex-wrap gap-2">
            {popularRepos.map((repo) => (
              <button
                key={repo}
                onClick={() => {
                  setRepoInput(repo);
                  setError('');
                }}
                disabled={loading}
                className={cn(
                  "px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground",
                  "text-sm rounded-full transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {repo}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepoSelector;