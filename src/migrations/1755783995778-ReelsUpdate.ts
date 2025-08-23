import { MigrationInterface, QueryRunner } from "typeorm";

export class ReelsUpdate1755783995778 implements MigrationInterface {
  name = "ReelsUpdate1755783995778";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reels" ALTER COLUMN "type" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "reels" ALTER COLUMN "user_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "reels" ALTER COLUMN "college_id" DROP NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "reels" ADD CONSTRAINT "FK_1793c12dac83d91ec123d6d2219" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reels" ADD CONSTRAINT "FK_71c661a13ad40d0e4d1c18518df" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reels" DROP CONSTRAINT "FK_71c661a13ad40d0e4d1c18518df"`
    );
    await queryRunner.query(
      `ALTER TABLE "reels" DROP CONSTRAINT "FK_1793c12dac83d91ec123d6d2219"`
    );

    await queryRunner.query(
      `ALTER TABLE "reels" ALTER COLUMN "college_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "reels" ALTER COLUMN "user_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "reels" ALTER COLUMN "type" SET NOT NULL`
    );
  }
}
