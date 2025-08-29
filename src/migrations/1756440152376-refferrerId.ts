import { MigrationInterface, QueryRunner } from "typeorm";

export class RefferrerId1756440152376 implements MigrationInterface {
  name = "RefferrerId1756440152376";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "referrer_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_1c1cdd6ef02ae157f3ee8f0e5aa" FOREIGN KEY ("referrer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_1c1cdd6ef02ae157f3ee8f0e5aa"`
    );

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "referrer_id"`);
  }
}
