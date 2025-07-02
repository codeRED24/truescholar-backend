import { MigrationInterface, QueryRunner } from "typeorm";

export class CourseType1740054344025 implements MigrationInterface {
    name = 'CourseType1740054344025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."course_group_type_enum" RENAME TO "course_group_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."course_group_type_enum" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other', 'Honours', 'Lateral Entry', 'Certificate', 'Degree', 'Diploma')`);
        await queryRunner.query(`ALTER TABLE "course_group" ALTER COLUMN "type" TYPE "public"."course_group_type_enum" USING "type"::"text"::"public"."course_group_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."course_group_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."courses_course_type_enum" RENAME TO "courses_course_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."courses_course_type_enum" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other', 'Honours', 'Lateral Entry', 'Certificate', 'Degree', 'Diploma')`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_type" TYPE "public"."courses_course_type_enum" USING "course_type"::"text"::"public"."courses_course_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."courses_course_mode_enum" RENAME TO "courses_course_mode_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."courses_course_mode_enum" AS ENUM('Full-Time', 'Part-Time', 'Online')`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_mode" TYPE "public"."courses_course_mode_enum" USING "course_mode"::"text"::"public"."courses_course_mode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_mode_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."courses_course_mode_enum_old" AS ENUM('Full-Time', 'Part-Time')`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_mode" TYPE "public"."courses_course_mode_enum_old" USING "course_mode"::"text"::"public"."courses_course_mode_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_mode_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."courses_course_mode_enum_old" RENAME TO "courses_course_mode_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."courses_course_type_enum_old" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other', 'Honours', 'Lateral Entry', 'Certificate', 'Degree')`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_type" TYPE "public"."courses_course_type_enum_old" USING "course_type"::"text"::"public"."courses_course_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."courses_course_type_enum_old" RENAME TO "courses_course_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."course_group_type_enum_old" AS ENUM('full-time', 'part-time', 'distance', 'online', 'executive', 'Other', 'Honours', 'Lateral Entry', 'Certificate', 'Degree')`);
        await queryRunner.query(`ALTER TABLE "course_group" ALTER COLUMN "type" TYPE "public"."course_group_type_enum_old" USING "type"::"text"::"public"."course_group_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."course_group_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."course_group_type_enum_old" RENAME TO "course_group_type_enum"`);
    }

}
