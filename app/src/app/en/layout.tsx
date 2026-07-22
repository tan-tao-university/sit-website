import LayoutCustom from "@/components/LayoutCustom";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages({ locale: "en" });

  return (
    <NextIntlClientProvider messages={messages}>
      <LayoutCustom>{children}</LayoutCustom>
    </NextIntlClientProvider>
  );
}
