# 🎨 Frontend - School of Information Technology

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-🚀-green?style=for-the-badge)](https://sit-ttu.vercel.app/)

**Frontend của website Khoa Công nghệ Thông tin - Đại học Tân Tạo**

*Modern web application với Next.js 15 và Tailwind CSS v4*

</div>

---

## 📋 Mục lục

- [🎯 Giới thiệu](#-giới-thiệu)
- [✨ Tính năng](#-tính-năng)
- [🛠 Công nghệ](#-công-nghệ)
- [🚀 Cài đặt](#-cài-đặt)
- [📁 Cấu trúc](#-cấu-trúc)
- [🎨 UI Components](#-ui-components)
- [🌍 i18n](#-i18n)
- [📱 Responsive](#-responsive)
- [🚀 Deployment](#-deployment)
- [📞 Liên hệ](#-liên-hệ)

---

## 🎯 Giới thiệu

Frontend của website chính thức Khoa Công nghệ Thông tin - Đại học Tân Tạo. Được xây dựng với Next.js 15 và Tailwind CSS v4, cung cấp giao diện hiện đại, responsive và tối ưu SEO.

> 📖 **Xem README tổng thể tại** [../README.md](../README.md)

## ✨ Tính năng

- 📱 **Responsive Design**: Tối ưu cho mọi thiết bị
- 🎨 **Modern UI/UX**: Giao diện hiện đại với Tailwind CSS và Radix UI
- 🔍 **SEO Optimized**: Metadata đầy đủ và tối ưu hóa
- 🌍 **Multilingual**: Hỗ trợ Tiếng Việt và Tiếng Anh
- ⚡ **Performance**: Next.js 15 với Turbopack
- ♿ **Accessibility**: Tuân thủ tiêu chuẩn accessibility
- 🎬 **Animations**: Framer Motion cho trải nghiệm mượt mà

## 🛠 Công nghệ

- ⚛️ **Framework**: Next.js 15.5.2
- 📝 **Language**: TypeScript
- 🎨 **Styling**: Tailwind CSS v4
- 🧩 **UI Components**: Radix UI
- 🎯 **Icons**: Lucide React
- 🎬 **Animations**: Framer Motion
- 📦 **Package Manager**: pnpm
- 🔧 **Build Tool**: Turbopack

## 🚀 Cài đặt

### 📋 Yêu cầu

- 🟢 **Node.js** >= 18.0.0
- 📦 **pnpm** >= 8.0.0

### ⚡ Quick Start

```bash
# Clone repository
git clone <repository-url>
cd sit/app

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
# http://localhost:3000
```

### 🔧 Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm dev --turbopack    # Start with Turbopack (faster)

# Production
pnpm build              # Build for production
pnpm start              # Start production server

# Code Quality
pnpm lint               # ESLint
pnpm format             # Prettier
```

## 📁 Cấu trúc

```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Internationalization routes
│   │   │   ├── about/          # About page
│   │   │   ├── news/           # News page
│   │   │   ├── programs/       # Programs page
│   │   │   ├── research/       # Research page
│   │   │   ├── students/       # Students page
│   │   │   ├── layout.tsx      # Locale layout
│   │   │   └── page.tsx        # Homepage
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Root page
│   ├── components/             # React components
│   │   ├── ui/                 # UI components (Radix UI)
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── card.tsx       # Card component
│   │   │   ├── dropdown-menu.tsx # Dropdown component
│   │   │   └── toast.tsx      # Toast component
│   │   ├── Header.tsx          # Header component
│   │   ├── Hero.tsx            # Hero section
│   │   ├── Programs.tsx        # Programs section
│   │   ├── Stats.tsx           # Statistics section
│   │   ├── Footer.tsx          # Footer component
│   │   ├── LanguageSwitcher.tsx # Language switcher
│   │   └── TextRibbon.tsx      # Text ribbon component
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.ts       # Mobile detection hook
│   │   └── use-toast.ts        # Toast hook
│   ├── lib/                    # Utility functions
│   │   ├── utils.ts            # General utilities
│   │   └── locale-utils.ts     # Locale utilities
│   ├── messages/               # i18n messages
│   │   ├── en.json             # English translations
│   │   └── vi.json             # Vietnamese translations
│   └── i18n.ts                 # i18n configuration
├── public/                     # Static assets
│   └── assets/                 # Images and media
├── components.json             # UI components config
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── package.json                # Dependencies
```

## 🎨 UI Components

Dự án sử dụng Radix UI components với Tailwind CSS:

- 🔘 **Button**: Nút bấm với nhiều variants và sizes
- 🃏 **Card**: Card component cho layout và content
- 📋 **Dropdown Menu**: Menu dropdown với keyboard navigation
- 🍞 **Toast**: Thông báo toast với animations

> 🎨 **Tất cả components được tùy chỉnh và tối ưu cho dự án**

## 🌍 i18n

Hỗ trợ đa ngôn ngữ với next-intl:

- 🇻🇳 **Tiếng Việt** (vi) - Ngôn ngữ chính
- 🇺🇸 **Tiếng Anh** (en) - Ngôn ngữ phụ

### 📁 File Structure
```
src/messages/
├── vi.json          # Vietnamese translations
└── en.json          # English translations
```

### 🔧 Configuration
```typescript
// src/i18n.ts
export const locales = ['vi', 'en'] as const;
export const defaultLocale = 'vi' as const;
```

## 📱 Responsive Design

Breakpoints được thiết kế responsive:

- 📱 **Mobile**: < 768px
- 📟 **Tablet**: 768px - 1024px
- 💻 **Desktop**: > 1024px

### 🎯 Mobile-First Approach
- Tất cả components được thiết kế mobile-first
- Progressive enhancement cho desktop
- Touch-friendly interactions

## 🚀 Deployment

### 🌐 Live Demo

**🚀 [View Live Website](https://sit-ttu.vercel.app/)**

### ☁️ Vercel (Recommended)

1. 📤 Push code lên GitHub
2. 🔗 Connect repository với Vercel
3. 🚀 Auto-deploy với mỗi commit

### 📦 Manual Deployment

```bash
# Build project
pnpm build

# Deploy static files
# Upload .next/static và .next/server folders
```

## 📊 Performance

- ⚡ **Lighthouse Score**: > 90
- 🚀 **Core Web Vitals**: Optimized
- 📦 **Bundle Size**: Minimized với tree-shaking
- 🖼️ **Images**: Optimized với Next.js Image component

## 🔍 SEO Features

- 📝 **Metadata**: Dynamic metadata cho mỗi page
- 🌍 **hreflang**: Multilingual SEO support
- 📱 **Open Graph**: Social media optimization
- 🐦 **Twitter Cards**: Twitter sharing optimization
- 🔗 **Structured Data**: JSON-LD schema markup

## 📞 Liên hệ

- 🌐 **Website**: [https://sit.ttu.edu.vn](https://sit.ttu.edu.vn)
- 🚀 **Live Demo**: [https://sit-ttu.vercel.app/](https://sit-ttu.vercel.app/)
- 📧 **Email**: [sit@ttu.edu.vn](mailto:sit@ttu.edu.vn)
- 📍 **Địa chỉ**: Đại học Tân Tạo, Long An, Việt Nam

---

<div align="center">

**🎓 Đại học Tân Tạo** - Khoa Công nghệ Thông tin

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://sit.ttu.edu.vn)

</div>