import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReviewsTable1755599208523 implements MigrationInterface {
    name = 'CreateReviewsTable1755599208523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "profile_picture_url" text, "linkedin_profile" text, "student_id_url" text, "mark_sheet_url" text, "degree_certificate_url" text, "review_title" character varying(200), "campus_experience_rating" integer, "placement_journey_rating" integer, "academic_experience_rating" integer, "college_admission_rating" integer, "campus_experience_comment" text, "placement_journey_comment" text, "academic_experience_comment" text, "college_admission_comment" text, "college_images_urls" text array, "status" character varying(20) NOT NULL DEFAULT 'pending', "reward_status" character varying(20) NOT NULL DEFAULT 'pending', "user_id" integer, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
    
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
      
        await queryRunner.query(`DROP TABLE "reviews"`);
    }

}
