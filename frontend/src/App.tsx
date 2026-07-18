import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { DevicesPage } from './pages/DevicesPage.js';import { WifiPage } from './pages/WifiPage.js';import { WanPage } from './pages/WanPage.js';import { SecurityPage } from './pages/SecurityPage.js';import { SettingsPage } from './pages/SettingsPage.js';import { LogsPage } from './pages/LogsPage.js';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/wifi" element={<WifiPage />} />
        <Route path="/wan" element={<WanPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
