// src/lib/petVisuals.ts
//
// Maps a pet's species + health + alive/dead status to a visual asset.
// Put your files under:
//   /public/pets/<species>/thriving.png   (health > 80)
//   /public/pets/<species>/happy.png      (health 41-80)
//   /public/pets/<species>/weak.png       (health 1-40)
//   /public/pets/<species>/fainted.png    (health 0 / status dead)
//   /public/pets/<species>/fainted.mp4    (optional — plays instead of the image when dead)
//
// Any file you haven't added yet is skipped automatically — the emoji fallback
// in PetDetailsPage.tsx covers it until you do.

export type HealthTier = "thriving" | "happy" | "weak" | "fainted";

export function getHealthTier(health: number, isDead: boolean): HealthTier {
    if (isDead || health <= 0) return "fainted";
    if (health > 80) return "thriving";
    if (health > 40) return "happy";
    return "weak";
}

export function getPetImageSrc(species: string, tier: HealthTier): string {
    const normalized = species.toLowerCase().trim();
    console.log('normalized', normalized, tier)
    return `/pets/${normalized}/${tier}.png`;
}

export function getPetVideoSrc(species: string, tier: HealthTier): string | null {
    // Only the "fainted" moment ships with a video by default — add more
    // entries here (e.g. "thriving") once you have clips for them.
    if (tier !== "fainted") return null;
    const normalized = species.toLowerCase().trim();
    return `/pets/${normalized}/fainted.mp4`;
}

export function getHealthTierLabel(tier: HealthTier): string {
    switch (tier) {
        case "thriving":
            return "Thriving and super happy";
        case "happy":
            return "Doing well";
        case "weak":
            return "Low health — complete tasks to restore it";
        case "fainted":
            return "Fainted — needs reviving";
    }
}