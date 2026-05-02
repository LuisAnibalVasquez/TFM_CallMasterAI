import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation: http://localhost:3000/docs`);
}
bootstrap();
