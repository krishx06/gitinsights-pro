import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  GitPullRequest, 
  Users, 
  Zap, 
  Github, 
  ArrowRight,
  BarChart2,
  ShieldAlert,
  Search,
  Layout,
  Lock,
  GitCommit,
  CheckCircle2,
  Moon,
  Sun
} from "lucide-react";

const Login = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = () => {
    window.location.href = `${backendUrl}/auth/login`;
  };

  const features = [
    {
      icon: <Layout className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "Interactive Dashboard",
      desc: "At-a-glance activity for commits, repos, stars, and forks.",
      tags: ["Activity Overview", "Commit Activity Trends", "Language Distribution"],
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800",
      hover: "group-hover:border-blue-200 dark:group-hover:border-blue-700 group-hover:shadow-blue-100/50 dark:group-hover:shadow-blue-900/20"
    },
    {
      icon: <Search className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
      title: "Repository Management",
      desc: "Search, compare, and sync repositories with production-ready metrics.",
      tags: ["Repository Explorer", "Project Activity Charts", "Repo Comparison Tool"],
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-100 dark:border-orange-800",
      hover: "group-hover:border-orange-200 dark:group-hover:border-orange-700 group-hover:shadow-orange-100/50 dark:group-hover:shadow-orange-900/20"
    },
    {
      icon: <GitPullRequest className="w-6 h-6 text-green-600 dark:text-green-400" />,
      title: "Pull Request Insights",
      desc: "Understand PR volume, review time, and contribution patterns.",
      tags: ["PR Metrics", "Review Performance", "Language Breakdown"],
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-100 dark:border-green-800",
      hover: "group-hover:border-green-200 dark:group-hover:border-green-700 group-hover:shadow-green-100/50 dark:group-hover:shadow-green-900/20"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "Team Builder & Collaboration",
      desc: "Create teams, link repos, and track collective output.",
      tags: ["Team Management", "Project Linking", "Team Analytics"],
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-100 dark:border-purple-800",
      hover: "group-hover:border-purple-200 dark:group-hover:border-purple-700 group-hover:shadow-purple-100/50 dark:group-hover:shadow-purple-900/20"
    },
    {
      icon: <Zap className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      title: "AI-Powered Insights",
      desc: "AI scores, completion estimates, and impact analysis out of the box.",
      tags: ["Project Health Scores", "Smart Completion Estimates", "Risk Analysis"],
      bg: "bg-pink-50 dark:bg-pink-900/20",
      border: "border-pink-100 dark:border-pink-800",
      hover: "group-hover:border-pink-200 dark:group-hover:border-pink-700 group-hover:shadow-pink-100/50 dark:group-hover:shadow-pink-900/20"
    },
    {
      icon: <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Security & Infrastructure",
      desc: "Secure GitHub OAuth and privacy-first data processing.",
      tags: ["GitHub OAuth", "Data Privacy", "Original Work Focus"],
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-100 dark:border-indigo-800",
      hover: "group-hover:border-indigo-200 dark:group-hover:border-indigo-700 group-hover:shadow-indigo-100/50 dark:group-hover:shadow-indigo-900/20"
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Connect GitHub",
      desc: "Securely link your GitHub account with OAuth",
      icon: <Github className="w-6 h-6 text-purple-600 dark:text-purple-400" />
    },
    {
      num: "02",
      title: "Select Repositories",
      desc: "Choose which repositories you want to analyze",
      icon: <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
    },
    {
      num: "03",
      title: "View Insights",
      desc: "Explore comprehensive analytics and dashboards",
      icon: <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-100 dark:selection:bg-purple-900 selection:text-purple-900 dark:selection:text-purple-100 transition-colors duration-300">
      
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Github className="w-7 h-7 text-foreground" />
            <span className="font-bold text-xl tracking-tight text-foreground">GitInsights Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleLogin}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={handleLogin}
              className="bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main>
        
        <section className="pt-24 pb-12 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-50 via-background to-background dark:from-purple-900/20 dark:via-background dark:to-background -z-10" />
          
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                v1.0 is now live
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                From Repository Analytics to <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                  AI health scores
                </span>
                {" "}— all in one place.
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Build, measure, and improve your engineering workflow with interactive dashboards, team insights, and intelligent guidance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleLogin}
                  className="group flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
     
          <div className="relative max-w-6xl mx-auto mt-40 mb-32">
            
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none hidden lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute border border-purple-200 dark:border-purple-800 rounded-full"
                    style={{ width: `${i * 200}px`, height: `${i * 200}px` }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.3, 0.6, 0.3],
                      borderColor: isDarkMode 
                        ? ["rgba(147, 51, 234, 0.1)", "rgba(147, 51, 234, 0.3)", "rgba(147, 51, 234, 0.1)"]
                        : ["rgba(147, 51, 234, 0.1)", "rgba(147, 51, 234, 0.3)", "rgba(147, 51, 234, 0.1)"]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      delay: i * 0.5,
                      ease: "easeInOut" 
                    }}
                  />
                ))}
                <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(147,51,234,0.3)] z-10 relative">
                  <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50 rounded-full animate-pulse" />
                  <Activity className="w-12 h-12 text-white relative z-10" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[400px] gap-y-16 relative z-10">
              <div className="space-y-24">
                <FeatureItem 
                  icon={<BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                  title="See your engineering heartbeat"
                  desc="Understand commits, repos, and languages at a glance with real-time interactive dashboards."
                  align="right"
                  delay={0.2}
                />
                <FeatureItem 
                  icon={<GitPullRequest className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                  title="Spot bottlenecks early"
                  desc="Use PR metrics and review time analysis to keep your delivery pipeline flowing smoothly."
                  align="right"
                  delay={0.4}
                />
              </div>

              <div className="space-y-24">
                <FeatureItem 
                  icon={<Users className="w-6 h-6 text-green-600 dark:text-green-400" />}
                  title="Grow high-performing teams"
                  desc="Track team velocity, individual contributions, and identify top performers effortlessly."
                  align="left"
                  delay={0.3}
                />
                <FeatureItem 
                  icon={<Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
                  title="Let AI watch your projects"
                  desc="Get automated health scores, completion estimates, and risk flags built right into your workflow."
                  align="left"
                  delay={0.5}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pt-24 pb-8 px-6 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-sm font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase mb-3">Product Overview</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">Everything you need to ship better code</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-card p-8 rounded-2xl border ${feature.border} shadow-sm hover:shadow-lg ${feature.hover} transition-all duration-300 group cursor-default`}
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{feature.title}</h4>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-muted border border-border rounded-full text-xs font-medium text-muted-foreground group-hover:bg-background group-hover:border-border transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-12 pb-32 px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-block px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-4">
                How It Works
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Get Started in Minutes</h2>
              <p className="text-xl text-muted-foreground">Three simple steps to unlock powerful insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-purple-100 dark:via-purple-900 to-transparent" />

              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-card border border-border shadow-lg flex items-center justify-center mb-8 relative z-10 group hover:border-purple-200 dark:hover:border-purple-800 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 text-6xl font-bold text-purple-100 dark:text-purple-900/50 -z-10 select-none group-hover:text-purple-200 dark:group-hover:text-purple-800 transition-colors duration-300">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6 bg-gray-900 dark:bg-gray-800 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to improve your engineering workflow?</h2>
            <p className="text-gray-400 text-lg mb-10">
              Join thousands of developers who use GitInsights Pro to build better software.
            </p>
            <button
              onClick={handleLogin}
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start for free with GitHub
            </button>
          </div>
        </section>

        <footer className="py-12 px-6 border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">GitInsights Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GitInsights Pro. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="https://github.com/TechGenie-awake/gitinsights-pro" className="hover:text-foreground">Checkout our Github</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc, align = "left", delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: align === "left" ? 20 : -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`flex flex-col ${align === "right" ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"} items-center text-center`}
  >
    <div className={`w-14 h-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center mb-6 group hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md transition-all duration-300`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed max-w-sm">
      {desc}
    </p>
  </motion.div>
);

export default Login;
