import { useState, useEffect } from "react";
import {
    Zap, Plus, Trash2, Loader2, CheckCircle2, Edit3, X, Check, Pencil, Power
} from "lucide-react";
import { toast } from "react-toastify";
import {
    createHabit,
    getHabits,
    deleteHabit,
    updateHabit,
} from "@/services/HabitService";
import type { HabitTemplate } from "@/lib/types";

const DAYS = [
    { label: "Mon", short: "M", value: 1 },
    { label: "Tue", short: "T", value: 2 },
    { label: "Wed", short: "W", value: 3 },
    { label: "Thu", short: "T", value: 4 },
    { label: "Fri", short: "F", value: 5 },
    { label: "Sat", short: "S", value: 6 },
    { label: "Sun", short: "S", value: 7 },
];

const today = new Date();
// getDay() => 0=Sun,1=Mon,...6=Sat. Map to 1=Mon...7=Sun
const todayDayValue = today.getDay() === 0 ? 7 : today.getDay();

const HabitsPage = () => {
    const [habits, setHabits] = useState<HabitTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDays, setNewDays] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // --- edit state (new) ---
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDays, setEditDays] = useState<number[]>([]);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const loadHabits = async () => {
        setLoading(true);
        try {
            const data = await getHabits();
            setHabits(data);
        } catch {
            toast.error("Failed to load habits.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHabits();
    }, []);

    const toggleDay = (d: number) => {
        setNewDays((prev) =>
            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
        );
    };

    const toggleEditDay = (d: number) => {
        setEditDays((prev) =>
            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
        );
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            toast.error("Please enter a habit title.");
            return;
        }
        if (newDays.length === 0) {
            toast.error("Select at least one day.");
            return;
        }
        setIsSubmitting(true);
        try {
            const created = await createHabit({
                title: newTitle.trim(),
                repeat_days: newDays,
            });
            setHabits((prev) => [...prev, created]);
            setNewTitle("");
            setNewDays([]);
            setShowForm(false);
            toast.success("Habit created!");
        } catch {
            toast.error("Failed to create habit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- edit handlers (new) ---
    const startEdit = (habit: HabitTemplate) => {
        setEditingId(habit.id);
        setEditTitle(habit.title);
        setEditDays(habit.repeat_days);
        setShowForm(false); // close the "new habit" form if it was open
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDays([]);
    };

    const saveEdit = async (habitId: string) => {
        if (!editTitle.trim()) {
            toast.error("Please enter a habit title.");
            return;
        }
        if (editDays.length === 0) {
            toast.error("Select at least one day.");
            return;
        }
        setIsSavingEdit(true);
        try {
            const updated = await updateHabit(habitId, {
                title: editTitle.trim(),
                repeat_days: editDays,
            });
            setHabits((prev) => prev.map((h) => (h.id === habitId ? updated : h)));
            cancelEdit();
            toast.success("Habit updated!");
        } catch {
            toast.error("Failed to update habit.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    // --- reactivate handler (new) ---
    const handleReactivate = async (habit: HabitTemplate) => {
        setTogglingId(habit.id);
        try {
            const updated = await updateHabit(habit.id, { is_active: true });
            setHabits((prev) => prev.map((h) => (h.id === habit.id ? updated : h)));
            toast.success(`"${habit.title}" reactivated.`);
        } catch {
            toast.error("Failed to reactivate habit.");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (habit: HabitTemplate) => {
        setDeletingId(habit.id);
        try {
            await deleteHabit(habit.id);
            // backend soft-deletes (is_active = false) — reflect that in place
            // instead of removing the habit from the list entirely
            setHabits((prev) =>
                prev.map((h) => (h.id === habit.id ? { ...h, is_active: false } : h))
            );
            toast.success(`"${habit.title}" deactivated.`);
        } catch {
            toast.error("Failed to delete habit.");
        } finally {
            setDeletingId(null);
        }
    };

    const selectAllDays = () => setNewDays([1, 2, 3, 4, 5, 6, 7]);
    const selectWeekdays = () => setNewDays([1, 2, 3, 4, 5]);
    const selectWeekend = () => setNewDays([6, 7]);
    const clearDays = () => setNewDays([]);

    const getDayLabel = (days: number[]) => {
        const sorted = [...days].sort((a, b) => a - b);
        if (sorted.length === 7) return "Every day";
        if (JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5])) return "Weekdays";
        if (JSON.stringify(sorted) === JSON.stringify([6, 7])) return "Weekends";
        return sorted.map((d) => DAYS.find((x) => x.value === d)?.label).join(", ");
    };

    const activeHabits = habits.filter((h) => h.is_active);
    const inactiveHabits = habits.filter((h) => !h.is_active);

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Habits</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {activeHabits.length} active habit{activeHabits.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowForm((v) => !v);
                        cancelEdit(); // close any open edit form
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${showForm
                        ? "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
                        : "bg-indigo-600 dark:bg-purple-600 hover:bg-indigo-700 dark:hover:bg-purple-500 text-white"
                        }`}
                >
                    {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showForm ? "Cancel" : "New Habit"}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-purple-800/50 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 dark:bg-purple-950/60 text-indigo-600 dark:text-purple-300 rounded-lg">
                            <Edit3 className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Create New Habit</h3>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                                Habit Name
                            </label>
                            <input
                                autoFocus
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="e.g. Morning Exercise, Read 20 mins..."
                                maxLength={200}
                                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 dark:focus:ring-purple-400/30 focus:border-indigo-500 dark:focus:border-purple-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                                    Repeat Days
                                </label>
                                <div className="flex gap-1.5">
                                    {[
                                        { label: "All", fn: selectAllDays },
                                        { label: "Wkd", fn: selectWeekdays },
                                        { label: "W/E", fn: selectWeekend },
                                        { label: "None", fn: clearDays },
                                    ].map(({ label, fn }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={fn}
                                            className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-purple-300 rounded-lg transition-all"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                {DAYS.map((d) => (
                                    <button
                                        key={d.value}
                                        type="button"
                                        onClick={() => toggleDay(d.value)}
                                        className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${newDays.includes(d.value)
                                            ? "bg-indigo-600 dark:bg-purple-600 text-white shadow-sm"
                                            : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        {d.short}
                                    </button>
                                ))}
                            </div>
                            {newDays.length > 0 && (
                                <p className="text-[11px] text-indigo-600 dark:text-purple-300 font-medium">
                                    ✓ {getDayLabel(newDays)}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !newTitle.trim() || newDays.length === 0}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 dark:bg-purple-600 hover:bg-indigo-700 dark:hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {isSubmitting ? "Creating..." : "Create Habit"}
                        </button>
                    </form>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 dark:text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-sm">Loading habits...</span>
                </div>
            ) : (
                <>
                    {/* Active Habits */}
                    {activeHabits.length === 0 && !showForm ? (
                        <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl py-14 px-6 text-center">
                            <Zap className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-sm font-bold text-gray-400 dark:text-slate-500">No habits yet</p>
                            <p className="text-xs text-gray-300 dark:text-slate-600 mt-1 mb-4">
                                Create your first habit and todos will auto-generate on their days!
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-4 py-2 bg-indigo-600 dark:bg-purple-600 hover:bg-indigo-700 dark:hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all"
                            >
                                + Create First Habit
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider px-1">
                                Active Habits
                            </p>
                            {activeHabits.map((habit) => {
                                const isDeleting = deletingId === habit.id;
                                const isEditing = editingId === habit.id;
                                const runsToday = habit.repeat_days.includes(todayDayValue);

                                return (
                                    <div
                                        key={habit.id}
                                        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-purple-800/40 transition-all group"
                                    >
                                        {isEditing ? (
                                            /* --- Inline edit form (new), styled to match the create form --- */
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                                                        Habit Name
                                                    </label>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        maxLength={200}
                                                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-indigo-300 dark:border-purple-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 dark:focus:ring-purple-400/30 text-gray-900 dark:text-white transition-all"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                                                            Repeat Days
                                                        </label>
                                                        <div className="flex gap-1.5">
                                                            {[
                                                                { label: "All", fn: () => setEditDays([1, 2, 3, 4, 5, 6, 7]) },
                                                                { label: "Wkd", fn: () => setEditDays([1, 2, 3, 4, 5]) },
                                                                { label: "W/E", fn: () => setEditDays([6, 7]) },
                                                                { label: "None", fn: () => setEditDays([]) },
                                                            ].map(({ label, fn }) => (
                                                                <button
                                                                    key={label}
                                                                    type="button"
                                                                    onClick={fn}
                                                                    className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-purple-300 rounded-lg transition-all"
                                                                >
                                                                    {label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        {DAYS.map((d) => (
                                                            <button
                                                                key={d.value}
                                                                type="button"
                                                                onClick={() => toggleEditDay(d.value)}
                                                                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${editDays.includes(d.value)
                                                                    ? "bg-indigo-600 dark:bg-purple-600 text-white shadow-sm"
                                                                    : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700"
                                                                    }`}
                                                            >
                                                                {d.short}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => saveEdit(habit.id)}
                                                        disabled={isSavingEdit}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all"
                                                    >
                                                        {isSavingEdit ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Check className="w-3.5 h-3.5" />
                                                        )}
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEdit}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* --- Existing display mode, with Edit button added --- */
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center mt-0.5">
                                                        <Zap className="w-4.5 h-4.5 text-indigo-600 dark:text-purple-400 fill-indigo-100 dark:fill-indigo-900" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                                {habit.title}
                                                            </p>
                                                            {runsToday && (
                                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                                                    📅 Active Today
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {DAYS.map((d) => (
                                                                <span
                                                                    key={d.value}
                                                                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${habit.repeat_days.includes(d.value)
                                                                        ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-purple-300"
                                                                        : "bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-slate-600"
                                                                        }`}
                                                                >
                                                                    {d.label}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1.5">
                                                            🔁 {getDayLabel(habit.repeat_days)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Edit + Delete */}
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => startEdit(habit)}
                                                        className="p-2 text-gray-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-purple-400 hover:bg-indigo-50 dark:hover:bg-purple-950/40 rounded-xl transition-all"
                                                        title="Edit habit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(habit)}
                                                        disabled={isDeleting}
                                                        className="p-2 text-gray-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                                                        title="Deactivate habit"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Inactive Habits */}
                    {inactiveHabits.length > 0 && (
                        <div className="space-y-2.5 mt-2">
                            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-1">
                                Deactivated
                            </p>
                            {inactiveHabits.map((habit) => {
                                const isToggling = togglingId === habit.id;
                                return (
                                    <div
                                        key={habit.id}
                                        className="bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 opacity-60 hover:opacity-100 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 shrink-0 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm text-gray-400 dark:text-slate-500 line-through truncate">
                                                    {habit.title}
                                                </p>
                                                <p className="text-[11px] text-gray-300 dark:text-slate-600">
                                                    {getDayLabel(habit.repeat_days)}
                                                </p>
                                            </div>
                                            {/* Reactivate button (new) */}
                                            <button
                                                onClick={() => handleReactivate(habit)}
                                                disabled={isToggling}
                                                className="p-2 text-gray-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                title="Reactivate habit"
                                            >
                                                {isToggling ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Power className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Info Banner */}
                    {activeHabits.length > 0 && (
                        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl p-4 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                    How it works
                                </p>
                                <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5 leading-relaxed">
                                    Tasks are auto-generated each day for habits with matching repeat days. Complete them to keep your pet healthy!
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HabitsPage;