import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import * as dotenv from "dotenv";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
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

  // Connect Kafka microservice for event consumption
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID || "truescholar-backend",
        brokers: (process.env.KAFKA_BROKERS || "localhost:19092").split(","),
      },
      consumer: {
        groupId: process.env.KAFKA_CONSUMER_GROUP || "truescholar-events",
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle("My NestJS API")
    .setDescription("API documentation for my NestJS project")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Environment-specific CORS origins
  const nodeEnv = process.env.NODE_ENV || "dev";
  let allowedOrigins: string[] = [];

  if (nodeEnv === "dev" || nodeEnv === "development") {
    // Dev: localhost + DEV_FRONTEND_URL
    allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:8001",
      process.env.DEV_FRONTEND_URL || "",
    ].filter(Boolean);
  } else if (nodeEnv === "staging" || nodeEnv === "stage") {
    allowedOrigins = [process.env.STAGING_FRONTEND_URL || ""].filter(Boolean);
  } else if (nodeEnv === "production" || nodeEnv === "prod") {
    allowedOrigins = [process.env.FRONTEND_URL || ""].filter(Boolean);
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
  await app.startAllMicroservices();
  await app.listen(port, "0.0.0.0");
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log("Kafka microservice connected");
}

bootstrap();
