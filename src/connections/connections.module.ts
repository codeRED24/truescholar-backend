import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "./connection.entity";
import { ConnectionRepository } from "./connection.repository";
import { ConnectionsService } from "./connections.service";
import { ConnectionsController } from "./connections.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Connection])],
  controllers: [ConnectionsController],
  providers: [ConnectionRepository, ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
