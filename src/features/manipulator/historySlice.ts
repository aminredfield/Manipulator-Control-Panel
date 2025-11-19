import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoryItem } from './types';

export interface HistoryState {
    items: HistoryItem[];
}

function loadHistory(): HistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem('manipulator_history');
        if (!raw) return [];
        const parsed = JSON.parse(raw) as HistoryItem[];
        return parsed;
    } catch {
        return [];
    }
}

const initialState: HistoryState = {
    items: loadHistory()
};

const slice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        addHistoryItem(state, action: PayloadAction<HistoryItem>) {
            state.items.unshift(action.payload);
            if (typeof window !== 'undefined') {
                localStorage.setItem(
                    'manipulator_history',
                    JSON.stringify(state.items)
                );
            }
        },
        clearHistory(state) {
            state.items = [];
            if (typeof window !== 'undefined') {
                localStorage.removeItem('manipulator_history');
            }
        }
    }
});

export const { addHistoryItem, clearHistory } = slice.actions;
export const historyReducer = slice.reducer;