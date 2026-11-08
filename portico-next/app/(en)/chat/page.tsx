import "../../capture.css";
import "../../capture-factory.css";
import "../../capture-tools.css";
import "../../chat-scene.css";
import "../../chat.css";
import ChatPage from "@/components/chat/ChatPage";
import { chatMetadata } from "@/lib/metadata";

export const metadata = chatMetadata("en");

export default function Page() {
  return <ChatPage lang="en" />;
}
