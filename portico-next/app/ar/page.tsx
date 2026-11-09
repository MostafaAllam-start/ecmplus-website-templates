import HomePage from "@/components/home/HomePage";
import { homeMetadata } from "@/lib/metadata";

export const metadata = homeMetadata("ar");

export default function Page() {
  return <HomePage lang="ar" />;
}
