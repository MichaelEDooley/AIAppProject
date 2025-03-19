ALTER TABLE "documents" ALTER COLUMN "bucket_name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "policy_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "public"."policies" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."policy_status";--> statement-breakpoint
CREATE TYPE "public"."policy_status" AS ENUM('ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "public"."policies" ALTER COLUMN "status" SET DATA TYPE "public"."policy_status" USING "status"::"public"."policy_status";--> statement-breakpoint
ALTER TABLE "public"."policies" ALTER COLUMN "policy_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."policy_type";--> statement-breakpoint
CREATE TYPE "public"."policy_type" AS ENUM('AUTO', 'HOME', 'LIFE', 'HEALTH', 'OTHER');--> statement-breakpoint
ALTER TABLE "public"."policies" ALTER COLUMN "policy_type" SET DATA TYPE "public"."policy_type" USING "policy_type"::"public"."policy_type";