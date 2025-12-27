import { MigrationInterface, QueryRunner } from "typeorm";

export class BetterAuthTables1766560231000 implements MigrationInterface {
  name = "BetterAuthTables1766560231000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user table
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" text NOT NULL PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean NOT NULL,
        "image" text,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "phoneNumber" text UNIQUE,
        "phoneNumberVerified" boolean,
        "role" text,
        "banned" boolean,
        "banReason" text,
        "banExpires" timestamptz
      )
    `);

    // Create session table
    await queryRunner.query(`
      CREATE TABLE "session" (
        "id" text NOT NULL PRIMARY KEY,
        "expiresAt" timestamptz NOT NULL,
        "token" text NOT NULL UNIQUE,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamptz NOT NULL,
        "ipAddress" text,
        "userAgent" text,
        "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
        "activeOrganizationId" text,
        "impersonatedBy" text
      )
    `);

    // Create account table
    await queryRunner.query(`
      CREATE TABLE "account" (
        "id" text NOT NULL PRIMARY KEY,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" timestamptz,
        "refreshTokenExpiresAt" timestamptz,
        "scope" text,
        "password" text,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamptz NOT NULL
      )
    `);

    // Create verification table
    await queryRunner.query(`
      CREATE TABLE "verification" (
        "id" text NOT NULL PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Create organization table
    await queryRunner.query(`
      CREATE TABLE "organization" (
        "id" text NOT NULL PRIMARY KEY,
        "name" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "logo" text,
        "createdAt" timestamptz NOT NULL,
        "metadata" text
      )
    `);

    // Create member table
    await queryRunner.query(`
      CREATE TABLE "member" (
        "id" text NOT NULL PRIMARY KEY,
        "organizationId" text NOT NULL REFERENCES "organization" ("id") ON DELETE CASCADE,
        "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
        "role" text NOT NULL,
        "createdAt" timestamptz NOT NULL
      )
    `);

    // Create invitation table
    await queryRunner.query(`
      CREATE TABLE "invitation" (
        "id" text NOT NULL PRIMARY KEY,
        "organizationId" text NOT NULL REFERENCES "organization" ("id") ON DELETE CASCADE,
        "email" text NOT NULL,
        "role" text,
        "status" text NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "inviterId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "session_userId_idx" ON "session" ("userId")`
    );
    await queryRunner.query(
      `CREATE INDEX "account_userId_idx" ON "account" ("userId")`
    );
    await queryRunner.query(
      `CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier")`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" ("slug")`
    );
    await queryRunner.query(
      `CREATE INDEX "member_organizationId_idx" ON "member" ("organizationId")`
    );
    await queryRunner.query(
      `CREATE INDEX "member_userId_idx" ON "member" ("userId")`
    );
    await queryRunner.query(
      `CREATE INDEX "invitation_organizationId_idx" ON "invitation" ("organizationId")`
    );
    await queryRunner.query(
      `CREATE INDEX "invitation_email_idx" ON "invitation" ("email")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`DROP INDEX IF EXISTS "invitation_email_idx"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "invitation_organizationId_idx"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "member_userId_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "member_organizationId_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "organization_slug_uidx"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "verification_identifier_idx"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "account_userId_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "session_userId_idx"`);

    // Drop tables in reverse order of creation (respecting foreign key dependencies)
    await queryRunner.query(`DROP TABLE IF EXISTS "invitation" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "member" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organization" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "verification" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "account" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "session" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
  }
}
