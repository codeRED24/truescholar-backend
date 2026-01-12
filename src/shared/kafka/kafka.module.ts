import { Module, Global } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

export const KAFKA_SERVICE = "KAFKA_SERVICE";

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: process.env.KAFKA_CLIENT_ID || "truescholar-backend",
            brokers: (process.env.KAFKA_BROKERS || "localhost:19092").split(
              ","
            ),
          },
          consumer: {
            groupId: process.env.KAFKA_CONSUMER_GROUP || "truescholar-events",
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
