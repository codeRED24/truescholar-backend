import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOtpRequestTable11755524832340 implements MigrationInterface {
  name = "CreateOtpRequestTable11755524832340";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp_request" ("id" SERIAL NOT NULL, "email" character varying, "phone" character varying, "email_otp" character varying, "phone_otp" character varying, "expires_at" TIMESTAMP, "phone_verified" boolean NOT NULL DEFAULT false, "email_verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_46517aa87968f18c82f077064c2" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_7a9032316fbdfa01f227f28c55d"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "kapp_uuid1"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "date_of_birth"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "tenth_percentage"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tenth_pass_year"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "twelth_percentage"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "twelth_pass_year"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "year_intake"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "otp_verified"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_d1300aa4184f58ff73b1a9a205f"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "custom_id"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "priority"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "company"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "designation"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tenth_board"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twelth_board"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "student_city"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "student_state"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "interest_incourse"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "insti_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "insti_city"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "insti_designation"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "insti_purpose"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_team"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mobile"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "otp"`);

    await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "custom_code" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_7feb9d0b2f9a4726ae27c77036f" UNIQUE ("custom_code")`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "gender" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "contact_number" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "country_of_origin" character varying`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "college_id" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "course_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "college_location" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "user_location" character varying`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "pass_year" integer`);
    await queryRunner.query(`ALTER TABLE "user" ADD "dob" date`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "user_type" character varying(50)`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "user_img_url" character varying`
    );

    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_df6b6b8d9c1ad2e1ac22705790d" FOREIGN KEY ("college_id") REFERENCES "college_info"("college_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_10687f04aeb9fbcb6a6c744ef73" FOREIGN KEY ("course_id") REFERENCES "college_wise_course"("college_wise_course_id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_10687f04aeb9fbcb6a6c744ef73"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_df6b6b8d9c1ad2e1ac22705790d"`
    );

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_img_url"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_type"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "dob"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pass_year"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_location"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "college_location"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "course_id"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "college_id"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "country_of_origin"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "contact_number"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gender"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_7feb9d0b2f9a4726ae27c77036f"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "custom_code"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);

    await queryRunner.query(`ALTER TABLE "user" ADD "otp" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "password" character varying NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "mobile" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "user_team" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "insti_purpose" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "insti_designation" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "insti_city" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "insti_name" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "interest_incourse" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "student_state" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "student_city" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "twelth_board" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "tenth_board" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "designation" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "company" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "priority" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "last_name" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "first_name" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "username" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "custom_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_d1300aa4184f58ff73b1a9a205f" UNIQUE ("custom_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "otp_verified" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "year_intake" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "twelth_pass_year" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "twelth_percentage" numeric`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "tenth_pass_year" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "tenth_percentage" numeric`
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "date_of_birth" date`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "kapp_uuid1" SERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_7a9032316fbdfa01f227f28c55d" PRIMARY KEY ("kapp_uuid1")`
    );

    await queryRunner.query(`DROP TABLE "otp_request"`);
  }
}
