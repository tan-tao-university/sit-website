"use client";

import { useParams } from "next/navigation";
import EventFormPage from "../event-form-page";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  return <EventFormPage eventId={id} />;
}
