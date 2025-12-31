import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { Connection, ConnectionStatus } from "./connection.entity";
import { ConnectionRepository } from "./connection.repository";
import { DomainEvent } from "../shared/events/domain-event";

// Events
export class ConnectionRequestedEvent extends DomainEvent {
  readonly eventType = "connections.requested";
  constructor(
    public readonly connectionId: string,
    public readonly requesterId: string,
    public readonly addresseeId: string
  ) {
    super(connectionId);
  }
  protected getPayload() {
    return {
      connectionId: this.connectionId,
      requesterId: this.requesterId,
      addresseeId: this.addresseeId,
    };
  }
}

export class ConnectionAcceptedEvent extends DomainEvent {
  readonly eventType = "connections.accepted";
  constructor(
    public readonly connectionId: string,
    public readonly requesterId: string,
    public readonly addresseeId: string
  ) {
    super(connectionId);
  }
  protected getPayload() {
    return {
      connectionId: this.connectionId,
      requesterId: this.requesterId,
      addresseeId: this.addresseeId,
    };
  }
}

export class ConnectionRejectedEvent extends DomainEvent {
  readonly eventType = "connections.rejected";
  constructor(
    public readonly connectionId: string,
    public readonly requesterId: string,
    public readonly addresseeId: string
  ) {
    super(connectionId);
  }
  protected getPayload() {
    return {
      connectionId: this.connectionId,
      requesterId: this.requesterId,
      addresseeId: this.addresseeId,
    };
  }
}

export class ConnectionRemovedEvent extends DomainEvent {
  readonly eventType = "connections.removed";
  constructor(
    public readonly connectionId: string,
    public readonly userId1: string,
    public readonly userId2: string
  ) {
    super(connectionId);
  }
  protected getPayload() {
    return {
      connectionId: this.connectionId,
      userId1: this.userId1,
      userId2: this.userId2,
    };
  }
}

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

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
    await this.eventBus.publish(
      new ConnectionRequestedEvent(connection.id, requesterId, addresseeId)
    );
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
    await this.eventBus.publish(
      new ConnectionAcceptedEvent(
        connectionId,
        connection.requesterId,
        connection.addresseeId
      )
    );
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
    await this.eventBus.publish(
      new ConnectionRejectedEvent(
        connectionId,
        connection.requesterId,
        connection.addresseeId
      )
    );
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
    await this.eventBus.publish(
      new ConnectionRemovedEvent(
        connectionId,
        connection.requesterId,
        connection.addresseeId
      )
    );
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
