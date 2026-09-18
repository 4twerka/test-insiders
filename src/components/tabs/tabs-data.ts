import {
  LayoutDashboard,
  Landmark,
  Phone,
  Users,
  ShoppingCart,
  BarChart3,
  Mail,
  Settings,
  HelpCircle,
  Package,
  ListChecks,
  ShoppingBasket,
  FileText,
} from "lucide-react";
import type { TabDefinition } from "./types";

export const TABS: TabDefinition[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "banking", label: "Banking", href: "/banking", icon: Landmark },
  { id: "telefonie", label: "Telefonie", href: "/telefonie", icon: Phone },
  { id: "accounting", label: "Accounting", href: "/accounting", icon: Users },
  { id: "verkauf", label: "Verkauf", href: "/verkauf", icon: ShoppingCart },
  { id: "statistik", label: "Statistik", href: "/statistik", icon: BarChart3 },
  { id: "post-office", label: "Post Office", href: "/post-office", icon: Mail },
  { id: "administration", label: "Administration", href: "/administration", icon: Settings },
  { id: "help", label: "Help", href: "/help", icon: HelpCircle },
  { id: "warenbestand", label: "Warenbestand", href: "/warenbestand", icon: Package },
  { id: "auswahllisten", label: "Auswahllisten", href: "/auswahllisten", icon: ListChecks },
  { id: "einkauf", label: "Einkauf", href: "/einkauf", icon: ShoppingBasket },
  { id: "rechnungen", label: "Rechnungen", href: "/rechnungen", icon: FileText },
];

export const TABS_BY_ID = new Map(TABS.map((tab) => [tab.id, tab]));
