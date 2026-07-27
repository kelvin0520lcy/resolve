export type PageThemeKey = "ensemble" | "bocchi" | "nijika" | "ryo" | "kita";

export type PageTheme = {
  key: PageThemeKey;
  name: string;
  nameEn: string;
  role: string;
  roleJa: string;
  status: string;
  statusJa: string;
  reaction: string;
  reactionJa: string;
  image: string;
  imageAlt: string;
  cutInImage?: string;
  cutInImageAlt?: string;
};

export type PageIllustration = {
  image: string;
  imageAlt: string;
  label: string;
};

export const PAGE_THEMES: Record<PageThemeKey, PageTheme> = {
  ensemble: {
    key: "ensemble",
    name: "結束バンド",
    nameEn: "Kessoku Band",
    role: "Full-band mode",
    roleJa: "全員集合モード",
    status: "Four personalities, one semester",
    statusJa: "四人四色、ひとつの学期",
    reaction: "Kessoku Band status: somehow still operational.",
    reactionJa: "結束バンドの状態：なんだかんだ、今日も稼働中！",
    image: "/illustrations/kessoku-ensemble-hero-v3.png",
    imageAlt: "Kessoku Band performing while Bocchi buffers on stage",
    cutInImage: "/illustrations/kessoku-intermission-v4.png",
    cutInImageAlt:
      "Kessoku Band rehearsing while Bocchi lags, Nijika counts in, Ryo grooves, and Kita sparkles",
  },
  bocchi: {
    key: "bocchi",
    name: "後藤ひとり（ぼっち）",
    nameEn: "Hitori Gotoh · Bocchi",
    role: "Practice room · inner world",
    roleJa: "練習室 · 心の中",
    status: "Bocchi.exe is responding… probably",
    statusJa: "ぼっち.exe 応答中……たぶん",
    reaction:
      "U-um… SYSTEM ERROR: social battery not found. Soul evacuation in progress…",
    reactionJa:
      "あっ……システムエラー：社会性バッテリーが見つかりません。魂、退避します……。",
    image: "/illustrations/bocchi-lag-reaction-v3.png",
    imageAlt: "Bocchi lagging as her soul floats out",
    cutInImage: "/illustrations/cut-in-bocchi-v2.webp",
    cutInImageAlt:
      "Bocchi nervously enjoying a solo on her black Les Paul Custom",
  },
  nijika: {
    key: "nijika",
    name: "伊地知虹夏",
    nameEn: "Nijika Ijichi",
    role: "Band leader · daily rhythm",
    roleJa: "バンドリーダー · 毎日のリズム",
    status: "Count in, keep moving",
    statusJa: "カウントして、前へ！",
    reaction:
      "One, two, three, four! Your week has a tempo—and yes, I made tabs for it!",
    reactionJa:
      "ワン、ツー、スリー、フォー！一週間にもテンポがあるよ。もちろんタブ分けもしたからね！",
    image: "/illustrations/nijika-planning-v3.png",
    imageAlt: "Nijika cheerfully organizing the band with a giant planner",
    cutInImage: "/illustrations/cut-in-nijika-v2.webp",
    cutInImageAlt:
      "Nijika cheerfully counting in behind her red acoustic drum kit",
  },
  ryo: {
    key: "ryo",
    name: "山田リョウ",
    nameEn: "Ryo Yamada",
    role: "Control room · study & stats",
    roleJa: "コントロールルーム · 勉強と分析",
    status: "Metrics stable · wallet critical",
    statusJa: "数値は安定 · 財布は危険",
    reaction:
      "The data is stable. My wallet is not. Admire the graph; it cost less.",
    reactionJa:
      "データは安定。財布は不安定。グラフなら無料だから、眺めていけば。",
    image: "/illustrations/ryo-analytics-v3.png",
    imageAlt: "Ryo reviewing analytics beside an empty wallet",
    cutInImage: "/illustrations/cut-in-ryo-v2.webp",
    cutInImageAlt:
      "Ryo calmly enjoying a groove on her white Precision Bass",
  },
  kita: {
    key: "kita",
    name: "喜多郁代",
    nameEn: "Ikuyo Kita",
    role: "Spotlight · goals & career",
    roleJa: "スポットライト · 目標とキャリア",
    status: "Kita-aura output: 120%",
    statusJa: "喜多オーラ出力：120％",
    reaction:
      "Kita-aura at 120%! Sunglasses on—let’s make this next step shine!",
    reactionJa:
      "喜多オーラ、120％！サングラス準備よしっ。次の一歩もキラキラにしよう！",
    image: "/illustrations/kita-aura-v3.png",
    imageAlt: "Kita radiating an overpowered sparkling aura",
    cutInImage: "/illustrations/cut-in-kita-v2.webp",
    cutInImageAlt:
      "Kita smiling while playing her blue double-cut Les Paul Junior",
  },
};

const ROUTE_THEMES: Record<string, PageThemeKey> = {
  "/dashboard": "ensemble",
  "/settings": "ensemble",
  "/today": "nijika",
  "/weekly": "nijika",
  "/habits": "nijika",
  "/guitar": "bocchi",
  "/reflections": "bocchi",
  "/academics": "ryo",
  "/analytics": "ryo",
  "/goals": "kita",
  "/career": "kita",
  "/timeline": "kita",
};

const ROUTE_ILLUSTRATIONS: Record<string, PageIllustration> = {
  "/dashboard": {
    image: "/illustrations/kessoku-intermission-v4.png",
    imageAlt:
      "Kessoku Band rehearsing while Bocchi lags, Nijika counts in, Ryo grooves, and Kita sparkles",
    label: "Band intermission",
  },
  "/settings": {
    image: "/illustrations/kessoku-ensemble-hero-v3.png",
    imageAlt: "Kessoku Band performing while Bocchi buffers on stage",
    label: "Season setup",
  },
  "/today": {
    image: "/illustrations/page-today-nijika-v1.webp",
    imageAlt:
      "Nijika drums an energetic morning count-in while task cards fall into rhythm",
    label: "Morning count-in",
  },
  "/weekly": {
    image: "/illustrations/page-weekly-nijika-v1.webp",
    imageAlt:
      "Chibi Nijika conducts an oversized weekly planner beside her red drum kit",
    label: "Chibi planning cut",
  },
  "/habits": {
    image: "/illustrations/page-habits-nijika-v1.webp",
    imageAlt:
      "Nijika repeats a seven-beat drum rhythm in a bold risograph montage",
    label: "Rhythm montage",
  },
  "/guitar": {
    image: "/illustrations/page-guitar-bocchi-v1.webp",
    imageAlt:
      "Bocchi turns a nervous warm-up into a solo on her black Les Paul Custom",
    label: "Concert manga cut",
  },
  "/reflections": {
    image: "/illustrations/page-reflections-bocchi-v1.webp",
    imageAlt:
      "Bocchi writes on a quiet rooftop as her soul hovers beside her black Les Paul Custom",
    label: "Watercolor diary cut",
  },
  "/academics": {
    image: "/illustrations/page-academics-ryo-v1.webp",
    imageAlt:
      "Ryo studies inside a library fortress beside her white Precision Bass",
    label: "Study zine cut",
  },
  "/analytics": {
    image: "/illustrations/page-analytics-ryo-v1.webp",
    imageAlt:
      "Ryo plays her white Precision Bass as abstract charts pulse from the groove",
    label: "Data visualizer cut",
  },
  "/goals": {
    image: "/illustrations/page-goals-kita-v1.webp",
    imageAlt:
      "Kita celebrates a milestone path with her blue single-pickup Les Paul Junior",
    label: "Shoujo finish-line cut",
  },
  "/career": {
    image: "/illustrations/page-career-kita-v1.webp",
    imageAlt:
      "Kita enters a stage-door interview carrying a portfolio and her blue Les Paul Junior",
    label: "Backstage audition cut",
  },
  "/timeline": {
    image: "/illustrations/page-timeline-kita-v1.webp",
    imageAlt:
      "Kita races through a semester filmstrip while playing her blue Les Paul Junior",
    label: "Anime opening cut",
  },
};

function matchRoute<T>(pathname: string, routes: Record<string, T>) {
  const route =
    Object.keys(routes).find(
      (candidate) =>
        pathname === candidate || pathname.startsWith(`${candidate}/`),
    ) ?? "/dashboard";

  return routes[route];
}

export function getPageTheme(pathname: string) {
  return PAGE_THEMES[matchRoute(pathname, ROUTE_THEMES)];
}

export function getPageIllustration(pathname: string) {
  return matchRoute(pathname, ROUTE_ILLUSTRATIONS);
}

export function getThemeRoutes(theme: PageThemeKey): string[] {
  return Object.entries(ROUTE_THEMES)
    .filter(([, routeTheme]) => routeTheme === theme)
    .map(([route]) => route);
}
