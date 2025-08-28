import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdate1756362121830 implements MigrationInterface {
  name = "UserUpdate1756362121830";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "password" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
  }
}
