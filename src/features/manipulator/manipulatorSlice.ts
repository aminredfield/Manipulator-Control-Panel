import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    CommandExecutionStep,
    GridConfig,
    ManipulatorState,
    Sample
} from './types';
import { createInitialState } from './commands';

export interface ManipulatorSliceState {
    grid: GridConfig;
    manipulator: ManipulatorState;
    samples: Sample[];
    sampleCount: number;
    commandSpeedMs: number;
    executing: boolean;
}

const defaultGrid: GridConfig = { width: 10, height: 10 };

const initialData = createInitialState(defaultGrid, 4);

const initialState: ManipulatorSliceState = {
    grid: defaultGrid,
    manipulator: initialData.manipulator,
    samples: initialData.samples,
    sampleCount: 4,
    commandSpeedMs: 300,
    executing: false
};

const slice = createSlice({
    name: 'manipulator',
    initialState,
    reducers: {
        setGridConfig(state, action: PayloadAction<GridConfig>) {
            state.grid = action.payload;
            const { manipulator, samples } = createInitialState(
                state.grid,
                state.sampleCount
            );
            state.manipulator = manipulator;
            state.samples = samples;
        },
        setSampleCount(state, action: PayloadAction<number>) {
            state.sampleCount = action.payload;
            const { manipulator, samples } = createInitialState(
                state.grid,
                state.sampleCount
            );
            state.manipulator = manipulator;
            state.samples = samples;
        },
        regenerateSamples(state) {
            const { manipulator, samples } = createInitialState(
                state.grid,
                state.sampleCount
            );
            state.manipulator = manipulator;
            state.samples = samples;
        },
        setSpeed(state, action: PayloadAction<number>) {
            state.commandSpeedMs = action.payload;
        },
        setExecuting(state, action: PayloadAction<boolean>) {
            state.executing = action.payload;
        },
        setStateFromStep(state, action: PayloadAction<CommandExecutionStep>) {
            state.manipulator = action.payload.state;
            state.samples = action.payload.samples;
        },
        resetToInitial(state) {
            const { manipulator, samples } = createInitialState(
                state.grid,
                state.sampleCount
            );
            state.manipulator = manipulator;
            state.samples = samples;
        }
    }
});

export const {
    setGridConfig,
    setSampleCount,
    regenerateSamples,
    setSpeed,
    setExecuting,
    setStateFromStep,
    resetToInitial
} = slice.actions;

export const manipulatorReducer = slice.reducer;