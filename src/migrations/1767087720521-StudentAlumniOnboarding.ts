import { MigrationInterface, QueryRunner } from "typeorm";

export class StudentAlumniOnboarding1767087720521 implements MigrationInterface {
    name = 'StudentAlumniOnboarding1767087720521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "college_link_request" ("id" text NOT NULL, "userId" text NOT NULL, "collegeId" integer NOT NULL, "status" text NOT NULL DEFAULT 'pending', "requestedRole" text NOT NULL, "enrollmentYear" integer, "graduationYear" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reviewedAt" TIMESTAMP WITH TIME ZONE, "reviewedBy" text, CONSTRAINT "PK_7f46a28dc3e078dc9a60e035b45" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_52757f3f1a289ab2c9cd8fc66f" ON "college_link_request" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b61e4fe00c93239a88af6553d2" ON "college_link_request" ("collegeId") `);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "phoneNumber" text`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "inviteToken" text`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD CONSTRAINT "UQ_dea1ccce83abb545ffb5eecba58" UNIQUE ("inviteToken")`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "source" text`);
        await queryRunner.query(`ALTER TABLE "college_info" ADD "emailDomains" text array`);
        await queryRunner.query(`ALTER TABLE "college_link_request" ADD CONSTRAINT "FK_52757f3f1a289ab2c9cd8fc66fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "college_link_request" ADD CONSTRAINT "FK_b61e4fe00c93239a88af6553d2f" FOREIGN KEY ("collegeId") REFERENCES "college_info"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "college_link_request" ADD CONSTRAINT "FK_4e764af0101d5ac4031ea68800f" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_link_request" DROP CONSTRAINT "FK_4e764af0101d5ac4031ea68800f"`);
        await queryRunner.query(`ALTER TABLE "college_link_request" DROP CONSTRAINT "FK_b61e4fe00c93239a88af6553d2f"`);
        await queryRunner.query(`ALTER TABLE "college_link_request" DROP CONSTRAINT "FK_52757f3f1a289ab2c9cd8fc66fd"`);
        await queryRunner.query(`ALTER TABLE "college_info" DROP COLUMN "emailDomains"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP CONSTRAINT "UQ_dea1ccce83abb545ffb5eecba58"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "inviteToken"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b61e4fe00c93239a88af6553d2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_52757f3f1a289ab2c9cd8fc66f"`);
        await queryRunner.query(`DROP TABLE "college_link_request"`);
    }

}
