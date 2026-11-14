import "../../capture.css";
import PartnersPage from "@/components/partners/PartnersPage";
import { partnersMetadata } from "@/lib/metadata";

export const metadata = partnersMetadata("ar");

export default function Page() {
  return <PartnersPage lang="ar" />;
}
