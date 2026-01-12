import { Global, Module } from "@nestjs/common";

/**
 * Shared Kernel Module
 *
 * This module provides core shared services to all modules in the application.
 * It is marked as @Global so that other modules don't need to import it explicitly.
 *
 */
@Global()
@Module({
  providers: [],
  exports: [],
})
export class SharedModule {}
