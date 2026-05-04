import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./features/landing/pages/LandingPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { Toaster } from "./shared/components/ui/toaster";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Temporary placeholder routes for post-login redirection */}
          <Route
            path="/admin/dashboard"
            element={<div className="p-8">Platform Owner Dashboard</div>}
          />
          <Route
            path="/dashboard"
            element={<div className="p-8">Tenant Admin Dashboard</div>}
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
