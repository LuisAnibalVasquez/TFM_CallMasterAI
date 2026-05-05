import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { useToast } from "../../../shared/hooks/use-toast";
import { PhoneCall, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "../../../shared/api/ApiClient";
import { UserRole } from "@callmaster/shared";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await apiClient.post<any>("/auth/login", {
        email,
        password,
      });

      // Store only non-sensitive user data
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Autenticación exitosa. Redirigiendo...",
      });

      // Redirect based on role
      const userRole = data.user?.role;
      if (userRole === UserRole.PlatformOwner) {
        navigate("/admin/dashboard");
      } else if (userRole === UserRole.TenantAdmin) {
        navigate("/dashboard");
      } else {
        // Fallback for unknown roles
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const message =
        error instanceof ApiError ? error.message : "Error desconocido";
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <PhoneCall className="h-5 w-5 text-primary" strokeWidth={2.25} />
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            Call Master <span className="text-primary">AI</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-semibold tracking-tight text-foreground">
          Ingresa a tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary hover:text-primary/90 hover:underline"
          >
            Solicita acceso
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-card shadow-soft-lg border-border">
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tuempresa.com"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-primary hover:text-primary/90 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </div>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background"
                  />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
