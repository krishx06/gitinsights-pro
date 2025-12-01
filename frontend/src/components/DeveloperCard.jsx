import React from 'react';
import { GitFork, Star } from 'lucide-react';

const DeveloperCard = ({ developer }) => {
  return (
    <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={developer.avatar}
          alt={developer.name}
          className="w-16 h-16 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {developer.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{developer.username}
          </p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {developer.bio}
      </p>

      {/* Languages */}
      <div className="flex flex-wrap gap-2 mb-4">
        {developer.languages.map((lang, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"
          >
            {lang}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <GitFork size={16} />
          <span>{developer.repositories}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={16} />
          <span>{developer.stars}</span>
        </div>
      </div>

      {/* View Profile Button */}
      <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
        View Profile
      </button>
    </div>
  );
};

export default DeveloperCard;