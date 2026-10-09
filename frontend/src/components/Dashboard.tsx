import { useEffect, useState } from "react";
import { getDashboardData } from "@/services/DashboardService";
import { markTodoComplete, createTodo, deleteTodo } from "@/services/TodoService";
import PetCard from "./dashboard/PetCard";
import TodayProgressCard from "./dashboard/TodayProgressCard";
import TodayTodosCard from "./dashboard/TodayTodosCard";
import HabitsCard from "./dashboard/HabitsCard";
import type { DashboardResponse, Todo } from "@/lib/types";

export const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = async () => {
        try {
            setError(null);
            const data = await getDashboardData();
            setDashboardData(data);
        } catch (err: unknown) {
            console.error("Failed to load dashboard data:", err);
            setError("Could not load dashboard information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    // Handle toggling todo completion
    const handleToggleTodo = async (todoId: string) => {
        if (!dashboardData) return;

        // Optimistic update
        const updatedTodos: Todo[] = dashboardData.todos.map((t) => {
            if (t.id === todoId) {
                const isCompleted = t.status === "completed";
                return {
                    ...t,
                    status: isCompleted ? "pending" : "completed",
                    completed_at: isCompleted ? null : new Date().toISOString(),
                };
            }
            return t;
        });

        const newCompletedCount = updatedTodos.filter((t) => t.status === "completed").length;

        setDashboardData({
            ...dashboardData,
            todos: updatedTodos,
            todos_completed: newCompletedCount,
        });

        try {
            // Call API endpoint
            await markTodoComplete(todoId);
            // Optionally refresh dashboard data to sync backend pet health changes
            const refreshed = await getDashboardData();
            setDashboardData(refreshed);
        } catch (err: unknown) {
            console.error("Failed to mark todo complete:", err);
            // Revert on error
            loadDashboard();
        }
    };

    // Handle creating a new todo for today
    const handleCreateTodo = async (title: string) => {
        if (!dashboardData) return;
        const todayStr = dashboardData.today || new Date().toISOString().split("T")[0];

        try {
            const newTodo = await createTodo({
                title,
                todo_date: todayStr,
            });

            setDashboardData((prev) => {
                if (!prev) return prev;
                const nextTodos = [newTodo, ...prev.todos];
                return {
                    ...prev,
                    todos: nextTodos,
                    todos_total: prev.todos_total + 1,
                };
            });
        } catch (err: unknown) {
            console.error("Failed to create todo:", err);
            loadDashboard();
        }
    };

    // Handle deleting a todo
    const handleDeleteTodo = async (todoId: string) => {
        if (!dashboardData) return;

        try {
            await deleteTodo(todoId);
            setDashboardData((prev) => {
                if (!prev) return prev;
                const nextTodos = prev.todos.filter((t) => t.id !== todoId);
                const newCompleted = nextTodos.filter((t) => t.status === "completed").length;
                return {
                    ...prev,
                    todos: nextTodos,
                    todos_total: Math.max(0, prev.todos_total - 1),
                    todos_completed: newCompleted,
                };
            });
        } catch (err: unknown) {
            console.error("Failed to delete todo:", err);
            loadDashboard();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-500">Preparing your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-center space-y-2">
                <p className="text-xs font-semibold">{error}</p>
                <button
                    onClick={loadDashboard}
                    className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const { todos, todos_completed, todos_total, pet, habit_stats_30d, current_streak } =
        dashboardData || {
            todos: [],
            todos_completed: 0,
            todos_total: 0,
            pet: null,
            habit_stats_30d: [],
            current_streak: 0,
        };

    return (
        <div className="space-y-4 pb-8">
            <TodayProgressCard
                completed={todos_completed}
                total={todos_total}
                streak={current_streak}
            />
            <PetCard pet={pet} />
            <TodayTodosCard
                todos={todos}
                onToggleComplete={handleToggleTodo}
                onCreateTodo={handleCreateTodo}
                onDeleteTodo={handleDeleteTodo}
            />
            <HabitsCard habitStats={habit_stats_30d} />
        </div>
    );
};

export default Dashboard;