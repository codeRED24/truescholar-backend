import { MigrationInterface, QueryRunner } from "typeorm";

export class UserDetails1766562403888 implements MigrationInterface {
  name = "UserDetails1766562403888";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "college_id" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "user_type" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "gender" text`);
    await queryRunner.query(`ALTER TABLE "user" ADD "dob" date`);
    await queryRunner.query(`ALTER TABLE "user" ADD "country_origin" text`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "college_roll_number" text`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "custom_code" text`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_7feb9d0b2f9a4726ae27c77036f" UNIQUE ("custom_code")`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "referred_by" text`);
    await queryRunner.query(
      `CREATE INDEX "IDX_df6b6b8d9c1ad2e1ac22705790" ON "user" ("college_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7feb9d0b2f9a4726ae27c77036" ON "user" ("custom_code") `
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_df6b6b8d9c1ad2e1ac22705790d" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_df6b6b8d9c1ad2e1ac22705790d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7feb9d0b2f9a4726ae27c77036"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df6b6b8d9c1ad2e1ac22705790"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "referred_by"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_7feb9d0b2f9a4726ae27c77036f"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "custom_code"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "college_roll_number"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "country_origin"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "dob"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gender"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_type"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "college_id"`);
  }
}
