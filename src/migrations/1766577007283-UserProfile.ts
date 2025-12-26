import { MigrationInterface, QueryRunner } from "typeorm";

export class UserProfile1766577007283 implements MigrationInterface {
  name = "UserProfile1766577007283";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_profile" ("user_id" text NOT NULL, "bio" text, "experience" jsonb DEFAULT '[]', "education" jsonb DEFAULT '[]', "linkedin_url" text, "twitter_url" text, "github_url" text, "website_url" text, "city" text, "state" text, "skills" jsonb DEFAULT '[]', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_eee360f3bff24af1b6890765201" PRIMARY KEY ("user_id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_eee360f3bff24af1b6890765201" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_eee360f3bff24af1b6890765201"`
    );
    await queryRunner.query(`DROP TABLE "user_profile"`);
  }
}
