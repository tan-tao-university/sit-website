"use client";

import { use } from "react";

import FacultyFormPage from "../faculty-form-page";

export default function EditFacultyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <FacultyFormPage facultyId={id} />;
}
