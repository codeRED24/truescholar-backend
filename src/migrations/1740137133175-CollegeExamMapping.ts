import { MigrationInterface, QueryRunner } from "typeorm";

export class CollegeExamMapping1740137133175 implements MigrationInterface {
    name = 'CollegeExamMapping1740137133175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "college_exam_mapping" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "college_id" integer, "exam_id" integer, "course_group_id" integer, CONSTRAINT "PK_604cb962328cb45d4baf1254c38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "college_exam_mapping" ADD CONSTRAINT "FK_ac8687094c648ef30638c89aa2c" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "college_exam_mapping" ADD CONSTRAINT "FK_c8595dfd7e9caf4d8be48a4c778" FOREIGN KEY ("exam_id") REFERENCES "exam"("exam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "college_exam_mapping" ADD CONSTRAINT "FK_0e21ad9a26b1a82652d1e5c2f97" FOREIGN KEY ("course_group_id") REFERENCES "course_group"("course_group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_exam_mapping" DROP CONSTRAINT "FK_0e21ad9a26b1a82652d1e5c2f97"`);
        await queryRunner.query(`ALTER TABLE "college_exam_mapping" DROP CONSTRAINT "FK_c8595dfd7e9caf4d8be48a4c778"`);
        await queryRunner.query(`ALTER TABLE "college_exam_mapping" DROP CONSTRAINT "FK_ac8687094c648ef30638c89aa2c"`);
        await queryRunner.query(`DROP TABLE "college_exam_mapping"`);
    }

}
