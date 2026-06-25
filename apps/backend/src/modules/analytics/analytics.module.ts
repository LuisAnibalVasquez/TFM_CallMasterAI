import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AnalyticsController } from "./infrastructure/controllers/analytics.controller";
import { AnalyticsService } from "./infrastructure/providers/analytics.service";
import { AdminAnalyticsService } from "./infrastructure/providers/admin-analytics.service";

@Module({
  imports: [AuthModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AdminAnalyticsService],
})
export class AnalyticsModule {}
