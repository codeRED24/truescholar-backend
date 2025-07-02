import { MigrationInterface, QueryRunner } from "typeorm";

export class LogType1739963606882 implements MigrationInterface {
    name = 'LogType1739963606882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."logs_type_enum" RENAME TO "logs_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."logs_type_enum" AS ENUM('college', 'user', 'exam', 'article', 'course')`);
        await queryRunner.query(`ALTER TABLE "logs" ALTER COLUMN "type" TYPE "public"."logs_type_enum" USING "type"::"text"::"public"."logs_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."logs_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."logs_type_enum_old" AS ENUM('college', 'user', 'exam', 'article')`);
        await queryRunner.query(`ALTER TABLE "logs" ALTER COLUMN "type" TYPE "public"."logs_type_enum_old" USING "type"::"text"::"public"."logs_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."logs_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."logs_type_enum_old" RENAME TO "logs_type_enum"`);
    }

}
