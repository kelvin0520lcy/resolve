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
    "急ぎのセットリストはまだなし！小さな行動を一つ選んで、今日をカウントインしよう。\nNo urgent setlist yet! Pick one small action and give the day a steady count-in.",
  bocchi:
    "あっ……練習室が静かすぎます。ち、小さな練習でも、キャラ成長には入るので……。\nU-um… the practice room is suspiciously quiet. A tiny rehearsal still counts as character development.",
  ryo:
    "有用なデータがない。具体的な行動を一つ追加して。でないとグラフは飾り。\nThere is no useful data. Add one concrete action; otherwise the graph is decoration.",
  kita:
    "スポットライト準備よしっ！未来の自分が誇れる一歩を、一つ選ぼう！\nThe spotlight is ready! Pick one next move that future-you can be proud of!",
};

const RELATED_COPY: Record<
  Exclude<PageThemeKey, "ensemble">,
  (title: string) => string
> = {
  nijika: (title) =>
    `カウントイン準備よし！「${title}」は今日のリズムにぴったり。一拍ずつ進もう！\nCount-in ready! “${title}” fits today's rhythm. Let's move one beat at a time.`,
  bocchi: (title) =>
    `あっ……練習室ミッションは「${title}」です。い、いちばん小さい一歩からなら、生還できるかも……。\nU-um… the practice-room mission is “${title}”. We might survive by rehearsing the smallest first step.`,
  ryo: (title) =>
    `価値の高い行動を検出：「${title}」。効率的で測定可能。ベースを止める価値は、たぶんある。\nHighest-value move detected: “${title}”. Efficient, measurable, and probably worth pausing the bass line.`,
  kita: (title) =>
    `スポットライト行動は「${title}」！今の一歩が、未来のモンタージュをキラキラにするよ！\nSpotlight action selected: “${title}”! One bold step gives the future montage something to shine with!`,
};

const REFRAMED_COPY: Record<
  Exclude<PageThemeKey, "ensemble">,
  (title: string) => string
> = {
  nijika: (title) =>
    `「${title}」はいつもの担当じゃないけど、テンポを決める人は必要だよね！最初の一拍を予定に入れよう。\n“${title}” is not my usual section, but every band needs a tempo. Let's schedule the first beat!`,
  bocchi: (title) =>
    `あっ……「${title}」は練習室の台本外です。こ、怖い曲だと思って、最初の一小節だけ覚えましょう……。\nU-um… “${title}” is outside the practice-room script. Let's treat it like a scary song and learn only the opening bar.`,
  ryo: (title) =>
    `「${title}」は普段のカテゴリじゃない。でも測れる一手まで削れば、許容範囲。\n“${title}” is not my usual category. Reduce it to one measurable move and it becomes acceptable.`,
  kita: (title) =>
    `「${title}」は違うステージだけど、自信は持っていけるよ！見える次の一歩に変えよう！\n“${title}” is a different stage, but confidence travels! Let's turn it into one visible next action!`,
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
