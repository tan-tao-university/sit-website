"use client";

import Link from "next/link";
import { Home, Headphones } from "lucide-react";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <main className="bg-white min-h-[60vh] flex flex-col font-sans antialiased py-20">
        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center py-16">
          {/* 404 Visual */}
          <div className="relative w-full max-w-xl mb-8">
            <div className="flex items-center justify-center gap-3 md:gap-6 relative z-10">
              {/* Left Card - 4 */}
              <div className="w-24 h-32 md:w-32 md:h-44 bg-slate-50 border-2 border-[#1A1A1A] rounded-lg transform -rotate-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/20"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/20"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/20"></div>
                </div>
                <span className="text-5xl md:text-7xl font-black text-[#1A1A1A] select-none">
                  4
                </span>
              </div>

              {/* Center - 0 */}
              <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center transform translate-y-3 relative">
                <span className="text-6xl md:text-8xl font-black text-[#BA4811] select-none">
                  0
                </span>
                <div className="absolute -top-6 -right-6">
                  <span className="text-[#1A1A1A]/10 text-2xl">{"</>"}</span>
                </div>
                <div className="absolute -bottom-6 -left-8">
                  <span className="text-[#1A1A1A]/10 text-xl">{"{ }"}</span>
                </div>
              </div>

              {/* Right Card - 4 */}
              <div className="w-24 h-32 md:w-32 md:h-44 bg-slate-50 border-2 border-[#1A1A1A] rounded-lg transform rotate-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/20"></div>
                </div>
                <span className="text-5xl md:text-7xl font-black text-[#1A1A1A] select-none">
                  4
                </span>
              </div>
            </div>

            {/* Decorative SVG Elements */}
            <svg
              className="absolute inset-0 w-full h-full -z-10 opacity-20"
              fill="none"
              viewBox="0 0 400 300"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="text-slate-200"
                d="M40 40C55 35 80 65 95 60"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
              <path
                className="text-slate-200"
                d="M320 240C335 235 360 265 375 260"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
              <circle
                className="text-slate-100"
                cx="340"
                cy="80"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                className="text-slate-200"
                d="M60 260L75 275M75 260L60 275"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div className="space-y-4 max-w-xl mx-auto">
            <h1 className="font-roboto-condensed text-3xl md:text-4xl font-extrabold text-[#1A1A1A] leading-tight">
              Ooops! Có vẻ như bạn đã đi lạc.
            </h1>
            <p className="text-base md:text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
              Chúng tôi không thể tìm thấy trang bạn yêu cầu. Đừng lo lắng,
              chúng ta có thể quay lại điểm bắt đầu.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/"
              className="px-8 py-3 bg-[#BA4811] text-white font-bold rounded-full shadow-lg hover:shadow-[#BA4811]/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
            >
              Quay lại Trang Chủ
              <Home className="h-4 w-4" />
            </Link>
            <a
              href="https://www.facebook.com/sit.ttu.edu.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A1A1A] font-semibold hover:text-[#BA4811] transition-colors flex items-center gap-2 py-1 border-b-2 border-transparent hover:border-[#BA4811] text-sm"
            >
              Liên hệ hỗ trợ
              <Headphones className="h-4 w-4" />
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
