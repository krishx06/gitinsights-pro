import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DeveloperCard from "../components/DeveloperCard";
import { TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Mock trending developers data
  const trendingDevelopers = [
    {
      id: 1,
      name: "Sarah Chen",
      username: "sarahchen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      bio: "Full-stack developer passionate about React and TypeScript",
      languages: ["TypeScript", "Python", "Go"],
      repositories: 42,
      stars: 1234
    },
    {
      id: 2,
      name: "Alex Kumar",
      username: "alexk",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      bio: "DevOps engineer | Cloud architecture enthusiast",
      languages: ["JavaScript", "Rust", "Shell"],
      repositories: 28,
      stars: 987
    },
    {
      id: 3,
      name: "Maria Garcia",
      username: "mgarcia",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      bio: "ML Engineer building the future",
      languages: ["Python", "Julia", "C++"],
      repositories: 35,
      stars: 2156
    }
  ];

  useEffect(() => {
    const token = searchParams.get("token") || localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    if (searchParams.get("token")) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/dashboard");
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${backendUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [searchParams, navigate, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1116] flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1116]">
      <Sidebar />
      
      <div className="lg:ml-64">
        <Navbar />
        
        <main className="p-8">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Discover GitHub Talent
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Search and analyze millions of developers worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 
                       rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          {/* Trending Developers Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trending Developers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingDevelopers.map((developer) => (
                <DeveloperCard key={developer.id} developer={developer} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;