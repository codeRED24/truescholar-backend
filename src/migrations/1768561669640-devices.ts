import { MigrationInterface, QueryRunner } from "typeorm";

export class Devices1768561669640 implements MigrationInterface {
  name = "Devices1768561669640";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_device" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" text NOT NULL, "token" text NOT NULL, "deviceType" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f3688bf7f92e04124fa06e3c180" UNIQUE ("token"), CONSTRAINT "PK_0232591a0b48e1eb92f3ec5d0d1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bda1afb30d9e3e8fb30b1e90af" ON "user_device" ("userId") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_device" ADD CONSTRAINT "FK_bda1afb30d9e3e8fb30b1e90af7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_device" DROP CONSTRAINT "FK_bda1afb30d9e3e8fb30b1e90af7"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bda1afb30d9e3e8fb30b1e90af"`
    );
    await queryRunner.query(`DROP TABLE "user_device"`);
  }
}
