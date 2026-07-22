"use client";

import { useParams } from "next/navigation";
import CareerOpportunityFormPage from "../career-opportunity-form-page";

export default function EditCareerOpportunityPage() {
  const { id } = useParams<{ id: string }>();
  return <CareerOpportunityFormPage opportunityId={id} />;
}
