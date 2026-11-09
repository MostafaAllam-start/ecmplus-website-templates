import "../../capture.css";
import "../../capture-factory.css";
import "../../capture-tools.css";
import CapturePage from "@/components/capture/CapturePage";
import { captureMetadata } from "@/lib/metadata";

export const metadata = captureMetadata("en");

export default function Page() {
  return <CapturePage lang="en" />;
}
