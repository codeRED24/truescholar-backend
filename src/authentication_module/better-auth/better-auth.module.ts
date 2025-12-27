import { Module } from "@nestjs/common";
import { BetterAuthController } from "./controllers/better-auth.controller";
import { AuthGuard } from "./guards/auth.guard";

@Module({
  controllers: [BetterAuthController],
  providers: [AuthGuard], // Register as a provider so it can be injected, but NOT as global APP_GUARD
  exports: [AuthGuard], // Export so other modules can use it
})
export class BetterAuthModule {}
