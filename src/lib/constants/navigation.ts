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
  description: string;
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
  label: "Dashboard",
  description: "Your resolutions, next proof, and semester pulse",
  icon: Home,
  mobile: true,
};

export const SETTINGS_NAV: NavItem = {
  href: "/settings",
  label: "Settings",
  description: "Semester dates, account sync, and data controls",
  icon: Settings,
};

export const NAV_ARCS: NavArc[] = [
  {
    key: "nijika",
    title: "Nijika’s Rhythm Desk",
    subtitle: "Plan the beat and keep the band moving",
    chapter: "Arc 01",
    items: [
      {
        href: "/today",
        label: "Today",
        description: "Capture and finish today’s focused tasks",
        icon: ListTodo,
        mobile: true,
      },
      {
        href: "/weekly",
        label: "Weekly Plan",
        description: "Balance tasks across the next seven days",
        icon: CalendarDays,
      },
      {
        href: "/habits",
        label: "Habits",
        description: "Build repeatable daily and weekly rhythms",
        icon: Heart,
      },
    ],
  },
  {
    key: "bocchi",
    title: "Bocchi’s Practice Room",
    subtitle: "Practice, process, and survive the inner monologue",
    chapter: "Arc 02",
    items: [
      {
        href: "/guitar",
        label: "Guitar",
        description: "Log practice, tempo, and the next focus",
        icon: Guitar,
        mobile: true,
      },
      {
        href: "/reflections",
        label: "Reflections",
        description: "Review today and carry one adjustment forward",
        icon: MessageSquare,
      },
    ],
  },
  {
    key: "ryo",
    title: "Ryo’s Control Room",
    subtitle: "Study the system, inspect the data, touch nothing",
    chapter: "Arc 03",
    items: [
      {
        href: "/academics",
        label: "Academics",
        description: "Update module study time and assessment progress",
        icon: BookOpen,
        mobile: true,
      },
      {
        href: "/analytics",
        label: "Analytics",
        description: "Find patterns across your real activity",
        icon: BarChart3,
      },
    ],
  },
  {
    key: "kita",
    title: "Kita’s Spotlight",
    subtitle: "Aim forward and turn intention into momentum",
    chapter: "Arc 04",
    items: [
      {
        href: "/goals",
        label: "Goals",
        description: "Define outcomes and update measurable progress",
        icon: Target,
        mobile: true,
      },
      {
        href: "/career",
        label: "Career",
        description: "Log practice and move applications through stages",
        icon: Briefcase,
      },
      {
        href: "/timeline",
        label: "Timeline",
        description: "See task deadlines and semester dates chronologically",
        icon: Timeline,
      },
    ],
  },
];

export const MAIN_NAV: NavItem[] = [
  DASHBOARD_NAV,
  ...NAV_ARCS.flatMap((arc) => arc.items),
  SETTINGS_NAV,
];

export const MOBILE_NAV = MAIN_NAV.filter((item) => item.mobile);

export function getNavArc(pathname: string) {
  return NAV_ARCS.find((arc) =>
    arc.items.some(
      ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
    ),
  );
}
