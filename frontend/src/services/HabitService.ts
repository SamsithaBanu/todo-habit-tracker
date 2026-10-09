import { api } from "@/lib/api";
import type { HabitTemplate } from "@/lib/types";

export interface HabitCreatePayload {
    title: string;
    repeat_days: number[]; // 1=Mon .. 7=Sun
}

export interface HabitUpdatePayload {
    title?: string;
    repeat_days?: number[];
    is_active?: boolean;
}

export const getHabits = async (): Promise<HabitTemplate[]> => {
    const res = await api.get("/api/habit");
    return res.data;
};

export const createHabit = async (payload: HabitCreatePayload): Promise<HabitTemplate> => {
    const res = await api.post("/api/habit", payload);
    return res.data;
};

export const updateHabit = async (
    habitId: string,
    payload: HabitUpdatePayload
): Promise<HabitTemplate> => {
    const res = await api.patch(`/api/habit/${habitId}`, payload);
    return res.data;
};

export const deleteHabit = async (habitId: string): Promise<void> => {
    await api.delete(`/api/habit/${habitId}`);
};