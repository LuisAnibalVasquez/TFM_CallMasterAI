import { useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { useToast } from "../../../shared/hooks/use-toast";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Building2,
  FlaskConical,
  Zap,
} from "lucide-react";
import { useCreateTenant, useUpdateTenant } from "../hooks/useTenants";
import type { Tenant, CreateTenantInput } from "@callmaster/shared";

interface TenantFormProps {
  tenant?: Tenant | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
  const isEditing = !!tenant;
  const { createTenant, isCreating, result: createResult } = useCreateTenant();
  const { updateTenant, isUpdating } = useUpdateTenant();
  const { toast } = useToast();

  const [showSandbox, setShowSandbox] = useState(false);
  const [showProduction, setShowProduction] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: tenant?.name || "",
    contactEmail: tenant?.contactEmail || "",
    phone: tenant?.phone || "",
    contactPerson: tenant?.contactPerson || "",
    logoUrl: tenant?.logoUrl || "",
    sandboxApiUrl: tenant?.sandboxConfig?.apiUrl || "",
    sandboxApiKey: "",
    productionApiUrl: tenant?.productionConfig?.apiUrl || "",
    productionApiKey: "",
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && tenant) {
        const updateInput: Record<string, unknown> = {};

        if (formData.name !== tenant.name) updateInput.name = formData.name;
        if (formData.contactEmail !== tenant.contactEmail)
          updateInput.contactEmail = formData.contactEmail;
        if (formData.phone !== tenant.phone) updateInput.phone = formData.phone;
        if (formData.contactPerson !== (tenant.contactPerson || ""))
          updateInput.contactPerson = formData.contactPerson || undefined;
        if (formData.logoUrl !== (tenant.logoUrl || ""))
          updateInput.logoUrl = formData.logoUrl || undefined;
        if (
          formData.sandboxApiUrl !== tenant.sandboxConfig.apiUrl ||
          formData.sandboxApiKey
        ) {
          updateInput.sandboxConfig = {
            apiUrl: formData.sandboxApiUrl,
            apiKey: formData.sandboxApiKey,
          };
        }
        if (
          formData.productionApiUrl !== tenant.productionConfig.apiUrl ||
          formData.productionApiKey
        ) {
          updateInput.productionConfig = {
            apiUrl: formData.productionApiUrl,
            apiKey: formData.productionApiKey,
          };
        }

        await updateTenant(tenant.id, updateInput as any);
        toast({
          title: "Tenant updated",
          description: "Tenant configuration has been updated successfully.",
        });
        onSuccess();
      } else {
        const createInput: CreateTenantInput = {
          name: formData.name,
          contactEmail: formData.contactEmail,
          phone: formData.phone || undefined,
          contactPerson: formData.contactPerson || undefined,
          logoUrl: formData.logoUrl || undefined,
          sandboxConfig: {
            apiUrl: formData.sandboxApiUrl,
            apiKey: formData.sandboxApiKey,
          },
          productionConfig: {
            apiUrl: formData.productionApiUrl,
            apiKey: formData.productionApiKey,
          },
        };

        await createTenant(createInput);
        toast({
          title: "Tenant created",
          description: "Tenant and admin user have been created successfully.",
        });
        setShowTempPassword(true);
      }
    } catch {
      toast({
        variant: "destructive",
        title: isEditing ? "Update failed" : "Creation failed",
        description: isEditing
          ? "Could not update the tenant. Please try again."
          : "Could not create the tenant. Please check your inputs.",
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? "Edit Tenant" : "Create New Tenant"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update tenant details and AI provider configuration. Leave API key fields empty to keep existing keys."
              : "Complete the tenant details and AI provider configuration. The system will generate a secure password for the admin user automatically."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange("name")}
                    placeholder="Acme Corp"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Admin Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={handleChange("contactEmail")}
                    placeholder="admin@acmecorp.com"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange("contactPerson")}
                    placeholder="John Doe"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    placeholder="+1 234 567 890"
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Company Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={handleChange("logoUrl")}
                  placeholder="https://acmecorp.com/logo.png"
                  className="bg-background"
                />
              </div>
            </div>

            {/* Sandbox AI Configuration */}
            <div className="border border-border rounded-lg">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors rounded-t-lg"
                onClick={() => setShowSandbox(!showSandbox)}
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    Sandbox AI Configuration
                  </span>
                </div>
                {showSandbox ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {showSandbox && (
                <div className="p-4 pt-0 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Development/testing environment. This agent handles limited
                    test calls.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sandboxApiUrl">API Base URL *</Label>
                      <Input
                        id="sandboxApiUrl"
                        type="url"
                        required={!isEditing}
                        value={formData.sandboxApiUrl}
                        onChange={handleChange("sandboxApiUrl")}
                        placeholder="https://sandbox-api.voiceflow.com"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sandboxApiKey">
                        API Key{" "}
                        {isEditing ? "(leave empty to keep current)" : "*"}
                      </Label>
                      <Input
                        id="sandboxApiKey"
                        type="password"
                        required={!isEditing}
                        value={formData.sandboxApiKey}
                        onChange={handleChange("sandboxApiKey")}
                        placeholder={isEditing ? "••••••••" : "sk-sandbox-..."}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Production AI Configuration */}
            <div className="border border-border rounded-lg">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors rounded-t-lg"
                onClick={() => setShowProduction(!showProduction)}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    Production AI Configuration
                  </span>
                </div>
                {showProduction ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {showProduction && (
                <div className="p-4 pt-0 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Live production environment. This agent handles real
                    customer calls.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productionApiUrl">API Base URL *</Label>
                      <Input
                        id="productionApiUrl"
                        type="url"
                        required={!isEditing}
                        value={formData.productionApiUrl}
                        onChange={handleChange("productionApiUrl")}
                        placeholder="https://api.voiceflow.com"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productionApiKey">
                        API Key{" "}
                        {isEditing ? "(leave empty to keep current)" : "*"}
                      </Label>
                      <Input
                        id="productionApiKey"
                        type="password"
                        required={!isEditing}
                        value={formData.productionApiKey}
                        onChange={handleChange("productionApiKey")}
                        placeholder={
                          isEditing ? "••••••••" : "sk-production-..."
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Create Tenant"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Temporary Password Modal */}
      {showTempPassword && createResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Admin Credentials</CardTitle>
              <CardDescription>
                This password is shown only once. Please copy it and share it
                securely with the tenant administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-mono text-sm font-medium">
                  {createResult.adminCredentials.email}
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="text-sm text-muted-foreground">
                  Temporary Password
                </div>
                <div className="font-mono text-sm font-medium select-all">
                  {createResult.adminCredentials.temporaryPassword}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowTempPassword(false);
                  onSuccess();
                }}
              >
                I have copied the credentials
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
