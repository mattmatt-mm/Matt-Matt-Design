import { permanentRedirect } from "next/navigation";
import { profilePath } from "@/lib/site";

export default function LegacyProfilePage() {
  permanentRedirect(profilePath);
}
