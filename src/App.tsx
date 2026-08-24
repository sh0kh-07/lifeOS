import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppProvider } from './context/AppContext';
import { CalendarPage } from './pages/CalendarPage';
import { DashboardPage } from './pages/DashboardPage';
import { DebtsPage } from './pages/DebtsPage';
import { FinancePage } from './pages/FinancePage';
import { GoalsPage } from './pages/GoalsPage';
import { PeoplePage } from './pages/PeoplePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';
import { TodayPage } from './pages/TodayPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="today" element={<TodayPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="debts" element={<DebtsPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

