// src/App.tsx
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "./common/UserLayout";
import AuthLayout from "./common/AuthLayout";
import NotFound from "./pages/NotFound";

import PublicHomePage from "./pages/public/LandingPage";
import SubscriptionPlansPage from "./pages/dashboard/SubscriptionPlansPage";
import TermsOfService from "./pages/public/TermsOfService";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PasswordRecovery from "./pages/auth/PasswordRecovery";
import NewPassword from "./pages/auth/NewPassword";
import ConfirmationEmailSent from "./pages/auth/EmailSent";
import DashboardMovies from "./pages/dashboard/DashboardFilms";
import DashboardAnime from "./pages/dashboard/DashboardAnime";
import DashboardCartoons from "./pages/dashboard/DashboardCartoons";
import Profile from "./pages/dashboard/Profile";
import Favorites from "./pages/dashboard/Favorites";
import WatchHistory from "./pages/dashboard/WatchHistory";
import { GlobalToaster } from "./lib/toast";
import AdminUsers from "./pages/admin/Admin";
import DashboardSeries from "./pages/dashboard/DashboardSeries";
import WelcomeDashboard from "./pages/dashboard/DashboardMain";
import MovieDetails from "./pages/dashboard/MovieDetails";
import { LoaderProvider } from "./components/GlobalLoader";

const isAuthenticated = () => !!localStorage.getItem("token");


const ProtectedRoute = () => {
  return isAuthenticated() ? (
    <UserLayout />
  ) : (
    <Navigate to="/login" replace />
  );
};


const GuestRoute = () => {
  return isAuthenticated() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <AuthLayout />
  );
};

function App() {
  return (
    <>
      <LoaderProvider>
        <Routes>
          {/* Гостьові маршрути (з AuthLayout — красивий хедер) */}
          <Route element={<GuestRoute />}>
            <Route path="/" element={<PublicHomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            <Route path="/reset-password" element={<NewPassword />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route
              path="/confirmation-sent"
              element={<ConfirmationEmailSent />}
            />
          </Route>

          {/* Захищені маршрути (з UserLayout — дашбордний хедер/сайдбар) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminUsers />} />
            <Route path="/dashboard-films" element={<DashboardMovies />} />
            <Route path="/dashboard" element={<WelcomeDashboard />} />
            <Route path="/dashboard-anime" element={<DashboardAnime />} />
            <Route path="/dashboard-series" element={<DashboardSeries />} />
            <Route path="/dashboard-cartoons" element={<DashboardCartoons />} />
            <Route path="/details/:type/:id" element={<MovieDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/watch-history" element={<WatchHistory />} />
            <Route path="/subscriptions" element={<SubscriptionPlansPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GlobalToaster />
      </LoaderProvider>
    </>
  );
}

export default App;
