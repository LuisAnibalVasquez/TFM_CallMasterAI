import { useState, useCallback } from "react";
import { CampaignList } from "../components/CampaignList";
import { CreateCampaignDialog } from "../components/CreateCampaignDialog";
import { campaignService } from "../services/campaignService";
import { useToast } from "../../../shared/hooks/use-toast";
import { useCampaigns } from "../hooks/useCampaigns";

export function CampaignsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { campaigns, total, isLoading, refetch } = useCampaigns();
  const { toast } = useToast();

  const handleTemplateDownload = useCallback(async () => {
    try {
      const url = await campaignService.downloadTemplate();
      window.open(url, "_blank");
    } catch {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not download the template. Please try again.",
      });
    }
  }, [toast]);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateDialog(false);
    refetch();
  }, [refetch]);

  const handleCreateCancel = useCallback(() => {
    setShowCreateDialog(false);
  }, []);

  return (
    <div className="space-y-6">
      <CampaignList
        campaigns={campaigns}
        total={total}
        isLoading={isLoading}
        refetch={refetch}
        onCreateClick={() => setShowCreateDialog(true)}
        onTemplateDownload={handleTemplateDownload}
      />
      <CreateCampaignDialog
        open={showCreateDialog}
        onSuccess={handleCreateSuccess}
        onCancel={handleCreateCancel}
        onTemplateDownload={handleTemplateDownload}
      />
    </div>
  );
}
