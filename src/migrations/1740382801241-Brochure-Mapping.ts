import { MigrationInterface, QueryRunner } from "typeorm";

export class BrochureMapping1740382801241 implements MigrationInterface {
    name = 'BrochureMapping1740382801241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_brochure" DROP CONSTRAINT "FK_626c5f593fec0365cd1f53e1c2c"`);
        await queryRunner.query(`ALTER TABLE "college_brochure" DROP CONSTRAINT "FK_1b1447d055f9af71161b737a677"`);
        await queryRunner.query(`CREATE TYPE "public"."brochure_mapping_course_type_enum" AS ENUM('course_id', 'course_group_id')`);
        await queryRunner.query(`CREATE TABLE "brochure_mapping" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "course_type" "public"."brochure_mapping_course_type_enum" NOT NULL, "course_type_id" integer NOT NULL, "brochure_id" integer, CONSTRAINT "PK_492df3862512c89a361e26f15c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "college_brochure" DROP COLUMN "course_group_id"`);
        await queryRunner.query(`ALTER TABLE "college_brochure" DROP COLUMN "course_id"`);
        await queryRunner.query(`ALTER TABLE "brochure_mapping" ADD CONSTRAINT "FK_30b4ee90c95d4518d730c7af7df" FOREIGN KEY ("brochure_id") REFERENCES "college_brochure"("brochure_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brochure_mapping" DROP CONSTRAINT "FK_30b4ee90c95d4518d730c7af7df"`);
        await queryRunner.query(`ALTER TABLE "college_brochure" ADD "course_id" integer`);
        await queryRunner.query(`ALTER TABLE "college_brochure" ADD "course_group_id" integer`);
        await queryRunner.query(`DROP TABLE "brochure_mapping"`);
        await queryRunner.query(`DROP TYPE "public"."brochure_mapping_course_type_enum"`);
        await queryRunner.query(`ALTER TABLE "college_brochure" ADD CONSTRAINT "FK_1b1447d055f9af71161b737a677" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "college_brochure" ADD CONSTRAINT "FK_626c5f593fec0365cd1f53e1c2c" FOREIGN KEY ("course_group_id") REFERENCES "course_group"("course_group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
