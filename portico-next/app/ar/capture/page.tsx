import "../../capture.css";
import "../../capture-factory.css";
import CapturePage from "@/components/capture/CapturePage";
import { captureMetadata } from "@/lib/metadata";

export const metadata = captureMetadata("ar");

export default function Page() {
  return <CapturePage lang="ar" />;
}
