import type { CharacterExpression, CharacterState } from "@/types";

export type DialogueContext = {
  tasksCompletedToday: number;
  tasksTotalToday: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  habitStreak: number;
  weeklyWorkloadHours: number;
  hourOfDay: number;
};

const DIALOGUE: Record<CharacterExpression, string[]> = {
  neutral: [
    "よしっ、新しい一話の始まり！今日はどんなセットリストにする？\nOkay, a new episode begins! What is today's setlist?",
    "準備できたらカウントするよ。この一週間をちゃんと鳴らそう！\nI will count us in when you are ready. Let's make this week sound!",
  ],
  happy: [
    "えっ、もう全部終わったの！？こっちの心の準備がまだなんだけど！\nWait, you finished everything already!? I was not emotionally prepared for this!",
    "全タスク完了！はい、勝利ポーズ！\nAll tasks complete! Okay—victory pose!",
  ],
  proud: [
    "今週もちゃんと続いてる！そのリズム、かなり頼もしくなってきたよ。\nYou kept it going this week! That rhythm is becoming seriously reliable.",
    "その連続記録、いいビートだね！無理せず次の一拍へ！\nThat streak has a great beat! Keep it moving without overplaying!",
  ],
  excited: [
    "マイルストーン達成！ここ、絶対に劇伴が入るところ！\nMilestone complete! This is absolutely where the dramatic soundtrack starts!",
    "自己ベスト更新！すごい、本当にすごいよ！\nNew personal best! That is amazing—seriously!",
  ],
  nervous: [
    "来週は締切が多いね。新しい寄り道は、今ある曲を整えてからにしよっか。\nNext week has a lot of deadlines. Let's finish arranging the current song before adding a side project.",
    "締切は明日！大丈夫、まず一拍目から一緒に数えよう。\nThe deadline is tomorrow! It is okay—let's count the first beat together.",
  ],
  tired: [
    "長い一週間だったね。休符だって、ちゃんと曲の一部だよ。\nThat was a long week. A rest is still part of the song.",
    "ずっと頑張ってたよ。明日は少し軽いセットにしてもいいんじゃない？\nYou have been pushing hard. How about a lighter set tomorrow?",
  ],
  overwhelmed: [
    "水曜日に十一時間！？それ、練習じゃなくて耐久ライブだよ！分けよう、今すぐ！\nEleven hours on Wednesday!? That is an endurance concert, not practice. Let's split it up!",
    "この量はテンポが速すぎるよ。続けられる配置に戻そう！\nThis workload is way over tempo. Let's rearrange it into something playable!",
  ],
  concerned: [
    "未着手のタスクがこっちを見てるね……まず一つ、最初の一拍だけ進めよう。\nThat untouched task is staring at us… let's move just its first beat.",
    "今週まだ音が出てない目標があるよ。次の行動を一つ決めよう！\nA few goals have not made a sound this week. Let's choose one next action!",
  ],
  encouraging: [
    "一日外しても、曲全体は壊れないよ。次のカウントから戻れば大丈夫！\nOne missed day does not ruin the song. Come back in on the next count!",
    "大変な週だったね。でも再スタートの一拍は、ここから作れるよ！\nIt was a rough week, but the comeback can start on this beat!",
  ],
  celebrating: [
    "学期目標、達成ーっ！アンコールの準備して！\nSEMESTER GOAL COMPLETE! Get ready for the encore!",
    "習慣パーフェクト週間！今日は全力でお祝いカット！\nPerfect habit week! You earned the full celebration scene!",
  ],
};

function pickDialogue(expression: CharacterExpression): string {
  const options = DIALOGUE[expression];
  return options[0];
}

export function resolveCharacterState(ctx: DialogueContext): CharacterState {
  const taskRate =
    ctx.tasksTotalToday > 0
      ? ctx.tasksCompletedToday / ctx.tasksTotalToday
      : 0;

  if (ctx.weeklyWorkloadHours > 50) {
    return {
      expression: "overwhelmed",
      dialogue: pickDialogue("overwhelmed"),
      scene: "backstage",
      triggerReason: "excessive_weekly_workload",
    };
  }

  if (ctx.overdueTasks >= 3) {
    return {
      expression: "concerned",
      dialogue: pickDialogue("concerned"),
      scene: "classroom",
      triggerReason: "multiple_overdue_tasks",
    };
  }

  if (ctx.upcomingDeadlines >= 3) {
    return {
      expression: "nervous",
      dialogue: pickDialogue("nervous"),
      scene: "classroom",
      triggerReason: "upcoming_deadlines",
    };
  }

  if (taskRate === 1 && ctx.tasksTotalToday > 0) {
    return {
      expression: "happy",
      dialogue: pickDialogue("happy"),
      scene: "practice-room",
      triggerReason: "all_tasks_complete",
    };
  }

  if (ctx.habitStreak >= 7) {
    return {
      expression: "proud",
      dialogue: pickDialogue("proud"),
      scene: "practice-room",
      triggerReason: "habit_streak",
    };
  }

  if (ctx.hourOfDay < 10) {
    return {
      expression: "neutral",
      dialogue:
        "おはよう！今日のセットリスト、一緒に確認しよっか。\nGood morning! Let's check today's setlist together.",
      scene: "bedroom",
      triggerReason: "morning_greeting",
    };
  }

  return {
    expression: "neutral",
    dialogue: pickDialogue("neutral"),
    scene: "neutral",
    triggerReason: "default",
  };
}
