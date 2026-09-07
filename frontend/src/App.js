import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/index.css';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Servers from './pages/Servers';
import ServerDetails from './pages/ServerDetails';
import Monitors from './pages/Monitors';
import Scanner from './pages/Scanner';
import ScanDetails from './pages/ScanDetails';
import Alerts from './pages/Alerts';
import Integrations from './pages/Integrations';
import Config from './pages/Config';
import Reports from './pages/Reports';
import CloudProviders from './pages/CloudProviders';
import SecuritySchedules from './pages/SecuritySchedules';
import Login from './pages/Login';

import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './hooks/useTheme';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
        }
    }
});

// ✅ FIX 22: Use AuthContext for auth state
const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#080b14]"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" /><p className="mt-3 text-sm text-slate-400">Loading Nexora...</p></div></div>;
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            {isAuthenticated ? (
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="servers" element={<Servers />} />
                    <Route path="servers/:id" element={<ServerDetails />} />
                    <Route path="monitors" element={<Monitors />} />
                    <Route path="scanner" element={<Scanner />} />
                    <Route path="scanner/:id" element={<ScanDetails />} />
                    <Route path="security/schedules" element={<SecuritySchedules />} />
                    <Route path="cloud" element={<CloudProviders />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="integrations" element={<Integrations />} />
                    <Route path="config" element={<Config />} />
                    <Route path="reports" element={<Reports />} />
                </Route>
            ) : (
                <Route path="*" element={<Navigate to="/login" />} />
            )}
        </Routes>
    );
};

const ThemedApp = () => {
    const { theme } = useTheme();
    return (
        <div className="nexora-shell">
            <ToastContainer
                position="top-right"
                autoClose={4500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
            />
            <AppRoutes />
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <WebSocketProvider>
                    <QueryClientProvider client={queryClient}>
                        <BrowserRouter>
                            <ThemedApp />
                        </BrowserRouter>
                    </QueryClientProvider>
                </WebSocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;