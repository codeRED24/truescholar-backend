import { MigrationInterface, QueryRunner } from "typeorm";

export class CollegeComment1769073578466 implements MigrationInterface {
    name = 'CollegeComment1769073578466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."comment_authortype_enum" AS ENUM('user', 'college')`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "authorType" "public"."comment_authortype_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "collegeId" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_fb91bea2d37140a877b775e6b2" ON "post" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc652dfc65b42ada6e3f086ad4" ON "comment" ("collegeId") `);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_bc652dfc65b42ada6e3f086ad49" FOREIGN KEY ("collegeId") REFERENCES "college_info"("college_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_bc652dfc65b42ada6e3f086ad49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc652dfc65b42ada6e3f086ad4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb91bea2d37140a877b775e6b2"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "collegeId"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "authorType"`);
        await queryRunner.query(`DROP TYPE "public"."comment_authortype_enum"`);
    }

}
