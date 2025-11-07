import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Response, Request } from "express";
import { SessionsService } from "../sessions/sessions.service";
import { generateTokens, setCookies } from "../../utils/auth-helpers";
import { UserService } from "../users/users.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { encryptData, decryptData } from "../../utils/encryption";
import { RegisterUserDto } from "../users/dto/create-users.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signUp(createUserDto: RegisterUserDto, res: Response, req: Request) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Generate a reasonably unique custom_code for referrals.
    // Format: first 4 non-space chars of name (uppercased) + 4-char random alphanumeric suffix.
    const generateCandidateCode = (name: string) => {
      const base = (name || "user")
        .replace(/\s+/g, "")
        .substring(0, 4)
        .toUpperCase();
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${base}${suffix}`;
    };

    let custom_code = generateCandidateCode(createUserDto.name);
    let attempts = 0;
    // Check uniqueness up to a few attempts
    while (attempts < 5) {
      const existing = await this.usersService.findByCustomCode(custom_code);
      if (!existing) break;
      custom_code = generateCandidateCode(createUserDto.name);
      attempts++;
    }
    // Final fallback: append a small timestamp fragment if still colliding
    if (await this.usersService.findByCustomCode(custom_code)) {
      custom_code = `${custom_code}${Date.now().toString().slice(-4)}`;
    }

    // If the incoming DTO contains a referral code, resolve it to a referrer id.
    let referrer_id: number | undefined = undefined;
    if (createUserDto.referred_by) {
      const referrer = await this.usersService.findByCustomCode(
        createUserDto.referred_by
      );
      if (referrer) {
        referrer_id = referrer.id;
      }
    }

    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
      custom_code,
      referrer_id,
    } as any);

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const decodedRefreshToken = this.jwtService.decode(refreshToken) as {
      exp: number;
    };
    const expiresAt = new Date(decodedRefreshToken.exp * 1000);

    const encryptedRefreshToken = encryptData(refreshToken);

    await this.sessionsService.createSession(
      user,
      encryptedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt
    );

    setCookies(res, accessToken, encryptedRefreshToken);

    return { accessToken, refreshToken };
  }

  async login(loginUserDto: LoginUserDto, res: Response, req: Request) {
    const { email, password } = loginUserDto;

    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Authentication failed");
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException("Authentication failed");
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    const decodedRefreshToken = this.jwtService.decode(refreshToken) as {
      exp: number;
    };
    const expiresAt = new Date(decodedRefreshToken.exp * 1000);

    const encryptedRefreshToken = encryptData(refreshToken);

    await this.sessionsService.createSession(
      user,
      encryptedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt
    );

    setCookies(res, accessToken, encryptedRefreshToken);

    return;
  }

  async logout(res: Response, req: Request) {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await this.sessionsService.deleteSession(refreshToken);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }

  async getAuthenticatedUser(userId: number) {
    return this.usersService.findUserById(userId);
  }

  async refreshTokens(refreshToken: string, req: Request) {
    try {
      const decryptedRefreshToken = decryptData(refreshToken);
      const decodedRefreshToken: any = this.jwtService.decode(
        decryptedRefreshToken
      );

      // Check if the refresh token is valid (not expired) and not revoked
      const session =
        await this.sessionsService.findSessionByRefreshToken(refreshToken);

      if (!session) {
        throw new UnauthorizedException("Invalid or expired refresh token");
      }

      // Token reuse detection: If the session is found but marked as revoked, it's a replay attack
      if (session.revoked) {
        // Revoke all sessions for this user to prevent further attacks
        await this.sessionsService.revokeAllUserSessions(session.user.id);
        throw new UnauthorizedException(
          "Refresh token reused. All sessions revoked."
        );
      }

      const userEntity = await this.usersService.findUserById(
        decodedRefreshToken.userId
      );
      if (!userEntity) {
        throw new UnauthorizedException("User not found");
      }

      // Immediately revoke the old refresh token to ensure single-use
      await this.sessionsService.revokeSession(refreshToken);

      // Generate new tokens
      const { accessToken, refreshToken: newRawRefreshToken } = generateTokens(
        userEntity.id,
        userEntity.email
      );
      const newEncryptedRefreshToken = encryptData(newRawRefreshToken);

      const newDecodedRefreshToken = this.jwtService.decode(
        newRawRefreshToken
      ) as {
        exp: number;
      };
      const newExpiresAt = new Date(newDecodedRefreshToken.exp * 1000);

      // Create a new session entry for the new refresh token
      const ipAddress = req.ip;
      const userAgent = req.headers["user-agent"];

      await this.sessionsService.createSession(
        userEntity,
        newEncryptedRefreshToken,
        userAgent,
        ipAddress,
        newExpiresAt
      );

      return {
        accessToken,
        refreshToken: newEncryptedRefreshToken,
      };
    } catch (error) {
      console.log({ error });

      throw new UnauthorizedException("Failed to refresh token");
    }
  }
}
