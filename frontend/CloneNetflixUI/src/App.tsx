// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SubscriptionPlansPage from "./pages/SubscriptionPlansPage";
import PasswordRecovery from "./pages/PasswordRecovery";
import NewPassword from "./pages/NewPassword";
import ConfirmationEmailSent from "./pages/ConfirmationEmailSent";
import UserLayout from "./common/UserLayout";
import NotFound from "./pages/OtherPage/NotFound";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<UserLayout/>}>          
          <Route index element={<HomePage />} />
          <Route
            path="/subscriptionPlansPage"
            element={<SubscriptionPlansPage />}
          />
          <Route path="/passwordRecovery" element={<PasswordRecovery />} />
          <Route path="/newPassword" element={<NewPassword />} />
          <Route
            path="/confirmationEmailSent"
            element={<ConfirmationEmailSent />}
          />
          
        </Route>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </>
  );
}

export default App;
