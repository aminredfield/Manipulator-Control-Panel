import {
    CellCoord,
    CommandChar,
    CommandExecutionStep,
    ExecutionResult,
    GridConfig,
    ManipulatorState,
    Run,
    Sample
} from './types';

const COMMAND_REGEX = /^[ЛПВНОБ]+$/;

export function validateCommandInput(input: string): string | null {
    const trimmed = input.replace(/\s+/g, '');
    if (!trimmed.length) return 'Строка команд пуста';
    if (!COMMAND_REGEX.test(trimmed)) {
        return 'Допускаются только символы Л, П, В, Н, О, Б';
    }
    return null;
}

export function toRuns(input: string): Run[] {
    const s = input.replace(/\s+/g, '');
    const runs: Run[] = [];
    if (!s.length) return runs;

    let current = s[0] as CommandChar;
    let count = 1;

    for (let i = 1; i < s.length; i++) {
        const ch = s[i] as CommandChar;
        if (ch === current) {
            count++;
        } else {
            runs.push({ count, cmd: current });
            current = ch;
            count = 1;
        }
    }
    runs.push({ count, cmd: current });
    return runs;
}

export function runsToString(runs: Run[]): string {
    return runs
        .map((r) => (r.count > 1 ? `${r.count}${r.cmd}` : r.cmd))
        .join('');
}

export function compressRepeatingBlock(runs: Run[]): string {
    const n = runs.length;
    if (n < 4) return runsToString(runs);

    for (let blockLen = 1; blockLen <= Math.floor(n / 2); blockLen++) {
        for (let start = 0; start + 2 * blockLen <= n; start++) {
            let same = true;
            for (let i = 0; i < blockLen; i++) {
                const a = runs[start + i];
                const b = runs[start + i + blockLen];
                if (a.cmd !== b.cmd || a.count !== b.count) {
                    same = false;
                    break;
                }
            }
            if (!same) continue;

            let repeats = 2;
            let nextStart = start + 2 * blockLen;

            while (nextStart + blockLen <= n) {
                let eq = true;
                for (let i = 0; i < blockLen; i++) {
                    const a = runs[start + i];
                    const b = runs[nextStart + i];
                    if (a.cmd !== b.cmd || a.count !== b.count) {
                        eq = false;
                        break;
                    }
                }
                if (!eq) break;
                repeats++;
                nextStart += blockLen;
            }

            if (repeats >= 2) {
                const prefix = runs.slice(0, start);
                const pattern = runs.slice(start, start + blockLen);
                const suffix = runs.slice(start + repeats * blockLen);

                const patternStr = runsToString(pattern);
                const prefixStr = runsToString(prefix);
                const suffixStr = runsToString(suffix);

                return [
                    prefixStr,
                    `${repeats}(${patternStr})`,
                    suffixStr
                ]
                    .filter(Boolean)
                    .join('');
            }
        }
    }

    return runsToString(runs);
}

export function optimizeCommands(raw: string): string {
    const trimmed = raw.replace(/\s+/g, '');
    if (!trimmed.length) return '';
    const runs = toRuns(trimmed);
    const rle = runsToString(runs);
    const withBlocks = compressRepeatingBlock(runs);
    return withBlocks.length < rle.length ? withBlocks : rle;
}

export function createInitialState(
    grid: GridConfig,
    sampleCount: number
): { manipulator: ManipulatorState; samples: Sample[] } {
    const position: CellCoord = { x: 0, y: 0 };
    const samples: Sample[] = [];

    const occupied = new Set<string>();
    occupied.add('0:0');

    for (let i = 0; i < sampleCount; i++) {
        let x = 0;
        let y = 0;
        do {
            x = Math.floor(Math.random() * grid.width);
            y = Math.floor(Math.random() * grid.height);
        } while (occupied.has(`${x}:${y}`));
        occupied.add(`${x}:${y}`);
        samples.push({ id: `s${i}`, position: { x, y } });
    }

    return {
        manipulator: { position, holdingSampleId: null },
        samples
    };
}

export function applyCommand(
    cmd: CommandChar,
    state: ManipulatorState,
    samples: Sample[],
    grid: GridConfig
): { state: ManipulatorState; samples: Sample[] } {
    const newState: ManipulatorState = {
        position: { ...state.position },
        holdingSampleId: state.holdingSampleId
    };
    const newSamples = samples.map((s) => ({
        ...s,
        position: { ...s.position }
    }));

    switch (cmd) {
        case 'Л':
            newState.position.x = Math.max(0, newState.position.x - 1);
            break;
        case 'П':
            newState.position.x = Math.min(
                grid.width - 1,
                newState.position.x + 1
            );
            break;
        case 'В':
            newState.position.y = Math.max(0, newState.position.y - 1);
            break;
        case 'Н':
            newState.position.y = Math.min(
                grid.height - 1,
                newState.position.y + 1
            );
            break;
        case 'О': {
            if (!newState.holdingSampleId) {
                const sample = newSamples.find(
                    (s) =>
                        s.position.x === newState.position.x &&
                        s.position.y === newState.position.y
                );
                if (sample) {
                    newState.holdingSampleId = sample.id;
                }
            }
            break;
        }
        case 'Б': {
            if (newState.holdingSampleId) {
                const sample = newSamples.find(
                    (s) => s.id === newState.holdingSampleId
                );
                if (sample) {
                    sample.position = { ...newState.position };
                }
                newState.holdingSampleId = null;
            }
            break;
        }
    }

    return { state: newState, samples: newSamples };
}

export function simulateExecution(
    rawCommand: string,
    initialState: ManipulatorState,
    initialSamples: Sample[],
    grid: GridConfig
): ExecutionResult {
    const cmds = rawCommand.replace(/\s+/g, '');
    const optimizedString = optimizeCommands(cmds);

    let state: ManipulatorState = {
        position: { ...initialState.position },
        holdingSampleId: initialState.holdingSampleId
    };
    let samples: Sample[] = initialSamples.map((s) => ({
        ...s,
        position: { ...s.position }
    }));

    const steps: CommandExecutionStep[] = [];

    for (let i = 0; i < cmds.length; i++) {
        const cmd = cmds[i] as CommandChar;
        const result = applyCommand(cmd, state, samples, grid);
        state = result.state;
        samples = result.samples;

        steps.push({
            index: i,
            cmd,
            state: {
                position: { ...state.position },
                holdingSampleId: state.holdingSampleId
            },
            samples: samples.map((s) => ({
                ...s,
                position: { ...s.position }
            }))
        });
    }

    return {
        steps,
        finalState: state,
        finalSamples: samples,
        optimizedString
    };
}