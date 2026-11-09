import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModulePage, { MODULE_SLUGS } from "@/components/ModulePage";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULE_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata("en", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!(MODULE_SLUGS as readonly string[]).includes(slug)) notFound();
  return <ModulePage lang="en" slug={slug} />;
}
