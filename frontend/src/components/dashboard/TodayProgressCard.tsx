import React from "react";
import { Flame, CheckCircle2, TrendingUp } from "lucide-react";

interface TodayProgressCardProps {
    completed: number;
    total: number;
    streak: number;
}

export const TodayProgressCard: React.FC<TodayProgressCardProps> = ({
    completed,
    total,
    streak,
}) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const getMessage = (pct: number, totalCount: number) => {
        if (totalCount === 0) return "No tasks scheduled for today yet.";
        if (pct === 100) return "🎉 Incredible! All today's tasks completed!";
        if (pct >= 75) return "🔥 Almost there! Keep up the momentum!";
        if (pct >= 50) return "💪 Over halfway done! Great progress!";
        if (pct > 0) return "🚀 Nice start! Keep knocking out tasks!";
        return "⏰ Ready to conquer today's goals?";
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-medium text-indigo-200 border border-white/10">
                        <TrendingUp className="w-3 h-3 text-emerald-400" /> Today's Overview
                    </span>
                    <h2 className="text-xl font-extrabold mt-2 tracking-tight">
                        Task Progress
                    </h2>
                    <p className="text-xs text-indigo-200/90 mt-0.5">
                        {getMessage(percentage, total)}
                    </p>
                </div>

                {/* Streak Badge */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 rounded-xl text-center flex flex-col items-center">
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                        <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
                        <span>{streak}</span>
                    </div>
                    <span className="text-[10px] text-indigo-200 font-medium mt-0.5 uppercase tracking-wider">
                        Streak
                    </span>
                </div>
            </div>

            {/* Circular Progress & Percentage Stats */}
            <div className="mt-5 flex items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-indigo-100">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
                        </span>
                        <span className="font-bold text-white">
                            {completed} of {total} ({percentage}%)
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 rounded-full transition-all duration-700 shadow-sm"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-white/10"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="text-emerald-400 transition-all duration-700 ease-out"
                            strokeDasharray={`${percentage}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <span className="absolute font-extrabold text-xs text-white">
                        {percentage}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TodayProgressCard;
