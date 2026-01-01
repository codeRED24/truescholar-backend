import { MigrationInterface, QueryRunner } from "typeorm";

export class Posts1767268387351 implements MigrationInterface {
    name = 'Posts1767268387351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."post_authortype_enum" AS ENUM('user', 'college')`);
        await queryRunner.query(`ALTER TABLE "post" ADD "authorType" "public"."post_authortype_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`CREATE TYPE "public"."post_type_enum" AS ENUM('general', 'announcement', 'event', 'achievement', 'news')`);
        await queryRunner.query(`ALTER TABLE "post" ADD "type" "public"."post_type_enum" NOT NULL DEFAULT 'general'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "taggedCollegeId" integer`);
        await queryRunner.query(`ALTER TYPE "public"."post_visibility_enum" RENAME TO "post_visibility_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."post_visibility_enum" AS ENUM('public', 'connections', 'private', 'college')`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibility" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibility" TYPE "public"."post_visibility_enum" USING "visibility"::"text"::"public"."post_visibility_enum"`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibility" SET DEFAULT 'public'`);
        await queryRunner.query(`DROP TYPE "public"."post_visibility_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_3f32a973819b1aa4a4e5d4d982" ON "post" ("taggedCollegeId") `);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_3f32a973819b1aa4a4e5d4d9829" FOREIGN KEY ("taggedCollegeId") REFERENCES "college_info"("college_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_3f32a973819b1aa4a4e5d4d9829"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3f32a973819b1aa4a4e5d4d982"`);
        await queryRunner.query(`CREATE TYPE "public"."post_visibility_enum_old" AS ENUM('public', 'connections', 'private')`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibility" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibility" TYPE "public"."post_visibility_enum_old" USING "visibility"::"text"::"public"."post_visibility_enum_old"`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "visibility" SET DEFAULT 'public'`);
        await queryRunner.query(`DROP TYPE "public"."post_visibility_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."post_visibility_enum_old" RENAME TO "post_visibility_enum"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "taggedCollegeId"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."post_type_enum"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "authorType"`);
        await queryRunner.query(`DROP TYPE "public"."post_authortype_enum"`);
    }

}
