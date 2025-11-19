import React from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    Button,
    Stack,
    TextField,
    Typography,
    Slider,
    IconButton,
    Tooltip
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    regenerateSamples,
    resetToInitial,
    setGridConfig,
    setSampleCount,
    setSpeed
} from './manipulatorSlice';
import { validateCommandInput, optimizeCommands } from './commands';

export interface ControlsFormValues {
    command: string;
}

interface ControlsFormProps {
    onExecute: (rawCommand: string, optimized: string) => void;
    executing: boolean;
}

export const ControlsForm: React.FC<ControlsFormProps> = ({
    onExecute,
    executing
}) => {
    const {
        handleSubmit,
        register,
        watch,
        setError,
        clearErrors,
        formState: { errors }
    } = useForm<ControlsFormValues>({
        defaultValues: { command: '' }
    });

    const dispatch = useAppDispatch();
    const grid = useAppSelector((s) => s.manipulator.grid);
    const sampleCount = useAppSelector((s) => s.manipulator.sampleCount);
    const speed = useAppSelector((s) => s.manipulator.commandSpeedMs);
    const [optimizedPreview, setOptimizedPreview] = React.useState<string>('');

    const commandValue = watch('command');

    React.useEffect(() => {
        if (!commandValue) {
            setOptimizedPreview('');
            clearErrors('command');
            return;
        }
        const validationError = validateCommandInput(commandValue);
        if (validationError) {
            setError('command', { type: 'manual', message: validationError });
            setOptimizedPreview('');
            return;
        }
        clearErrors('command');
        setOptimizedPreview(optimizeCommands(commandValue));
    }, [commandValue, clearErrors, setError]);

    const onSubmit = (values: ControlsFormValues) => {
        const validationError = validateCommandInput(values.command);
        if (validationError) {
            setError('command', { type: 'manual', message: validationError });
            return;
        }
        const opt = optimizeCommands(values.command);
        onExecute(values.command.replace(/\s+/g, ''), opt);
    };

    const handleGridWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const width = Number(e.target.value) || 1;
        dispatch(
            setGridConfig({
                width: Math.max(1, Math.min(30, width)),
                height: grid.height
            })
        );
    };

    const handleGridHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const height = Number(e.target.value) || 1;
        dispatch(
            setGridConfig({
                width: grid.width,
                height: Math.max(1, Math.min(30, height))
            })
        );
    };

    const handleSampleCountChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const count = Number(e.target.value) || 0;
        dispatch(setSampleCount(Math.max(0, Math.min(20, count))));
    };

    const handleSpeedChange = (_: Event, value: number | number[]) => {
        const v = Array.isArray(value) ? value[0] : value;
        dispatch(setSpeed(v));
    };

    return (
        <Box>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                    <Typography variant="h6" fontSize={{ xs: 16, sm: 20 }}>
                        Команды манипулятора
                    </Typography>
                    <TextField
                        label="Последовательность команд (ЛПВНОБ)"
                        {...register('command')}
                        error={!!errors.command}
                        helperText={
                            errors.command?.message ||
                            'Например: ЛЛЛЛВВПППОНННБ или ЛЛЛНННЛЛЛНННО'
                        }
                        disabled={executing}
                        size="small"
                    />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize={{ xs: 12, sm: 14 }}
                    >
                        Доступные команды: <b>Л</b> - шаг влево; <b>П</b> - шаг вправо; <b>В</b> - шаг вверх; <b>Н</b> -
                        шаг вниз; <b>О</b> - взять образец; <b>Б</b> - отпустить образец.
                    </Typography>

                    {optimizedPreview && (
                        <Typography
                            variant="body2"
                            fontSize={{ xs: 12, sm: 14 }}
                        >
                            Оптимизированная версия: <b>{optimizedPreview}</b>
                        </Typography>
                    )}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={executing || !commandValue}
                            fullWidth={{ xs: true, sm: false } as any}
                        >
                            Отправить на манипулятор
                        </Button>
                        <Tooltip title="Сбросить состояние и сгенерировать новые образцы">
                            <span>
                                <IconButton
                                    onClick={() => dispatch(resetToInitial())}
                                    disabled={executing}
                                >
                                    <RestartAltIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </Stack>
            </form>

            <Box mt={4}>
                <Typography variant="h6" mb={2} fontSize={{ xs: 16, sm: 20 }}>
                    Настройки стола и образцов
                </Typography>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <TextField
                        label="Ширина (кол-во колонок)"
                        type="number"
                        value={grid.width}
                        onChange={handleGridWidthChange}
                        size="small"
                        inputProps={{ min: 1, max: 30 }}
                        fullWidth={true}
                        disabled={executing}
                    />
                    <TextField
                        label="Высота (кол-во строк)"
                        type="number"
                        value={grid.height}
                        onChange={handleGridHeightChange}
                        size="small"
                        inputProps={{ min: 1, max: 30 }}
                        fullWidth={true}
                        disabled={executing}
                    />
                    <TextField
                        label="Кол-во образцов"
                        type="number"
                        value={sampleCount}
                        onChange={handleSampleCountChange}
                        size="small"
                        inputProps={{ min: 0, max: 20 }}
                        fullWidth={true}
                        disabled={executing}
                    />

                </Stack>
                <br />
                <Button
                    variant="outlined"
                    onClick={() => dispatch(regenerateSamples())}
                    disabled={executing}
                    fullWidth={{ xs: true, sm: false } as any}
                >
                    Перегенерировать образцы
                </Button>
            </Box>

            <Box mt={4}>
                <Typography variant="h6" mb={1} fontSize={{ xs: 16, sm: 20 }}>
                    Скорость анимации
                </Typography>
                <Typography
                    variant="body2"
                    mb={1}
                    fontSize={{ xs: 12, sm: 14 }}
                >
                    Интервал между шагами: {speed} мс
                </Typography>
                <Slider
                    min={50}
                    max={1000}
                    step={50}
                    value={speed}
                    onChange={handleSpeedChange}
                    valueLabelDisplay="auto"
                    disabled={executing}
                />
            </Box>
        </Box>
    );
};