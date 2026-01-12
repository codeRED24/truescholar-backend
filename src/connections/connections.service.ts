import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  OnModuleInit,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { Connection, ConnectionStatus } from "./connection.entity";
import { ConnectionRepository } from "./connection.repository";
import { randomUUID } from "crypto";

@Injectable()
export class ConnectionsService implements OnModuleInit {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async sendRequest(
    requesterId: string,
    addresseeId: string
  ): Promise<Connection> {
    if (requesterId === addresseeId)
      throw new BadRequestException("Cannot connect to yourself");

    const existing = await this.connectionRepository.findBetweenUsers(
      requesterId,
      addresseeId
    );
    if (existing) {
      if (existing.status === ConnectionStatus.ACCEPTED)
        throw new ConflictException("Already connected");
      if (existing.status === ConnectionStatus.PENDING)
        throw new ConflictException("Connection request already pending");
      await this.connectionRepository.delete(existing.id);
    }

    const connection = await this.connectionRepository.create(
      requesterId,
      addresseeId
    );

    this.kafkaClient.emit("connections.requested", {
      eventId: randomUUID(),
      eventType: "connections.requested",
      aggregateId: connection.id,
      occurredAt: new Date().toISOString(),
      payload: {
        connectionId: connection.id,
        requesterId,
        addresseeId,
      },
    });

    return connection;
  }

  async acceptRequest(
    connectionId: string,
    userId: string
  ): Promise<Connection> {
    const connection = await this.connectionRepository.findById(connectionId);
    if (!connection)
      throw new NotFoundException("Connection request not found");
    if (connection.addresseeId !== userId)
      throw new BadRequestException("You cannot accept this request");
    if (connection.status !== ConnectionStatus.PENDING)
      throw new BadRequestException("Connection request is not pending");

    const updated = await this.connectionRepository.updateStatus(
      connectionId,
      ConnectionStatus.ACCEPTED
    );

    this.kafkaClient.emit("connections.accepted", {
      eventId: randomUUID(),
      eventType: "connections.accepted",
      aggregateId: connectionId,
      occurredAt: new Date().toISOString(),
      payload: {
        connectionId,
        requesterId: connection.requesterId,
        addresseeId: connection.addresseeId,
      },
    });

    return updated!;
  }

  async rejectRequest(connectionId: string, userId: string): Promise<void> {
    const connection = await this.connectionRepository.findById(connectionId);
    if (!connection)
      throw new NotFoundException("Connection request not found");
    if (connection.addresseeId !== userId)
      throw new BadRequestException("You cannot reject this request");
    if (connection.status !== ConnectionStatus.PENDING)
      throw new BadRequestException("Connection request is not pending");

    await this.connectionRepository.updateStatus(
      connectionId,
      ConnectionStatus.REJECTED
    );

    this.kafkaClient.emit("connections.rejected", {
      eventId: randomUUID(),
      eventType: "connections.rejected",
      aggregateId: connectionId,
      occurredAt: new Date().toISOString(),
      payload: {
        connectionId,
        requesterId: connection.requesterId,
        addresseeId: connection.addresseeId,
      },
    });
  }

  async cancelRequest(connectionId: string, userId: string): Promise<void> {
    const connection = await this.connectionRepository.findById(connectionId);
    if (!connection)
      throw new NotFoundException("Connection request not found");
    if (connection.requesterId !== userId)
      throw new BadRequestException("You cannot cancel this request");
    if (connection.status !== ConnectionStatus.PENDING)
      throw new BadRequestException("Connection request is not pending");
    await this.connectionRepository.delete(connectionId);
  }

  async removeConnection(connectionId: string, userId: string): Promise<void> {
    const connection = await this.connectionRepository.findById(connectionId);
    if (!connection) throw new NotFoundException("Connection not found");
    if (connection.requesterId !== userId && connection.addresseeId !== userId)
      throw new BadRequestException("You are not part of this connection");
    if (connection.status !== ConnectionStatus.ACCEPTED)
      throw new BadRequestException("Connection is not active");

    await this.connectionRepository.delete(connectionId);

    this.kafkaClient.emit("connections.removed", {
      eventId: randomUUID(),
      eventType: "connections.removed",
      aggregateId: connectionId,
      occurredAt: new Date().toISOString(),
      payload: {
        connectionId,
        userId1: connection.requesterId,
        userId2: connection.addresseeId,
      },
    });
  }

  async getConnections(userId: string, page: number, limit: number) {
    return this.connectionRepository.getConnections(userId, page, limit);
  }

  async getPendingRequests(userId: string, page: number, limit: number) {
    return this.connectionRepository.getPendingRequests(userId, page, limit);
  }

  async getSentRequests(userId: string, page: number, limit: number) {
    return this.connectionRepository.getSentRequests(userId, page, limit);
  }

  async getConnectionCount(userId: string): Promise<number> {
    return this.connectionRepository.countConnections(userId);
  }

  async getConnectionUserIds(userId: string): Promise<string[]> {
    return this.connectionRepository.getConnectionUserIds(userId);
  }

  async areConnected(userId1: string, userId2: string): Promise<boolean> {
    return this.connectionRepository.areConnected(userId1, userId2);
  }

  async getConnectionStatus(userId: string, otherUserId: string) {
    const connection = await this.connectionRepository.findBetweenUsers(
      userId,
      otherUserId
    );
    if (!connection) return { status: "none" as const };
    if (connection.status === ConnectionStatus.ACCEPTED)
      return { status: "connected" as const, connectionId: connection.id };
    if (connection.status === ConnectionStatus.PENDING) {
      return connection.requesterId === userId
        ? { status: "pending_sent" as const, connectionId: connection.id }
        : { status: "pending_received" as const, connectionId: connection.id };
    }
    return { status: "none" as const };
  }
}
