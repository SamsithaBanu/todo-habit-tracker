import React, { useState } from "react";
import { CheckCircle2, Circle, Plus, Calendar, CheckSquare, Trash2, Repeat } from "lucide-react";
import type { Todo } from "@/lib/types";

interface TodayTodosCardProps {
    todos: Todo[];
    onToggleComplete: (todoId: string) => Promise<void>;
    onCreateTodo: (title: string) => Promise<void>;
    onDeleteTodo?: (todoId: string) => Promise<void>;
}

export const TodayTodosCard: React.FC<TodayTodosCardProps> = ({
    todos,
    onToggleComplete,
    onCreateTodo,
    onDeleteTodo,
}) => {
    const [newTitle, setNewTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await onCreateTodo(newTitle.trim());
            setNewTitle("");
        } catch (error) {
            console.error("Failed to create todo:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = async (todoId: string) => {
        try {
            setLoadingId(todoId);
            await onToggleComplete(todoId);
        } catch (error) {
            console.error("Failed to toggle todo:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (todoId: string) => {
        if (!onDeleteTodo) return;
        try {
            setLoadingId(todoId);
            await onDeleteTodo(todoId);
        } catch (error) {
            console.error("Failed to delete todo:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const completedCount = todos.filter((t) => t.status === "completed").length;

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Today's Tasks</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                            {completedCount} of {todos.length} completed
                        </p>
                    </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1 border border-transparent dark:border-purple-800/40">
                    <Calendar className="w-3 h-3" /> Today
                </span>
            </div>

            {/* Quick Add Input */}
            <form onSubmit={handleCreate} className="flex items-center gap-2 mb-4">
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Add a new task for today..."
                    className="flex-1 px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-purple-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                />
                <button
                    type="submit"
                    disabled={!newTitle.trim() || isSubmitting}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-purple-600 dark:hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                    title="Add Task"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>

            {/* Todo List */}
            {todos.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-800/30">
                    <CheckSquare className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">No tasks for today yet</p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">Type above to add your first task</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {todos.map((todo) => {
                        const isDone = todo.status === "completed";
                        const isLoading = loadingId === todo.id;

                        return (
                            <div
                                key={todo.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                                    isDone
                                        ? "bg-gray-50/70 dark:bg-slate-800/40 border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500"
                                        : "bg-white dark:bg-slate-800/80 border-gray-100 dark:border-slate-700 text-gray-800 dark:text-slate-200 hover:border-purple-200 dark:hover:border-purple-700/50 shadow-2xs"
                                }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                    <button
                                        onClick={() => handleToggle(todo.id)}
                                        disabled={isLoading}
                                        className="text-gray-400 hover:text-indigo-600 dark:hover:text-purple-400 transition-colors shrink-0 focus:outline-none"
                                    >
                                        {isDone ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-purple-400" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-xs font-medium truncate ${
                                                isDone ? "line-through text-gray-400 dark:text-slate-500" : "text-gray-800 dark:text-slate-200"
                                            }`}
                                        >
                                            {todo.title}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    {todo.habit_template_id && (
                                        <span className="p-1 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 rounded-md text-[10px] flex items-center gap-0.5" title="Generated from Habit">
                                            <Repeat className="w-3 h-3" />
                                        </span>
                                    )}

                                    {onDeleteTodo && (
                                        <button
                                            onClick={() => handleDelete(todo.id)}
                                            disabled={isLoading}
                                            className="p-1 text-gray-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-lg"
                                            title="Delete Task"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TodayTodosCard;
