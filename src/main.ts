import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { HttpAdapterHost } from "@nestjs/core";
import * as dotenv from "dotenv";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.useLogger(new Logger());

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("My NestJS API")
    .setDescription("API documentation for my NestJS project")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const allowedOrigins = [
    "*",
    "https://www.truescholar.in",
    "https://main.d11ru2go6oqfip.amplifyapp.com",
    "https://stage.d3lclg6mfctqxo.amplifyapp.com", // CMS Stage
    "https://stage.d3idi0ktyuzfgf.amplifyapp.com", // Kapp Stage
  ];

  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push(
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8000",
      "http://localhost:3002",
      "*"
    );
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  const port = process.env.PORT || 8001;
  await app.listen(port, "0.0.0.0");
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
