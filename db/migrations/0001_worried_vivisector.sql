CREATE TYPE "public"."customer_type" AS ENUM('INDIVIDUAL', 'BUSINESS');--> statement-breakpoint
CREATE TYPE "public"."policy_status" AS ENUM('ACTIVE', 'EXPIRED', 'PENDING_RENEWAL', 'LAPSED');--> statement-breakpoint
CREATE TYPE "public"."policy_type" AS ENUM('AUTO', 'HOME', 'LIFE', 'HEALTH', 'COMMERCIAL');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('OPEN', 'IN_PROGRESS', 'REQUIRES_INFO', 'RESOLVED', 'DENIED');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('POLICY', 'CLAIM', 'IDENTIFICATION', 'CONTRACT', 'OTHER');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"encrypted_data" json NOT NULL,
	"tags" text[],
	"type" "customer_type" DEFAULT 'INDIVIDUAL' NOT NULL,
	"deleted_at" timestamp,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"policy_type" "policy_type" NOT NULL,
	"premium_amount" numeric(15, 2) NOT NULL,
	"renewal_date" timestamp NOT NULL,
	"status" "policy_status" DEFAULT 'ACTIVE' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"audit_trail" json[] DEFAULT '{}' NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"policy_id" uuid NOT NULL,
	"claim_details" json NOT NULL,
	"status" "claim_status" DEFAULT 'OPEN' NOT NULL,
	"status_history" json[] DEFAULT '{}' NOT NULL,
	"resolution_time" interval,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"storage_path" text NOT NULL,
	"document_type" "document_type" DEFAULT 'OTHER' NOT NULL,
	"customer_id" uuid,
	"policy_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"user_id" text NOT NULL,
	"bucket_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE no action ON UPDATE no action;