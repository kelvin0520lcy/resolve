import type { PageThemeKey } from "@/lib/page-themes";
import type { Task } from "@/types";

export const CHARACTER_TASK_CATEGORIES: Record<
  Exclude<PageThemeKey, "ensemble">,
  string[]
> = {
  nijika: ["health", "personal"],
  bocchi: ["guitar"],
  ryo: ["academics", "technical", "finance"],
  kita: ["career", "social"],
};

const EMPTY_COPY: Record<Exclude<PageThemeKey, "ensemble">, string> = {
  nijika:
    "No urgent setlist yet. Let’s choose one small action and give the day a steady count-in.",
  bocchi:
    "The practice room is suspiciously quiet. A tiny rehearsal still counts as character development.",
  ryo:
    "There is no useful data yet. Add one concrete action; otherwise the graph is merely decorative.",
  kita:
    "The spotlight is ready, but it needs a next move. Pick one action that future-you can be proud of.",
};

const RELATED_COPY: Record<
  Exclude<PageThemeKey, "ensemble">,
  (title: string) => string
> = {
  nijika: (title) =>
    `Count-in ready: “${title}” fits this rhythm. Let’s keep the band moving one beat at a time.`,
  bocchi: (title) =>
    `Practice-room mission: “${title}”. We can survive it by rehearsing the smallest possible first step.`,
  ryo: (title) =>
    `Highest-value move detected: “${title}”. Efficient, measurable, and almost worth pausing the bass line.`,
  kita: (title) =>
    `Spotlight action selected: “${title}”. One confident step now gives the future montage something to work with.`,
};

const REFRAMED_COPY: Record<
  Exclude<PageThemeKey, "ensemble">,
  (title: string) => string
> = {
  nijika: (title) =>
    `“${title}” is not usually my section, but every good band needs someone to set the tempo. Let’s schedule the first beat.`,
  bocchi: (title) =>
    `“${title}” is outside the practice-room script… so let’s treat it like a scary song and learn only the opening bar.`,
  ryo: (title) =>
    `“${title}” is not my usual category. Still, reducing it to one measurable move makes it acceptable.`,
  kita: (title) =>
    `“${title}” is a different kind of stage, but confidence transfers. Let’s turn it into one visible next action.`,
};

function nextIncompleteTask(tasks: Task[]) {
  return [...tasks]
    .filter(
      (task) =>
        task.status !== "completed" &&
        task.status !== "cancelled" &&
        task.status !== "skipped",
    )
    .sort((a, b) => {
      const aDate = a.deadline ?? a.scheduledDate ?? "9999-12-31";
      const bDate = b.deadline ?? b.scheduledDate ?? "9999-12-31";
      return aDate.localeCompare(bDate);
    })[0];
}

export function getCharacterTask(
  character: Exclude<PageThemeKey, "ensemble">,
  tasks: Task[],
) {
  const relevant = nextIncompleteTask(
    tasks.filter((task) =>
      CHARACTER_TASK_CATEGORIES[character].includes(task.category),
    ),
  );

  if (relevant) {
    return {
      task: relevant,
      related: true,
      dialogue: RELATED_COPY[character](relevant.title),
    };
  }

  const fallback = nextIncompleteTask(tasks);
  if (fallback) {
    return {
      task: fallback,
      related: false,
      dialogue: REFRAMED_COPY[character](fallback.title),
    };
  }

  return {
    task: null,
    related: false,
    dialogue: EMPTY_COPY[character],
  };
}
