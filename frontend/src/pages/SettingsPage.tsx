import { useEffect, useState } from "react";
import { Bell, BellOff, Clock, LogOut, Mail, User as UserIcon } from "lucide-react";
import { toast } from "react-toastify";

import { getMe, updateSettings, type UserMe } from "@/services/UserService";
import {
    enablePushNotifications,
    disablePushNotifications,
    hasActiveSubscription,
} from "@/services/PushService";

// toHHMM / fromHHMM: <input type="time"> wants "HH:MM"; the API returns "HH:MM:SS"
const toHHMM = (t: string) => t.slice(0, 5);

const SettingsPage = () => {
    const [user, setUser] = useState<UserMe | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [morning, setMorning] = useState("08:00");
    const [evening, setEvening] = useState("21:00");
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const me = await getMe();
                setUser(me);
                setMorning(toHHMM(me.reminder_morning_time));
                setEvening(toHHMM(me.reminder_evening_time));
            } catch {
                toast.error("Could not load your settings.");
            } finally {
                setLoading(false);
            }
        })();

        hasActiveSubscription().then(setPushEnabled);
    }, []);

    const handleSaveTimes = async () => {
        setSaving(true);
        try {
            const updated = await updateSettings({
                reminder_morning_time: morning,
                reminder_evening_time: evening,
            });
            setUser(updated);
            toast.success("Reminder times updated!");
        } catch {
            toast.error("Failed to save reminder times.");
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePush = async () => {
        setPushBusy(true);
        try {
            if (pushEnabled) {
                await disablePushNotifications();
                setPushEnabled(false);
                toast.success("Notifications turned off.");
            } else {
                const ok = await enablePushNotifications();
                if (ok) {
                    setPushEnabled(true);
                    toast.success("Notifications enabled!");
                } else {
                    toast.error("Permission was not granted.");
                }
            }
        } catch (err) {
            console.error("Push toggle failed:", err);
            toast.error("Something went wrong with notifications.");
        } finally {
            setPushBusy(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("notif_prompt_dismissed");
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-8">
            <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage your profile and reminders</p>
            </div>

            {/* Profile */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-purple-400" /> Profile
                </h3>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Name</span>
                    <span className="text-white font-medium">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email
                    </span>
                    <span className="text-white font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Verified</span>
                    <span className={user?.is_verified ? "text-emerald-400" : "text-amber-400"}>
                        {user?.is_verified ? "Yes" : "Pending"}
                    </span>
                </div>
            </section>

            {/* Reminders */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" /> Reminders
                </h3>

                <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-300">Morning reminder</label>
                    <input
                        type="time"
                        value={morning}
                        onChange={(e) => setMorning(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-300">Evening reminder</label>
                    <input
                        type="time"
                        value={evening}
                        onChange={(e) => setEvening(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                    />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-slate-400">Timezone</span>
                    <span className="text-sm text-slate-200">{user?.timezone}</span>
                </div>

                <button
                    onClick={handleSaveTimes}
                    disabled={saving}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                >
                    {saving ? "Saving..." : "Save reminder times"}
                </button>
            </section>

            {/* Notifications */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        {pushEnabled ? (
                            <Bell className="w-4 h-4 text-purple-400" />
                        ) : (
                            <BellOff className="w-4 h-4 text-slate-500" />
                        )}
                        Push notifications
                    </h3>
                    <button
                        onClick={handleTogglePush}
                        disabled={pushBusy}
                        className={`relative w-10 h-5 rounded-full transition-colors ${pushEnabled ? "bg-purple-600" : "bg-slate-700"
                            }`}
                        aria-label="Toggle push notifications"
                    >
                        <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${pushEnabled ? "left-5" : "left-0.5"
                                }`}
                        />
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Get a nudge at your reminder times so you never forget to feed your pet.
                </p>
            </section>

            <button
                onClick={handleLogout}
                className="w-full py-2.5 border border-rose-900/60 text-rose-400 hover:bg-rose-950/40 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
                <LogOut className="w-4 h-4" /> Log out
            </button>
        </div>
    );
};

export default SettingsPage;