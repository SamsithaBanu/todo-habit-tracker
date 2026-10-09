import React from "react";
import { Link } from "react-router-dom";
import { Zap, CheckCircle, BarChart2, Settings2 } from "lucide-react";
import type { HabitStat } from "@/lib/types";

interface HabitsCardProps {
    habitStats: HabitStat[];
}

export const HabitsCard: React.FC<HabitsCardProps> = ({ habitStats }) => {
    return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Zap className="w-5 h-5 fill-purple-600/20" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Habits Overview</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">30-day consistency rate</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center gap-1 border border-transparent dark:border-indigo-800/40">
                        <BarChart2 className="w-3 h-3" /> 30 Days
                    </span>
                    {habitStats.length > 0 && (
                        <Link
                            to="/habits"
                            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                            <Settings2 className="w-3.5 h-3.5" />
                            Manage
                        </Link>
                    )}
                </div>
            </div>

            {habitStats.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-800/30">
                    <Zap className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">No habit templates active</p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                        Habits created will automatically track here
                    </p>
                    <Link
                        to="/habits"
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Create your first habit
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {habitStats.map((stat) => {
                        const pct = Math.round(stat.completed_pct || 0);
                        const progressColor =
                            pct >= 80
                                ? "bg-emerald-500"
                                : pct >= 50
                                    ? "bg-indigo-500"
                                    : "bg-amber-500";

                        return (
                            <div
                                key={stat.habit_template_id}
                                className="p-3 bg-gray-50/60 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60 hover:border-purple-100 dark:hover:border-purple-800/50 transition-all"
                            >
                                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                                    <span className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-semibold text-gray-800 dark:text-slate-200 truncate max-w-[160px]">
                                            {stat.title}
                                        </span>
                                        {stat.total_days_due === 0 ? (
                                            <span className="text-[10px] text-gray-400">Not yet due</span>
                                        ) : pct < 50 ? (
                                            <span className="shrink-0 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full">
                                                Slipping</span>
                                        ) : null}
                                    </span>
                                    <span className="text-gray-500 dark:text-slate-400 font-bold flex items-center gap-1 shrink-0">
                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                        {stat.completed_days}/{stat.total_days_due} days ({pct}%)
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HabitsCard;