import React from "react";

const Login = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = () => {
    window.location.href = `${backendUrl}/auth/login`;
  };

  const features = [
    {
      icon: "📈",
      title: "Real-time Analytics",
      desc: "Stay up-to-date with live insights on commits, pull requests, and contributor activity.",
    },
    {
      icon: "💻",
      title: "Code Intelligence",
      desc: "Understand your codebase better with deep analysis of language usage and code health.",
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      desc: "Gain visibility into team performance and streamline your collaboration workflows.",
    },
    {
      icon: "📊",
      title: "Custom Dashboards",
      desc: "Design dashboards that fit your goals — drag, drop, and personalize your view.",
    },
    {
      icon: "⚡",
      title: "AI-Powered Insights",
      desc: "Leverage smart recommendations to boost productivity and code quality instantly.",
    },
    {
      icon: "🔗",
      title: "Multi-Repo Management",
      desc: "Track and compare analytics across multiple repositories with ease.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1116] text-white flex flex-col items-center px-6 py-16">


      <header className="flex flex-col items-center mb-12 text-center">
        <img
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="GitHub"
          className="w-16 h-16 mb-4"
        />
        <h1 className="text-5xl font-bold mb-3">GitInsights Pro</h1>
        <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
          Your all-in-one dashboard for GitHub analytics.
          Understand your projects, empower your team, and make data-driven decisions — effortlessly.
        </p>
      </header>


      <button
        onClick={handleLogin}
        className="flex items-center gap-3 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-md mb-4"
      >
        <img
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="GitHub"
          className="w-6 h-6"
        />
        <span>Continue with GitHub</span>
      </button>






      <section className="w-full max-w-6xl text-center">
        <h2 className="text-3xl font-bold mb-4">Why Teams Love GitInsights Pro</h2>
        <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
          From commit tracking to AI-driven reports — everything you need to improve your workflow and ship better code.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>


      <footer className="mt-20 text-sm text-gray-500">
        © {2025} GitInsights Pro — Empowering developers with clarity.
      </footer>
    </div>
  );
};

export default Login;
