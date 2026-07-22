CREATE TABLE "career_opportunity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_vi" varchar(255) NOT NULL,
	"title_en" varchar(255),
	"company_name" varchar(255) NOT NULL,
	"company_logo_url" text,
	"summary_vi" text,
	"summary_en" text,
	"requirements_vi" text,
	"requirements_en" text,
	"type" varchar(20) NOT NULL,
	"work_mode" varchar(20) NOT NULL,
	"location_vi" varchar(255) NOT NULL,
	"location_en" varchar(255),
	"skills" text,
	"salary_text" varchar(255),
	"application_url" text,
	"contact_email" varchar(255),
	"application_deadline" timestamp with time zone,
	"published_at" timestamp with time zone,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "career_opportunity_status_deadline_idx" ON "career_opportunity" USING btree ("status","application_deadline");--> statement-breakpoint
CREATE INDEX "career_opportunity_type_status_idx" ON "career_opportunity" USING btree ("type","status");