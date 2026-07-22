"use client";

import { use, useEffect, useState } from "react";
import { api, type Handbook } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { HandbookForm } from "../handbook-form";

export default function EditHandbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [handbook, setHandbook] = useState<Handbook | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.handbook
      .findOne(id)
      .then(setHandbook)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="p-8 text-muted-foreground">Không tìm thấy sổ tay.</div>
    );
  }
  if (!handbook) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  // Remount the form once data arrives so the editor seeds with stored content.
  return <HandbookForm key={handbook.id} handbook={handbook} />;
}
