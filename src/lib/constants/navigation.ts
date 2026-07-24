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

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
};

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, mobile: true },
  { href: "/today", label: "Today", icon: ListTodo, mobile: true },
  { href: "/weekly", label: "Weekly Plan", icon: CalendarDays, mobile: true },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/academics", label: "Academics", icon: BookOpen },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/guitar", label: "Guitar", icon: Guitar },
  { href: "/habits", label: "Habits", icon: Heart },
  { href: "/analytics", label: "Analytics", icon: BarChart3, mobile: true },
  { href: "/reflections", label: "Reflections", icon: MessageSquare },
  { href: "/timeline", label: "Timeline", icon: Timeline },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const MOBILE_NAV = MAIN_NAV.filter((item) => item.mobile);
