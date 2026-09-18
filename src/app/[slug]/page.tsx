import { notFound } from "next/navigation";
import { TABS } from "@/components/tabs/tabs-data";

export function generateStaticParams() {
  return TABS.filter((tab) => tab.href !== "/").map((tab) => ({
    slug: tab.href.slice(1),
  }));
}

export default async function TabPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const tab = TABS.find((item) => item.href === `/${slug}`);
  if (!tab) notFound();

  return (
    <main className="flex-1 p-8">
      <h1 className="text-xl font-semibold text-gray-900">{tab.label}</h1>
    </main>
  );
}
