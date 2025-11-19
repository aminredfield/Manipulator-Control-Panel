import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
    isAuthenticated: boolean;
}

function loadInitialAuth(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const raw = localStorage.getItem('auth_isAuthenticated');
        return raw === 'true';
    } catch {
        return false;
    }
}

const initialState: AuthState = {
    isAuthenticated: loadInitialAuth()
};

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess(state) {
            state.isAuthenticated = true;
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_isAuthenticated', 'true');
            }
        },
        logout(state) {
            state.isAuthenticated = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_isAuthenticated');
            }
        }
    }
});

export const { loginSuccess, logout } = slice.actions;
export const authReducer = slice.reducer;