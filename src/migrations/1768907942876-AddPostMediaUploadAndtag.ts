import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostMediaUploadAndtag1768907942876 implements MigrationInterface {
  name = "AddPostMediaUploadAndtag1768907942876";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "post_media_upload" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "url" text NOT NULL, "type" "public"."post_media_upload_type_enum" NOT NULL DEFAULT 'image', "uploaderId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_77b5ac0fae0dacd2bb0a3f3bee7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00ce5fc5d1de17d659a791e5bb" ON "post_media_upload" ("uploaderId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."entity_handle_entitytype_enum" AS ENUM('user', 'college', 'company')`,
    );
    await queryRunner.query(
      `CREATE TABLE "entity_handle" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "handle" text NOT NULL, "entityType" "public"."entity_handle_entitytype_enum" NOT NULL, "entityId" text NOT NULL, "displayName" text, "image" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_23f958d8d18303603917ff94bbc" UNIQUE ("handle"), CONSTRAINT "PK_e0915cef271c56a93d638c1c86e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_23f958d8d18303603917ff94bb" ON "entity_handle" ("handle") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_601c66fb2c835c4deeee6d4d5f" ON "entity_handle" ("entityType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf891d88c13e4c3797ab204fce" ON "entity_handle" ("entityId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text NOT NULL, "website" text, "description" text, "logo" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "company"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cf891d88c13e4c3797ab204fce"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_601c66fb2c835c4deeee6d4d5f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_23f958d8d18303603917ff94bb"`,
    );
    await queryRunner.query(`DROP TABLE "entity_handle"`);
    await queryRunner.query(
      `DROP TYPE "public"."entity_handle_entitytype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00ce5fc5d1de17d659a791e5bb"`,
    );
    await queryRunner.query(`DROP TABLE "post_media_upload"`);
  }
}
