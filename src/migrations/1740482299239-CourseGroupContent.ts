import { MigrationInterface, QueryRunner } from "typeorm";

export class CourseGroupContent1740482299239 implements MigrationInterface {
    name = 'CourseGroupContent1740482299239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "course_group_content" ("course_group_content_id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying(300) NOT NULL, "description" text, "author_id" integer, "is_active" boolean NOT NULL DEFAULT false, "refrence_url" character varying(500), "meta_desc" character varying, "seo_param" text, "og_title" character varying, "og_description" character varying, "og_featured_img" character varying, "course_group_id" integer, "college_id" integer, CONSTRAINT "PK_8d9582ba8c0b888df84b0e28a2c" PRIMARY KEY ("course_group_content_id"))`);
        await queryRunner.query(`ALTER TABLE "course_group_content" ADD CONSTRAINT "FK_406dfe8e8790573e702f755023a" FOREIGN KEY ("course_group_id") REFERENCES "course_group"("course_group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_group_content" ADD CONSTRAINT "FK_3cc7583f40ab904e28096ce7237" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_group_content" DROP CONSTRAINT "FK_3cc7583f40ab904e28096ce7237"`);
        await queryRunner.query(`ALTER TABLE "course_group_content" DROP CONSTRAINT "FK_406dfe8e8790573e702f755023a"`);
        await queryRunner.query(`DROP TABLE "course_group_content"`);
    }

}
