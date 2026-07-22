import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
  numeric,
} from 'drizzle-orm/pg-core';
// Relations
import { relations } from 'drizzle-orm';

export const program = pgTable('program', {
  programId: uuid('program_id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull(),
  nameVi: varchar('name_vi', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  slugVi: varchar('slug_vi', { length: 255 }).unique(),
  slugEn: varchar('slug_en', { length: 255 }).unique(),
  level: varchar('level', { length: 20 }).notNull(),
  majorCode: varchar('major_code', { length: 20 }),
  banner: text('banner'),
  status: varchar('status', { length: 20 }).default('active'),
  descriptionVi: text('description_vi'),
  descriptionEn: text('description_en'),

  // Linked Content (Headless)
  contentId: uuid('content_id').notNull(),
});

export const content = pgTable('content', {
  contentId: uuid('content_id').primaryKey().defaultRandom(),
  // Yoopta document JSON
  document: jsonb('document').notNull(),
  // Base language
  baseLanguage: varchar('base_language', { length: 5 }).default('vi'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contentTranslation = pgTable('content_translation', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentId: uuid('content_id').references(() => content.contentId),
  language: varchar('language', { length: 5 }).notNull(), // en, ja, ko...
  document: jsonb('document').notNull(),
  status: varchar('status', { length: 20 }).default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const curriculum = pgTable('curriculum', {
  curriculumId: uuid('curriculum_id').primaryKey().defaultRandom(),
  programId: uuid('program_id')
    .references(() => program.programId, { onDelete: 'cascade' })
    .notNull(),
  year: integer('year').notNull(),
  nameVi: varchar('name_vi', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  slugVi: varchar('slug_vi', { length: 255 }).unique(),
  slugEn: varchar('slug_en', { length: 255 }).unique(),
  descriptionVi: text('description_vi'),
  descriptionEn: text('description_en'),
  banner: text('banner'),
  pdfUrl: text('pdf_url'),
  isCurrent: boolean('is_current').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow(),
  durationYears: numeric('duration_years', {
    precision: 3,
    scale: 1,
    mode: 'number',
  }),
  totalSemesters: integer('total_semesters'),
  totalCredits: integer('total_credits'),
  educationType: varchar('education_type', { length: 50 }),
  language: varchar('language', { length: 10 }).default('Tiếng Việt'),
  degreeAwarded: varchar('degree_awarded', { length: 255 }),
});

export const curriculumSection = pgTable('curriculum_section', {
  sectionId: uuid('section_id').primaryKey().defaultRandom(),
  curriculumId: uuid('curriculum_id')
    .references(() => curriculum.curriculumId, { onDelete: 'cascade' })
    .notNull(),
  sectionKey: varchar('section_key', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  displayOrder: integer('display_order'),
  isVisible: boolean('is_visible').default(true),
});

export const course = pgTable('course', {
  courseId: uuid('course_id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull(),
  nameVi: varchar('name_vi', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  slugVi: varchar('slug_vi', { length: 255 }).unique(),
  slugEn: varchar('slug_en', { length: 255 }).unique(),
  credits: integer('credits').notNull(),
  lectureHours: integer('lecture_hours'), // LT
  practiceHours: integer('practice_hours'), // TH
});

export const curriculumCourse = pgTable('curriculum_course', {
  id: uuid('id').primaryKey().defaultRandom(),
  curriculumId: uuid('curriculum_id')
    .references(() => curriculum.curriculumId, { onDelete: 'cascade' })
    .notNull(),
  courseId: uuid('course_id')
    .references(() => course.courseId, { onDelete: 'cascade' })
    .notNull(),
});

export const user = pgTable('user', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  emailVerified: boolean('email_verified').default(false),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const refreshToken = pgTable('refresh_token', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => user.userId, { onDelete: 'cascade' })
    .notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userRole = pgTable('user_role', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => user.userId, { onDelete: 'cascade' })
    .notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'admin' | 'student' | 'parent'
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  roles: many(userRole),
  refreshTokens: many(refreshToken),
}));

export const refreshTokenRelations = relations(refreshToken, ({ one }) => ({
  user: one(user, {
    fields: [refreshToken.userId],
    references: [user.userId],
  }),
}));

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.userId],
  }),
}));

export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  summary: text('summary'),
  content: jsonb('content').notNull(), // Yoopta editor state
  contentText: text('content_text'), // plain text for search / AI
  coverImage: text('cover_image'),
  category: varchar('category', { length: 50 }).default('general'), // 'workshop', 'achievements', 'academic', 'business', 'events', 'general'
  status: varchar('status', { length: 20 }).default('draft'), // 'draft', 'published', 'archived'
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const newsTranslation = pgTable(
  'news_translation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    newsId: uuid('news_id')
      .references(() => news.id, { onDelete: 'cascade' })
      .notNull(),
    lang: varchar('lang', { length: 5 }).notNull(), // vi, en
    title: varchar('title', { length: 255 }),
    slug: varchar('slug', { length: 255 }),
    summary: text('summary'),
    content: jsonb('content'),
    contentText: text('content_text'),
  },
  (t) => ({
    uncc: {
      uniqueLang: uniqueIndex('news_translation_news_id_lang_unique').on(
        t.newsId,
        t.lang,
      ),
    },
  }),
);

export const newsCategory = pgTable('news_category', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
});

export const newsCategoryMap = pgTable(
  'news_category_map',
  {
    newsId: uuid('news_id')
      .references(() => news.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: uuid('category_id')
      .references(() => newsCategory.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.newsId, t.categoryId] }),
  }),
);

export const event = pgTable(
  'event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    titleVi: varchar('title_vi', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }),
    descriptionVi: text('description_vi'),
    descriptionEn: text('description_en'),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }),
    locationVi: varchar('location_vi', { length: 255 }).notNull(),
    locationEn: varchar('location_en', { length: 255 }),
    registrationUrl: text('registration_url'),
    status: varchar('status', { length: 20 }).default('draft').notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('event_status_start_at_idx').on(table.status, table.startAt),
  ],
);

export const careerOpportunity = pgTable(
  'career_opportunity',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    titleVi: varchar('title_vi', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }),
    companyName: varchar('company_name', { length: 255 }).notNull(),
    companyLogoUrl: text('company_logo_url'),
    summaryVi: text('summary_vi'),
    summaryEn: text('summary_en'),
    requirementsVi: text('requirements_vi'),
    requirementsEn: text('requirements_en'),
    type: varchar('type', { length: 20 }).notNull(),
    workMode: varchar('work_mode', { length: 20 }).notNull(),
    locationVi: varchar('location_vi', { length: 255 }).notNull(),
    locationEn: varchar('location_en', { length: 255 }),
    skills: text('skills'),
    salaryText: varchar('salary_text', { length: 255 }),
    applicationUrl: text('application_url'),
    contactEmail: varchar('contact_email', { length: 255 }),
    applicationDeadline: timestamp('application_deadline', {
      withTimezone: true,
    }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    status: varchar('status', { length: 20 }).default('draft').notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('career_opportunity_status_deadline_idx').on(
      table.status,
      table.applicationDeadline,
    ),
    index('career_opportunity_type_status_idx').on(table.type, table.status),
  ],
);

export const popupBanner = pgTable(
  'popup_banner',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    titleVi: varchar('title_vi', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }),
    imageUrl: text('image_url').notNull(),
    imageAltVi: varchar('image_alt_vi', { length: 255 }),
    imageAltEn: varchar('image_alt_en', { length: 255 }),
    linkUrl: text('link_url').notNull(),
    openInNewTab: boolean('open_in_new_tab').default(false).notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    isActive: boolean('is_active').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('popup_banner_active_schedule_idx').on(
      table.isActive,
      table.startsAt,
      table.endsAt,
    ),
  ],
);

export const research = pgTable('research', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 20 }).notNull(), // 'PROJECT' | 'PUBLICATION'

  // Common fields
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).unique(),
  abstract: text('abstract'),

  authors: text('authors'),
  principalInvestigator: varchar('principal_investigator', { length: 255 }),

  unit: varchar('unit', { length: 255 }), // SIT, TTU, Faculty...
  researchField: varchar('research_field', { length: 255 }),

  // Project-specific fields
  sponsor: varchar('sponsor', { length: 255 }),
  fundingAmount: varchar('funding_amount', { length: 100 }), // Using varchar for flexibility with formatting
  startYear: integer('start_year'),
  endYear: integer('end_year'),
  status: varchar('status', { length: 20 }), // 'ONGOING' | 'COMPLETED'

  // Publication-specific fields
  journalName: varchar('journal_name', { length: 255 }),
  publisher: varchar('publisher', { length: 255 }),
  publicationYear: integer('publication_year'),
  doi: varchar('doi', { length: 255 }),
  pdfUrl: text('pdf_url'),

  // Metadata
  keywords: text('keywords'),
  language: varchar('language', { length: 5 }).default('vi'), // 'vi' | 'en'

  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Achievements table
export const achievement = pgTable('achievement', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'HACKATHON' | 'AWARD' | 'SCHOLARSHIP' | 'RESEARCH' | 'COMPETITION' | 'OTHER'
  description: text('description'),

  // Student & Project info
  studentNames: text('student_names'), // Semicolon-separated: "Nguyễn Hoài Duy; Huỳnh Văn Đông"
  projectName: varchar('project_name', { length: 255 }),

  // Context info
  organization: varchar('organization', { length: 255 }), // Ancient8, Bộ GD&ĐT, TTU...
  level: varchar('level', { length: 50 }), // 'UNIVERSITY' | 'NATIONAL' | 'INTERNATIONAL'
  rank: varchar('rank', { length: 100 }), // Nhất / Nhì / Ba / Finalist
  reward: varchar('reward', { length: 255 }), // 2000 USD, học bổng, giấy chứng nhận...
  achievedYear: integer('achieved_year'),

  // Display & visibility
  isHighlight: boolean('is_highlight').default(false),
  visibility: varchar('visibility', { length: 20 }).default('PUBLIC'), // 'PUBLIC' | 'INTERNAL'

  // Image
  coverImage: text('cover_image'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Alumni Tables

export const alumni = pgTable('alumni', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),

  fullName: varchar('full_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),

  graduationYear: integer('graduation_year'),
  program: varchar('program', { length: 255 }), // CNTT, AI, Data Science...
  degree: varchar('degree', { length: 50 }), // Bachelor | Master | PhD

  shortBio: text('short_bio'), // 1–2 neutral sentences
  personalStory: text('personal_story'), // 150–300 words (optional)

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const alumniAcademicProfile = pgTable('alumni_academic_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  alumniId: uuid('alumni_id')
    .references(() => alumni.id, { onDelete: 'cascade' })
    .notNull(),

  major: varchar('major', { length: 255 }),
  thesisTitle: text('thesis_title'),
  advisor: varchar('advisor', { length: 255 }),
  researchArea: varchar('research_area', { length: 255 }),

  honors: text('honors'), // Scholarships, awards
  notes: text('notes'),
});

export const alumniCareer = pgTable('alumni_career', {
  id: uuid('id').primaryKey().defaultRandom(),
  alumniId: uuid('alumni_id')
    .references(() => alumni.id, { onDelete: 'cascade' })
    .notNull(),

  organization: varchar('organization', { length: 255 }),
  role: varchar('role', { length: 255 }),
  industry: varchar('industry', { length: 100 }), // Tech, Academia, Finance…

  location: varchar('location', { length: 255 }),
  startYear: integer('start_year'),
  endYear: integer('end_year'), // null = current

  description: text('description'),
});

export const alumniAchievement = pgTable('alumni_achievement', {
  id: uuid('id').primaryKey().defaultRandom(),
  alumniId: uuid('alumni_id')
    .references(() => alumni.id, { onDelete: 'cascade' })
    .notNull(),

  type: varchar('type', { length: 50 }), // award | publication | startup | patent
  title: varchar('title', { length: 255 }),
  description: text('description'),

  year: integer('year'),
  link: text('link'),
});

export const alumniSection = pgTable('alumni_section', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).unique().notNull(), // international-corporations

  titleVi: varchar('title_vi', { length: 255 }),
  titleEn: varchar('title_en', { length: 255 }),

  descriptionVi: text('description_vi'),
  descriptionEn: text('description_en'),

  displayOrder: integer('display_order'),
  isActive: boolean('is_active').default(true),
});

export const alumniSectionMember = pgTable('alumni_section_member', {
  id: uuid('id').primaryKey().defaultRandom(),
  alumniId: uuid('alumni_id')
    .references(() => alumni.id, { onDelete: 'cascade' })
    .notNull(),
  sectionId: uuid('section_id')
    .references(() => alumniSection.id, { onDelete: 'cascade' })
    .notNull(),

  customTitle: varchar('custom_title', { length: 255 }), // override: Data Scientist @ Meta
  customQuote: text('custom_quote'), // Quote specific to this section

  displayOrder: integer('display_order'),
  isFeatured: boolean('is_featured').default(false),
});

export const alumniContact = pgTable('alumni_contact', {
  id: uuid('id').primaryKey().defaultRandom(),
  alumniId: uuid('alumni_id')
    .references(() => alumni.id, { onDelete: 'cascade' })
    .notNull(),

  type: varchar('type', { length: 50 }), // linkedin | github | scholar | website
  url: text('url'),

  visibility: varchar('visibility', { length: 20 }).default('public'), // public | internal | hidden
});

export const alumniMeta = pgTable('alumni_meta', {
  alumniId: uuid('alumni_id')
    .primaryKey()
    .references(() => alumni.id, { onDelete: 'cascade' }),

  visibility: varchar('visibility', { length: 20 }).default('public'), // public | internal
  lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
  verifiedBy: varchar('verified_by', { length: 255 }),
});

// Relations for Alumni tables

export const alumniRelations = relations(alumni, ({ one, many }) => ({
  academicProfile: one(alumniAcademicProfile), // Assuming 1:1 for simplicity based on "one profile"
  careers: many(alumniCareer),
  achievements: many(alumniAchievement),
  contacts: many(alumniContact),
  sectionMembers: many(alumniSectionMember),
  meta: one(alumniMeta),
}));

export const alumniAcademicProfileRelations = relations(
  alumniAcademicProfile,
  ({ one }) => ({
    alumni: one(alumni, {
      fields: [alumniAcademicProfile.alumniId],
      references: [alumni.id],
    }),
  }),
);

export const alumniCareerRelations = relations(alumniCareer, ({ one }) => ({
  alumni: one(alumni, {
    fields: [alumniCareer.alumniId],
    references: [alumni.id],
  }),
}));

export const alumniAchievementRelations = relations(
  alumniAchievement,
  ({ one }) => ({
    alumni: one(alumni, {
      fields: [alumniAchievement.alumniId],
      references: [alumni.id],
    }),
  }),
);

export const alumniSectionRelations = relations(alumniSection, ({ many }) => ({
  members: many(alumniSectionMember),
}));

export const alumniSectionMemberRelations = relations(
  alumniSectionMember,
  ({ one }) => ({
    alumni: one(alumni, {
      fields: [alumniSectionMember.alumniId],
      references: [alumni.id],
    }),
    section: one(alumniSection, {
      fields: [alumniSectionMember.sectionId],
      references: [alumniSection.id],
    }),
  }),
);

export const alumniContactRelations = relations(alumniContact, ({ one }) => ({
  alumni: one(alumni, {
    fields: [alumniContact.alumniId],
    references: [alumni.id],
  }),
}));

export const alumniMetaRelations = relations(alumniMeta, ({ one }) => ({
  alumni: one(alumni, {
    fields: [alumniMeta.alumniId],
    references: [alumni.id],
  }),
}));

// Faculty Tables

export const faculty = pgTable('faculty', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),

  fullName: varchar('full_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),

  academicTitle: varchar('academic_title', { length: 50 }), // TS., PGS.TS., ThS.
  position: varchar('position', { length: 255 }), // Dean, Associate Professor, Lecturer
  department: varchar('department', { length: 255 }), // School of Information Technology

  quote: text('quote'), // philosophy quote
  bioShort: text('bio_short'), // 2-3 sentence introduction

  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const facultyAcademicTimeline = pgTable('faculty_academic_timeline', {
  id: uuid('id').primaryKey().defaultRandom(),
  facultyId: uuid('faculty_id')
    .references(() => faculty.id, { onDelete: 'cascade' })
    .notNull(),

  degree: varchar('degree', { length: 50 }), // PhD, MSc, BSc
  field: varchar('field', { length: 255 }), // Artificial Intelligence
  institution: varchar('institution', { length: 255 }), // Stanford University
  country: varchar('country', { length: 100 }),

  startYear: integer('start_year'),
  endYear: integer('end_year'),

  description: text('description'),
  displayOrder: integer('display_order'),
});

export const facultyResearchArea = pgTable('faculty_research_area', {
  id: uuid('id').primaryKey().defaultRandom(),
  facultyId: uuid('faculty_id')
    .references(() => faculty.id, { onDelete: 'cascade' })
    .notNull(),

  title: varchar('title', { length: 255 }), // Deep Learning
  description: text('description'),
  displayOrder: integer('display_order'),
});

export const facultyPublication = pgTable('faculty_publication', {
  id: uuid('id').primaryKey().defaultRandom(),
  facultyId: uuid('faculty_id')
    .references(() => faculty.id, { onDelete: 'cascade' })
    .notNull(),

  title: text('title'),
  venue: varchar('venue', { length: 255 }), // IEEE, Nature, ICML…
  year: integer('year'),

  publicationType: varchar('publication_type', { length: 50 }), // journal | conference
  doi: varchar('doi', { length: 255 }),
  publisherUrl: text('publisher_url'),

  displayOrder: integer('display_order'),
});

export const facultyCourse = pgTable('faculty_course', {
  id: uuid('id').primaryKey().defaultRandom(),
  facultyId: uuid('faculty_id')
    .references(() => faculty.id, { onDelete: 'cascade' })
    .notNull(),
  courseId: uuid('course_id')
    .references(() => course.courseId, { onDelete: 'cascade' })
    .notNull(),
});

export const facultyContact = pgTable('faculty_contact', {
  id: uuid('id').primaryKey().defaultRandom(),
  facultyId: uuid('faculty_id')
    .references(() => faculty.id, { onDelete: 'cascade' })
    .notNull(),

  type: varchar('type', { length: 50 }), // email | phone | scholar | linkedin
  value: text('value'),

  visibility: varchar('visibility', { length: 20 }).default('public'), // public | internal
});

export const facultyMeta = pgTable('faculty_meta', {
  facultyId: uuid('faculty_id')
    .primaryKey()
    .references(() => faculty.id, { onDelete: 'cascade' }),

  profileVisibility: varchar('profile_visibility', { length: 20 }).default(
    'public',
  ), // public | internal
  lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }),
  updatedBy: varchar('updated_by', { length: 255 }),
});

// Relations for Faculty tables

export const facultyRelations = relations(faculty, ({ one, many }) => ({
  academicTimeline: many(facultyAcademicTimeline),
  researchAreas: many(facultyResearchArea),
  publications: many(facultyPublication),
  courses: many(facultyCourse),
  contacts: many(facultyContact),
  meta: one(facultyMeta),
}));

export const facultyAcademicTimelineRelations = relations(
  facultyAcademicTimeline,
  ({ one }) => ({
    faculty: one(faculty, {
      fields: [facultyAcademicTimeline.facultyId],
      references: [faculty.id],
    }),
  }),
);

export const facultyResearchAreaRelations = relations(
  facultyResearchArea,
  ({ one }) => ({
    faculty: one(faculty, {
      fields: [facultyResearchArea.facultyId],
      references: [faculty.id],
    }),
  }),
);

export const facultyPublicationRelations = relations(
  facultyPublication,
  ({ one }) => ({
    faculty: one(faculty, {
      fields: [facultyPublication.facultyId],
      references: [faculty.id],
    }),
  }),
);

export const facultyCourseRelations = relations(facultyCourse, ({ one }) => ({
  faculty: one(faculty, {
    fields: [facultyCourse.facultyId],
    references: [faculty.id],
  }),
  course: one(course, {
    fields: [facultyCourse.courseId],
    references: [course.courseId],
  }),
}));

export const facultyContactRelations = relations(facultyContact, ({ one }) => ({
  faculty: one(faculty, {
    fields: [facultyContact.facultyId],
    references: [faculty.id],
  }),
}));

export const facultyMetaRelations = relations(facultyMeta, ({ one }) => ({
  faculty: one(faculty, {
    fields: [facultyMeta.facultyId],
    references: [faculty.id],
  }),
}));

// Student handbook: one row per school year. Content is Yoopta value (same as news).
export const handbook = pgTable('handbook', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolYear: varchar('school_year', { length: 20 }).unique().notNull(), // "2023-2024"
  status: varchar('status', { length: 20 }).default('draft'), // 'draft' | 'published'
  contentVi: jsonb('content_vi'), // Yoopta editor state
  contentEn: jsonb('content_en'),
  pdfUrlVi: text('pdf_url_vi'),
  pdfUrlEn: text('pdf_url_en'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Student portfolio: one row per student, served at /[slug] on the public site.
// Deliberately separate from the `alumni` tables — alumni are graduated and
// verified by admins, portfolios are self-service and student-owned.
export const studentPortfolio = pgTable('student_portfolio', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),

  fullName: varchar('full_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  title: varchar('title', { length: 255 }), // "Sinh viên Khoa học Máy tính"

  shortBio: text('short_bio'), // hero tagline, 1-2 sentences
  about: text('about'), // longer About section

  program: varchar('program', { length: 255 }),
  studentYear: integer('student_year'), // enrollment year, e.g. 2023
  location: varchar('location', { length: 255 }),

  isPublished: boolean('is_published').default(false),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const studentPortfolioSkill = pgTable('student_portfolio_skill', {
  id: uuid('id').primaryKey().defaultRandom(),
  portfolioId: uuid('portfolio_id')
    .references(() => studentPortfolio.id, { onDelete: 'cascade' })
    .notNull(),

  category: varchar('category', { length: 100 }), // "Programming Languages", "Frameworks"
  name: varchar('name', { length: 100 }).notNull(),
  displayOrder: integer('display_order').default(0),
});

export const studentPortfolioProject = pgTable('student_portfolio_project', {
  id: uuid('id').primaryKey().defaultRandom(),
  portfolioId: uuid('portfolio_id')
    .references(() => studentPortfolio.id, { onDelete: 'cascade' })
    .notNull(),

  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  techStack: jsonb('tech_stack'), // string[]
  role: varchar('role', { length: 255 }),
  demoUrl: text('demo_url'),
  repoUrl: text('repo_url'),

  isFeatured: boolean('is_featured').default(false),
  displayOrder: integer('display_order').default(0),
});

export const studentPortfolioExperience = pgTable(
  'student_portfolio_experience',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    portfolioId: uuid('portfolio_id')
      .references(() => studentPortfolio.id, { onDelete: 'cascade' })
      .notNull(),

    organization: varchar('organization', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }).notNull(),
    startDate: varchar('start_date', { length: 20 }), // "2024-06"
    endDate: varchar('end_date', { length: 20 }), // null = present
    description: text('description'),
    displayOrder: integer('display_order').default(0),
  },
);

export const studentPortfolioEducation = pgTable(
  'student_portfolio_education',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    portfolioId: uuid('portfolio_id')
      .references(() => studentPortfolio.id, { onDelete: 'cascade' })
      .notNull(),

    school: varchar('school', { length: 255 }).notNull(),
    degree: varchar('degree', { length: 100 }),
    field: varchar('field', { length: 255 }),
    startYear: integer('start_year'),
    endYear: integer('end_year'),
    displayOrder: integer('display_order').default(0),
  },
);

export const studentPortfolioAchievement = pgTable(
  'student_portfolio_achievement',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    portfolioId: uuid('portfolio_id')
      .references(() => studentPortfolio.id, { onDelete: 'cascade' })
      .notNull(),

    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    year: integer('year'),
    link: text('link'),
    displayOrder: integer('display_order').default(0),
  },
);

export const studentPortfolioContact = pgTable('student_portfolio_contact', {
  id: uuid('id').primaryKey().defaultRandom(),
  portfolioId: uuid('portfolio_id')
    .references(() => studentPortfolio.id, { onDelete: 'cascade' })
    .notNull(),

  type: varchar('type', { length: 50 }).notNull(), // email | github | linkedin | website | facebook
  value: text('value').notNull(),
  displayOrder: integer('display_order').default(0),
});

export const studentPortfolioRelations = relations(
  studentPortfolio,
  ({ many }) => ({
    skills: many(studentPortfolioSkill),
    projects: many(studentPortfolioProject),
    experiences: many(studentPortfolioExperience),
    education: many(studentPortfolioEducation),
    achievements: many(studentPortfolioAchievement),
    contacts: many(studentPortfolioContact),
  }),
);

export const studentPortfolioSkillRelations = relations(
  studentPortfolioSkill,
  ({ one }) => ({
    portfolio: one(studentPortfolio, {
      fields: [studentPortfolioSkill.portfolioId],
      references: [studentPortfolio.id],
    }),
  }),
);

export const studentPortfolioProjectRelations = relations(
  studentPortfolioProject,
  ({ one }) => ({
    portfolio: one(studentPortfolio, {
      fields: [studentPortfolioProject.portfolioId],
      references: [studentPortfolio.id],
    }),
  }),
);

export const studentPortfolioExperienceRelations = relations(
  studentPortfolioExperience,
  ({ one }) => ({
    portfolio: one(studentPortfolio, {
      fields: [studentPortfolioExperience.portfolioId],
      references: [studentPortfolio.id],
    }),
  }),
);

export const studentPortfolioEducationRelations = relations(
  studentPortfolioEducation,
  ({ one }) => ({
    portfolio: one(studentPortfolio, {
      fields: [studentPortfolioEducation.portfolioId],
      references: [studentPortfolio.id],
    }),
  }),
);

export const studentPortfolioAchievementRelations = relations(
  studentPortfolioAchievement,
  ({ one }) => ({
    portfolio: one(studentPortfolio, {
      fields: [studentPortfolioAchievement.portfolioId],
      references: [studentPortfolio.id],
    }),
  }),
);

export const studentPortfolioContactRelations = relations(
  studentPortfolioContact,
  ({ one }) => ({
    portfolio: one(studentPortfolio, {
      fields: [studentPortfolioContact.portfolioId],
      references: [studentPortfolio.id],
    }),
  }),
);
