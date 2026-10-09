import { api } from "@/lib/api";
import type { userData } from "@/lib/types";

export interface UserMe {
    id: string;
    name: string;
    email: string;
    is_verified: boolean;
    timezone: string;
    reminder_morning_time: string;
    reminder_evening_time: string;
    pet_species: "dog" | "cat" | "plant" | string;
    pet_nickname: string;
    created_at: string;
}

export interface UpdateSettingsPayload {
    reminder_morning_time?: string;
    reminder_evening_time?: string;
    timezone?: string;
}

export const getMe = async (): Promise<UserMe> => {
    const res = await api.get("/api/users/me");
    return res.data;
};

export const updateSettings = async (payload: UpdateSettingsPayload): Promise<UserMe> => {
    const res = await api.patch("/api/users/me", payload);
    return res.data;
};