import React from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import { loginSuccess } from './authSlice';

interface LoginFormValues {
    login: string;
    password: string;
}

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'admin';

export const LoginForm: React.FC = () => {
    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<LoginFormValues>({
        defaultValues: {
            login: '',
            password: ''
        }
    });
    const dispatch = useAppDispatch();
    const [authError, setAuthError] = React.useState<string | null>(null);

    const onSubmit = (values: LoginFormValues) => {
        if (
            values.login === ADMIN_LOGIN &&
            values.password === ADMIN_PASSWORD
        ) {
            setAuthError(null);
            dispatch(loginSuccess());
        } else {
            setAuthError('Неверный логин или пароль');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Paper sx={{ p: 4, minWidth: 320 }}>
                <Typography variant="h5" mb={2}>
                    Вход в систему
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        <TextField
                            label="Логин"
                            {...register('login', { required: 'Введите логин' })}
                            error={!!errors.login}
                            helperText={errors.login?.message}
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            {...register('password', { required: 'Введите пароль' })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />
                        {authError && (
                            <Typography color="error" variant="body2">
                                {authError}
                            </Typography>
                        )}
                        <Button type="submit" variant="contained">
                            Войти
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
};