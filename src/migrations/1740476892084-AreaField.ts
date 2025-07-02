import { MigrationInterface, QueryRunner } from "typeorm";

export class AreaField1740476892084 implements MigrationInterface {
    name = 'AreaField1740476892084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_info" ADD "area" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "college_info" DROP COLUMN "area"`);
    }

}
