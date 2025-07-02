import { MigrationInterface, QueryRunner } from "typeorm";

export class CollegeWiseCoursedisplayName1740484553294 implements MigrationInterface {
    name = 'CollegeWiseCoursedisplayName1740484553294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_wise_course" ADD "display_name" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_wise_course" DROP COLUMN "display_name"`);
    }

}
