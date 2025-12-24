import { MigrationInterface, QueryRunner } from "typeorm";

export class UserDetails1766565645986 implements MigrationInterface {
    name = 'UserDetails1766565645986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "college_id" integer, "course_id" integer, "college_location" character varying, "pass_year" integer, "is_anonymous" boolean, "stream" character varying, "year_of_study" character varying, "mode_of_study" character varying, "current_semester" character varying, "linkedin_profile" text, "student_id_url" text, "mark_sheet_url" text, "degree_certificate_url" text, "review_title" character varying(200), "college_images_urls" text array, "annual_tuition_fees" numeric(10,2), "hostel_fees" numeric(10,2), "other_charges" numeric(10,2), "scholarship_availed" boolean, "scholarship_name" character varying(255), "scholarship_amount" numeric(10,2), "overall_satisfaction_rating" integer, "overall_experience_feedback" text, "teaching_quality_rating" integer, "teaching_quality_feedback" text, "infrastructure_rating" integer, "infrastructure_feedback" text, "library_rating" integer, "library_feedback" text, "placement_support_rating" integer, "placement_support_feedback" text, "administrative_support_rating" integer, "administrative_support_feedback" text, "hostel_rating" integer, "hostel_feedback" text, "extracurricular_rating" integer, "extracurricular_feedback" text, "improvement_suggestions" text, "status" character varying(20) NOT NULL DEFAULT 'pending', "reward_status" character varying(20) NOT NULL DEFAULT 'pending', "user_id" text, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5ece1412ba5f92fc808251a11a" ON "reviews" ("college_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_728447781a30bc3fcfe5c2f1cd" ON "reviews" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_5ece1412ba5f92fc808251a11aa" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_f99062f36181ab42863facfaea3" FOREIGN KEY ("course_id") REFERENCES "college_wise_course"("college_wise_course_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_f99062f36181ab42863facfaea3"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_5ece1412ba5f92fc808251a11aa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_728447781a30bc3fcfe5c2f1cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ece1412ba5f92fc808251a11a"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
    }

}
