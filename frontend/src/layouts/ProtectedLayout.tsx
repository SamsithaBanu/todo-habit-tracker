import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { useEffect, useState } from "react";
import type { userData } from "@/lib/types";
import { getMe } from "@/services/UserService";
import NotificationPrompt from "@/components/NotificationPrompt";

export const ProtectedLayout = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const [userData, setUserData] = useState<userData>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const data = await getMe();

                setUserData(data);
            } catch (error) {
                console.error("Failed to get current user:", error);

                localStorage.removeItem("token");

                navigate("/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, [token, navigate]);

    // No token → login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Waiting for current user
    if (loading) {
        return (
            <div className="min-h-screen bg-[#E8EAF7] dark:bg-slate-950 flex items-center justify-center text-gray-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold">Loading app...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E8EAF7] dark:bg-slate-950 flex justify-center transition-colors duration-200">
            <main className="w-full max-w-[430px] border rounded-xl border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 my-3 min-h-screen px-5 py-4 shadow-xl">
                <Topbar userData={userData} />
                <div className="mt-6">
                    <Outlet />
                </div>
            </main>
            <NotificationPrompt />
        </div>
    );
};