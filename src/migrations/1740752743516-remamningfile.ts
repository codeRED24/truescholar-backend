import { MigrationInterface, QueryRunner } from "typeorm";

export class Remamningfile1740752743516 implements MigrationInterface {
    name = 'Remamningfile1740752743516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."articles_mapping_tag_type_enum" AS ENUM('college_id', 'course_id', 'exam_id', 'course_group_id')`);
        await queryRunner.query(`CREATE TABLE "articles_mapping" ("articles_mapping_id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "tag_type" "public"."articles_mapping_tag_type_enum" NOT NULL, "tag_type_id" integer NOT NULL, "article_id" integer, CONSTRAINT "PK_0d5107d9b2c15080349bc81ad49" PRIMARY KEY ("articles_mapping_id"))`);
        await queryRunner.query(`ALTER TABLE "article" ADD "og_title" character varying`);
        await queryRunner.query(`ALTER TABLE "article" ADD "og_description" character varying`);
        await queryRunner.query(`ALTER TABLE "article" ADD "og_featured_img" character varying`);
        await queryRunner.query(`ALTER TABLE "exam_content" ADD "og_title" character varying`);
        await queryRunner.query(`ALTER TABLE "exam_content" ADD "og_description" character varying`);
        await queryRunner.query(`ALTER TABLE "exam_content" ADD "og_featured_img" character varying`);
        await queryRunner.query(`ALTER TABLE "exam_date" ADD "year" integer `);
        await queryRunner.query(`ALTER TABLE "college_content" ADD "og_title" character varying`);
        await queryRunner.query(`ALTER TABLE "college_content" ADD "og_description" character varying`);
        await queryRunner.query(`ALTER TABLE "college_content" ADD "og_featured_img" character varying`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "author_id" integer`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "title" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "meta_desc" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "seo_params" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "is_discontinued" boolean`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "average_salary" integer`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "median_salary" integer`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "highest_salary" integer`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "top_recruiters" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "exam_date" ADD CONSTRAINT "UQ_14f577b81999868322f54cd7d5f" UNIQUE ("exam_id", "event_type", "year")`);
        await queryRunner.query(`ALTER TABLE "articles_mapping" ADD CONSTRAINT "FK_3c2d786e1ab915ecea2a0b438ba" FOREIGN KEY ("article_id") REFERENCES "article"("article_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD CONSTRAINT "FK_7a0c594949d58b40b0ed3adf4dc" FOREIGN KEY ("author_id") REFERENCES "author"("author_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP CONSTRAINT "FK_7a0c594949d58b40b0ed3adf4dc"`);
        await queryRunner.query(`ALTER TABLE "articles_mapping" DROP CONSTRAINT "FK_3c2d786e1ab915ecea2a0b438ba"`);
        await queryRunner.query(`ALTER TABLE "exam_date" DROP CONSTRAINT "UQ_14f577b81999868322f54cd7d5f"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "top_recruiters"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "highest_salary"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "median_salary"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "average_salary"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "is_discontinued"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "seo_params"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "meta_desc"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "author_id"`);
        await queryRunner.query(`ALTER TABLE "college_content" DROP COLUMN "og_featured_img"`);
        await queryRunner.query(`ALTER TABLE "college_content" DROP COLUMN "og_description"`);
        await queryRunner.query(`ALTER TABLE "college_content" DROP COLUMN "og_title"`);
        await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "year"`);
        await queryRunner.query(`ALTER TABLE "exam_content" DROP COLUMN "og_featured_img"`);
        await queryRunner.query(`ALTER TABLE "exam_content" DROP COLUMN "og_description"`);
        await queryRunner.query(`ALTER TABLE "exam_content" DROP COLUMN "og_title"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "og_featured_img"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "og_description"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "og_title"`);
        await queryRunner.query(`DROP TABLE "articles_mapping"`);
        await queryRunner.query(`DROP TYPE "public"."articles_mapping_tag_type_enum"`);
    }

}
