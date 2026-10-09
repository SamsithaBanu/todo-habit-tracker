import { CheckCircle2 } from "lucide-react";

interface ReviveProgressProps {
    streakDays: boolean[];
}

export const ReviveProgress = ({ streakDays }: ReviveProgressProps) => {
    const completedCount = streakDays.filter(Boolean).length;
    const canRevive = completedCount === 7;

    return (
        <div className="bg-slate-900/90 border border-purple-900/50 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Revive progress</h3>
            <div className="flex justify-center gap-2">
                {streakDays.map((done, i) => (
                    <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${done
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-slate-700 text-slate-500"
                            }`}
                    >
                        {done ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                            <span className="text-xs">{i + 1}</span>
                        )}
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-400 text-center">
                {completedCount} of 7 days complete
            </p>
            {canRevive && (
                <p className="text-xs text-emerald-400 text-center font-semibold">
                    You can revive your pet now!
                </p>
            )}
        </div>
    );
};