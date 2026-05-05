import { Outlet, Link, useNavigate, Navigate } from "react-router-dom";
import { useToast } from "../../../shared/hooks/use-toast";
import { Button } from "../../../shared/components/ui/button";
import { PhoneCall, LogOut, LayoutDashboard, Building2 } from "lucide-react";
import { apiClient } from "../../../shared/api/ApiClient";
import { UserRole } from "@callmaster/shared";

export function DashboardLayout() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Basic auth check
  let user: { email?: string; role?: UserRole } | null;
  try {
    const userStr = localStorage.getItem("user");
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    localStorage.removeItem("user");
    user = null;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout", undefined);
    } catch (error) {
      console.warn("Error during logout API call", error);
    } finally {
      localStorage.removeItem("user");

      toast({
        title: "Sesión finalizada",
        description: "Has cerrado sesión correctamente.",
      });

      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <PhoneCall className="h-4 w-4 text-primary" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Call Master
            </span>
          </Link>
        </div>

        <div className="p-4 flex-1">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Menú Principal
          </p>
          <nav className="space-y-1">
            <Link
              to={
                user.role === UserRole.PlatformOwner
                  ? "/admin/dashboard"
                  : "/dashboard"
              }
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-secondary text-secondary-foreground font-medium text-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            {user.role === UserRole.PlatformOwner && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-foreground font-medium text-sm transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Tenants
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user.email}</span>
              <span className="text-xs text-muted-foreground">{user.role}</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-background flex items-center px-8 justify-between shrink-0">
          <h1 className="text-xl font-semibold">
            {user.role === UserRole.PlatformOwner
              ? "Administración Global"
              : "Dashboard de Tenant"}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
