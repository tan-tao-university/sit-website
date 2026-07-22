"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function FacultyPage() {
  const faculty = [
    {
      name: "PGS. Donna Cleveland",
      role: "Trưởng khoa",
      description:
        "Phó giáo sư Donna Cleveland chịu trách nhiệm đảm bảo chất lượng giảng dạy và đẩy mạnh hoạt động nghiên cứu. Bà có nhiều công trình nghiên cứu được công bố quốc tế về chuyển đổi số và phát triển học thuật bền vững.",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop",
      align: "left",
    },
    {
      name: "TS. Manny Ling",
      role: "Quyền phó trưởng khoa",
      description:
        "Chủ nhiệm cấp cao bộ môn Thiết kế Ứng dụng Sáng tạo. Ông là chuyên gia hàng đầu về Công nghệ tương tác với hơn 20 năm kinh nghiệm trong việc xây dựng các chương trình đào tạo chuẩn quốc tế.",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=750&fit=crop",
      align: "right",
    },
    {
      name: "TS. Sarah Nguyen",
      role: "Giảng viên cao cấp",
      description:
        "Chuyên gia Máy học và Xử lý ngôn ngữ tự nhiên. Tiến sĩ Sarah dẫn dắt nhiều dự án nghiên cứu về ứng dụng AI trong y tế, cam kết xây dựng cộng đồng công nghệ mạnh mẽ tại khu vực.",
      image:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=750&fit=crop",
      align: "left",
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-16">
      {/* Header - Keep Large */}
      <header className="mb-24 text-left sm:text-center max-w-3xl sm:mx-auto">
        <h1 className="font-roboto-condensed text-3xl sm:text-4xl md:text-5xl font-bold text-[#020617] dark:text-white mb-8 tracking-tight leading-tight">
          Đội ngũ giảng viên & <br className="hidden sm:block" />
          nhân viên tại SIT
        </h1>
        <div className="h-1 w-20 bg-primary sm:mx-auto mb-8"></div>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-light">
          Khoa Công nghệ Thông tin (SIT) được dẫn dắt bởi các chuyên gia xuất
          sắc và các học giả hàng đầu, cam kết mang đến môi trường học thuật
          tiên tiến cho thế hệ kế tiếp của ngành công nghệ.
        </p>
      </header>

      {/* Faculty Cards */}
      <div className="space-y-20">
        {faculty.map((member, index) => (
          <motion.article
            key={member.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`faculty-card flex flex-col ${member.align === "right" ? "md:flex-row-reverse" : "md:flex-row"
              } items-center gap-8 group`}
          >
            {/* Portrait */}
            <div className="w-full md:w-5/12 aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-slate-800 shadow-sm">
              <img
                alt={member.name}
                className="portrait-img w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                src={member.image}
              />
            </div>

            {/* Content */}
            <div
              className={`w-full md:w-7/12 flex flex-col ${member.align === "right"
                  ? "md:items-end md:text-right"
                  : "items-start"
                } py-2`}
            >
              <span className="text-primary font-medium tracking-[0.2em] text-[10px] uppercase mb-3">
                {member.role}
              </span>
              <h2 className="font-roboto-condensed text-2xl md:text-3xl text-[#020617] dark:text-white mb-4 leading-tight font-bold">
                {member.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed font-light text-base">
                {member.description}
              </p>
              <a
                className={`group/btn flex items-center space-x-3 ${member.align === "right"
                    ? "flex-row-reverse md:space-x-reverse"
                    : ""
                  } group cursor-pointer`}
                href="#"
              >
                <div className="arrow-button w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:translate-x-1">
                  {member.align === "right" ? (
                    <ArrowLeft className="text-primary group-hover:text-white h-4 w-4 transition-colors" />
                  ) : (
                    <ArrowRight className="text-primary group-hover:text-white h-4 w-4 transition-colors" />
                  )}
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#020617] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Xem hồ sơ
                </span>
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </main>
  );
}
