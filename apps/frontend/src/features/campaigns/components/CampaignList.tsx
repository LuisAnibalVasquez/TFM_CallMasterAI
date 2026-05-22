import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { useToast } from "../../../shared/hooks/use-toast";
import {
  Loader2,
  Play,
  Square,
  Mail,
  FlaskConical,
  Zap,
  PhoneCall,
} from "lucide-react";
import {
  useCampaigns,
  useStartCampaign,
  useCancelCampaign,
} from "../hooks/useCampaigns";
import type { CampaignData } from "../services/campaignService";

interface CampaignListProps {
  onCreateClick?: () => void;
  onTemplateDownload?: () => void;
}

export function CampaignList({
  onCreateClick,
  onTemplateDownload,
}: CampaignListProps) {
  const { campaigns, total, isLoading, refetch } = useCampaigns();
  const { startCampaign, isStarting } = useStartCampaign();
  const { cancelCampaign, isCanceling } = useCancelCampaign();
  const { toast } = useToast();

  const handleStart = async (campaign: CampaignData) => {
    try {
      await startCampaign(campaign.id);
      toast({
        title: "Campaign started",
        description: `"${campaign.name}" is now In-Progress.`,
      });
      refetch();
    } catch {
      toast({
        variant: "destructive",
        title: "Start failed",
        description: "Could not start the campaign. Please try again.",
      });
    }
  };

  const handleCancel = async (campaign: CampaignData) => {
    try {
      await cancelCampaign(campaign.id);
      toast({
        title: "Campaign cancelled",
        description: `"${campaign.name}" has been cancelled.`,
      });
      refetch();
    } catch {
      toast({
        variant: "destructive",
        title: "Cancel failed",
        description: "Could not cancel the campaign. Please try again.",
      });
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colorMap: Record<string, string> = {
      Created: "bg-blue-500",
      "In-Progress": "bg-amber-500 animate-pulse",
      Completed: "bg-green-500",
      Cancelled: "bg-destructive",
    };

    return (
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${colorMap[status] || "bg-muted-foreground"}`}
        ></span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {status}
        </span>
      </div>
    );
  };

  const EnvironmentBadge = ({ environment }: { environment: string }) => {
    const isProduction = environment === "Production";
    return (
      <div className="flex items-center gap-1.5">
        {isProduction ? (
          <Zap className="h-3.5 w-3.5 text-amber-500" />
        ) : (
          <FlaskConical className="h-3.5 w-3.5 text-blue-500" />
        )}
        <span className="text-xs text-muted-foreground">{environment}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground">
            Manage your call campaigns and track their progress.
            {total > 0 && (
              <span className="ml-2 text-sm">
                ({total} total
                {campaigns.length < total
                  ? `, showing ${campaigns.length}`
                  : ""}
                )
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onTemplateDownload && (
            <Button variant="outline" onClick={onTemplateDownload}>
              Download Template
            </Button>
          )}
          {onCreateClick && (
            <Button onClick={onCreateClick}>
              <Mail className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && campaigns.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <PhoneCall className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-2">No campaigns created yet</p>
          <p className="text-sm">
            Create your first campaign by uploading a CSV file with customer
            phone numbers.
          </p>
        </div>
      )}

      {/* Campaign Table */}
      {!isLoading && campaigns.length > 0 && (
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Environment
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Analytics
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="px-6 py-4">
                        <EnvironmentBadge environment={campaign.environment} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-xs">
                          <span title="Total calls">{campaign.totalCalls}</span>
                          <span
                            className="text-green-600"
                            title="Successful calls"
                          >
                            {campaign.successfulCalls}
                          </span>
                          <span
                            className="text-destructive"
                            title="Failed calls"
                          >
                            {campaign.failedCalls}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {campaign.status === "Created" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isStarting || isCanceling}
                              onClick={() => handleStart(campaign)}
                              title="Start campaign"
                            >
                              <Play className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {campaign.status === "In-Progress" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isStarting || isCanceling}
                              onClick={() => handleCancel(campaign)}
                              title="Cancel campaign"
                            >
                              <Square className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
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
    </div>
  );
}
