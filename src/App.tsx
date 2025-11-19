import React from 'react';
import { useAppSelector } from './app/hooks';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

const App: React.FC = () => {
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return <DashboardPage />;
};

export default App;