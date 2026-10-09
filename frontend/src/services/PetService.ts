import { api } from "@/lib/api";
import type { Pet, PetAdoptRequest } from "@/lib/types";

export const getCurrentPet = async (): Promise<Pet> => {
    const response = await api.get<Pet>('/api/pets/me');
    return response.data;
};

export const revivePet = async (): Promise<Pet> => {
    const response = await api.post<Pet>('/api/pets/revive');
    return response.data;
};

export const adoptPet = async (payload: PetAdoptRequest): Promise<Pet> => {
    const response = await api.post<Pet>('/api/pets/adopt', payload);
    return response.data;
};
