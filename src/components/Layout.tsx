import React from 'react';
import {
    AppBar,
    Box,
    Container,
    IconButton,
    Toolbar,
    Typography
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const dispatch = useAppDispatch();

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="static">
                <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            fontSize: { xs: 16, sm: 20 }
                        }}
                    >
                        Панель управления манипулятором
                    </Typography>
                    <IconButton
                        color="inherit"
                        onClick={() => dispatch(logout())}
                        size="large"
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container
                maxWidth="lg"
                sx={{
                    py: { xs: 2, md: 3 },
                    flexGrow: 1
                }}
            >
                {children}
            </Container>
        </Box>
    );
};
