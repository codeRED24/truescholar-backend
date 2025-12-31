import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import * as dotenv from "dotenv";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { AppLogger } from "./common/logger";
dotenv.config();

async function bootstrap() {
  const logger = new AppLogger("Bootstrap");

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bodyParser: false,
      logger: new AppLogger("NestJS"),
    }
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

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
    process.env.FRONTEND_URL || "",
    process.env.STAGING_FRONTEND_URL || "",
    process.env.DEV_FRONTEND_URL || "",
    "https://main.d11ru2go6oqfip.amplifyapp.com",
    "https://stage.d3lclg6mfctqxo.amplifyapp.com", // CMS Stage
    "https://stage.d3idi0ktyuzfgf.amplifyapp.com", // Kapp Stage
    "*",
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
      // allow requests with no origin (e.g., curl, mobile apps)
      if (!origin) return callback(null, true);

      // if wildcard is present, allow all origins
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    // include common headers that browsers send during preflight
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "Accept",
      "Origin",
      "X-Requested-With",
      "Access-Control-Request-Headers",
      "Access-Control-Request-Method",
    ],
  });

  const port = process.env.PORT || 8001;
  await app.listen(port, "0.0.0.0");
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
