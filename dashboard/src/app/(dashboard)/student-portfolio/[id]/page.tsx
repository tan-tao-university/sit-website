"use client";

import { use } from "react";

import StudentPortfolioFormPage from "../student-portfolio-form-page";

export default function EditStudentPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <StudentPortfolioFormPage portfolioId={id} />;
}
