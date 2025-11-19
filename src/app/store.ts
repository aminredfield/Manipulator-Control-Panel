import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/authSlice';
import { manipulatorReducer } from '../features/manipulator/manipulatorSlice';
import { historyReducer } from '../features/manipulator/historySlice';
import { manipulatorApi } from '../features/api/manipulatorApi';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        manipulator: manipulatorReducer,
        history: historyReducer,
        [manipulatorApi.reducerPath]: manipulatorApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(manipulatorApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;