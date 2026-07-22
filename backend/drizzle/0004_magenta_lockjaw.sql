CREATE TABLE "student_portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"avatar_url" text,
	"title" varchar(255),
	"short_bio" text,
	"about" text,
	"program" varchar(255),
	"student_year" integer,
	"location" varchar(255),
	"is_published" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "student_portfolio_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "student_portfolio_achievement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"year" integer,
	"link" text,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "student_portfolio_contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"value" text NOT NULL,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "student_portfolio_education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"school" varchar(255) NOT NULL,
	"degree" varchar(100),
	"field" varchar(255),
	"start_year" integer,
	"end_year" integer,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "student_portfolio_experience" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"organization" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"start_date" varchar(20),
	"end_date" varchar(20),
	"description" text,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "student_portfolio_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"tech_stack" jsonb,
	"role" varchar(255),
	"demo_url" text,
	"repo_url" text,
	"is_featured" boolean DEFAULT false,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "student_portfolio_skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"category" varchar(100),
	"name" varchar(100) NOT NULL,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "student_portfolio_achievement" ADD CONSTRAINT "student_portfolio_achievement_portfolio_id_student_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."student_portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_portfolio_contact" ADD CONSTRAINT "student_portfolio_contact_portfolio_id_student_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."student_portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_portfolio_education" ADD CONSTRAINT "student_portfolio_education_portfolio_id_student_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."student_portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_portfolio_experience" ADD CONSTRAINT "student_portfolio_experience_portfolio_id_student_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."student_portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_portfolio_project" ADD CONSTRAINT "student_portfolio_project_portfolio_id_student_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."student_portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_portfolio_skill" ADD CONSTRAINT "student_portfolio_skill_portfolio_id_student_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."student_portfolio"("id") ON DELETE cascade ON UPDATE no action;