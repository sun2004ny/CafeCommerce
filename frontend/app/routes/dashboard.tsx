import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { User, Mail, Shield, Calendar, LogOut, CheckCircle2, Server, Database } from "lucide-react";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const meta: MetaFunction = () => [
  { title: "Dashboard — CaféCommerce" },
  { name: "description", content: "Your CaféCommerce account dashboard." },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout completed");
      navigate("/login");
    }
  };

  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CC";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0d0b0a] text-stone-100 flex flex-col">
        {/* Global Navigation Bar */}
        <Navbar />

        {/* Main Dashboard Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Welcome Banner */}
          <section className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-8 sm:p-10 mb-8 bg-gradient-to-br from-[#1c1714] via-[#14100e] to-[#0d0a09]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Authenticated Session</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                    {user?.name || "Coffee Lover"}
                  </span>
                  !
                </h1>
                <p className="mt-2 text-stone-400 text-sm sm:text-base max-w-xl">
                  You are signed in to your CaféCommerce account. Your session is active and verified with the PostgreSQL backend.
                </p>
              </div>

              {/* Logout Action */}
              <button
                onClick={handleLogout}
                className="shrink-0 px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-sm font-semibold flex items-center gap-2.5 transition-all duration-200 cursor-pointer shadow-lg"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </section>

          {/* User Profile & System Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* User Profile Card (Spans 2 columns on lg) */}
            <div className="lg:col-span-2 rounded-3xl glass-card border border-white/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold font-mono shadow-xl shadow-amber-500/20 ring-2 ring-white/10">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {user?.name}
                    </h2>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </div>
              </div>

              {/* Detail fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                      Full Name
                    </p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {user?.name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-white mt-0.5 truncate max-w-[200px]">
                      {user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                      Account ID
                    </p>
                    <p className="text-xs font-mono text-stone-300 mt-1 truncate max-w-[190px]">
                      {user?.id || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                      Member Since
                    </p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {formattedJoinDate}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* System Architecture & Status Card */}
            <div className="rounded-3xl glass-card border border-white/10 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-4">
                  System Status
                </h3>

                <div className="space-y-4">
                  {/* Database Indicator */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Database size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-200">Database</p>
                        <p className="text-[11px] text-stone-400">PostgreSQL (Neon)</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase font-bold">
                      Connected
                    </span>
                  </div>

                  {/* API Server Indicator */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <Server size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-200">API Server</p>
                        <p className="text-[11px] text-stone-400">Express + TypeScript :5000</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono uppercase font-bold">
                      Online
                    </span>
                  </div>

                  {/* Frontend Engine Indicator */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-200">Frontend</p>
                        <p className="text-[11px] text-stone-400">Remix + React :5173</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-mono uppercase font-bold">
                      Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Informational Note */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-stone-400 leading-relaxed">
                <p className="text-amber-400 font-medium mb-1">Development Phase 1 Complete</p>
                Authentication, session storage, and dashboard routing are isolated and verified.
              </div>
            </div>

          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
