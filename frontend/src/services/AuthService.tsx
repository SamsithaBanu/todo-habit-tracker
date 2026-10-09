import { api } from "../lib/api";
import type { UserCreate, userData, UserLogin } from "../lib/types";

// REGISTER
export async function registerUser(payload: UserCreate) {
    const response = await api.post(
        "/api/users/register",
        payload
    );

    return response.data;
}

// LOGIN
export async function loginUser(payload: UserLogin) {
    const formData = new URLSearchParams();

    formData.append("username", payload.username);
    formData.append("password", payload.password);

    const response = await api.post(
        "/api/users/token",
        formData,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    if (response.data.access_token) {
        localStorage.setItem(
            "token",
            response.data.access_token
        );
    }

    return response.data;
}

// LOGOUT
export async function logoutUser() {
    const response = await api.post(
        "/api/users/logout"
    );

    localStorage.removeItem("token");

    return response.data;
}

export const getCurrentUser = async (): Promise<userData> => {
    const response = await api.get<userData>(
        '/api/users/me'
    )
    return response.data
}