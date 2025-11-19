export type CommandChar = 'Л' | 'П' | 'В' | 'Н' | 'О' | 'Б';

export type CellCoord = { x: number; y: number };

export interface Sample {
    id: string;
    position: CellCoord;
}

export interface ManipulatorState {
    position: CellCoord;
    holdingSampleId: string | null;
}

export interface GridConfig {
    width: number;
    height: number;
}

export interface Run {
    count: number;
    cmd: CommandChar;
}

export interface CommandExecutionStep {
    index: number;
    cmd: CommandChar;
    state: ManipulatorState;
    samples: Sample[];
}

export interface ExecutionResult {
    steps: CommandExecutionStep[];
    finalState: ManipulatorState;
    finalSamples: Sample[];
    optimizedString: string;
}

export interface HistoryItem {
    id: string;
    createdAt: string;
    rawCommand: string;
    optimizedCommand: string;
    samplesBefore: Sample[];
    samplesAfter: Sample[];
}