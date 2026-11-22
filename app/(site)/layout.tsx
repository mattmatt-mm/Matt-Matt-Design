import { Column } from "@/components/Column";
import { PageSlide } from "@/components/PageSlide";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Column>
      <PageSlide>{children}</PageSlide>
    </Column>
  );
}
