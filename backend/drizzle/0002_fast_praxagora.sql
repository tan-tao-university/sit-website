CREATE TABLE "handbook" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_year" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"content_vi" jsonb,
	"content_en" jsonb,
	"pdf_url_vi" text,
	"pdf_url_en" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "handbook_school_year_unique" UNIQUE("school_year")
);
