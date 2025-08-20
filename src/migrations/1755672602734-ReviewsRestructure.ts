import { MigrationInterface, QueryRunner } from "typeorm";

export class ReviewsRestructure1755672602734 implements MigrationInterface {
  name = "ReviewsRestructure1755672602734";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_10687f04aeb9fbcb6a6c744ef73"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_df6b6b8d9c1ad2e1ac22705790d"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "college_id"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "course_id"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pass_year"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "college_location"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "profile_picture_url"`
    );
    await queryRunner.query(`ALTER TABLE "reviews" ADD "college_id" integer`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "course_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "college_location" character varying`
    );
    await queryRunner.query(`ALTER TABLE "reviews" ADD "pass_year" integer`);

    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_5ece1412ba5f92fc808251a11aa" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_f99062f36181ab42863facfaea3" FOREIGN KEY ("course_id") REFERENCES "college_wise_course"("college_wise_course_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_f99062f36181ab42863facfaea3"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_5ece1412ba5f92fc808251a11aa"`
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "pass_year"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "college_location"`
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "course_id"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "college_id"`);

    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "profile_picture_url" text`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "college_location" character varying`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "pass_year" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "course_id" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "college_id" integer`);

    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_df6b6b8d9c1ad2e1ac22705790d" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_10687f04aeb9fbcb6a6c744ef73" FOREIGN KEY ("course_id") REFERENCES "college_wise_course"("college_wise_course_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }
}
