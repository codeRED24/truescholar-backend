import { MigrationInterface, QueryRunner } from "typeorm";

export class CourseContent1740134066569 implements MigrationInterface {
    name = 'CourseContent1740134066569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_content" ADD "og_title" character varying`);
        await queryRunner.query(`ALTER TABLE "course_content" ADD "og_description" character varying`);
        await queryRunner.query(`ALTER TABLE "course_content" ADD "og_featured_img" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_content" DROP COLUMN "og_featured_img"`);
        await queryRunner.query(`ALTER TABLE "course_content" DROP COLUMN "og_description"`);
        await queryRunner.query(`ALTER TABLE "course_content" DROP COLUMN "og_title"`);
    }

}
