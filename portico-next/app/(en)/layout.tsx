import type { Viewport } from "next";
import type { ReactNode } from "react";
import RootDocument from "@/components/RootDocument";
import "../styles.css";
import "../ecmplus-logo.css";
import "../fonts.css";

export const viewport: Viewport = { themeColor: "#F4F2EE", colorScheme: "light" };

export default function Layout({ children }: { children: ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
