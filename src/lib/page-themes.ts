export type PageThemeKey = "ensemble" | "bocchi" | "nijika" | "ryo" | "kita";

export type PageTheme = {
  key: PageThemeKey;
  name: string;
  role: string;
  status: string;
  reaction: string;
  image: string;
  imageAlt: string;
};

export const PAGE_THEMES: Record<PageThemeKey, PageTheme> = {
  ensemble: {
    key: "ensemble",
    name: "Kessoku Band",
    role: "Full-band mode",
    status: "Four personalities, one semester",
    reaction: "Kessoku Band status: somehow still operational.",
    image: "/illustrations/kessoku-ensemble-hero-v3.png",
    imageAlt: "Kessoku Band performing while Bocchi buffers on stage",
  },
  bocchi: {
    key: "bocchi",
    name: "Bocchi",
    role: "Practice room · inner world",
    status: "Bocchi.exe is responding… probably",
    reaction: "SYSTEM ERROR: social battery not found. Soul evacuation in progress.",
    image: "/illustrations/bocchi-lag-reaction-v3.png",
    imageAlt: "Bocchi lagging as her soul floats out",
  },
  nijika: {
    key: "nijika",
    name: "Nijika",
    role: "Band leader · daily rhythm",
    status: "Count in, keep moving",
    reaction: "One, two, three, four—your week has a tempo. I made tabs for it!",
    image: "/illustrations/nijika-planning-v3.png",
    imageAlt: "Nijika cheerfully organizing the band with a giant planner",
  },
  ryo: {
    key: "ryo",
    name: "Ryo",
    role: "Control room · study & stats",
    status: "Metrics stable · wallet critical",
    reaction: "The data is stable. My wallet is not. Please admire the graph.",
    image: "/illustrations/ryo-analytics-v3.png",
    imageAlt: "Ryo reviewing analytics beside an empty wallet",
  },
  kita: {
    key: "kita",
    name: "Kita",
    role: "Spotlight · goals & career",
    status: "Kita-aura output: 120%",
    reaction: "Kita-aura output: 120%. Sunglasses recommended. Let’s make it happen!",
    image: "/illustrations/kita-aura-v3.png",
    imageAlt: "Kita radiating an overpowered sparkling aura",
  },
};

const ROUTE_THEMES: Record<string, PageThemeKey> = {
  "/dashboard": "ensemble",
  "/today": "nijika",
  "/weekly": "nijika",
  "/habits": "nijika",
  "/guitar": "bocchi",
  "/reflections": "bocchi",
  "/academics": "ryo",
  "/analytics": "ryo",
  "/settings": "ryo",
  "/goals": "kita",
  "/career": "kita",
  "/timeline": "kita",
};

export function getPageTheme(pathname: string) {
  const route =
    Object.keys(ROUTE_THEMES).find(
      (candidate) =>
        pathname === candidate || pathname.startsWith(`${candidate}/`),
    ) ?? "/dashboard";

  return PAGE_THEMES[ROUTE_THEMES[route]];
}

export function getThemeRoutes(theme: PageThemeKey): string[] {
  return Object.entries(ROUTE_THEMES)
    .filter(([, routeTheme]) => routeTheme === theme)
    .map(([route]) => route);
}
