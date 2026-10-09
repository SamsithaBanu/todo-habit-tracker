import { api } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";

export const getDashboardData = async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/api/dashboard');
    return response.data;
};
