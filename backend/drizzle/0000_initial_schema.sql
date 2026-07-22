-- Squashed from 0000_initial_schema.sql
CREATE TABLE "achievement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"student_names" text,
	"project_name" varchar(255),
	"organization" varchar(255),
	"level" varchar(50),
	"rank" varchar(100),
	"reward" varchar(255),
	"achieved_year" integer,
	"is_highlight" boolean DEFAULT false,
	"visibility" varchar(20) DEFAULT 'PUBLIC',
	"cover_image" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alumni" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"avatar_url" text,
	"graduation_year" integer,
	"program" varchar(255),
	"degree" varchar(50),
	"short_bio" text,
	"personal_story" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "alumni_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "alumni_academic_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alumni_id" uuid NOT NULL,
	"major" varchar(255),
	"thesis_title" text,
	"advisor" varchar(255),
	"research_area" varchar(255),
	"honors" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "alumni_achievement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alumni_id" uuid NOT NULL,
	"type" varchar(50),
	"title" varchar(255),
	"description" text,
	"year" integer,
	"link" text
);
--> statement-breakpoint
CREATE TABLE "alumni_career" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alumni_id" uuid NOT NULL,
	"organization" varchar(255),
	"role" varchar(255),
	"industry" varchar(100),
	"location" varchar(255),
	"start_year" integer,
	"end_year" integer,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "alumni_contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alumni_id" uuid NOT NULL,
	"type" varchar(50),
	"url" text,
	"visibility" varchar(20) DEFAULT 'public'
);
--> statement-breakpoint
CREATE TABLE "alumni_meta" (
	"alumni_id" uuid PRIMARY KEY NOT NULL,
	"visibility" varchar(20) DEFAULT 'public',
	"last_verified_at" timestamp with time zone,
	"verified_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "alumni_section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title_vi" varchar(255),
	"title_en" varchar(255),
	"description_vi" text,
	"description_en" text,
	"display_order" integer,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "alumni_section_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "alumni_section_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alumni_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"custom_title" varchar(255),
	"custom_quote" text,
	"display_order" integer,
	"is_featured" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "content" (
	"content_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document" jsonb NOT NULL,
	"base_language" varchar(5) DEFAULT 'vi',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid,
	"language" varchar(5) NOT NULL,
	"document" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course" (
	"course_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_vi" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"slug_vi" varchar(255),
	"slug_en" varchar(255),
	"credits" integer NOT NULL,
	"lecture_hours" integer,
	"practice_hours" integer,
	CONSTRAINT "course_slug_vi_unique" UNIQUE("slug_vi"),
	CONSTRAINT "course_slug_en_unique" UNIQUE("slug_en")
);
--> statement-breakpoint
CREATE TABLE "curriculum" (
	"curriculum_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"name_vi" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"slug_vi" varchar(255),
	"slug_en" varchar(255),
	"description_vi" text,
	"description_en" text,
	"banner" text,
	"pdf_url" text,
	"is_current" boolean DEFAULT false,
	"published_at" timestamp with time zone DEFAULT now(),
	"duration_years" integer,
	"total_semesters" integer,
	"total_credits" integer,
	"education_type" varchar(50),
	"language" varchar(10) DEFAULT 'Tiếng Việt',
	"degree_awarded" varchar(255),
	CONSTRAINT "curriculum_slug_vi_unique" UNIQUE("slug_vi"),
	CONSTRAINT "curriculum_slug_en_unique" UNIQUE("slug_en")
);
--> statement-breakpoint
CREATE TABLE "curriculum_course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_id" uuid NOT NULL,
	"course_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_section" (
	"section_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_id" uuid NOT NULL,
	"section_key" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"display_order" integer,
	"is_visible" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"avatar_url" text,
	"academic_title" varchar(50),
	"position" varchar(255),
	"department" varchar(255),
	"quote" text,
	"bio_short" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "faculty_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faculty_academic_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"faculty_id" uuid NOT NULL,
	"degree" varchar(50),
	"field" varchar(255),
	"institution" varchar(255),
	"country" varchar(100),
	"start_year" integer,
	"end_year" integer,
	"description" text,
	"display_order" integer
);
--> statement-breakpoint
CREATE TABLE "faculty_contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"faculty_id" uuid NOT NULL,
	"type" varchar(50),
	"value" text,
	"visibility" varchar(20) DEFAULT 'public'
);
--> statement-breakpoint
CREATE TABLE "faculty_course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"faculty_id" uuid NOT NULL,
	"course_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_meta" (
	"faculty_id" uuid PRIMARY KEY NOT NULL,
	"profile_visibility" varchar(20) DEFAULT 'public',
	"last_updated_at" timestamp with time zone,
	"updated_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "faculty_publication" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"faculty_id" uuid NOT NULL,
	"title" text,
	"venue" varchar(255),
	"year" integer,
	"publication_type" varchar(50),
	"doi" varchar(255),
	"publisher_url" text,
	"display_order" integer
);
--> statement-breakpoint
CREATE TABLE "faculty_research_area" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"faculty_id" uuid NOT NULL,
	"title" varchar(255),
	"description" text,
	"display_order" integer
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"summary" text,
	"content" jsonb NOT NULL,
	"content_text" text,
	"cover_image" text,
	"category" varchar(50) DEFAULT 'general',
	"status" varchar(20) DEFAULT 'draft',
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "news_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_category_map" (
	"news_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "news_category_map_news_id_category_id_pk" PRIMARY KEY("news_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "news_translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"news_id" uuid NOT NULL,
	"lang" varchar(5) NOT NULL,
	"title" varchar(255),
	"slug" varchar(255),
	"summary" text,
	"content" jsonb,
	"content_text" text
);
--> statement-breakpoint
CREATE TABLE "program" (
	"program_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_vi" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"slug_vi" varchar(255),
	"slug_en" varchar(255),
	"level" varchar(20) NOT NULL,
	"major_code" varchar(20),
	"banner" text,
	"status" varchar(20) DEFAULT 'active',
	"description_vi" text,
	"description_en" text,
	"content_id" uuid NOT NULL,
	CONSTRAINT "program_slug_vi_unique" UNIQUE("slug_vi"),
	CONSTRAINT "program_slug_en_unique" UNIQUE("slug_en")
);
--> statement-breakpoint
CREATE TABLE "research" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500),
	"abstract" text,
	"authors" text,
	"principal_investigator" varchar(255),
	"unit" varchar(255),
	"research_field" varchar(255),
	"sponsor" varchar(255),
	"funding_amount" varchar(100),
	"start_year" integer,
	"end_year" integer,
	"status" varchar(20),
	"journal_name" varchar(255),
	"publisher" varchar(255),
	"publication_year" integer,
	"doi" varchar(255),
	"pdf_url" text,
	"keywords" text,
	"language" varchar(5) DEFAULT 'vi',
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "research_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"full_name" varchar(255) NOT NULL,
	"avatar_url" text,
	"email_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "alumni_academic_profile" ADD CONSTRAINT "alumni_academic_profile_alumni_id_alumni_id_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_achievement" ADD CONSTRAINT "alumni_achievement_alumni_id_alumni_id_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_career" ADD CONSTRAINT "alumni_career_alumni_id_alumni_id_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_contact" ADD CONSTRAINT "alumni_contact_alumni_id_alumni_id_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_meta" ADD CONSTRAINT "alumni_meta_alumni_id_alumni_id_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_section_member" ADD CONSTRAINT "alumni_section_member_alumni_id_alumni_id_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_section_member" ADD CONSTRAINT "alumni_section_member_section_id_alumni_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."alumni_section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translation" ADD CONSTRAINT "content_translation_content_id_content_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum" ADD CONSTRAINT "curriculum_program_id_program_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("program_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_course" ADD CONSTRAINT "curriculum_course_curriculum_id_curriculum_curriculum_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curriculum"("curriculum_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_course" ADD CONSTRAINT "curriculum_course_course_id_course_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("course_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_section" ADD CONSTRAINT "curriculum_section_curriculum_id_curriculum_curriculum_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curriculum"("curriculum_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_academic_timeline" ADD CONSTRAINT "faculty_academic_timeline_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_contact" ADD CONSTRAINT "faculty_contact_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_course" ADD CONSTRAINT "faculty_course_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_course" ADD CONSTRAINT "faculty_course_course_id_course_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("course_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_meta" ADD CONSTRAINT "faculty_meta_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_publication" ADD CONSTRAINT "faculty_publication_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_research_area" ADD CONSTRAINT "faculty_research_area_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_category_map" ADD CONSTRAINT "news_category_map_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_category_map" ADD CONSTRAINT "news_category_map_category_id_news_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."news_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_translation" ADD CONSTRAINT "news_translation_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Squashed from 0001_auth_refresh_tokens.sql
CREATE TABLE "refresh_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "refresh_token_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Squashed from 0002_lowly_black_widow.sql
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_vi" varchar(255) NOT NULL,
	"title_en" varchar(255),
	"description_vi" text,
	"description_en" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"location_vi" varchar(255) NOT NULL,
	"location_en" varchar(255),
	"registration_url" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "event_status_start_at_idx" ON "event" USING btree ("status","start_at");
--> statement-breakpoint
-- Squashed from 0003_nostalgic_roulette.sql
CREATE TABLE "popup_banner" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_vi" varchar(255) NOT NULL,
	"title_en" varchar(255),
	"image_url" text NOT NULL,
	"image_alt_vi" varchar(255),
	"image_alt_en" varchar(255),
	"link_url" text NOT NULL,
	"open_in_new_tab" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "popup_banner_active_schedule_idx" ON "popup_banner" USING btree ("is_active","starts_at","ends_at");
