import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFields1751345610456 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "exam" ADD "exam_category" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
