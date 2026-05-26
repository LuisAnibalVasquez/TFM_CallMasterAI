-- Add snapshot/metrics columns to campaigns table for post-completion analytics
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS total_calls integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS successful_calls integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_calls integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cost numeric(10,2) DEFAULT 0.00;

COMMENT ON COLUMN public.campaigns.total_calls IS 'Total number of call records associated with this campaign';
COMMENT ON COLUMN public.campaigns.successful_calls IS 'Number of calls that completed successfully';
COMMENT ON COLUMN public.campaigns.failed_calls IS 'Number of calls that failed or were rejected';
COMMENT ON COLUMN public.campaigns.total_cost IS 'Aggregate cost of all calls in this campaign';
