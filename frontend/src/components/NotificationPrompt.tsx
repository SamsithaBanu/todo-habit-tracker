import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "react-toastify";
import { enablePushNotifications, getNotificationPermission, isPushSupported } from "@/services/PushService";

const DISMISS_KEY = "notif_prompt_dismissed";

export const NotificationPrompt = () => {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(DISMISS_KEY) === "true";
        const permission = getNotificationPermission();

        if (!dismissed && isPushSupported() && permission === "default") {
            setShow(true);
        }
    }, []);

    console.log('return', localStorage.getItem("notif_prompt_dismissed"))
    const handleEnable = async () => {
        setLoading(true);
        try {
            const ok = await enablePushNotifications();
            if (ok) toast.success("Notifications enabled!");
            else toast.error("Permission was not granted.");
        } finally {
            setLoading(false);
            setShow(false);
            localStorage.setItem(DISMISS_KEY, "true");
        }
    };

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem(DISMISS_KEY, "true");
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-950/60 flex items-center justify-center mx-auto">
                    <Bell className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Stay on track</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Get a nudge at 8am to plan your day, and at 9pm so your pet doesn't go hungry.
                    </p>
                </div>
                <button
                    onClick={handleEnable}
                    disabled={loading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                >
                    {loading ? "Enabling..." : "Enable notifications"}
                </button>
                <button
                    onClick={handleDismiss}
                    className="w-full text-slate-500 text-xs hover:text-slate-300"
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
};

export default NotificationPrompt;