import React from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronRight, ShieldAlert, Sparkles } from "lucide-react";
import type { Pet } from "@/lib/types";
import { PetVisual } from "../PetVisuals";

interface PetCardProps {
    pet: Pet | null;
}

export const PetCard: React.FC<PetCardProps> = ({ pet }) => {
    if (!pet) {
        return (
            <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-2xl">
                        🐾
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-slate-200">No Pet Adopted</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Adopt a companion to track your habits!</p>
                    </div>
                </div>
                <Link
                    to="/pet"
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                    Adopt <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        );
    }

    // const getPetEmoji = (species: string) => {
    //     const s = species.toLowerCase();
    //     if (s.includes("dog")) return "🐶";
    //     if (s.includes("cat")) return "🐱";
    //     if (s.includes("plant") || s.includes("rose")) return "🪴";
    //     if (s.includes("dragon")) return "🐉";
    //     if (s.includes("rabbit") || s.includes("bunny")) return "🐰";
    //     return "🐾";
    // };

    const isDead = pet.status === "dead" || pet.health <= 0;
    const healthColor = pet.health > 60 ? "bg-emerald-500" : pet.health > 30 ? "bg-amber-500" : "bg-rose-500";
    const healthTextColor = pet.health > 60 ? "text-emerald-600 dark:text-emerald-400" : pet.health > 30 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-purple-100/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                    {/* <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-50 dark:from-purple-950 dark:to-slate-800 flex items-center justify-center text-3xl shadow-inner border border-purple-100 dark:border-slate-700">
                            {getPetEmoji(pet.species)}
                        </div>
                        <span
                            className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white uppercase border-2 border-white dark:border-slate-900 ${
                                isDead ? "bg-rose-600 animate-pulse" : "bg-emerald-500"
                            }`}
                        >
                            {isDead ? "Fainted" : "Alive"}
                        </span>
                    </div> */}
                    <div className="relative inline-block">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-100 via-indigo-50 to-pink-50 flex items-center justify-center text-6xl shadow-md border-2 border-white ring-4 ring-purple-100/50 overflow-hidden">
                            <PetVisual
                                species={pet.species}
                                health={pet.health}
                                isDead={isDead}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span
                            className={`absolute -bottom-2 right-0 px-2.5 py-0.5 text-xs font-bold rounded-full text-white uppercase border-2 border-white ${isDead ? "bg-rose-600 animate-pulse" : "bg-emerald-500"
                                }`}
                        >
                            {isDead ? "Fainted" : "Alive"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                                {pet.nickname || "My Companion"}
                            </h3>
                            <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-semibold rounded-full capitalize border border-transparent dark:border-purple-800/40">
                                {pet.species}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            {isDead ? (
                                <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5" /> Needs revival!
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-500" /> Thriving companion
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <Link
                    to="/pet"
                    className="p-2 text-gray-400 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-all"
                    title="Pet Details"
                >
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>

            {/* Health Meter */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-600 dark:text-slate-300 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Health Level
                    </span>
                    <span className={`font-bold ${healthTextColor}`}>
                        {pet.health}%
                    </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                        className={`h-full ${healthColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(0, Math.min(100, pet.health))}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PetCard;
