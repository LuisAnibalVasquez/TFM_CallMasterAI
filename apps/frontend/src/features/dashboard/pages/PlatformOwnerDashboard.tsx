import { useState, useEffect } from "react";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { useToast } from "../../../shared/hooks/use-toast";
import { Loader2, Plus, Building2, Eye, MoreVertical } from "lucide-react";
import { apiClient, ApiError } from "../../../shared/api/ApiClient";

interface Tenant {
  id: string;
  name: string;
  contact_email: string;
  status: string;
  created_at: string;
}

export function PlatformOwnerDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    phone: "",
  });

  const { toast } = useToast();
  const token = localStorage.getItem("access_token");

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<Tenant[]>("/tenants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTenants(data);
    } catch (error: any) {
      const message =
        error instanceof ApiError ? error.message : "Error fetching tenants";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const data = await apiClient.post<any>("/tenants", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Tenant creado exitosamente",
        description: `Usuario: ${data.adminCredentials.email} | Clave: ${data.adminCredentials.temporaryPassword} (Guárdala!)`,
      });

      setShowCreateForm(false);
      setFormData({ name: "", contactEmail: "", phone: "" });
      fetchTenants();
    } catch (error: any) {
      const message =
        error instanceof ApiError ? error.message : "Error al crear el tenant";
      toast({
        variant: "destructive",
        title: "Error de creación",
        description: message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">
            Gestiona las organizaciones registradas en la plataforma.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Tenant
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Crear nuevo Tenant</CardTitle>
            <CardDescription>
              Completa los datos básicos. El sistema generará una contraseña
              segura automáticamente para el administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Acme Corp"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Correo del Administrador</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    placeholder="admin@acme.com"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono de contacto (Opcional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 234 567 890"
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Creando...
                    </>
                  ) : (
                    "Crear y generar acceso"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.length === 0 ? (
            <div className="col-span-full p-8 text-center text-muted-foreground border border-dashed rounded-xl">
              No hay tenants registrados todavía.
            </div>
          ) : (
            tenants.map((tenant) => (
              <Card
                key={tenant.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    {tenant.contact_email}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${tenant.status === "active" ? "bg-accent" : "bg-destructive"}`}
                      ></span>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {tenant.status}
                      </span>
                    </div>
                    <Button variant="secondary" size="sm">
                      <Eye className="mr-2 h-3 w-3" /> Ver detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
