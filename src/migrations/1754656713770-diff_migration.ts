import { MigrationInterface, QueryRunner } from "typeorm";

export class DiffMigration1754656713770 implements MigrationInterface {
  name = "DiffMigration1754656713770";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."articles_mapping_tag_type_enum" AS ENUM('college_id', 'course_id', 'exam_id', 'course_group_id')`
    );
    await queryRunner.query(
      `CREATE TABLE "articles_mapping" ("articles_mapping_id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "tag_type" "public"."articles_mapping_tag_type_enum" NOT NULL, "tag_type_id" integer NOT NULL, "article_id" integer, CONSTRAINT "PK_0d5107d9b2c15080349bc81ad49" PRIMARY KEY ("articles_mapping_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "college_exam_mapping" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "college_id" integer, "exam_id" integer, "course_group_id" integer, CONSTRAINT "PK_604cb962328cb45d4baf1254c38" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "templatization_college_content" ("templatization_id" SERIAL NOT NULL, "college_id" integer NOT NULL, "silos" character varying(50) NOT NULL, "description" text NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_65e7424351ac2d521ef97a9c71a" PRIMARY KEY ("templatization_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_85b14d10136b5f048a30b1ecb1" ON "templatization_college_content" ("silos", "college_id") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exam_question_papers_type_enum" AS ENUM('Question Paper', 'Sample Paper', 'Syllabus', 'Answer Key', 'General')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exam_question_papers_subject_enum" AS ENUM('Physics', 'Chemistry', 'Maths', 'Biology', 'English', 'General Knowledge', 'Other')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exam_question_papers_shift_enum" AS ENUM('Shift 1', 'Shift 2', 'Shift 3', 'Shift 4')`
    );
    await queryRunner.query(
      `CREATE TABLE "exam_question_papers" ("question_paper_id" SERIAL NOT NULL, "exam_id" integer NOT NULL, "title" character varying, "type" "public"."exam_question_papers_type_enum" NOT NULL, "year" integer, "subject" "public"."exam_question_papers_subject_enum", "shift" "public"."exam_question_papers_shift_enum", "file_url" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b2966dba3ddbc82ff02e4eaaf88" PRIMARY KEY ("question_paper_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90ec81a4cd39c4c19a555310df" ON "exam_question_papers" ("exam_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f0c5f9feeadea8c4231793562" ON "exam_question_papers" ("year") `
    );
    await queryRunner.query(
      `CREATE TABLE "course_group_content" ("course_group_content_id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying(300) NOT NULL, "description" text, "author_id" integer, "is_active" boolean NOT NULL DEFAULT false, "refrence_url" character varying(500), "meta_desc" character varying, "seo_param" text, "og_title" character varying, "og_description" character varying, "og_featured_img" character varying, "course_group_id" integer, "college_id" integer, CONSTRAINT "PK_8d9582ba8c0b888df84b0e28a2c" PRIMARY KEY ("course_group_content_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "course_content" ("course_content_id" SERIAL NOT NULL, "course_id" integer, "silos" character varying(50), "is_active" boolean NOT NULL DEFAULT false, "title" character varying(300) NOT NULL, "description" text, "meta_desc" character varying, "author_id" integer, "refrence_url" character varying(500), "img1_url" character varying, "seo_param" text, "og_title" character varying, "og_description" character varying, "og_featured_img" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e924b0731cd61edc2393c7b0cb" PRIMARY KEY ("course_content_id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."brochure_mapping_course_type_enum" AS ENUM('course_id', 'course_group_id')`
    );
    await queryRunner.query(
      `CREATE TABLE "brochure_mapping" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "course_type" "public"."brochure_mapping_course_type_enum" NOT NULL, "course_type_id" integer NOT NULL, "brochure_id" integer, CONSTRAINT "PK_492df3862512c89a361e26f15c5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "college_brochure" ("brochure_id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "brochure_title" character varying NOT NULL, "brochure_file" character varying NOT NULL, "year" integer NOT NULL, "college_id" integer, CONSTRAINT "PK_accc088bb8dc44ed38e2634fdb9" PRIMARY KEY ("brochure_id"))`
    );

    await queryRunner.query(
      `ALTER TABLE "exam_content" ADD "og_title" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_content" ADD "og_description" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_content" ADD "og_featured_img" character varying`
    );

    await queryRunner.query(`ALTER TABLE "state" ADD "description" text`);
    await queryRunner.query(`ALTER TABLE "city" ADD "description" text`);
    await queryRunner.query(`ALTER TABLE "stream" ADD "description" text`);

    await queryRunner.query(
      `ALTER TYPE "public"."course_group_type_enum" RENAME TO "course_group_type_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."course_group_type_enum" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other', 'Honours', 'Lateral Entry', 'Certificate', 'Degree', 'Diploma')`
    );
    await queryRunner.query(
      `ALTER TABLE "course_group" ALTER COLUMN "type" TYPE "public"."course_group_type_enum" USING "type"::"text"::"public"."course_group_type_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."course_group_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "scholarship" DROP COLUMN "provided_by"`
    );
    await queryRunner.query(`ALTER TABLE "scholarship" ADD "provided_by" text`);
    await queryRunner.query(
      `ALTER TABLE "scholarship" ALTER COLUMN "description" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "scholarship" DROP COLUMN "provider"`);
    await queryRunner.query(`ALTER TABLE "scholarship" ADD "provider" text`);
    await queryRunner.query(`ALTER TABLE "scholarship" DROP COLUMN "type"`);
    await queryRunner.query(`ALTER TABLE "scholarship" ADD "type" text`);
    await queryRunner.query(
      `ALTER TYPE "public"."logs_type_enum" RENAME TO "logs_type_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."logs_type_enum" AS ENUM('college', 'user', 'exam', 'article', 'course')`
    );
    await queryRunner.query(
      `ALTER TABLE "logs" ALTER COLUMN "type" TYPE "public"."logs_type_enum" USING "type"::"text"::"public"."logs_type_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."logs_type_enum_old"`);

    await queryRunner.query(
      `ALTER TABLE "articles_mapping" ADD CONSTRAINT "FK_3c2d786e1ab915ecea2a0b438ba" FOREIGN KEY ("article_id") REFERENCES "article"("article_id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "college_exam_mapping" ADD CONSTRAINT "FK_ac8687094c648ef30638c89aa2c" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "college_exam_mapping" ADD CONSTRAINT "FK_c8595dfd7e9caf4d8be48a4c778" FOREIGN KEY ("exam_id") REFERENCES "exam"("exam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "college_exam_mapping" ADD CONSTRAINT "FK_0e21ad9a26b1a82652d1e5c2f97" FOREIGN KEY ("course_group_id") REFERENCES "course_group"("course_group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "templatization_college_content" ADD CONSTRAINT "FK_741a5a1d8f35a7ed8374361d665" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_question_papers" ADD CONSTRAINT "FK_90ec81a4cd39c4c19a555310df8" FOREIGN KEY ("exam_id") REFERENCES "exam"("exam_id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "course_group_content" ADD CONSTRAINT "FK_406dfe8e8790573e702f755023a" FOREIGN KEY ("course_group_id") REFERENCES "course_group"("course_group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "course_group_content" ADD CONSTRAINT "FK_3cc7583f40ab904e28096ce7237" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "brochure_mapping" ADD CONSTRAINT "FK_30b4ee90c95d4518d730c7af7df" FOREIGN KEY ("brochure_id") REFERENCES "college_brochure"("brochure_id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "college_brochure" ADD CONSTRAINT "FK_39e2f3002e991abdae2df7fb1e8" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "college_brochure" DROP CONSTRAINT "FK_39e2f3002e991abdae2df7fb1e8"`
    );
    await queryRunner.query(
      `ALTER TABLE "brochure_mapping" DROP CONSTRAINT "FK_30b4ee90c95d4518d730c7af7df"`
    );
    await queryRunner.query(
      `ALTER TABLE "course_content" DROP CONSTRAINT "FK_89178486243763c734fd3ea24c3"`
    );
    await queryRunner.query(
      `ALTER TABLE "course_group_content" DROP CONSTRAINT "FK_3cc7583f40ab904e28096ce7237"`
    );
    await queryRunner.query(
      `ALTER TABLE "course_group_content" DROP CONSTRAINT "FK_406dfe8e8790573e702f755023a"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_question_papers" DROP CONSTRAINT "FK_90ec81a4cd39c4c19a555310df8"`
    );
    await queryRunner.query(
      `ALTER TABLE "templatization_college_content" DROP CONSTRAINT "FK_741a5a1d8f35a7ed8374361d665"`
    );
    await queryRunner.query(
      `ALTER TABLE "college_exam_mapping" DROP CONSTRAINT "FK_0e21ad9a26b1a82652d1e5c2f97"`
    );
    await queryRunner.query(
      `ALTER TABLE "college_exam_mapping" DROP CONSTRAINT "FK_c8595dfd7e9caf4d8be48a4c778"`
    );
    await queryRunner.query(
      `ALTER TABLE "college_exam_mapping" DROP CONSTRAINT "FK_ac8687094c648ef30638c89aa2c"`
    );
    await queryRunner.query(
      `ALTER TABLE "articles_mapping" DROP CONSTRAINT "FK_3c2d786e1ab915ecea2a0b438ba"`
    );

    await queryRunner.query(
      `CREATE TYPE "public"."logs_type_enum_old" AS ENUM('college', 'user', 'exam', 'article')`
    );
    await queryRunner.query(
      `ALTER TABLE "logs" ALTER COLUMN "type" TYPE "public"."logs_type_enum_old" USING "type"::"text"::"public"."logs_type_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."logs_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."logs_type_enum_old" RENAME TO "logs_type_enum"`
    );
    await queryRunner.query(`ALTER TABLE "scholarship" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "scholarship" ADD "type" character varying NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "scholarship" DROP COLUMN "provider"`);
    await queryRunner.query(
      `ALTER TABLE "scholarship" ADD "provider" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "scholarship" ALTER COLUMN "description" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "scholarship" DROP COLUMN "provided_by"`
    );
    await queryRunner.query(
      `ALTER TABLE "scholarship" ADD "provided_by" character varying NOT NULL`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."course_group_type_enum_old" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other')`
    );
    await queryRunner.query(
      `ALTER TABLE "course_group" ALTER COLUMN "type" TYPE "public"."course_group_type_enum_old" USING "type"::"text"::"public"."course_group_type_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."course_group_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."course_group_type_enum_old" RENAME TO "course_group_type_enum"`
    );

    await queryRunner.query(`ALTER TABLE "stream" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "description"`);

    await queryRunner.query(
      `ALTER TABLE "exam_content" DROP COLUMN "og_featured_img"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_content" DROP COLUMN "og_description"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_content" DROP COLUMN "og_title"`
    );

    await queryRunner.query(`DROP TABLE "college_brochure"`);
    await queryRunner.query(`DROP TABLE "brochure_mapping"`);
    await queryRunner.query(
      `DROP TYPE "public"."brochure_mapping_course_type_enum"`
    );
    await queryRunner.query(`DROP TABLE "course_content"`);
    await queryRunner.query(`DROP TABLE "course_group_content"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f0c5f9feeadea8c4231793562"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90ec81a4cd39c4c19a555310df"`
    );
    await queryRunner.query(`DROP TABLE "exam_question_papers"`);
    await queryRunner.query(
      `DROP TYPE "public"."exam_question_papers_shift_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."exam_question_papers_subject_enum"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."exam_question_papers_type_enum"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85b14d10136b5f048a30b1ecb1"`
    );
    await queryRunner.query(`DROP TABLE "templatization_college_content"`);
    await queryRunner.query(`DROP TABLE "college_exam_mapping"`);
    await queryRunner.query(`DROP TABLE "articles_mapping"`);
    await queryRunner.query(
      `DROP TYPE "public"."articles_mapping_tag_type_enum"`
    );
  }
}
