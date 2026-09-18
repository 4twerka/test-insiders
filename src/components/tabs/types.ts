import type { LucideIcon } from "lucide-react";

export type TabDefinition = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export type TabsState = {
  order: string[];
  pinned: string[];
};
