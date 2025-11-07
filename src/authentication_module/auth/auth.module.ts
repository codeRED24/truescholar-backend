import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { SessionsModule } from "../sessions/sessions.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { RefreshAuthGuard } from "./refresh-auth.guard";
import { OwnerGuard } from "../../common/guards/owner.guard";

@Module({
  imports: [
    UserModule,
    SessionsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" }, // Changed from 60s to 1h
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // milliseconds
        limit: 5, // 5 attempts per minute per IP for auth endpoints
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshAuthGuard, OwnerGuard],
})
export class AuthModule {}
