// src/App.tsx
import "./App.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import UserLayout from "./common/UserLayout";
import AuthLayout from "./common/AuthLayout";
import NotFound from "./pages/NotFound";

import PublicHomePage from "./pages/public/LandingPage";
import SubscriptionPlansPage from "./pages/dashboard/SubscriptionPlansPage";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PasswordRecovery from "./pages/auth/PasswordRecovery";
import NewPassword from "./pages/auth/NewPassword";
import ConfirmationEmailSent from "./pages/auth/EmailSent";
import WelcomeDashboardMovies from "./pages/dashboard/Dashboard";
import DashboardAnime from "./pages/dashboard/DashboardAnime";
import DashboardCartoons from "./pages/dashboard/DashboardCartoons";
import Profile from "./pages/dashboard/Profile";
import { GlobalToaster } from "./lib/toast";
import AdminUsers from "./pages/admin/Admin";
import DashboardSeries from "./pages/dashboard/DashboardSeries";

const isAuthenticated = () => !!localStorage.getItem("token");

// Захищений маршрут: тільки залогінені + UserLayout
const ProtectedRoute = () => {
  return isAuthenticated() ? (
    <UserLayout>
      <Outlet /> {/* Тут будуть Dashboard, Plans тощо */}
    </UserLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Гостьовий маршрут: тільки незалогінені + AuthLayout (з красивим хедером)
const GuestRoute = () => {
  return isAuthenticated() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <AuthLayout>
      <Outlet /> {/* Тут будуть LandingPage, Login, Register тощо */}
    </AuthLayout>
  );
};

function App() {
  return (
    <>
      <Routes>
        {/* Гостьові маршрути (з AuthLayout — красивий хедер) */}
        <Route element={<GuestRoute />}>
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route
            path="/confirmation-sent"
            element={<ConfirmationEmailSent />}
          />
        </Route>

        {/* Захищені маршрути (з UserLayout — дашбордний хедер/сайдбар) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminUsers />} />
          <Route path="/dashboard" element={<WelcomeDashboardMovies />} />
          <Route path="/dashboard-anime" element={<DashboardAnime />} />
          <Route path="/dashboard-series" element={<DashboardSeries />} />
          <Route path="/dashboard-cartoons" element={<DashboardCartoons />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/plans" element={<SubscriptionPlansPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GlobalToaster />
    </>
  );
}

export default App;
