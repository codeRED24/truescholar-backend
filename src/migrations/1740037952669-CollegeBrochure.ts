import { MigrationInterface, QueryRunner } from "typeorm";

export class CollegeBrochure1740037952669 implements MigrationInterface {
    name = 'CollegeBrochure1740037952669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "college_brochure" ("brochure_id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "brochure_title" character varying NOT NULL, "brochure_file" character varying NOT NULL, "year" integer NOT NULL, "college_id" integer, "course_group_id" integer, "course_id" integer, CONSTRAINT "PK_accc088bb8dc44ed38e2634fdb9" PRIMARY KEY ("brochure_id"))`);
        await queryRunner.query(`ALTER TABLE "college_brochure" ADD CONSTRAINT "FK_39e2f3002e991abdae2df7fb1e8" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "college_brochure" ADD CONSTRAINT "FK_626c5f593fec0365cd1f53e1c2c" FOREIGN KEY ("course_group_id") REFERENCES "course_group"("course_group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "college_brochure" ADD CONSTRAINT "FK_1b1447d055f9af71161b737a677" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_brochure" DROP CONSTRAINT "FK_1b1447d055f9af71161b737a677"`);
        await queryRunner.query(`ALTER TABLE "college_brochure" DROP CONSTRAINT "FK_626c5f593fec0365cd1f53e1c2c"`);
        await queryRunner.query(`ALTER TABLE "college_brochure" DROP CONSTRAINT "FK_39e2f3002e991abdae2df7fb1e8"`);
        await queryRunner.query(`DROP TABLE "college_brochure"`);
    }

}
