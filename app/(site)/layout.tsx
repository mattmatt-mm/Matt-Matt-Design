import { Column } from "@/components/Column";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <Column>{children}</Column>;
}
