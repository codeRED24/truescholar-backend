import { MigrationInterface, QueryRunner } from "typeorm";

export class Reels1755760612293 implements MigrationInterface {
  name = "Reels1755760612293";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reels" ("id" SERIAL NOT NULL, "reel_url" text NOT NULL, "user_id" integer NOT NULL, "college_id" integer NOT NULL, "type" character varying(50) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e5ecdc818bad986f1eb0a5d7a2d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1793c12dac83d91ec123d6d221" ON "reels" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71c661a13ad40d0e4d1c18518d" ON "reels" ("college_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_71c661a13ad40d0e4d1c18518d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1793c12dac83d91ec123d6d221"`
    );
    await queryRunner.query(`DROP TABLE "reels"`);
  }
}
