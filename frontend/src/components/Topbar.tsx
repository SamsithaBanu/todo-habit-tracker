import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Heart, LogOut, Sun, Moon, Zap } from "lucide-react";
import { logoutUser } from "@/services/AuthService";
import { useTheme } from "@/context/ThemeContext";
import type { userData } from "@/lib/types";
import { IoSettings } from "react-icons/io5";

interface TopbarProps {
    userData?: userData;
}

export const Topbar: React.FC<TopbarProps> = ({ userData }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning ☀️";
        if (hour < 18) return "Good Afternoon 🌤️";
        return "Good Evening 🌙";
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("notif_prompt_dismissed");
        } finally {
            navigate("/login", { replace: true });
        }
    };

    const getPetEmoji = (species?: string) => {
        if (!species) return "🐾";
        const s = species.toLowerCase();
        if (s.includes("dog")) return "🐶";
        if (s.includes("cat")) return "🐱";
        if (s.includes("plant")) return "🪴";
        return "🐾";
    };

    const navItems = [
        { to: "/", icon: <LayoutDashboard className="w-3 h-3" />, label: "Home" },
        { to: "/todos", icon: <CheckSquare className="w-3 h-3" />, label: "Tasks" },
        { to: "/habits", icon: <Zap className="w-3 h-3" />, label: "Habits" },
        { to: "/pet", icon: <Heart className="w-3 h-3" />, label: "Pet" },
    ];

    return (
        <header className="space-y-3 pb-2">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{getGreeting()}</p>
                    <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {userData?.name || "Welcome Back!"}
                    </h1>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={toggleTheme}
                        className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-amber-400 rounded-xl transition-all border border-gray-200 dark:border-slate-700 shadow-2xs"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <Link
                        to="/pet"
                        className="p-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl transition-all text-sm font-bold flex items-center gap-1 border border-purple-100 dark:border-purple-800/50 shadow-2xs"
                        title="Pet Details"
                    >
                        <span>{getPetEmoji(userData?.pet_species)}</span>
                    </Link>
                    <Link
                        to="/settings"
                        className="p-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl transition-all text-sm font-bold flex items-center gap-1 border border-purple-100 dark:border-purple-800/50 shadow-2xs"
                        title="Settings"
                    >
                        <IoSettings className="h-5 w-5" />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-xl gap-1 border border-transparent dark:border-slate-700/50">
                {navItems.map(({ to, icon, label }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${isActive
                                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-purple-300 shadow-xs"
                                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                                }`}
                        >
                            {icon}
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
};

export default Topbar;