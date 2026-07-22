"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, AlumniSection } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils";

// Keep zod schema for type inference if needed, or just define interface
const formSchema = z.object({
  titleVi: z.string().min(1, "Vui lòng nhập tên section (Tiếng Việt)"),
  titleEn: z.string().optional(),
  slug: z.string().min(1, "Slug là bắt buộc"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSectionDialogProps {
  onSuccess: (newSection: AlumniSection) => void;
}

export function CreateSectionDialog({ onSuccess }: CreateSectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      titleVi: "",
      titleEn: "",
      slug: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      // Manual validation check if needed, but rules will handle it
      if (!values.titleVi || !values.slug) {
        return;
      }

      const newSection = await api.alumniSections.create({
        ...values,
        isActive: true,
      });

      toast({
        title: "Tạo thành công",
        description: "Section mới đã được tạo",
      });

      onSuccess(newSection);
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo section. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" type="button">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo Alumni Section mới</DialogTitle>
          <DialogDescription>
            Tạo nhanh section để gán vào profile alumni.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titleVi"
              rules={{ required: "Vui lòng nhập tên section (Tiếng Việt)" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Tiếng Việt *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-generate slug from titleVi if slug is empty
                        if (!form.getValues("slug")) {
                          form.setValue("slug", slugify(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Tiếng Anh (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              rules={{ required: "Slug là bắt buộc" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo Section
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
