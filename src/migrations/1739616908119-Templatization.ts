import { MigrationInterface, QueryRunner } from "typeorm";

export class Templatization1739616908119 implements MigrationInterface {
  name = "Templatization1739616908119";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "templatization_college_content" ("templatization_id" SERIAL NOT NULL, "college_id" integer NOT NULL, "silos" character varying(50) NOT NULL, "description" text NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_65e7424351ac2d521ef97a9c71a" PRIMARY KEY ("templatization_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_85b14d10136b5f048a30b1ecb1" ON "templatization_college_content" ("silos", "college_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "templatization_college_content" ADD CONSTRAINT "FK_741a5a1d8f35a7ed8374361d665" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "templatization_college_content" DROP CONSTRAINT "FK_741a5a1d8f35a7ed8374361d665"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85b14d10136b5f048a30b1ecb1"`
    );
    await queryRunner.query(`DROP TABLE "templatization_college_content"`);
  }
}
