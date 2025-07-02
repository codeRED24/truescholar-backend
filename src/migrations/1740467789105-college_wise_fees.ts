import { MigrationInterface, QueryRunner } from "typeorm";

export class CollegeWiseFees1740467789105 implements MigrationInterface {
    name = 'CollegeWiseFees1740467789105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_wise_fees" ADD "tution_fees" integer`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" ADD "hostel_fees" integer`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" ADD "admission_fees" integer`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" ADD "exam_fees" integer`);
        await queryRunner.query(`CREATE TYPE "public"."college_wise_fees_category_enum" AS ENUM('General', 'Sc', 'St', 'Obc', 'Nri')`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" ADD "category" "public"."college_wise_fees_category_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."college_wise_fees_type_enum" AS ENUM('Year', 'Semester', 'Trimester', 'Quarter', 'Total')`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" ADD "type" "public"."college_wise_fees_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_wise_fees" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."college_wise_fees_type_enum"`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" DROP COLUMN "category"`);
        await queryRunner.query(`DROP TYPE "public"."college_wise_fees_category_enum"`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" DROP COLUMN "exam_fees"`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" DROP COLUMN "admission_fees"`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" DROP COLUMN "hostel_fees"`);
        await queryRunner.query(`ALTER TABLE "college_wise_fees" DROP COLUMN "tution_fees"`);
    }

}
