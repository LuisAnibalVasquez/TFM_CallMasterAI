// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt3 on Tue May 26 2026
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  createTenantSchema,
  updateTenantSchema,
  type CreateTenantFormInput,
  type CreateTenantInput,
  type UpdateTenantInput,
} from "@callmaster/shared";
import type { Tenant } from "@callmaster/shared";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTenantFormInput>({
    // @ts-expect-error - Zod types mismatch due to optional fields in update vs create
    resolver: zodResolver(isEditing ? updateTenantSchema : createTenantSchema),
    defaultValues: {
      name: tenant?.name || "",
      contactEmail: tenant?.contactEmail || "",
      phone: tenant?.phone || undefined,
      contactPerson: tenant?.contactPerson || undefined,
      logoUrl: tenant?.logoUrl || undefined,
      sandboxConfig: {
        apiUrl: tenant?.sandboxConfig?.apiUrl || "",
        apiKey: "",
      },
      productionConfig: {
        apiUrl: tenant?.productionConfig?.apiUrl || "",
        apiKey: "",
      },
    },
  });

  const rhfSubmitting = isCreating || isUpdating;

  const onValidSubmit = async (data: CreateTenantFormInput) => {
    try {
      if (isEditing && tenant) {
        const updateInput: Record<string, unknown> = {};

        if (data.name !== tenant.name) updateInput.name = data.name;
        if (data.contactEmail !== tenant.contactEmail)
          updateInput.contactEmail = data.contactEmail;
        if (data.phone !== tenant.phone) updateInput.phone = data.phone;
        if (data.contactPerson !== (tenant.contactPerson || ""))
          updateInput.contactPerson = data.contactPerson || undefined;
        if (data.logoUrl !== (tenant.logoUrl || ""))
          updateInput.logoUrl = data.logoUrl || undefined;

        // Only include sandbox config if API URL changed or key provided
        if (
          data.sandboxConfig.apiUrl !== tenant.sandboxConfig.apiUrl ||
          data.sandboxConfig.apiKey
        ) {
          updateInput.sandboxConfig = {
            apiUrl: data.sandboxConfig.apiUrl,
            apiKey: data.sandboxConfig.apiKey,
          };
        }
        // Only include production config if API URL changed or key provided
        if (
          data.productionConfig.apiUrl !== tenant.productionConfig.apiUrl ||
          data.productionConfig.apiKey
        ) {
          updateInput.productionConfig = {
            apiUrl: data.productionConfig.apiUrl,
            apiKey: data.productionConfig.apiKey,
          };
        }

        await updateTenant(
          tenant.id,
          updateInput as unknown as UpdateTenantInput,
        );
        toast({
          title: "Tenant updated",
          description: "Tenant configuration has been updated successfully.",
        });
        onSuccess();
      } else {
        await createTenant(data as unknown as CreateTenantInput);
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

  const onInvalidSubmit = () => {
    toast({
      variant: "destructive",
      title: "Validation Error",
      description: "Please check your inputs and fix any errors.",
    });
  };

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
          <form
            onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
            className="space-y-6"
            noValidate
          >
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
                    placeholder="Acme Corp"
                    className="bg-background"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Admin Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="admin@acmecorp.com"
                    className="bg-background"
                    {...register("contactEmail")}
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-xs text-destructive" role="alert">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="John Doe"
                    className="bg-background"
                    {...register("contactPerson")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 234 567 890"
                    className="bg-background"
                    {...register("phone", {
                      setValueAs: (v: string) => (v === "" ? undefined : v),
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Company Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://acmecorp.com/logo.png"
                  className="bg-background"
                  {...register("logoUrl", {
                    setValueAs: (v: string) => (v === "" ? undefined : v),
                  })}
                />
                {errors.logoUrl && (
                  <p className="mt-1 text-xs text-destructive" role="alert">
                    {errors.logoUrl.message}
                  </p>
                )}
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
                        placeholder="https://sandbox-api.voiceflow.com"
                        className="bg-background"
                        {...register("sandboxConfig.apiUrl")}
                      />
                      {errors.sandboxConfig?.apiUrl && (
                        <p
                          className="mt-1 text-xs text-destructive"
                          role="alert"
                        >
                          {errors.sandboxConfig.apiUrl.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sandboxApiKey">
                        API Key{" "}
                        {isEditing ? "(leave empty to keep current)" : "*"}
                      </Label>
                      <Input
                        id="sandboxApiKey"
                        type="password"
                        placeholder={isEditing ? "••••••••" : "sk-sandbox-..."}
                        className="bg-background"
                        {...register("sandboxConfig.apiKey")}
                      />
                      {errors.sandboxConfig?.apiKey && (
                        <p
                          className="mt-1 text-xs text-destructive"
                          role="alert"
                        >
                          {errors.sandboxConfig.apiKey.message}
                        </p>
                      )}
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
                        placeholder="https://api.voiceflow.com"
                        className="bg-background"
                        {...register("productionConfig.apiUrl")}
                      />
                      {errors.productionConfig?.apiUrl && (
                        <p
                          className="mt-1 text-xs text-destructive"
                          role="alert"
                        >
                          {errors.productionConfig.apiUrl.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productionApiKey">
                        API Key{" "}
                        {isEditing ? "(leave empty to keep current)" : "*"}
                      </Label>
                      <Input
                        id="productionApiKey"
                        type="password"
                        placeholder={
                          isEditing ? "••••••••" : "sk-production-..."
                        }
                        className="bg-background"
                        {...register("productionConfig.apiKey")}
                      />
                      {errors.productionConfig?.apiKey && (
                        <p
                          className="mt-1 text-xs text-destructive"
                          role="alert"
                        >
                          {errors.productionConfig.apiKey.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={rhfSubmitting}>
                {rhfSubmitting ? (
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
