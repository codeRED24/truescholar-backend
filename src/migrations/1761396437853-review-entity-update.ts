import { MigrationInterface, QueryRunner } from "typeorm";

export class ReviewEntityUpdate1761396437853 implements MigrationInterface {
  name = "ReviewEntityUpdate1761396437853";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reviews" ADD "is_anonymous" boolean`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "stream" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "year_of_study" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "mode_of_study" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "current_semester" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "current_semester"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "mode_of_study"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "year_of_study"`
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "stream"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "is_anonymous"`);
  }
}
