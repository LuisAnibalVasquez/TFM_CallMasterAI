import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

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
  SwaggerModule.setup("docs", app, document);

  await app.listen(3000, "0.0.0.0");
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation: http://localhost:3000/docs`);
}
bootstrap();
