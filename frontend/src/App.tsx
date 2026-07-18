import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout.js';
import { DashboardPage } from './pages/DashboardPage.js';

const App = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/devices" element={<DashboardPage />} />
        <Route path="/wifi" element={<DashboardPage />} />
        <Route path="/wan" element={<DashboardPage />} />
        <Route path="/security" element={<DashboardPage />} />
        <Route path="/settings" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
};

export default App;
