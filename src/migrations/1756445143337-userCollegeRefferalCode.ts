import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCollegeRefferalCode1756445143337
  implements MigrationInterface
{
  name = "UserCollegeRefferalCode1756445143337";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "referred_by" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "college" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "college"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "referred_by"`);
  }
}
