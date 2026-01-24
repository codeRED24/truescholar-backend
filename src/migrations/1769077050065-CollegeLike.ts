import { MigrationInterface, QueryRunner } from "typeorm";

export class CollegeLike1769077050065 implements MigrationInterface {
    name = 'CollegeLike1769077050065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "UQ_3a063d4952039809428988bb852"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "UQ_78a9f4a1b09b6d2bf7ed85f252f"`);
        await queryRunner.query(`CREATE TYPE "public"."like_authortype_enum" AS ENUM('user', 'college')`);
        await queryRunner.query(`ALTER TABLE "like" ADD "authorType" "public"."like_authortype_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "like" ADD "collegeId" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_f5a8096bb63bb3f2b8912e9765" ON "like" ("collegeId") `);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_f5a8096bb63bb3f2b8912e9765d" FOREIGN KEY ("collegeId") REFERENCES "college_info"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_f5a8096bb63bb3f2b8912e9765d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f5a8096bb63bb3f2b8912e9765"`);
        await queryRunner.query(`ALTER TABLE "like" DROP COLUMN "collegeId"`);
        await queryRunner.query(`ALTER TABLE "like" DROP COLUMN "authorType"`);
        await queryRunner.query(`DROP TYPE "public"."like_authortype_enum"`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "UQ_78a9f4a1b09b6d2bf7ed85f252f" UNIQUE ("userId", "postId")`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "UQ_3a063d4952039809428988bb852" UNIQUE ("userId", "commentId")`);
    }

}
