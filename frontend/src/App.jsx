import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Repositories from "./pages/Repositories";
import PullRequests from "./pages/PullRequests";
import Insights from "./pages/Insights";
import TeamBuilder from "./pages/Team";
import Settings from "./pages/Settings";
import Compare from "./pages/Compare";
import Builder from "./pages/Builder";

// Protected Routes Wrapper
function ProtectedRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = searchParams.get("token") || localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    if (searchParams.get("token")) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
      return;
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/pull-requests" element={<PullRequests />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/team" element={<TeamBuilder />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;