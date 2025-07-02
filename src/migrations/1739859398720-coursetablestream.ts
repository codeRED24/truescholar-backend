import { MigrationInterface, QueryRunner } from "typeorm";

export class Coursetablestream1739859398720 implements MigrationInterface {
    name = 'Coursetablestream1739859398720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_26bcf0b4249de4f1f6fe662cb18"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "stream_id" integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_72832d6391b8d9a675c61196e20" FOREIGN KEY ("stream_id") REFERENCES "stream"("stream_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_72832d6391b8d9a675c61196e20"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "stream_id"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_26bcf0b4249de4f1f6fe662cb18" FOREIGN KEY ("specialization_id") REFERENCES "specialization"("specialization_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
