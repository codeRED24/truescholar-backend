import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { VerificationService } from "./verification.service";
import { VerificationController } from "./verification.controller";
import { Verification } from "./verification.entity";
import { User } from "../users/users.entity";
import { SessionsModule } from "../sessions/sessions.module";
import { UserModule } from "../users/users.module";
import { RefreshAuthGuard } from "../auth/refresh-auth.guard";

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification, User]),
    SessionsModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [VerificationController],
  providers: [VerificationService, RefreshAuthGuard],
  exports: [VerificationService, TypeOrmModule],
})
export class VerificationModule {}
