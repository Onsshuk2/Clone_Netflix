// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SubscriptionPlansPage from "./pages/SubscriptionPlansPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/">
          <Route index element={<HomePage />} />
          <Route
            path="/SubscriptionPlansPage"
            element={<SubscriptionPlansPage />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
