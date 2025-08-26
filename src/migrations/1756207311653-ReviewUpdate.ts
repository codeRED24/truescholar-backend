import { MigrationInterface, QueryRunner } from "typeorm";

export class ReviewUpdate1756207311653 implements MigrationInterface {
  name = "ReviewUpdate1756207311653";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "college_roll_number" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "annual_tuition_fees" numeric(10,2)`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "hostel_fees" numeric(10,2)`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "other_charges" numeric(10,2)`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "scholarship_availed" boolean`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "scholarship_name" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "scholarship_amount" numeric(10,2)`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "overall_satisfaction_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "overall_experience_feedback" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "teaching_quality_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "teaching_quality_feedback" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "infrastructure_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "infrastructure_feedback" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "library_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "library_feedback" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "placement_support_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "placement_support_feedback" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "administrative_support_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "administrative_support_feedback" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "hostel_rating" integer`
    );
    await queryRunner.query(`ALTER TABLE "reviews" ADD "hostel_feedback" text`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "extracurricular_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "extracurricular_feedback" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "improvement_suggestions" text`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "improvement_suggestions"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "extracurricular_feedback"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "extracurricular_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "hostel_feedback"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "hostel_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "administrative_support_feedback"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "administrative_support_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "placement_support_feedback"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "placement_support_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "library_feedback"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "library_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "infrastructure_feedback"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "infrastructure_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "teaching_quality_feedback"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "teaching_quality_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "overall_experience_feedback"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "overall_satisfaction_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "scholarship_amount"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "scholarship_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "scholarship_availed"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "other_charges"`
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "hostel_fees"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "annual_tuition_fees"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "college_roll_number"`
    );
  }
}
