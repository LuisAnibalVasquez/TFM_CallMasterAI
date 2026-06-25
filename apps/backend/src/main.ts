import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { serve } from "inngest/express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Ensure JSON body parsing supports larger payloads (e.g. CSV uploads)
  // and is available globally for both our API and Inngest.
  app.useBodyParser("json", { limit: "50mb" });

  app.use(cookieParser());

  // Global validation pipe: whitelist + forbid non-whitelisted + auto-transform
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar orígenes permitidos usando variables de entorno para Producción
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle("Call Master AI API")
    .setDescription(
      "Plataforma SaaS para gestión de campañas de analistas con IA",
    )
    .setVersion("1.0")
    .addTag("auth")
    .addTag("tenants")
    .addTag("campaigns")
    .addTag("analytics")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js",
    ],
  });

  // ── Inngest serve endpoint ──────────────────────────────────────────
  // Exposes POST /api/inngest so the Inngest dev server can discover and
  // invoke registered background functions (Campaign Processing, Campaign
  // Purge). The InngestClient and INNGEST_FUNCTIONS tokens are provided
  // by CampaignsInngestModule / CampaignsModule respectively.

  const inngestClient = app.get("InngestClient");
  const inngestFunctions = app.get("INNGEST_FUNCTIONS");

  app.use(
    "/api/inngest",
    serve({ client: inngestClient, functions: inngestFunctions }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
