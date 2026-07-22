"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  Pencil,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormLoading } from "@/components/shared/LoadingStates";
import { useToast } from "@/hooks/use-toast";
import { api, type Event, type EventStatus } from "@/lib/api";

const statusLabel: Record<EventStatus, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  cancelled: "Đã hủy",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ViewEventPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await api.events.findOne(params.id as string);
        setEvent(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải sự kiện",
        });
        router.push("/events");
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (isLoading) {
    return <FormLoading fieldCount={6} />;
  }

  if (!event) return null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 p-8 pt-6 dashboard-reveal">
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push("/events")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Button
          type="button"
          className="cursor-pointer"
          onClick={() => router.push(`/events/${event.id}`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e2dc] bg-white">
        <div className="space-y-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                event.status === "published"
                  ? "default"
                  : event.status === "cancelled"
                    ? "destructive"
                    : "secondary"
              }
            >
              {statusLabel[event.status]}
            </Badge>
            {event.isFeatured && (
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3" />
                Nổi bật
              </Badge>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-stone-950 sm:text-3xl">
              {event.titleVi}
            </h1>
            {event.titleEn && (
              <p className="mt-1 text-base text-muted-foreground">
                {event.titleEn}
              </p>
            )}
          </div>

          <dl className="grid grid-cols-1 gap-4 rounded-xl border border-[#e8e2dc] bg-[#fdfbf9] p-5 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <dt className="text-xs text-muted-foreground">Thời gian</dt>
                <dd className="text-sm font-medium text-stone-800">
                  {formatDateTime(event.startAt)}
                  {event.endAt && (
                    <>
                      {" "}
                      &rarr; {formatDateTime(event.endAt)}
                    </>
                  )}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <dt className="text-xs text-muted-foreground">Địa điểm</dt>
                <dd className="text-sm font-medium text-stone-800">
                  {event.locationVi}
                  {event.locationEn && (
                    <span className="block text-xs text-muted-foreground">
                      {event.locationEn}
                    </span>
                  )}
                </dd>
              </div>
            </div>
            {event.registrationUrl && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Đăng ký tham gia
                  </dt>
                  <dd className="text-sm font-medium">
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {event.registrationUrl}
                    </a>
                  </dd>
                </div>
              </div>
            )}
          </dl>

          {(event.descriptionVi || event.descriptionEn) && (
            <div className="space-y-4 border-t border-[#eee9e4] pt-6">
              {event.descriptionVi && (
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-stone-950">
                    Mô tả (Tiếng Việt)
                  </h2>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-stone-600">
                    {event.descriptionVi}
                  </p>
                </div>
              )}
              {event.descriptionEn && (
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-stone-950">
                    Mô tả (Tiếng Anh)
                  </h2>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-stone-600">
                    {event.descriptionEn}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
