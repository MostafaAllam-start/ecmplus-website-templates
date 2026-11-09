import HomePage from "@/components/home/HomePage";
import { homeMetadata } from "@/lib/metadata";

export const metadata = homeMetadata("en");

export default function Page() {
  return <HomePage lang="en" />;
}
