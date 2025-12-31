import { MigrationInterface, QueryRunner } from "typeorm";

export class CollegeOrg1767079251030 implements MigrationInterface {
  name = "CollegeOrg1767079251030";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "member" ("id" text NOT NULL, "collegeId" integer NOT NULL, "userId" text NOT NULL, "role" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_97cbbe986ce9d14ca5894fdc072" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd844c845bef339985baea41c8" ON "member" ("collegeId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08897b166dee565859b7fb2fcc" ON "member" ("userId") `
    );
    await queryRunner.query(
      `CREATE TABLE "invitation" ("id" text NOT NULL, "collegeId" integer NOT NULL, "email" text NOT NULL, "role" text, "status" text NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "inviterId" text NOT NULL, CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1dce5dd54cc9257c8c8f895de2" ON "invitation" ("collegeId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bcb0a0d2333443083582a05cdd" ON "invitation" ("email") `
    );
    await queryRunner.query(
      `CREATE TABLE "follow_college" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "followerId" text NOT NULL, "collegeId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_4fc26ac53d0fb69b2ff5d674f8c" UNIQUE ("followerId", "collegeId"), CONSTRAINT "PK_2b87626c45752bf170b07c64595" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_673e76bcabfbeab2979eb65a10" ON "follow_college" ("followerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_346e47d1224881953aca53c44a" ON "follow_college" ("collegeId") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_visibility_enum" AS ENUM('public', 'connections', 'private')`
    );
    await queryRunner.query(
      `CREATE TABLE "post" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "authorId" text NOT NULL, "content" text NOT NULL, "media" jsonb NOT NULL DEFAULT '[]', "visibility" "public"."post_visibility_enum" NOT NULL DEFAULT 'public', "likeCount" integer NOT NULL DEFAULT '0', "commentCount" integer NOT NULL DEFAULT '0', "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c6fb082a3114f35d0cc27c518e" ON "post" ("authorId") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('post_liked', 'post_commented', 'comment_liked', 'comment_replied', 'connection_requested', 'connection_accepted', 'new_follower', 'job_application_received', 'application_status_changed', 'system_announcement')`
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "recipientId" text NOT NULL, "actorId" text, "type" "public"."notification_type_enum" NOT NULL, "title" text NOT NULL, "message" text NOT NULL, "data" jsonb NOT NULL DEFAULT '{}', "link" text, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab7cbe7a013ecac5da0a8f8888" ON "notification" ("recipientId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_080ab397c379af09b9d2169e5b" ON "notification" ("isRead") `
    );
    await queryRunner.query(
      `CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text, "isGroup" boolean NOT NULL DEFAULT false, "lastMessageId" text, "lastMessagePreview" text, "lastMessageAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."message_type_enum" AS ENUM('text', 'image', 'file', 'system')`
    );
    await queryRunner.query(
      `CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "conversationId" uuid NOT NULL, "senderId" text NOT NULL, "content" text NOT NULL, "type" "public"."message_type_enum" NOT NULL DEFAULT 'text', "metadata" jsonb, "isDeleted" boolean NOT NULL DEFAULT false, "editedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7cf4a4df1f2627f72bf6231635" ON "message" ("conversationId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc096b4e18b1f9508197cd9806" ON "message" ("senderId") `
    );
    await queryRunner.query(
      `CREATE TABLE "message_read_status" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "conversationId" uuid NOT NULL, "userId" text NOT NULL, "lastReadMessageId" uuid, "lastReadAt" TIMESTAMP WITH TIME ZONE, "unreadCount" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_9e6ae00e7c9cfce48ddc816873c" UNIQUE ("conversationId", "userId"), CONSTRAINT "PK_258e8d92b4e212a121dc10a74d3" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_df841bb39a92dd0538e52070d6" ON "message_read_status" ("conversationId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00956f27e567b20ea63956a94d" ON "message_read_status" ("userId") `
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "postId" uuid NOT NULL, "authorId" text NOT NULL, "parentId" uuid, "content" text NOT NULL, "likeCount" integer NOT NULL DEFAULT '0', "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_94a85bb16d24033a2afdd5df06" ON "comment" ("postId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_276779da446413a0d79598d4fb" ON "comment" ("authorId") `
    );
    await queryRunner.query(
      `CREATE TABLE "like" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "userId" text NOT NULL, "postId" uuid, "commentId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_3a063d4952039809428988bb852" UNIQUE ("userId", "commentId"), CONSTRAINT "UQ_78a9f4a1b09b6d2bf7ed85f252f" UNIQUE ("userId", "postId"), CONSTRAINT "CHK_e52be040a82bb8e99a0ef422e9" CHECK (("postId" IS NOT NULL AND "commentId" IS NULL) OR ("postId" IS NULL AND "commentId" IS NOT NULL)), CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8fb739f08d47955a39850fac2" ON "like" ("userId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3acf7c55c319c4000e8056c127" ON "like" ("postId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d86e0a3eeecc21faa0da415a18" ON "like" ("commentId") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_locationtype_enum" AS ENUM('onsite', 'remote', 'hybrid')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_jobtype_enum" AS ENUM('full_time', 'part_time', 'contract', 'internship', 'freelance')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_experiencelevel_enum" AS ENUM('entry', 'mid', 'senior', 'lead', 'executive')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_status_enum" AS ENUM('draft', 'active', 'closed', 'expired')`
    );
    await queryRunner.query(
      `CREATE TABLE "job" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "posterId" text NOT NULL, "title" text NOT NULL, "company" text NOT NULL, "companyLogo" text, "description" text NOT NULL, "requirements" text, "responsibilities" text, "location" text NOT NULL, "locationType" "public"."job_locationtype_enum" NOT NULL DEFAULT 'onsite', "jobType" "public"."job_jobtype_enum" NOT NULL DEFAULT 'full_time', "experienceLevel" "public"."job_experiencelevel_enum" NOT NULL DEFAULT 'mid', "skills" text array NOT NULL DEFAULT '{}', "salaryMin" numeric(12,2), "salaryMax" numeric(12,2), "salaryCurrency" text NOT NULL DEFAULT 'INR', "status" "public"."job_status_enum" NOT NULL DEFAULT 'active', "applicationCount" integer NOT NULL DEFAULT '0', "viewCount" integer NOT NULL DEFAULT '0', "expiresAt" TIMESTAMP WITH TIME ZONE, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7022b3f2989f32f9e78721044f" ON "job" ("posterId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5482e092d68165721467491e75" ON "job" ("title") `
    );
    await queryRunner.query(
      `CREATE TABLE "saved_job" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "jobId" uuid NOT NULL, "userId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("jobId", "userId"), CONSTRAINT "PK_eec7a26a4f0a651ab3d63c2a4a6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ceb2154a962ca924a284f15c2e" ON "saved_job" ("jobId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65314280f947dd20a26faf013d" ON "saved_job" ("userId") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_application_status_enum" AS ENUM('pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn')`
    );
    await queryRunner.query(
      `CREATE TABLE "job_application" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "jobId" uuid NOT NULL, "applicantId" text NOT NULL, "coverLetter" text, "resumeUrl" text, "status" "public"."job_application_status_enum" NOT NULL DEFAULT 'pending', "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_559c5792c511d5fe3468d80e5ee" UNIQUE ("jobId", "applicantId"), CONSTRAINT "PK_c0b8f6b6341802967369b5d70f5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0452612ad9cb0e20f6f320ebc" ON "job_application" ("jobId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f72681370346063768901281b" ON "job_application" ("applicantId") `
    );
    await queryRunner.query(
      `CREATE TABLE "follow" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "followerId" text NOT NULL, "followingId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2952595a5bec0052c5da0751cca" UNIQUE ("followerId", "followingId"), CONSTRAINT "CHK_b4464e5cb2573d44cfc725ffe4" CHECK ("followerId" != "followingId"), CONSTRAINT "PK_fda88bc28a84d2d6d06e19df6e5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_550dce89df9570f251b6af2665" ON "follow" ("followerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e9f68503556c5d72a161ce3851" ON "follow" ("followingId") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."connection_status_enum" AS ENUM('pending', 'accepted', 'rejected')`
    );
    await queryRunner.query(
      `CREATE TABLE "connection" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "requesterId" text NOT NULL, "addresseeId" text NOT NULL, "status" "public"."connection_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_98f5efad80c7eaf7e090375718" CHECK ("requesterId" != "addresseeId"), CONSTRAINT "PK_be611ce8b8cf439091c82a334b2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d87a8cb9c50618f63bcf9ebbb2" ON "connection" ("requesterId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_73c7c1c0fb66fd9bf99b804211" ON "connection" ("addresseeId") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_35d4471367fcd259a82da79b35" ON "connection" ("requesterId", "addresseeId") `
    );
    await queryRunner.query(
      `CREATE TABLE "conversation_participants" ("conversationId" uuid NOT NULL, "userId" text NOT NULL, CONSTRAINT "PK_e43efbfa3b850160b5b2c50e3ec" PRIMARY KEY ("conversationId", "userId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4453e20858b14ab765a09ad728" ON "conversation_participants" ("conversationId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18c4ba3b127461649e5f5039db" ON "conversation_participants" ("userId") `
    );
    await queryRunner.query(`ALTER TABLE "college_info" ADD "metadata" text`);
    await queryRunner.query(
      `ALTER TABLE "member" ADD CONSTRAINT "FK_dd844c845bef339985baea41c87" FOREIGN KEY ("collegeId") REFERENCES "college_info"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "member" ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_1dce5dd54cc9257c8c8f895de29" FOREIGN KEY ("collegeId") REFERENCES "college_info"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_528426b10830422eac8e5c51e7f" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "follow_college" ADD CONSTRAINT "FK_673e76bcabfbeab2979eb65a100" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "follow_college" ADD CONSTRAINT "FK_346e47d1224881953aca53c44a1" FOREIGN KEY ("collegeId") REFERENCES "college_info"("college_id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_c5133a026bd1b3d9feccac1a234" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "message_read_status" ADD CONSTRAINT "FK_df841bb39a92dd0538e52070d6b" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "message_read_status" ADD CONSTRAINT "FK_00956f27e567b20ea63956a94da" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_3acf7c55c319c4000e8056c1279" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_d86e0a3eeecc21faa0da415a18a" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "job" ADD CONSTRAINT "FK_7022b3f2989f32f9e78721044f2" FOREIGN KEY ("posterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_job" ADD CONSTRAINT "FK_ceb2154a962ca924a284f15c2e7" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_job" ADD CONSTRAINT "FK_65314280f947dd20a26faf013d2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "job_application" ADD CONSTRAINT "FK_d0452612ad9cb0e20f6f320ebc0" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "job_application" ADD CONSTRAINT "FK_0f72681370346063768901281b6" FOREIGN KEY ("applicantId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "follow" ADD CONSTRAINT "FK_550dce89df9570f251b6af2665a" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "follow" ADD CONSTRAINT "FK_e9f68503556c5d72a161ce38513" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "connection" ADD CONSTRAINT "FK_d87a8cb9c50618f63bcf9ebbb2f" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "connection" ADD CONSTRAINT "FK_73c7c1c0fb66fd9bf99b804211e" FOREIGN KEY ("addresseeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" ADD CONSTRAINT "FK_4453e20858b14ab765a09ad728c" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" ADD CONSTRAINT "FK_18c4ba3b127461649e5f5039dbf" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" DROP CONSTRAINT "FK_18c4ba3b127461649e5f5039dbf"`
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_participants" DROP CONSTRAINT "FK_4453e20858b14ab765a09ad728c"`
    );
    await queryRunner.query(
      `ALTER TABLE "connection" DROP CONSTRAINT "FK_73c7c1c0fb66fd9bf99b804211e"`
    );
    await queryRunner.query(
      `ALTER TABLE "connection" DROP CONSTRAINT "FK_d87a8cb9c50618f63bcf9ebbb2f"`
    );
    await queryRunner.query(
      `ALTER TABLE "follow" DROP CONSTRAINT "FK_e9f68503556c5d72a161ce38513"`
    );
    await queryRunner.query(
      `ALTER TABLE "follow" DROP CONSTRAINT "FK_550dce89df9570f251b6af2665a"`
    );
    await queryRunner.query(
      `ALTER TABLE "job_application" DROP CONSTRAINT "FK_0f72681370346063768901281b6"`
    );
    await queryRunner.query(
      `ALTER TABLE "job_application" DROP CONSTRAINT "FK_d0452612ad9cb0e20f6f320ebc0"`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_job" DROP CONSTRAINT "FK_65314280f947dd20a26faf013d2"`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_job" DROP CONSTRAINT "FK_ceb2154a962ca924a284f15c2e7"`
    );
    await queryRunner.query(
      `ALTER TABLE "job" DROP CONSTRAINT "FK_7022b3f2989f32f9e78721044f2"`
    );
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_d86e0a3eeecc21faa0da415a18a"`
    );
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_3acf7c55c319c4000e8056c1279"`
    );
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_e8fb739f08d47955a39850fac23"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_e3aebe2bd1c53467a07109be596"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`
    );
    await queryRunner.query(
      `ALTER TABLE "message_read_status" DROP CONSTRAINT "FK_00956f27e567b20ea63956a94da"`
    );
    await queryRunner.query(
      `ALTER TABLE "message_read_status" DROP CONSTRAINT "FK_df841bb39a92dd0538e52070d6b"`
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_c5133a026bd1b3d9feccac1a234"`
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_ab7cbe7a013ecac5da0a8f88884"`
    );
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`
    );
    await queryRunner.query(
      `ALTER TABLE "follow_college" DROP CONSTRAINT "FK_346e47d1224881953aca53c44a1"`
    );
    await queryRunner.query(
      `ALTER TABLE "follow_college" DROP CONSTRAINT "FK_673e76bcabfbeab2979eb65a100"`
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_528426b10830422eac8e5c51e7f"`
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_1dce5dd54cc9257c8c8f895de29"`
    );
    await queryRunner.query(
      `ALTER TABLE "member" DROP CONSTRAINT "FK_08897b166dee565859b7fb2fcc8"`
    );
    await queryRunner.query(
      `ALTER TABLE "member" DROP CONSTRAINT "FK_dd844c845bef339985baea41c87"`
    );
    await queryRunner.query(
      `ALTER TABLE "college_info" DROP COLUMN "metadata"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18c4ba3b127461649e5f5039db"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4453e20858b14ab765a09ad728"`
    );
    await queryRunner.query(`DROP TABLE "conversation_participants"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_35d4471367fcd259a82da79b35"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_73c7c1c0fb66fd9bf99b804211"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d87a8cb9c50618f63bcf9ebbb2"`
    );
    await queryRunner.query(`DROP TABLE "connection"`);
    await queryRunner.query(`DROP TYPE "public"."connection_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e9f68503556c5d72a161ce3851"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_550dce89df9570f251b6af2665"`
    );
    await queryRunner.query(`DROP TABLE "follow"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0f72681370346063768901281b"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d0452612ad9cb0e20f6f320ebc"`
    );
    await queryRunner.query(`DROP TABLE "job_application"`);
    await queryRunner.query(`DROP TYPE "public"."job_application_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65314280f947dd20a26faf013d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ceb2154a962ca924a284f15c2e"`
    );
    await queryRunner.query(`DROP TABLE "saved_job"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5482e092d68165721467491e75"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7022b3f2989f32f9e78721044f"`
    );
    await queryRunner.query(`DROP TABLE "job"`);
    await queryRunner.query(`DROP TYPE "public"."job_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_experiencelevel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_jobtype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_locationtype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d86e0a3eeecc21faa0da415a18"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3acf7c55c319c4000e8056c127"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8fb739f08d47955a39850fac2"`
    );
    await queryRunner.query(`DROP TABLE "like"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_276779da446413a0d79598d4fb"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94a85bb16d24033a2afdd5df06"`
    );
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00956f27e567b20ea63956a94d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df841bb39a92dd0538e52070d6"`
    );
    await queryRunner.query(`DROP TABLE "message_read_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc096b4e18b1f9508197cd9806"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7cf4a4df1f2627f72bf6231635"`
    );
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
    await queryRunner.query(`DROP TABLE "conversation"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_080ab397c379af09b9d2169e5b"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab7cbe7a013ecac5da0a8f8888"`
    );
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c6fb082a3114f35d0cc27c518e"`
    );
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TYPE "public"."post_visibility_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_346e47d1224881953aca53c44a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_673e76bcabfbeab2979eb65a10"`
    );
    await queryRunner.query(`DROP TABLE "follow_college"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bcb0a0d2333443083582a05cdd"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1dce5dd54cc9257c8c8f895de2"`
    );
    await queryRunner.query(`DROP TABLE "invitation"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_08897b166dee565859b7fb2fcc"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd844c845bef339985baea41c8"`
    );
    await queryRunner.query(`DROP TABLE "member"`);
  }
}
