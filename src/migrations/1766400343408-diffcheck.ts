import { MigrationInterface, QueryRunner } from "typeorm";

export class Diffcheck1766400343408 implements MigrationInterface {
  name = "Diffcheck1766400343408";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp_request" ("id" SERIAL NOT NULL, "email" character varying, "phone" character varying, "email_otp" character varying, "phone_otp" character varying, "expires_at" TIMESTAMP, "phone_verified" boolean NOT NULL DEFAULT false, "email_verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_46517aa87968f18c82f077064c2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "is_active"`);
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "tentative"`);
    await queryRunner.query(
      `ALTER TABLE "exam_date" DROP COLUMN "event_Title"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" DROP CONSTRAINT "UQ_79053ab9d80577f97a4a96859df"`
    );
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "slug"`);
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "exam_date"`);
    await queryRunner.query(
      `ALTER TABLE "exam_date" DROP COLUMN "refrence_url"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "is_email_verified"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "is_phone_verified"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "email_verified_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "phone_verified_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "title" character varying(500)`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."exam_date_event_type_enum" AS ENUM('Registration', 'Exam Date', 'Results', 'Cutoff', 'Counselling', 'Answer Key', 'Notification', 'Admit Card', 'Application', 'Miscellaneous')`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "event_type" "public"."exam_date_event_type_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "is_tentative" boolean`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "duration_value" integer`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."courses_duration_type_enum" AS ENUM('Years', 'Months', 'Days', 'Weeks')`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "duration_type" "public"."courses_duration_type_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."courses_course_type_enum" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other', 'Honours', 'Lateral Entry', 'Certificate', 'Degree', 'Diploma')`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "course_type" "public"."courses_course_type_enum"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."courses_course_level_enum" AS ENUM('Ug', 'Pg')`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "course_level" "public"."courses_course_level_enum"`
    );
    await queryRunner.query(`ALTER TABLE "courses" ADD "stream_id" integer`);
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "start_date"`);
    await queryRunner.query(`ALTER TABLE "exam_date" ADD "start_date" date`);
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "end_date"`);
    await queryRunner.query(`ALTER TABLE "exam_date" ADD "end_date" date`);
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "year"`);
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "year" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD CONSTRAINT "UQ_14f577b81999868322f54cd7d5f" UNIQUE ("exam_id", "event_type", "year")`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_72832d6391b8d9a675c61196e20" FOREIGN KEY ("stream_id") REFERENCES "stream"("stream_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "course_content" ADD CONSTRAINT "FK_89178486243763c734fd3ea24c3" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_content" DROP CONSTRAINT "FK_89178486243763c734fd3ea24c3"`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_72832d6391b8d9a675c61196e20"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" DROP CONSTRAINT "UQ_14f577b81999868322f54cd7d5f"`
    );
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "year"`);
    await queryRunner.query(`ALTER TABLE "exam_date" ADD "year" smallint`);
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "end_date"`);
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "end_date" character varying`
    );
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "start_date"`);
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "start_date" character varying`
    );
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "stream_id"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "course_level"`);
    await queryRunner.query(`DROP TYPE "public"."courses_course_level_enum"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "course_type"`);
    await queryRunner.query(`DROP TYPE "public"."courses_course_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN "duration_type"`
    );
    await queryRunner.query(`DROP TYPE "public"."courses_duration_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN "duration_value"`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" DROP COLUMN "is_tentative"`
    );
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "event_type"`);
    await queryRunner.query(`DROP TYPE "public"."exam_date_event_type_enum"`);
    await queryRunner.query(`ALTER TABLE "exam_date" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "phone_verified_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email_verified_at" TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_phone_verified" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_email_verified" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "refrence_url" character varying(500)`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "exam_date" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "slug" character varying(100)`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD CONSTRAINT "UQ_79053ab9d80577f97a4a96859df" UNIQUE ("slug")`
    );
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "event_Title" character varying(500)`
    );
    await queryRunner.query(`ALTER TABLE "exam_date" ADD "tentative" boolean`);
    await queryRunner.query(
      `ALTER TABLE "exam_date" ADD "is_active" boolean DEFAULT true`
    );
    await queryRunner.query(`DROP TABLE "otp_request"`);
  }
}
