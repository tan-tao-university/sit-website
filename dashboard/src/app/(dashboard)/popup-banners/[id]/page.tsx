"use client";

import { useParams } from "next/navigation";
import PopupBannerFormPage from "../popup-banner-form-page";

export default function EditPopupBannerPage() {
  const { id } = useParams<{ id: string }>();
  return <PopupBannerFormPage bannerId={id} />;
}
