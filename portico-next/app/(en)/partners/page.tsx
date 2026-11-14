import "../../capture.css";
import PartnersPage from "@/components/partners/PartnersPage";
import { partnersMetadata } from "@/lib/metadata";

export const metadata = partnersMetadata("en");

export default function Page() {
  return <PartnersPage lang="en" />;
}
