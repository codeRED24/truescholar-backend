import { MigrationInterface, QueryRunner } from "typeorm";

export class SearchIndexEntityidText1767350256533 implements MigrationInterface {
  name = "SearchIndexEntityidText1767350256533";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b24cb26246719e9b960d4891cf"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_353930235fd57fa789a933db44"`
    );
    await queryRunner.query(
      `ALTER TABLE "search_index" ALTER COLUMN "entityId" TYPE text`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_353930235fd57fa789a933db44" ON "search_index" ("entityId") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b24cb26246719e9b960d4891cf" ON "search_index" ("entityType", "entityId") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b24cb26246719e9b960d4891cf"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_353930235fd57fa789a933db44"`
    );
    await queryRunner.query(
      `ALTER TABLE "search_index" DROP COLUMN "entityId"`
    );
    await queryRunner.query(
      `ALTER TABLE "search_index" ADD "entityId" uuid NOT NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_353930235fd57fa789a933db44" ON "search_index" ("entityId") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b24cb26246719e9b960d4891cf" ON "search_index" ("entityId", "entityType") `
    );
  }
}
