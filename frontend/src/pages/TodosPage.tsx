import { useState, useEffect, useCallback } from "react";
import {
    CheckCircle2, Circle, Plus, Trash2, Repeat, ChevronLeft, ChevronRight,
    CalendarDays, CheckSquare, Loader2, ClipboardList, Pencil, Check, X
} from "lucide-react";
import { toast } from "react-toastify";
import {
    getTodosByDate,
    createTodo,
    deleteTodo,
    markTodoComplete,
    updateTodo,
} from "@/services/TodoService";
import type { Todo } from "@/lib/types";
import { Link } from "react-router-dom";

const formatDateLabel = (d: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (same(d, today)) return "Today";
    if (same(d, yesterday)) return "Yesterday";
    if (same(d, tomorrow)) return "Tomorrow";
    return `${dayNames[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
};

const toDateString = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const TodosPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const dateStr = toDateString(currentDate);
    const completedCount = todos.filter((t) => t.status === "completed").length;
    const pct = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

    const loadTodos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTodosByDate(dateStr);
            setTodos(data);
        } catch {
            toast.error("Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    }, [dateStr]);

    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setIsAdding(true);
        try {
            const created = await createTodo({ title: newTitle.trim(), todo_date: dateStr });
            setTodos((prev) => [...prev, created]);
            setNewTitle("");
            setShowAddForm(false);
            toast.success("Task added!");
        } catch {
            toast.error("Failed to add task.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggle = async (todo: Todo) => {
        if (todo.status === "completed") return;
        setActionLoadingId(todo.id);
        try {
            const updated = await markTodoComplete(todo.id);
            setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
        } catch {
            toast.error("Failed to update task.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (todoId: string) => {
        setActionLoadingId(todoId);
        try {
            await deleteTodo(todoId);
            setTodos((prev) => prev.filter((t) => t.id !== todoId));
            toast.success("Task deleted.");
        } catch {
            toast.error("Failed to delete task.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const startEdit = (todo: Todo) => {
        setEditingId(todo.id);
        setEditTitle(todo.title);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
    };

    const handleEditSave = async (todo: Todo) => {
        if (!editTitle.trim() || editTitle.trim() === todo.title) {
            cancelEdit();
            return;
        }
        setActionLoadingId(todo.id);
        try {
            const updated = await updateTodo(todo.id, { title: editTitle.trim() });
            setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
            cancelEdit();
            toast.success("Task updated!");
        } catch {
            toast.error("Failed to update task.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const goDay = (delta: number) => {
        setEditingId(null);
        const d = new Date(currentDate);
        d.setDate(d.getDate() + delta);
        setCurrentDate(d);
    };

    const isToday = toDateString(currentDate) === toDateString(new Date());

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Tasks</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Manage your daily to-dos</p>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
                <button
                    onClick={() => goDay(-1)}
                    className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-purple-400 hover:bg-indigo-50 dark:hover:bg-purple-950/40 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                        <CalendarDays className="w-4 h-4 text-indigo-500 dark:text-purple-400" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                            {formatDateLabel(currentDate)}
                        </span>
                        {isToday && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-purple-300 rounded-full">
                                Today
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{dateStr}</p>
                </div>
                <button
                    onClick={() => goDay(1)}
                    className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-purple-400 hover:bg-indigo-50 dark:hover:bg-purple-950/40 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Progress Bar */}
            {todos.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-gray-600 dark:text-slate-300 flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-500 dark:text-purple-400" />
                            {completedCount} of {todos.length} completed
                        </span>
                        <span className={`font-bold ${pct === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-purple-400"}`}>
                            {pct}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    {pct === 100 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-semibold text-center animate-pulse">
                            🎉 All tasks completed!
                        </p>
                    )}
                </div>
            )}

            {/* Task List */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <ClipboardList className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-slate-200 text-sm">Task List</span>
                    </div>
                    <button
                        onClick={() => { setShowAddForm((v) => !v); setEditingId(null); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${showAddForm
                            ? "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
                            : "bg-indigo-600 dark:bg-purple-600 hover:bg-indigo-700 dark:hover:bg-purple-500 text-white"
                            }`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {showAddForm ? "Cancel" : "Add Task"}
                    </button>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/habits"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all"
                        >
                            <Repeat className="w-3.5 h-3.5" />
                            Manage habits
                        </Link>
                    </div>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <form
                        onSubmit={handleAdd}
                        className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/20"
                    >
                        <input
                            autoFocus
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Enter task title..."
                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 dark:focus:ring-purple-400/30 focus:border-indigo-500 dark:focus:border-purple-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newTitle.trim() || isAdding}
                            className="px-3 py-2 bg-indigo-600 dark:bg-purple-600 hover:bg-indigo-700 dark:hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                        >
                            {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            Add
                        </button>
                    </form>
                )}
                {showAddForm && (
                    <p className="px-4 pb-3 text-[11px] text-gray-400 dark:text-slate-500 -mt-1">
                        Repeating this daily or weekly?{" "}
                        <Link to="/habits" className="text-indigo-600 dark:text-purple-400 font-semibold hover:underline">
                            Create a habit instead
                        </Link>
                    </p>
                )}
                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 dark:text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-sm">Loading tasks...</span>
                    </div>
                ) : todos.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckSquare className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-400 dark:text-slate-500">No tasks for this day</p>
                        <p className="text-xs text-gray-300 dark:text-slate-600 mt-1">Click "Add Task" to create one</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-slate-800/80">
                        {todos.map((todo) => {
                            const isDone = todo.status === "completed";
                            const isActionLoading = actionLoadingId === todo.id;
                            const isEditing = editingId === todo.id;
                            const isHabit = !!todo.habit_template_id;

                            return (
                                <div
                                    key={todo.id}
                                    className={`flex items-center gap-3 px-4 py-3 group transition-colors ${isDone
                                        ? "bg-gray-50/60 dark:bg-slate-800/30"
                                        : "hover:bg-gray-50/50 dark:hover:bg-slate-800/30"
                                        }`}
                                >
                                    {/* Toggle */}
                                    <button
                                        onClick={() => handleToggle(todo)}
                                        disabled={isActionLoading || isDone}
                                        className="shrink-0 transition-transform active:scale-90"
                                    >
                                        {isActionLoading && !isEditing ? (
                                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                        ) : isDone ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-900/20" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-purple-400 transition-colors" />
                                        )}
                                    </button>

                                    {/* Title / Edit */}
                                    <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    autoFocus
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleEditSave(todo);
                                                        if (e.key === "Escape") cancelEdit();
                                                    }}
                                                    className="flex-1 min-w-0 text-sm px-2.5 py-1 bg-white dark:bg-slate-700 border border-indigo-400 dark:border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300/40 dark:focus:ring-purple-400/30 text-gray-900 dark:text-white"
                                                />
                                                <button
                                                    onClick={() => handleEditSave(todo)}
                                                    disabled={isActionLoading}
                                                    className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all shrink-0"
                                                    title="Save"
                                                >
                                                    {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-1.5 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all shrink-0"
                                                    title="Cancel (Esc)"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <p className={`text-sm truncate ${isDone
                                                ? "line-through text-gray-400 dark:text-slate-500"
                                                : "text-gray-800 dark:text-slate-200"
                                                }`}>
                                                {todo.title}
                                            </p>
                                        )}
                                    </div>

                                    {/* Badges & Actions */}
                                    {!isEditing && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            {isHabit && (
                                                <span
                                                    title="Auto-generated from habit"
                                                    className="p-1 bg-purple-50 dark:bg-purple-950/50 text-purple-500 dark:text-purple-300 rounded-lg"
                                                >
                                                    <Repeat className="w-3.5 h-3.5" />
                                                </span>
                                            )}
                                            {/* Edit button — only for non-habit, non-completed */}
                                            {!isHabit && !isDone && (
                                                <button
                                                    onClick={() => startEdit(todo)}
                                                    className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                                    title="Edit task"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {/* Delete button — only for non-habit */}
                                            {!isHabit && (
                                                <button
                                                    onClick={() => handleDelete(todo.id)}
                                                    disabled={isActionLoading}
                                                    className="p-1.5 text-gray-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                                    title="Delete task"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Hint */}
            <p className="text-center text-[11px] text-gray-400 dark:text-slate-600">
                💡 Hover a task and click ✏️ to edit · 🔁 = habit-generated
            </p>
        </div>
    );
};

export default TodosPage;