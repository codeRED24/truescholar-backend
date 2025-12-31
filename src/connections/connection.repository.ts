import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Connection, ConnectionStatus } from "./connection.entity";

@Injectable()
export class ConnectionRepository {
  constructor(
    @InjectRepository(Connection)
    private readonly repo: Repository<Connection>
  ) {}

  async create(requesterId: string, addresseeId: string): Promise<Connection> {
    const connection = this.repo.create({
      requesterId,
      addresseeId,
      status: ConnectionStatus.PENDING,
    });
    return this.repo.save(connection);
  }

  async findById(id: string): Promise<Connection | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<Connection | null> {
    return this.repo.findOne({
      where: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
    });
  }

  async updateStatus(
    id: string,
    status: ConnectionStatus
  ): Promise<Connection | null> {
    const connection = await this.findById(id);
    if (!connection) return null;
    connection.status = status;
    return this.repo.save(connection);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getConnections(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const connections = await this.repo
      .createQueryBuilder("connection")
      .leftJoinAndSelect("connection.requester", "requester")
      .leftJoinAndSelect("connection.addressee", "addressee")
      .where("connection.status = :status", {
        status: ConnectionStatus.ACCEPTED,
      })
      .andWhere(
        "(connection.requesterId = :userId OR connection.addresseeId = :userId)",
        { userId }
      )
      .orderBy("connection.updatedAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return connections.map((conn) => ({
      ...conn,
      otherUser:
        conn.requesterId === userId
          ? {
              id: conn.addressee.id,
              name: conn.addressee.name,
              image: conn.addressee.image,
              user_type: conn.addressee.user_type,
            }
          : {
              id: conn.requester.id,
              name: conn.requester.name,
              image: conn.requester.image,
              user_type: conn.requester.user_type,
            },
    }));
  }

  async getPendingRequests(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const connections = await this.repo
      .createQueryBuilder("connection")
      .leftJoinAndSelect("connection.requester", "requester")
      .where("connection.addresseeId = :userId", { userId })
      .andWhere("connection.status = :status", {
        status: ConnectionStatus.PENDING,
      })
      .orderBy("connection.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return connections.map((conn) => ({
      ...conn,
      otherUser: {
        id: conn.requester.id,
        name: conn.requester.name,
        image: conn.requester.image,
        user_type: conn.requester.user_type,
      },
    }));
  }

  async getSentRequests(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const connections = await this.repo
      .createQueryBuilder("connection")
      .leftJoinAndSelect("connection.addressee", "addressee")
      .where("connection.requesterId = :userId", { userId })
      .andWhere("connection.status = :status", {
        status: ConnectionStatus.PENDING,
      })
      .orderBy("connection.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return connections.map((conn) => ({
      ...conn,
      otherUser: {
        id: conn.addressee.id,
        name: conn.addressee.name,
        image: conn.addressee.image,
        user_type: conn.addressee.user_type,
      },
    }));
  }

  async getConnectionUserIds(userId: string): Promise<string[]> {
    const connections = await this.repo.find({
      where: [
        { requesterId: userId, status: ConnectionStatus.ACCEPTED },
        { addresseeId: userId, status: ConnectionStatus.ACCEPTED },
      ],
      select: ["requesterId", "addresseeId"],
    });
    return connections.map((conn) =>
      conn.requesterId === userId ? conn.addresseeId : conn.requesterId
    );
  }

  async countConnections(userId: string): Promise<number> {
    return this.repo.count({
      where: [
        { requesterId: userId, status: ConnectionStatus.ACCEPTED },
        { addresseeId: userId, status: ConnectionStatus.ACCEPTED },
      ],
    });
  }

  async areConnected(userId1: string, userId2: string): Promise<boolean> {
    const connection = await this.findBetweenUsers(userId1, userId2);
    return connection?.status === ConnectionStatus.ACCEPTED;
  }
}
