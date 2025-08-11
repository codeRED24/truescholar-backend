import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScholarshipTable1754647816149 implements MigrationInterface {
    name = 'AddScholarshipTable1754647816149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."scholarship_gender_enum" AS ENUM('M', 'F', 'Both')`);
        await queryRunner.query(`CREATE TABLE "scholarship" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "provided_by" character varying NOT NULL, "meta_description" character varying, "description" text NOT NULL, "provider" character varying NOT NULL, "type" character varying NOT NULL, "amount" numeric, "percentage" numeric, "eligibility" text, "level" character varying, "category" character varying, "gender" "public"."scholarship_gender_enum" NOT NULL DEFAULT 'Both', "application_start_date" date, "application_end_date" date, "application_process" text, "selection_process" text, "official_link" text, "document_required" text, "renewable" boolean NOT NULL DEFAULT false, "number_of_awards" integer, "country" character varying, "state" character varying, "added_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_8dd923cf66d895fc71ff403cf1b" UNIQUE ("slug"), CONSTRAINT "PK_90ab4b7111faf40fd3c788eac7b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "scholarship"`);
        await queryRunner.query(`DROP TYPE "public"."scholarship_gender_enum"`);
    }

}
