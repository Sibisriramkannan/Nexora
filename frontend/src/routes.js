// frontend/src/routes.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// Pages
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
import Login from './pages/Login';

export const publicRoutes = [
    {
        path: '/login',
        element: <Login />,
        auth: false
    }
];

export const privateRoutes = [
    {
        path: '/',
        element: <Navigate to="/dashboard" />,
        auth: true
    },
    {
        path: '/dashboard',
        element: <Dashboard />,
        auth: true
    },
    {
        path: '/servers',
        element: <Servers />,
        auth: true
    },
    {
        path: '/servers/:id',
        element: <ServerDetails />,
        auth: true
    },
    {
        path: '/monitors',
        element: <Monitors />,
        auth: true
    },
    {
        path: '/scanner',
        element: <Scanner />,
        auth: true
    },
    {
        path: '/scanner/:id',
        element: <ScanDetails />,
        auth: true
    },
    {
        path: '/alerts',
        element: <Alerts />,
        auth: true
    },
    {
        path: '/integrations',
        element: <Integrations />,
        auth: true
    },
    {
        path: '/config',
        element: <Config />,
        auth: true
    },
    {
        path: '/reports',
        element: <Reports />,
        auth: true
    }
];

// Helper to check if route requires authentication
export const isProtectedRoute = (path) => {
    return privateRoutes.some(route => route.path === path && route.auth);
};

// Helper to get route element
export const getRouteElement = (path) => {
    const route = [...publicRoutes, ...privateRoutes].find(r => r.path === path);
    return route ? route.element : null;
};