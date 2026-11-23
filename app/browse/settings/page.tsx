import type { Metadata } from "next";
import { Column } from "@/components/Column";
import { AppearanceSettings } from "@/components/AppearanceSettings";

export const metadata: Metadata = {
  title: "Settings",
  alternates: { canonical: "/browse/settings" },
};

export default function SettingsPage() {
  return (
    <Column>
      <main>
        <h1 className="mb-6 text-title">Settings</h1>
        <AppearanceSettings />
      </main>
    </Column>
  );
}
