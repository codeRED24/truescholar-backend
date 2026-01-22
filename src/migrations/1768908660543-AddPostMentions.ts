import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostMentions1768908660543 implements MigrationInterface {
    name = 'AddPostMentions1768908660543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_mentions" ("postId" uuid NOT NULL, "handleId" uuid NOT NULL, CONSTRAINT "PK_2679248eb0816eb1715395d5321" PRIMARY KEY ("postId", "handleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_633d695e8529c2edffffd40393" ON "post_mentions" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e71c7b070375bf467e981e89df" ON "post_mentions" ("handleId") `);
        await queryRunner.query(`ALTER TABLE "post_mentions" ADD CONSTRAINT "FK_633d695e8529c2edffffd40393c" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_mentions" ADD CONSTRAINT "FK_e71c7b070375bf467e981e89dfd" FOREIGN KEY ("handleId") REFERENCES "entity_handle"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_mentions" DROP CONSTRAINT "FK_e71c7b070375bf467e981e89dfd"`);
        await queryRunner.query(`ALTER TABLE "post_mentions" DROP CONSTRAINT "FK_633d695e8529c2edffffd40393c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e71c7b070375bf467e981e89df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_633d695e8529c2edffffd40393"`);
        await queryRunner.query(`DROP TABLE "post_mentions"`);
    }

}
