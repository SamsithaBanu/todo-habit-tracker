import { api } from "@/lib/api";
import type { Todo, TodoCreate, TodoUpdate } from "@/lib/types";

export const getTodosByDate = async (todoDate: string): Promise<Todo[]> => {
    const response = await api.get<Todo[]>('/api/todos/', {
        params: { todo_date: todoDate }
    });
    return response.data;
};

export const createTodo = async (payload: TodoCreate): Promise<Todo> => {
    const response = await api.post<Todo>('/api/todos/', payload);
    return response.data;
};

export const updateTodo = async (todoId: string, payload: TodoUpdate): Promise<Todo> => {
    const response = await api.patch<Todo>(`/api/todos/${todoId}`, payload);
    return response.data;
};

export const markTodoComplete = async (todoId: string): Promise<Todo> => {
    const response = await api.patch<Todo>(`/api/todos/${todoId}/complete`);
    return response.data;
};

export const deleteTodo = async (todoId: string): Promise<void> => {
    await api.delete(`/api/todos/${todoId}`);
};