"use client";

import { use } from "react";

import AlumniFormPage from "../alumni-form-page";

export default function EditAlumniPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <AlumniFormPage alumniId={id} />;
}
