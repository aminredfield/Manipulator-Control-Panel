import React from 'react';
import { Grid, Snackbar, Alert } from '@mui/material';
import { Layout } from '../components/Layout';
import { ControlsForm } from '../features/manipulator/ControlsForm';
import { ManipulatorCanvas } from '../features/manipulator/ManipulatorCanvas';
import { HistoryTable } from '../features/manipulator/HistoryTable';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useExecuteCommandsMutation } from '../features/api/manipulatorApi';
import {
    setExecuting,
    setStateFromStep
} from '../features/manipulator/manipulatorSlice';
import { HistoryItem } from '../features/manipulator/types';
import { addHistoryItem } from '../features/manipulator/historySlice';

export const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const grid = useAppSelector((s) => s.manipulator.grid);
    const manipulator = useAppSelector((s) => s.manipulator.manipulator);
    const samples = useAppSelector((s) => s.manipulator.samples);
    const speed = useAppSelector((s) => s.manipulator.commandSpeedMs);

    const [executeCommands, { isLoading }] = useExecuteCommandsMutation();
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarError, setSnackbarError] = React.useState<string | null>(
        null
    );

    const [currentTimeoutId, setCurrentTimeoutId] =
        React.useState<number | null>(null);

    React.useEffect(() => {
        return () => {
            if (currentTimeoutId !== null) {
                window.clearTimeout(currentTimeoutId);
            }
        };
    }, [currentTimeoutId]);

    const playSteps = React.useCallback(
        (steps: any[], onFinish: () => void) => {
            let index = 0;

            const runStep = () => {
                if (index >= steps.length) {
                    onFinish();
                    return;
                }
                const step = steps[index];
                dispatch(setStateFromStep(step));
                index += 1;
                const id = window.setTimeout(runStep, speed);
                setCurrentTimeoutId(id);
            };

            runStep();
        },
        [dispatch, speed]
    );

    const handleExecute = async (rawCommand: string, optimized: string) => {
        try {
            if (!rawCommand) return;

            const samplesBefore = samples.map((s) => ({
                ...s,
                position: { ...s.position }
            }));

            dispatch(setExecuting(true));
            setSnackbarError(null);

            const result = await executeCommands({
                rawCommand,
                grid,
                samples,
                manipulator
            }).unwrap();

            if (!result.steps.length) {
                dispatch(setExecuting(false));
                setSnackbarError('Нет команд для выполнения');
                return;
            }

            playSteps(result.steps, () => {
                dispatch(setExecuting(false));
                const item: HistoryItem = {
                    id: `${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    rawCommand,
                    optimizedCommand: result.optimizedString || optimized,
                    samplesBefore,
                    samplesAfter: result.finalSamples
                };
                dispatch(addHistoryItem(item));
                setSnackbarOpen(true);
            });
        } catch (e) {
            dispatch(setExecuting(false));
            setSnackbarError('Ошибка при выполнении команд');
        }
    };

    const executing = useAppSelector((s) => s.manipulator.executing);

    return (
        <Layout>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ControlsForm
                        onExecute={handleExecute}
                        executing={executing || isLoading}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <ManipulatorCanvas />
                </Grid>
                <Grid item xs={12}>
                    <HistoryTable />
                </Grid>
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={(_, reason) => {
                    if (reason === 'clickaway') return;
                    setSnackbarOpen(false);
                }}
            >
                <Alert
                    severity="success"
                    sx={{ width: '100%' }}
                    onClose={() => setSnackbarOpen(false)}
                >
                    Команды успешно выполнены
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!snackbarError}
                autoHideDuration={4000}
                onClose={(_, reason) => {
                    if (reason === 'clickaway') return;
                    setSnackbarError(null);
                }}
            >
                <Alert
                    severity="error"
                    sx={{ width: '100%' }}
                    onClose={() => setSnackbarError(null)}
                >
                    {snackbarError}
                </Alert>
            </Snackbar>
        </Layout>
    );
};