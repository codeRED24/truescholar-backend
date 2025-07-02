import { MigrationInterface, QueryRunner } from "typeorm";

export class CourseContent1739945381543 implements MigrationInterface {
    name = 'CourseContent1739945381543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "course_content" ("course_content_id" SERIAL NOT NULL, "course_id" integer, "silos" character varying(50), "is_active" boolean NOT NULL DEFAULT false, "title" character varying(300) NOT NULL, "description" text, "meta_desc" character varying, "author_id" integer, "refrence_url" character varying(500), "img1_url" character varying, "seo_param" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e924b0731cd61edc2393c7b0cb" PRIMARY KEY ("course_content_id"))`);
        await queryRunner.query(`ALTER TABLE "course_content" ADD CONSTRAINT "FK_89178486243763c734fd3ea24c3" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_content" DROP CONSTRAINT "FK_89178486243763c734fd3ea24c3"`);
        await queryRunner.query(`DROP TABLE "course_content"`);
    }

}
