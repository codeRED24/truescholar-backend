import { MigrationInterface, QueryRunner } from "typeorm";

export class FollowCollege1769234056993 implements MigrationInterface {
    name = 'FollowCollege1769234056993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "CHK_b4464e5cb2573d44cfc725ffe4"`);
        await queryRunner.query(`ALTER TABLE "follow_college" DROP CONSTRAINT "UQ_4fc26ac53d0fb69b2ff5d674f8c"`);
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "UQ_2952595a5bec0052c5da0751cca"`);
        await queryRunner.query(`CREATE TYPE "public"."follow_college_authortype_enum" AS ENUM('user', 'college')`);
        await queryRunner.query(`ALTER TABLE "follow_college" ADD "authorType" "public"."follow_college_authortype_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "follow_college" ADD "followerCollegeId" integer`);
        await queryRunner.query(`CREATE TYPE "public"."follow_authortype_enum" AS ENUM('user', 'college')`);
        await queryRunner.query(`ALTER TABLE "follow" ADD "authorType" "public"."follow_authortype_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "follow" ADD "followerCollegeId" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_2b24d9da508315bb08bf7abfc9" ON "follow_college" ("followerCollegeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6133023b6058d1f6a90e3d9397" ON "follow" ("followerCollegeId") `);
        await queryRunner.query(`ALTER TABLE "follow_college" ADD CONSTRAINT "FK_2b24d9da508315bb08bf7abfc9f" FOREIGN KEY ("followerCollegeId") REFERENCES "college_info"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "FK_6133023b6058d1f6a90e3d93979" FOREIGN KEY ("followerCollegeId") REFERENCES "college_info"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "FK_6133023b6058d1f6a90e3d93979"`);
        await queryRunner.query(`ALTER TABLE "follow_college" DROP CONSTRAINT "FK_2b24d9da508315bb08bf7abfc9f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6133023b6058d1f6a90e3d9397"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b24d9da508315bb08bf7abfc9"`);
        await queryRunner.query(`ALTER TABLE "follow" DROP COLUMN "followerCollegeId"`);
        await queryRunner.query(`ALTER TABLE "follow" DROP COLUMN "authorType"`);
        await queryRunner.query(`DROP TYPE "public"."follow_authortype_enum"`);
        await queryRunner.query(`ALTER TABLE "follow_college" DROP COLUMN "followerCollegeId"`);
        await queryRunner.query(`ALTER TABLE "follow_college" DROP COLUMN "authorType"`);
        await queryRunner.query(`DROP TYPE "public"."follow_college_authortype_enum"`);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "UQ_2952595a5bec0052c5da0751cca" UNIQUE ("followerId", "followingId")`);
        await queryRunner.query(`ALTER TABLE "follow_college" ADD CONSTRAINT "UQ_4fc26ac53d0fb69b2ff5d674f8c" UNIQUE ("followerId", "collegeId")`);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "CHK_b4464e5cb2573d44cfc725ffe4" CHECK (("followerId" <> "followingId"))`);
    }

}
