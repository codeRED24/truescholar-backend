import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, LessThanOrEqual } from "typeorm";
import { Session } from "./sessions.entity";
import { User } from "../users/users.entity";

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>
  ) {}

  async createSession(
    user: User,
    refreshToken: string,
    userAgent: string,
    ipAddress: string,
    expiresAt: Date
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      user,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
      revoked: false, // New session is not revoked
    });

    return this.sessionRepository.save(session);
  }

  async findSessionByRefreshToken(
    refreshToken: string
  ): Promise<Session | undefined> {
    return this.sessionRepository.findOne({
      where: { refreshToken, expiresAt: MoreThan(new Date()), revoked: false },
    });
  }

  async updateSession(
    oldRefreshToken: string,
    newRefreshToken: string,
    newExpiresAt: Date
  ): Promise<void> {
    await this.sessionRepository.update(
      { refreshToken: oldRefreshToken },
      { refreshToken: newRefreshToken, expiresAt: newExpiresAt, revoked: false }
    );
  }

  async deleteSession(refreshToken: string): Promise<void> {
    await this.sessionRepository.delete({ refreshToken });
  }

  async revokeSession(refreshToken: string): Promise<void> {
    await this.sessionRepository.update(
      { refreshToken: refreshToken },
      { revoked: true }
    );
  }

  async revokeAllUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.update(
      { user: { id: userId } },
      { revoked: true }
    );
  }

  async deleteExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository.delete({
      expiresAt: LessThanOrEqual(new Date()),
    });
    return result.affected || 0;
  }
}
