import { MigrationInterface, QueryRunner } from "typeorm";

export class Coursetable1739812736311 implements MigrationInterface {
    name = 'Coursetable1739812736311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ADD "duration_value" integer`);
        await queryRunner.query(`CREATE TYPE "public"."courses_duration_type_enum" AS ENUM('Years', 'Months', 'Days', 'Weeks')`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "duration_type" "public"."courses_duration_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."courses_course_type_enum" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other', 'Honours', 'Lateral Entry', 'Certificate', 'Degree')`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "course_type" "public"."courses_course_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."courses_course_mode_enum" AS ENUM('Full-Time', 'Part-Time')`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "course_mode" "public"."courses_course_mode_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."courses_course_level_enum" AS ENUM('Ug', 'Pg')`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "course_level" "public"."courses_course_level_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."course_group_type_enum" RENAME TO "course_group_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."course_group_type_enum" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other', 'Honours', 'Lateral Entry', 'Certificate', 'Degree')`);
        await queryRunner.query(`ALTER TABLE "course_group" ALTER COLUMN "type" TYPE "public"."course_group_type_enum" USING "type"::"text"::"public"."course_group_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."course_group_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."course_group_type_enum_old" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other')`);
        await queryRunner.query(`ALTER TABLE "course_group" ALTER COLUMN "type" TYPE "public"."course_group_type_enum_old" USING "type"::"text"::"public"."course_group_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."course_group_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."course_group_type_enum_old" RENAME TO "course_group_type_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "course_level"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_level_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "course_mode"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_mode_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "course_type"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_type_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "duration_type"`);
        await queryRunner.query(`DROP TYPE "public"."courses_duration_type_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "duration_value"`);
    }

}
