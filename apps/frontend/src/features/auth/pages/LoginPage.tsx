// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt3 on Tue May 26 2026
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { useToast } from "../../../shared/hooks/use-toast";
import { PhoneCall, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "../../../shared/api/ApiClient";
import { loginSchema, type LoginInput, UserRole } from "@callmaster/shared";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const onValidSubmit = async (data: LoginInput) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.post<any>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      // Store only non-sensitive user data
      localStorage.setItem("user", JSON.stringify(response.user));

      toast({
        title: "Welcome back!",
        description: "Authentication successful. Redirecting...",
      });

      // Redirect based on role
      const userRole = response.user?.role;
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
        error instanceof ApiError ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: message,
      });
    }
  };

  const onInvalidSubmit = () => {
    const errorMessages: string[] = [];
    if (errors.email) errorMessages.push(errors.email.message as string);
    if (errors.password) errorMessages.push(errors.password.message as string);

    toast({
      variant: "destructive",
      title: "Validation Error",
      description: errorMessages.join(" ") || "Please check your inputs.",
    });
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
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-card shadow-soft-lg border-border">
          <CardContent className="pt-6">
            <form
              className="space-y-6"
              onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@tuempresa.com"
                    className="bg-background"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-primary hover:text-primary/90 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </div>
                <div className="mt-1">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="bg-background"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-destructive" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
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
