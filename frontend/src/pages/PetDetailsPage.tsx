import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Heart,
    RefreshCw,
    PlusCircle,
    Sparkles,
    Calendar,
    Award,
    Info,
} from "lucide-react";
import { getCurrentPet, revivePet, adoptPet } from "@/services/PetService";
import type { Pet } from "@/lib/types";
import { toast } from "react-toastify";
import { PetVisual } from "@/components/PetVisuals";
import { getHealthTier, getHealthTierLabel } from "@/lib/petVisuals";

export const PetDetailsPage = () => {
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdoptForm, setShowAdoptForm] = useState(false);

    // Adopt form state
    const [adoptSpecies, setAdoptSpecies] = useState("dog");
    const [adoptNickname, setAdoptNickname] = useState("");

    const fetchPetData = async () => {
        try {
            setLoading(true);
            setError(null);

            const petData = await getCurrentPet();
            setPet(petData);
        } catch (err: unknown) {
            console.error("Failed to load pet details:", err);
            setError("Could not load pet data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPetData();
    }, []);

    const handleRevive = async () => {
        try {
            setActionLoading(true);

            const revived = await revivePet();
            setPet(revived);

            toast.success("Pet revived successfully!");
        } catch (err: unknown) {
            console.error("Failed to revive pet:", err);
            toast.error(
                "Could not revive pet at this time. Pet is not dead!"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdopt = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!adoptNickname.trim()) return;

        try {
            setActionLoading(true);

            const newPet = await adoptPet({
                species: adoptSpecies,
                nickname: adoptNickname.trim(),
            });

            setPet(newPet);
            setShowAdoptForm(false);
            setAdoptNickname("");

            toast.success("New companion adopted!");
        } catch (err: unknown) {
            console.error("Failed to adopt pet:", err);
            toast.error(
                "Could not adopt pet. Current pet is still alive."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "N/A";

        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 border-4 border-purple-200 dark:border-purple-950 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin mb-3" />

                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Loading companion details...
                </p>
            </div>
        );
    }

    const isDead = pet
        ? pet.status === "dead" || pet.health <= 0
        : false;

    const canRevive = pet?.can_revive ?? false;

    return (
        <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
                <Link
                    to="/"
                    className="
                        inline-flex items-center gap-1.5
                        text-xs font-semibold
                        text-gray-600 dark:text-slate-300
                        hover:text-purple-600 dark:hover:text-purple-400
                        bg-white dark:bg-slate-900
                        px-3 py-1.5
                        rounded-xl
                        border border-gray-200 dark:border-slate-800
                        shadow-sm
                        transition-all
                    "
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Dashboard
                </Link>
                <span
                    className="
                        text-[10px] font-bold
                        text-purple-700 dark:text-purple-300
                        bg-purple-100 dark:bg-purple-950/60
                        px-3 py-1
                        rounded-full
                        uppercase tracking-wider
                    "
                >
                    Pet Sanctuary
                </span>
            </div>
            {/* Error */}
            {error && (
                <div
                    className="
                        p-3
                        bg-rose-50 dark:bg-rose-950/30
                        border border-rose-200 dark:border-rose-900
                        rounded-xl
                        text-xs
                        text-rose-700 dark:text-rose-300
                    "
                >
                    {error}
                </div>
            )}
            {/* No Pet */}
            {!pet ? (
                <div
                    className="
                        bg-white dark:bg-slate-900
                        rounded-2xl
                        p-6
                        text-center
                        border border-gray-200 dark:border-slate-800
                        shadow-sm
                        space-y-4
                    "
                >
                    <div
                        className="
                            w-20 h-20
                            bg-purple-50 dark:bg-purple-950/50
                            text-4xl
                            rounded-3xl
                            flex items-center justify-center
                            mx-auto
                            shadow-inner
                        "
                    >
                        🐾
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                            No Companion Yet
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                            Adopt your pet companion to start earning health
                            by completing your daily tasks & habits!
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAdoptForm(true)}
                        className="
                            px-5 py-2.5
                            bg-gradient-to-r from-purple-600 to-indigo-600
                            hover:from-purple-700 hover:to-indigo-700
                            text-white
                            font-semibold text-xs
                            rounded-xl
                            shadow-md
                            transition-all
                            flex items-center gap-2
                            mx-auto
                        "
                    >
                        <PlusCircle className="w-4 h-4" />
                        Adopt a Companion
                    </button>
                </div>
            ) : (
                /* Pet Details */
                <div
                    className="
                        bg-white dark:bg-slate-900
                        rounded-2xl
                        p-6
                        border border-gray-200 dark:border-slate-800
                        shadow-sm
                        space-y-6
                    "
                >
                    {/* Avatar & Basic Info */}
                    <div className="text-center space-y-3">
                        <div className="relative inline-block">
                            <div
                                className="
                                    w-24 h-24
                                    rounded-3xl
                                    bg-gradient-to-tr
                                    from-purple-100 via-indigo-50 to-pink-50
                                    dark:from-purple-950/50
                                    dark:via-indigo-950/40
                                    dark:to-pink-950/30
                                    flex items-center justify-center
                                    text-6xl
                                    shadow-md
                                    border-2 border-white dark:border-slate-700
                                    ring-4 ring-purple-100/50 dark:ring-purple-900/30
                                    overflow-hidden
                                "
                            >
                                <PetVisual
                                    species={pet.species}
                                    health={pet.health}
                                    isDead={isDead}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Status Badge */}
                            <span
                                className={`
                                    absolute -bottom-2 right-0
                                    px-2.5 py-0.5
                                    text-xs font-bold
                                    rounded-full
                                    text-white
                                    uppercase
                                    border-2 border-white dark:border-slate-900
                                    ${isDead
                                        ? "bg-rose-600 animate-pulse"
                                        : "bg-emerald-500"
                                    }
                                `}
                            >
                                {isDead ? "Fainted" : "Alive"}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {pet.nickname || "My Companion"}
                            </h2>
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider mt-0.5">
                                Species: {pet.species}
                            </p>
                        </div>
                    </div>
                    {/* Health */}
                    <div
                        className="
                            bg-gradient-to-br
                            from-gray-50 to-purple-50/30
                            dark:from-slate-800 dark:to-purple-950/20
                            p-4
                            rounded-xl
                            border border-gray-100 dark:border-slate-700
                            space-y-2
                        "
                    >
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Heart
                                    className={`
                                        w-4 h-4
                                        ${isDead
                                            ? "text-gray-400 dark:text-slate-500"
                                            : "text-rose-500 fill-rose-500 animate-pulse"
                                        }
                                    `}
                                />
                                Companion Health
                            </span>
                            <span
                                className={
                                    pet.health > 60
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : pet.health > 30
                                            ? "text-amber-600 dark:text-amber-400"
                                            : "text-rose-600 dark:text-rose-400"
                                }
                            >
                                {pet.health} / 100 HP
                            </span>
                        </div>
                        {/* Progress */}
                        <div className="w-full h-3.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 shadow-inner">
                            <div
                                className={`
                                    h-full rounded-full
                                    transition-all duration-500
                                    ${pet.health > 60
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                        : pet.health > 30
                                            ? "bg-gradient-to-r from-amber-500 to-orange-400"
                                            : "bg-gradient-to-r from-rose-600 to-red-500"
                                    }
                                `}
                                style={{
                                    width: `${Math.max(
                                        0,
                                        Math.min(100, pet.health)
                                    )}%`,
                                }}
                            />
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 text-center italic mt-1">
                            {getHealthTierLabel(
                                getHealthTier(pet.health, isDead)
                            )}
                        </p>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Born Date */}
                        <div
                            className="
                                p-3
                                bg-gray-50 dark:bg-slate-800
                                rounded-xl
                                border border-gray-100 dark:border-slate-700
                                flex items-center gap-3
                            "
                        >
                            <div className="p-2 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase">
                                    Born Date
                                </p>
                                <p className="text-xs font-bold text-gray-800 dark:text-slate-200">
                                    {formatDate(pet.born_at)}
                                </p>
                            </div>
                        </div>
                        {/* Status */}
                        <div
                            className="
                                p-3
                                bg-gray-50 dark:bg-slate-800
                                rounded-xl
                                border border-gray-100 dark:border-slate-700
                                flex items-center gap-3
                            "
                        >
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Award className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase">
                                    Status
                                </p>
                                <p className="text-xs font-bold text-gray-800 dark:text-slate-200 capitalize">
                                    {pet.status}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-2">
                        {isDead && (
                            <button
                                onClick={handleRevive}
                                disabled={actionLoading || !canRevive}
                                className="
                                    w-full py-2.5
                                    bg-gradient-to-r from-emerald-600 to-teal-600
                                    hover:from-emerald-700 hover:to-teal-700
                                    disabled:opacity-50
                                    text-white
                                    font-semibold text-xs
                                    rounded-xl
                                    shadow-md
                                    transition-all
                                    flex items-center justify-center gap-2
                                "
                            >
                                <RefreshCw className={actionLoading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
                                Revive Companion
                            </button>
                        )}

                        <button
                            onClick={() =>
                                setShowAdoptForm(!showAdoptForm)
                            }
                            className="
                                w-full py-2
                                bg-gray-100 dark:bg-slate-800
                                hover:bg-gray-200 dark:hover:bg-slate-700
                                text-gray-700 dark:text-slate-300
                                font-semibold text-xs
                                rounded-xl
                                transition-all
                                flex items-center justify-center gap-2
                            "
                        >
                            <PlusCircle className="w-3.5 h-3.5" />

                            {showAdoptForm
                                ? "Cancel Adoption"
                                : "Adopt New Companion"}
                        </button>
                    </div>
                </div>
            )}

            {/* Adoption Form */}
            {showAdoptForm && (
                <form
                    onSubmit={handleAdopt}
                    className="
                        bg-white dark:bg-slate-900
                        rounded-2xl
                        p-5
                        border border-purple-200 dark:border-purple-900/50
                        shadow-sm
                        space-y-4
                        animate-in fade-in slide-in-from-bottom-2
                    "
                >
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">

                        <Sparkles className="w-5 h-5 text-amber-500" />

                        <h3 className="font-bold text-gray-800 dark:text-white text-sm">
                            Adopt a New Pet Companion
                        </h3>
                    </div>

                    {/* Species */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                            Choose Species
                        </label>

                        <select
                            value={adoptSpecies}
                            onChange={(e) =>
                                setAdoptSpecies(e.target.value)
                            }
                            className="
                                w-full px-3 py-2
                                text-xs
                                bg-gray-50 dark:bg-slate-800
                                border border-gray-200 dark:border-slate-700
                                text-gray-900 dark:text-white
                                rounded-xl
                                focus:outline-none
                                focus:ring-2
                                focus:ring-purple-500/20
                                focus:border-purple-500
                            "
                        >
                            <option value="dog">🐶 Dog</option>
                            <option value="cat">🐱 Cat</option>
                            <option value="plant">🪴 Plant</option>
                            <option value="rabbit">🐰 Rabbit</option>
                            <option value="dragon">🐉 Dragon</option>
                        </select>
                    </div>

                    {/* Nickname */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                            Companion Nickname
                        </label>

                        <input
                            type="text"
                            required
                            maxLength={50}
                            value={adoptNickname}
                            onChange={(e) =>
                                setAdoptNickname(e.target.value)
                            }
                            placeholder="e.g., Buddy, Fluffy, Rosy"
                            className="
                                w-full px-3 py-2
                                text-xs
                                bg-gray-50 dark:bg-slate-800
                                border border-gray-200 dark:border-slate-700
                                text-gray-900 dark:text-white
                                placeholder:text-gray-400 dark:placeholder:text-slate-500
                                rounded-xl
                                focus:outline-none
                                focus:ring-2
                                focus:ring-purple-500/20
                                focus:border-purple-500
                            "
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={
                            !adoptNickname.trim() || actionLoading
                        }
                        className="
                            w-full py-2.5
                            bg-purple-600
                            hover:bg-purple-700
                            dark:bg-purple-600 dark:hover:bg-purple-500
                            disabled:opacity-50
                            text-white
                            font-bold text-xs
                            rounded-xl
                            shadow-md
                            transition-all
                            flex items-center justify-center gap-2
                        "
                    >
                        {actionLoading
                            ? "Adopting..."
                            : "Confirm & Adopt Companion"}
                    </button>
                </form>
            )}

            {/* Health Information */}
            <div
                className="
                    bg-purple-50/60 dark:bg-purple-950/20
                    rounded-2xl
                    p-4
                    border border-purple-100 dark:border-purple-900/40
                    text-xs
                    text-purple-900 dark:text-purple-200
                    space-y-2
                "
            >
                <div className="flex items-center gap-1.5 font-bold text-purple-950 dark:text-purple-100">
                    <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />

                    How Companion Health Works
                </div>

                <ul className="list-disc list-inside space-y-1 text-purple-800 dark:text-purple-300 text-[11px] leading-relaxed">
                    <li>
                        Completing daily todos feeds your companion and
                        restores health.
                    </li>

                    <li>
                        Maintaining daily habit streaks keeps your
                        companion happy and thriving.
                    </li>

                    <li>
                        If health reaches 0%, your companion will faint
                        and need revival.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default PetDetailsPage;
