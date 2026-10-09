// src/components/PetVisual.tsx
import { useState } from "react";
import { getHealthTier, getPetImageSrc, getPetVideoSrc } from "@/lib/petVisuals";

function getPetEmoji(species?: string) {
    if (!species) return "🐾";
    const s = species.toLowerCase();
    if (s.includes("dog")) return "🐶";
    if (s.includes("cat")) return "🐱";
    if (s.includes("plant") || s.includes("rose")) return "🪴";
    if (s.includes("dragon")) return "🐉";
    if (s.includes("rabbit") || s.includes("bunny")) return "🐰";
    return "🐾";
}

type Props = {
    species: string;
    health: number;
    isDead: boolean;
    className?: string;
};

export function PetVisual({ species, health, isDead, className }: Props) {
    const tier = getHealthTier(health, isDead);
    const videoSrc = getPetVideoSrc(species, tier);
    const imageSrc = getPetImageSrc(species, tier);
    console.log('image', imageSrc)

    // Starts true (try the real asset first); flips to false the moment it 404s,
    // so broken image paths quietly fall back to the emoji instead of showing
    // a broken-image icon.
    const [imageOk, setImageOk] = useState(true);
    const [videoOk, setVideoOk] = useState(true);

    if (videoSrc && videoOk) {
        return (
            <video
                className={className}
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoOk(false)}
            />
        );
    }

    if (imageOk) {
        return (
            <img
                className={className}
                src={imageSrc}
                alt={`${species} at ${tier} health`}
                onError={() => setImageOk(false)}
            />
        );
    }

    // Final fallback — always renders something, even with zero assets uploaded
    return <span className={className}>{getPetEmoji(species)}</span>;
}