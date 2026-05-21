import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./features/landing/pages/LandingPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { DashboardLayout } from "./features/dashboard/layouts/DashboardLayout";
import { PlatformOwnerDashboard } from "./features/dashboard/pages/PlatformOwnerDashboard";
import { TenantAdminDashboard } from "./features/dashboard/pages/TenantAdminDashboard";
import { TenantsPage } from "./features/tenants/pages/TenantsPage";
import { Toaster } from "./shared/components/ui/toaster";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/signup"
            element={
              <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Solicitud de Acceso
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Página de registro en construcción.
                </p>
              </div>
            }
          />

          <Route element={<DashboardLayout />}>
            <Route
              path="/admin/dashboard"
              element={<PlatformOwnerDashboard />}
            />
            <Route path="/admin/tenants" element={<TenantsPage />} />
            <Route path="/dashboard" element={<TenantAdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
