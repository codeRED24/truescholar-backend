import { MigrationInterface, QueryRunner } from "typeorm";

export class ReviewUpdate11756208510678 implements MigrationInterface {
  name = "ReviewUpdate11756208510678";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "campus_experience_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "placement_journey_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "academic_experience_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "college_admission_rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "campus_experience_comment"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "placement_journey_comment"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "academic_experience_comment"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "college_admission_comment"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "college_admission_comment" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "academic_experience_comment" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "placement_journey_comment" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "campus_experience_comment" text`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "college_admission_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "academic_experience_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "placement_journey_rating" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "campus_experience_rating" integer`
    );
  }
}
