import Link from "next/link";
import type { SiteLocale } from "@/lib/program-pages";
import type { CareerOpportunity } from "@/lib/api";

import { ArrowIcon } from "@/components/icons/ArrowIcon";
import CareerOpportunityList from "@/components/CareerOpportunityList";

const copyByLocale = {
  vi: {
    eyebrow: "Việc làm & thực tập",
    title: "Chuẩn bị tốt trước khi cơ hội xuất hiện.",
    description:
      "Một điểm bắt đầu rõ ràng để sinh viên SIT xây hồ sơ, tìm trải nghiệm thực tế và sẵn sàng cho bước chuyển từ giảng đường đến môi trường công nghệ.",
    primaryAction: "Trao đổi với Khoa",
    secondaryAction: "Xem lộ trình chuẩn bị",
    statusLabel: "Cơ hội tuyển dụng",
    openTitle: "Cơ hội thực tập và việc làm đang mở",
    openDescription:
      "Các vị trí dưới đây được tổng hợp cho sinh viên SIT. Hãy đọc kỹ yêu cầu, thời hạn và điều chỉnh hồ sơ trước khi ứng tuyển.",
    statusTitle: "Danh sách vị trí đang được cập nhật",
    statusDescription:
      "Hiện chưa có vị trí việc làm hoặc thực tập được công bố trên website. Khi có thông tin đã được xác minh từ doanh nghiệp và Khoa, cơ hội mới sẽ xuất hiện tại đây.",
    employerTitle: "Dành cho doanh nghiệp",
    employerDescription:
      "Gửi thông tin tuyển dụng, thực tập hoặc đề xuất hợp tác cùng sinh viên SIT qua email của Khoa.",
    employerAction: "Gửi cơ hội tuyển dụng",
    followAction: "Theo dõi thông tin từ Khoa",
    journeyEyebrow: "Lộ trình nghề nghiệp",
    journeyTitle: "Bốn bước để hồ sơ sẵn sàng hơn.",
    journeyDescription:
      "Không chờ đến năm cuối mới bắt đầu. Mỗi bước dưới đây có thể được hoàn thiện dần trong quá trình học.",
    steps: [
      {
        title: "Xác định hướng đi",
        text: "Chọn nhóm vai trò phù hợp với thế mạnh: phần mềm, dữ liệu, AI, hệ thống hoặc nghiên cứu.",
      },
      {
        title: "Xây bằng chứng năng lực",
        text: "Biến bài tập, sản phẩm và dự án nghiên cứu thành portfolio có bối cảnh, vai trò và kết quả rõ ràng.",
      },
      {
        title: "Chuẩn hóa hồ sơ",
        text: "Giữ CV ngắn gọn, cập nhật GitHub và điều chỉnh nội dung theo từng vị trí muốn ứng tuyển.",
      },
      {
        title: "Luyện trao đổi chuyên môn",
        text: "Chuẩn bị cách trình bày quyết định kỹ thuật, bài học từ dự án và câu hỏi dành cho nhà tuyển dụng.",
      },
    ],
    toolkitEyebrow: "Bộ công cụ ứng tuyển",
    toolkitTitle: "Tập trung vào những gì nhà tuyển dụng có thể kiểm chứng.",
    toolkit: [
      {
        label: "CV",
        title: "Một trang, đúng trọng tâm",
        text: "Ưu tiên kỹ năng liên quan, dự án tiêu biểu, phạm vi công việc và kết quả có thể đo lường.",
      },
      {
        label: "Portfolio",
        title: "Cho thấy cách bạn giải quyết vấn đề",
        text: "Mỗi dự án nên có mục tiêu, công nghệ, phần việc cá nhân, ảnh minh họa và liên kết mã nguồn khi phù hợp.",
      },
      {
        label: "Phỏng vấn",
        title: "Trình bày tư duy, không chỉ đáp án",
        text: "Luyện giải thích giả định, lựa chọn kỹ thuật, đánh đổi và cách bạn kiểm tra chất lượng sản phẩm.",
      },
    ],
    nextTitle: "Tiếp tục từ trải nghiệm thật tại SIT.",
    nextDescription:
      "Hoạt động học thuật, dự án và câu chuyện cựu sinh viên có thể giúp bạn định hình bước tiếp theo.",
    activities: "Khám phá hoạt động",
    alumni: "Gặp gỡ cựu sinh viên",
  },
  en: {
    eyebrow: "Jobs & internships",
    title: "Be ready before the opportunity arrives.",
    description:
      "A clear starting point for SIT students to build credible profiles, gain practical experience and prepare for the transition from university to technology careers.",
    primaryAction: "Talk to the School",
    secondaryAction: "View the preparation path",
    statusLabel: "Open opportunities",
    openTitle: "Open internships and jobs",
    openDescription:
      "These opportunities are curated for SIT students. Review the requirements and deadline, then tailor your application before applying.",
    statusTitle: "The opportunity list is being updated",
    statusDescription:
      "No job or internship has been published on the website yet. Verified opportunities from employers and the School will appear here when available.",
    employerTitle: "For employers",
    employerDescription:
      "Share a job, internship or collaboration proposal for SIT students through the School's email.",
    employerAction: "Share an opportunity",
    followAction: "Follow School updates",
    journeyEyebrow: "Career journey",
    journeyTitle: "Four steps toward a stronger application.",
    journeyDescription:
      "Do not wait until the final year. Each step can be developed progressively throughout your studies.",
    steps: [
      {
        title: "Choose a direction",
        text: "Identify roles that match your strengths across software, data, AI, systems or research.",
      },
      {
        title: "Build proof of ability",
        text: "Turn coursework, products and research into portfolio cases with clear context, ownership and outcomes.",
      },
      {
        title: "Refine your profile",
        text: "Keep the résumé concise, update GitHub and tailor the content to each role you pursue.",
      },
      {
        title: "Practise technical conversations",
        text: "Prepare to explain technical decisions, project lessons and thoughtful questions for employers.",
      },
    ],
    toolkitEyebrow: "Application toolkit",
    toolkitTitle: "Focus on what employers can verify.",
    toolkit: [
      {
        label: "Résumé",
        title: "One page, clearly focused",
        text: "Prioritise relevant skills, selected projects, your scope of work and measurable outcomes.",
      },
      {
        label: "Portfolio",
        title: "Show how you solve problems",
        text: "Each project should explain the goal, technology, your contribution, visuals and source links where appropriate.",
      },
      {
        label: "Interview",
        title: "Explain the thinking, not only the answer",
        text: "Practise discussing assumptions, technical choices, trade-offs and how you validate product quality.",
      },
    ],
    nextTitle: "Continue with real experiences at SIT.",
    nextDescription:
      "Academic activities, projects and alumni stories can help you shape your next step.",
    activities: "Explore activities",
    alumni: "Meet SIT alumni",
  },
} as const;

export default function StudentCareersPageContent({
  locale,
  opportunities,
}: {
  locale: SiteLocale;
  opportunities: CareerOpportunity[];
}) {
  const copy = copyByLocale[locale];
  const activitiesPath =
    locale === "vi" ? "/vi/sinh-vien/hoat-dong" : "/en/students/activities";
  const alumniPath =
    locale === "vi" ? "/vi/sinh-vien/cuu-sinh-vien" : "/en/students/alumni";

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#171b25]">
      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20 lg:pb-20 lg:pt-16">
          <div>
            <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
              <span className="h-px w-12 bg-current" />
              {copy.eyebrow}
            </div>
            <h1 className="mt-7 max-w-[13ch] text-[2.8rem] font-bold leading-[1.03] tracking-[-0.045em] text-balance sm:text-[3.6rem] lg:text-[4rem]">
              {copy.title}
            </h1>
          </div>

          <div className="border-l-2 border-[#BA4811] pl-6 sm:pl-8">
            <p className="max-w-xl text-base leading-8 text-[#626661] sm:text-lg">
              {copy.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href="https://www.facebook.com/sit.ttu.edu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center bg-[#BA4811] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {copy.primaryAction} <ArrowIcon direction="up-right" size={16} />
              </a>
              <a
                href="#lo-trinh"
                className="text-sm font-semibold text-[#5b321f] underline decoration-[#BA4811]/35 underline-offset-8 transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {copy.secondaryAction}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div
            className={`border-t-2 border-[#171b25] ${
              opportunities.length === 0 ? "border-b-2" : ""
            }`}
          >
            <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
            <div className="py-8 lg:pr-14">
              <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#BA4811]">
                {copy.statusLabel}
              </p>
              <h2 className="mt-4 max-w-2xl text-[2rem] font-bold leading-tight tracking-[-0.04em] sm:text-[2.6rem]">
                {opportunities.length > 0 ? copy.openTitle : copy.statusTitle}
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-[#666a65] sm:text-base">
                {opportunities.length > 0
                  ? copy.openDescription
                  : copy.statusDescription}
              </p>
              {opportunities.length === 0 && (
                <a
                  href="https://www.facebook.com/sit.ttu.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-11 items-center border border-[#BA4811] px-5 text-sm font-semibold text-[#BA4811] transition-colors hover:bg-[#BA4811] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                >
                  {copy.followAction}{" "}
                  <ArrowIcon direction="up-right" size={16} />
                </a>
              )}
            </div>
            <div className="border-t border-[#d8d3ce] py-8 lg:border-l lg:border-t-0 lg:pl-10">
              <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#8b8e89]">
                {copy.employerTitle}
              </p>
              <p className="mt-4 text-sm leading-7 text-[#666a65]">
                {copy.employerDescription}
              </p>
              <a
                href="https://www.facebook.com/sit.ttu.edu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex text-sm font-semibold text-[#BA4811] underline decoration-[#BA4811]/35 underline-offset-6 hover:decoration-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {copy.employerAction} <ArrowIcon direction="up-right" size={16} />
              </a>
            </div>
            </div>
          {opportunities.length > 0 && (
            <CareerOpportunityList
              opportunities={opportunities}
              locale={locale}
            />
          )}
          </div>
        </div>
      </section>

      <section id="lo-trinh" className="scroll-mt-24 border-y border-[#171b25]/15 bg-[#f7f4f1] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-20">
            <div>
              <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.17em] text-[#BA4811]">
                {copy.journeyEyebrow}
              </p>
              <h2 className="mt-4 max-w-[14ch] text-[2.25rem] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[3rem]">
                {copy.journeyTitle}
              </h2>
            </div>
            <p className="max-w-xl border-l-2 border-[#BA4811] pl-5 text-sm leading-7 text-[#686c67]">
              {copy.journeyDescription}
            </p>
          </div>

          <div className="mt-12 grid border-t-2 border-[#171b25] md:grid-cols-2 lg:grid-cols-4">
            {copy.steps.map((step, index) => (
              <article
                key={step.title}
                className="border-b border-[#d8d3ce] py-7 md:px-6 md:first:pl-0 lg:border-r lg:last:border-r-0 lg:last:pr-0"
              >
                <span className="font-mono text-[0.62rem] font-semibold text-[#BA4811]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-xl font-bold leading-snug tracking-[-0.025em]">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#666a65]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.17em] text-[#BA4811]">
            {copy.toolkitEyebrow}
          </p>
          <h2 className="mt-4 max-w-3xl text-[2.25rem] font-bold leading-[1.08] tracking-[-0.045em] sm:text-[3rem]">
            {copy.toolkitTitle}
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {copy.toolkit.map((item) => (
              <article key={item.label} className="border-t-2 border-[#171b25] py-6">
                <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-[#BA4811]">
                  {item.label}
                </p>
                <h3 className="mt-5 text-xl font-bold leading-snug tracking-[-0.025em]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#666a65]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#171b25]/15 bg-[#f7f4f1] py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-[2rem] font-bold leading-tight tracking-[-0.04em] sm:text-[2.5rem]">
              {copy.nextTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#666a65]">
              {copy.nextDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={activitiesPath}
              className="inline-flex min-h-12 items-center border border-[#BA4811] px-5 text-sm font-semibold text-[#BA4811] transition-colors hover:bg-[#BA4811] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
            >
              {copy.activities} <ArrowIcon direction="up-right" size={16} />
            </Link>
            <Link
              href={alumniPath}
              className="inline-flex min-h-12 items-center bg-[#BA4811] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
            >
              {copy.alumni} <ArrowIcon direction="up-right" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
