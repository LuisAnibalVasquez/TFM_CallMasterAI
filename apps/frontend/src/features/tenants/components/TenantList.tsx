import { useState } from "react";
import { Button } from "../../../shared/components/ui/button";
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
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  CheckCircle,
  FlaskConical,
  Zap,
  AlertTriangle,
} from "lucide-react";
import {
  useTenants,
  useUpdateTenant,
  useDeleteTenant,
} from "../hooks/useTenants";
import { TenantForm } from "./TenantForm";
import { TenantStatus, type Tenant } from "@callmaster/shared";

interface DeleteConfirmation {
  tenantId: string;
  tenantName: string;
}

export function TenantList() {
  const { tenants, total, isLoading, refetch } = useTenants();
  const { updateTenant, isUpdating } = useUpdateTenant();
  const { deleteTenant, isDeleting } = useDeleteTenant();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmation | null>(
    null,
  );

  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus: TenantStatus =
      tenant.status === TenantStatus.ACTIVE
        ? TenantStatus.SUSPENDED
        : TenantStatus.ACTIVE;

    try {
      await updateTenant(tenant.id, { status: newStatus });
      toast({
        title: "Status updated",
        description: `${tenant.name} is now ${newStatus}.`,
      });
      refetch();
    } catch {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update tenant status. Please try again.",
      });
    }
  };

  const handleDelete = async (tenantId: string, tenantName: string) => {
    try {
      await deleteTenant(tenantId);
      toast({
        title: "Tenant deleted",
        description: `${tenantName} has been permanently deleted.`,
      });
      setDeleteConfirm(null);
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Delete operation failed";

      if (message.includes("campaigns") || message.includes("409")) {
        toast({
          variant: "destructive",
          title: "Cannot delete",
          description:
            "This tenant has existing campaigns. Remove all campaigns first before deleting the tenant.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: message,
        });
      }
      setDeleteConfirm(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTenant(null);
    refetch();
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingTenant(null);
    setShowForm(true);
  };

  // ─── Delete Confirmation Modal ───────────────────────────────────────

  const DeleteConfirmDialog = () => {
    if (!deleteConfirm) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-sm border-destructive/30 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg">Confirm Deletion</CardTitle>
            </div>
            <CardDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.tenantName}</strong>? This action cannot be
              undone. All associated users will also be removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() =>
                handleDelete(deleteConfirm.tenantId, deleteConfirm.tenantName)
              }
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ─── Status Badge ────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: TenantStatus }) => {
    const isActive = status === TenantStatus.ACTIVE;
    return (
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-destructive"}`}
        ></span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {status}
        </span>
      </div>
    );
  };

  // ─── AI Config Indicator ─────────────────────────────────────────────

  const AIConfigIndicator = ({
    sandboxConfigured,
    productionConfigured,
  }: {
    sandboxConfigured: boolean;
    productionConfigured: boolean;
  }) => (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-1 text-xs ${sandboxConfigured ? "text-green-600" : "text-muted-foreground"}`}
        title={
          sandboxConfigured ? "Sandbox configured" : "Sandbox not configured"
        }
      >
        <FlaskConical className="h-3 w-3" />
        {sandboxConfigured ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <span className="text-[10px]">—</span>
        )}
      </div>
      <div
        className={`flex items-center gap-1 text-xs ${productionConfigured ? "text-green-600" : "text-muted-foreground"}`}
        title={
          productionConfigured
            ? "Production configured"
            : "Production not configured"
        }
      >
        <Zap className="h-3 w-3" />
        {productionConfigured ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <span className="text-[10px]">—</span>
        )}
      </div>
    </div>
  );

  // ─── Main Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">
            Manage organizations and their AI agent configurations.
            {total > 0 && (
              <span className="ml-2 text-sm">
                ({total} total
                {tenants.length < total ? `, showing ${tenants.length}` : ""})
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> New Tenant
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <TenantForm
          tenant={editingTenant}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingTenant(null);
          }}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tenants.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <Building2Icon className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-2">No tenants registered yet</p>
          <p className="text-sm">
            Create your first tenant to start managing AI call center agents.
          </p>
        </div>
      )}

      {/* Tenant Table */}
      {!isLoading && tenants.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      AI Config
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{tenant.name}</div>
                        {tenant.contactPerson && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {tenant.contactPerson}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-muted-foreground">
                          {tenant.contactEmail}
                        </div>
                        {tenant.phone && (
                          <div className="text-xs text-muted-foreground/70 mt-0.5">
                            {tenant.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={tenant.status} />
                      </td>
                      <td className="px-6 py-4">
                        <AIConfigIndicator
                          sandboxConfigured={!!tenant.sandboxConfig?.apiUrl}
                          productionConfigured={
                            !!tenant.productionConfig?.apiUrl
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(tenant)}
                            title="Edit tenant"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(tenant)}
                            title={
                              tenant.status === TenantStatus.ACTIVE
                                ? "Suspend tenant"
                                : "Activate tenant"
                            }
                          >
                            {tenant.status === TenantStatus.ACTIVE ? (
                              <PowerOff className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setDeleteConfirm({
                                tenantId: tenant.id,
                                tenantName: tenant.name,
                              })
                            }
                            title="Delete tenant"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog />
    </div>
  );
}

// Inline icon for empty state to avoid import issues
function Building2Icon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
