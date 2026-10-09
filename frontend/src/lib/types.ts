export interface UserCreate {
    name: string;
    email: string;
    password: string;
    pet_species: string;
    pet_nickname: string;
    timezone: string;
}

export interface UserLogin {
    username: string;
    password: string;
}

export interface userData {
    id: string;
    name: string;
    email: string;
    pet_species: "dog" | "cat" | "plant" | string;
    pet_nickname: string;
    timezone: string;
    created_at: string;
}

export interface Pet {
    id: string;
    species: string;
    nickname: string | null;
    health: number;
    status: "alive" | "dead" | string;
    can_revive: boolean;
    born_at: string | null;
    died_at: string | null;
}

export interface PetAdoptRequest {
    species: string;
    nickname: string;
}

export interface Todo {
    id: string;
    title: string;
    todo_date: string;
    status: "pending" | "completed" | string;
    completed_at: string | null;
    habit_template_id: string | null;
}

export interface TodoCreate {
    title: string;
    todo_date: string;
}

export interface TodoUpdate {
    title: string;
}

export interface HabitTemplate {
    id: string;
    title: string;
    repeat_days: number[];
    is_active: boolean;
}

export interface HabitTemplateCreate {
    title: string;
    repeat_days: number[];
}

export interface HabitStat {
    habit_template_id: string;
    title: string;
    total_days_due: number;
    completed_days: number;
    completed_pct: number;
}

export interface DashboardResponse {
    today: string;
    todos: Todo[];
    todos_completed: number;
    todos_total: number;
    pet: Pet;
    habit_stats_30d: HabitStat[];
    current_streak: number;
}
