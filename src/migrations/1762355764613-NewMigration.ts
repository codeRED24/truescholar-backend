import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1762355764613 implements MigrationInterface {
  name = "NewMigration1762355764613";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "session" ("id" SERIAL NOT NULL, "refreshToken" character varying NOT NULL, "userAgent" character varying, "ipAddress" character varying, "expiresAt" TIMESTAMP NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "userId" integer, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."verification_type_enum" AS ENUM('email', 'phone')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."verification_status_enum" AS ENUM('pending', 'verified', 'expired', 'failed')`
    );
    await queryRunner.query(
      `CREATE TABLE "verification" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."verification_type_enum" NOT NULL, "identifier" character varying NOT NULL, "otp" character varying NOT NULL, "status" "public"."verification_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP NOT NULL, "verified_at" TIMESTAMP, "attempts" integer NOT NULL DEFAULT '0', "user_id" integer NOT NULL, CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_email_verified" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_phone_verified" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email_verified_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "phone_verified_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification" ADD CONSTRAINT "FK_49cf5e171603b309b4194850461" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "verification" DROP CONSTRAINT "FK_49cf5e171603b309b4194850461"`
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "phone_verified_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "email_verified_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "is_phone_verified"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "is_email_verified"`
    );
    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(`DROP TYPE "public"."verification_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."verification_type_enum"`);
    await queryRunner.query(`DROP TABLE "session"`);
  }
}
