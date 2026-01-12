import { MigrationInterface, QueryRunner } from "typeorm";

export class Elasticsearchindex1767350013600 implements MigrationInterface {
  name = "Elasticsearchindex1767350013600";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."events_organizertype_enum" AS ENUM('user', 'college')`
    );
    await queryRunner.query(
      `CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "organizerType" "public"."events_organizertype_enum" NOT NULL DEFAULT 'user', "organizerUserId" text, "organizerCollegeId" integer, "title" character varying(255) NOT NULL, "description" text, "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endTime" TIMESTAMP WITH TIME ZONE NOT NULL, "location" character varying(255), "mediaUrl" character varying(500), "durationInMins" integer, "rsvpCount" integer NOT NULL DEFAULT '0', "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9bd83ec3faf089c11021a6ad62" ON "events" ("organizerUserId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_25b139b630c8914bb0920364dc" ON "events" ("organizerCollegeId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_614920333d353cbbbd2463d29f" ON "events" ("startTime") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_rsvps_status_enum" AS ENUM('booked', 'interested', 'not_going')`
    );
    await queryRunner.query(
      `CREATE TABLE "event_rsvps" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "eventId" uuid NOT NULL, "userId" text NOT NULL, "status" "public"."event_rsvps_status_enum" NOT NULL DEFAULT 'interested', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_93c8aab65f7d87b348353ab0025" UNIQUE ("eventId", "userId"), CONSTRAINT "PK_9b36694202531f62919c0bf5b35" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b064b8746996712f592833ca2b" ON "event_rsvps" ("eventId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f58c8918444363c81f80da603" ON "event_rsvps" ("userId") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."search_index_entitytype_enum" AS ENUM('user', 'college', 'event', 'post')`
    );
    await queryRunner.query(
      `CREATE TABLE "search_index" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "entityType" "public"."search_index_entitytype_enum" NOT NULL, "entityId" uuid NOT NULL, "indexedText" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_98e7fcdd8a5c077de6d88d2be28" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b798bc66c4a8689f3825f164ee" ON "search_index" ("entityType") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_353930235fd57fa789a933db44" ON "search_index" ("entityId") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b24cb26246719e9b960d4891cf" ON "search_index" ("entityType", "entityId") `
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_9bd83ec3faf089c11021a6ad627" FOREIGN KEY ("organizerUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_25b139b630c8914bb0920364dc1" FOREIGN KEY ("organizerCollegeId") REFERENCES "college_info"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvps" ADD CONSTRAINT "FK_b064b8746996712f592833ca2be" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvps" ADD CONSTRAINT "FK_1f58c8918444363c81f80da6035" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_rsvps" DROP CONSTRAINT "FK_1f58c8918444363c81f80da6035"`
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvps" DROP CONSTRAINT "FK_b064b8746996712f592833ca2be"`
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_25b139b630c8914bb0920364dc1"`
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_9bd83ec3faf089c11021a6ad627"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b24cb26246719e9b960d4891cf"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_353930235fd57fa789a933db44"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b798bc66c4a8689f3825f164ee"`
    );
    await queryRunner.query(`DROP TABLE "search_index"`);
    await queryRunner.query(
      `DROP TYPE "public"."search_index_entitytype_enum"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f58c8918444363c81f80da603"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b064b8746996712f592833ca2b"`
    );
    await queryRunner.query(`DROP TABLE "event_rsvps"`);
    await queryRunner.query(`DROP TYPE "public"."event_rsvps_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_614920333d353cbbbd2463d29f"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_25b139b630c8914bb0920364dc"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9bd83ec3faf089c11021a6ad62"`
    );
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TYPE "public"."events_organizertype_enum"`);
  }
}
