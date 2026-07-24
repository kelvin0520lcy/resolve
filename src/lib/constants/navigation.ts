import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  Guitar,
  Heart,
  Home,
  ListTodo,
  MessageSquare,
  Settings,
  Target,
  Timeline,
  type LucideIcon,
} from "lucide-react";
import type { PageThemeKey } from "@/lib/page-themes";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
};

export type NavArc = {
  key: Exclude<PageThemeKey, "ensemble">;
  title: string;
  subtitle: string;
  chapter: string;
  items: NavItem[];
};

export const DASHBOARD_NAV: NavItem = {
  href: "/dashboard",
  label: "Band Dashboard",
  icon: Home,
  mobile: true,
};

export const NAV_ARCS: NavArc[] = [
  {
    key: "nijika",
    title: "Nijika’s Rhythm Desk",
    subtitle: "Plan the beat and keep the band moving",
    chapter: "Arc 01",
    items: [
      { href: "/today", label: "Today", icon: ListTodo, mobile: true },
      { href: "/weekly", label: "Weekly Plan", icon: CalendarDays },
      { href: "/habits", label: "Habits", icon: Heart },
    ],
  },
  {
    key: "bocchi",
    title: "Bocchi’s Practice Room",
    subtitle: "Practice, process, and survive the inner monologue",
    chapter: "Arc 02",
    items: [
      { href: "/guitar", label: "Guitar", icon: Guitar, mobile: true },
      { href: "/reflections", label: "Reflections", icon: MessageSquare },
    ],
  },
  {
    key: "ryo",
    title: "Ryo’s Control Room",
    subtitle: "Study the system, inspect the data, touch nothing",
    chapter: "Arc 03",
    items: [
      { href: "/academics", label: "Academics", icon: BookOpen },
      { href: "/analytics", label: "Analytics", icon: BarChart3, mobile: true },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    key: "kita",
    title: "Kita’s Spotlight",
    subtitle: "Aim forward and turn intention into momentum",
    chapter: "Arc 04",
    items: [
      { href: "/goals", label: "Goals", icon: Target, mobile: true },
      { href: "/career", label: "Career", icon: Briefcase },
      { href: "/timeline", label: "Timeline", icon: Timeline },
    ],
  },
];

export const MAIN_NAV: NavItem[] = [
  DASHBOARD_NAV,
  ...NAV_ARCS.flatMap((arc) => arc.items),
];

export const MOBILE_NAV = MAIN_NAV.filter((item) => item.mobile);

export function getNavArc(pathname: string) {
  return NAV_ARCS.find((arc) =>
    arc.items.some(
      ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
    ),
  );
}
