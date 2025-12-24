import { MigrationInterface, QueryRunner } from "typeorm";

export class DropAuthAndRelatedTables1734878976000 implements MigrationInterface {
  name = "DropAuthAndRelatedTables1734878976000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop tables that have foreign key dependencies on 'user'
    // Using CASCADE to handle any remaining constraints

    // Drop session table (depends on user)
    await queryRunner.query(`DROP TABLE IF EXISTS "session" CASCADE`);

    // Drop verification table (depends on user)
    await queryRunner.query(`DROP TABLE IF EXISTS "verification" CASCADE`);

    // Drop reviews table
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews" CASCADE`);

    // Drop reels table
    await queryRunner.query(`DROP TABLE IF EXISTS "reels" CASCADE`);

    // Drop otp_request table
    await queryRunner.query(`DROP TABLE IF EXISTS "otp_request" CASCADE`);

    // Finally, drop user table (after dependent tables are dropped)
    await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
