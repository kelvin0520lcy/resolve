import {
  GUITAR_LESSONS,
  GUITAR_LESSON_BY_ID,
} from "@/features/guitar-learning/data/curriculum";
import {
  getLessonProgress,
} from "@/features/guitar-learning/lib/learning-state";
import type {
  Goal,
  GuitarPracticeSession,
} from "@/types";
import type {
  GuitarLearningState,
  GuitarLesson,
  LessonRecommendation,
} from "@/features/guitar-learning/types";

type RecommendationInput = {
  state: GuitarLearningState;
  goals?: Goal[];
  sessions?: GuitarPracticeSession[];
  now?: string;
  limit?: number;
};

const PATH_KEYWORDS: Record<string, string[]> = {
  rhythm: [
    "rhythm",
    "strum",
    "groove",
    "timing",
    "syncop",
    "palm",
    "power chord",
  ],
  lead: [
    "lead",
    "pick",
    "bend",
    "vibrato",
    "legato",
    "solo",
    "string cross",
  ],
  fretboard: [
    "fretboard",
    "note",
    "interval",
    "octave",
    "caged",
    "triad",
  ],
  improvisation: [
    "improvis",
    "phrase",
    "pentatonic",
    "scale",
    "motif",
    "solo",
  ],
  chords: [
    "chord",
    "triad",
    "arpeggio",
    "voicing",
    "harmony",
  ],
  "ear-theory": [
    "ear",
    "theory",
    "transcri",
    "roman",
    "interval",
    "harmony",
  ],
  application: [
    "song",
    "riff",
    "arrang",
    "repertoire",
    "perform",
    "section",
  ],
};

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function relevanceToText(lesson: GuitarLesson, text: string) {
  const normalized = text.toLowerCase();
  const lessonTokens = new Set(
    tokenize(
      `${lesson.title} ${lesson.summary} ${lesson.pathId} ${lesson.category}`,
    ),
  );
  let score = tokenize(text).filter((token) =>
    [...lessonTokens].some(
      (lessonToken) =>
        lessonToken.includes(token) || token.includes(lessonToken),
    ),
  ).length;
  if (
    PATH_KEYWORDS[lesson.pathId]?.some((keyword) =>
      normalized.includes(keyword),
    )
  ) {
    score += 2;
  }
  return score;
}

function daysSince(value: string | undefined, now: Date) {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 86_400_000),
  );
}

function sourceFromReasons(
  reasons: Array<{ source: LessonRecommendation["source"]; weight: number }>,
) {
  return [...reasons].sort(
    (a, b) => b.weight - a.weight,
  )[0]?.source ?? "path_progression";
}

export function getLessonRecommendations({
  state,
  goals = [],
  sessions = [],
  now = new Date().toISOString(),
  limit = 5,
}: RecommendationInput): LessonRecommendation[] {
  const nowDate = new Date(now);
  const hidden = new Set(state.profile.hiddenRecommendationIds);
  const focusText = sessions
    .slice(0, 12)
    .flatMap((session) => [
      session.category,
      ...(session.techniques ?? []),
      session.nextFocus ?? "",
    ])
    .filter(Boolean)
    .join(" ");
  const goalText = goals
    .filter(
      (goal) =>
        goal.category.toLowerCase() === "guitar" &&
        !["completed", "abandoned"].includes(goal.status),
    )
    .map(
      (goal) =>
        `${goal.title} ${goal.description} ${goal.motivation ?? ""}`,
    )
    .join(" ");

  return GUITAR_LESSONS.flatMap((lesson, catalogIndex) => {
    const progress = getLessonProgress(state, lesson.id);
    if (
      hidden.has(lesson.id) ||
      progress?.status === "understood" ||
      progress?.status === "already_known"
    ) {
      return [];
    }

    const missingPrerequisiteIds = lesson.prerequisiteIds.filter(
      (id) => {
        if (!GUITAR_LESSON_BY_ID.has(id)) return true;
        const prerequisiteProgress = getLessonProgress(state, id);
        return !(
          prerequisiteProgress?.status === "understood" ||
          prerequisiteProgress?.status === "already_known"
        );
      },
    );
    let score = 10;
    const reasons: string[] = [];
    const sources: Array<{
      source: LessonRecommendation["source"];
      weight: number;
    }> = [];

    if (progress?.status === "needs_review") {
      score += 55;
      reasons.push(
        "Your latest checkpoint or confidence signal marked this concept for review.",
      );
      sources.push({ source: "checkpoint", weight: 55 });
    }
    if (
      state.profile.confusingConceptIds.includes(lesson.id) ||
      (progress?.confusingSectionIds?.length ?? 0) > 0
    ) {
      score += 48;
      reasons.push(
        "You marked part of this concept as confusing, so it deserves a clearer pass.",
      );
      sources.push({ source: "knowledge_gap", weight: 48 });
    }
    if (
      state.profile.placementResult?.recommendedLessonId === lesson.id
    ) {
      score += 44;
      reasons.push(
        state.profile.placementResult.explanation,
      );
      sources.push({ source: "assessment", weight: 44 });
    } else if (
      state.profile.placementResult?.reviewLessonIds.includes(lesson.id)
    ) {
      score += 30;
      reasons.push(
        "Your placement answers suggest reviewing this before moving deeper into the path.",
      );
      sources.push({ source: "assessment", weight: 30 });
    }
    if (state.profile.selectedPathIds.includes(lesson.pathId)) {
      score += 18;
      reasons.push("It advances one of your selected learning paths.");
      sources.push({ source: "path_progression", weight: 18 });
    }

    const goalRelevance = relevanceToText(lesson, goalText);
    if (goalRelevance > 0) {
      const weight = Math.min(36, 12 + goalRelevance * 4);
      score += weight;
      reasons.push(
        "It directly supports the language used in your active guitar goal.",
      );
      sources.push({ source: "goal", weight });
    }

    const focusRelevance = relevanceToText(lesson, focusText);
    if (focusRelevance > 0) {
      const weight = Math.min(30, 9 + focusRelevance * 3);
      score += weight;
      reasons.push(
        "It matches a recent practice category, technique, or next-focus note.",
      );
      sources.push({ source: "focus_area", weight });
    }

    const unlockedByThisLesson = GUITAR_LESSONS.filter((candidate) =>
      candidate.prerequisiteIds.includes(lesson.id),
    ).length;
    if (unlockedByThisLesson > 0) {
      const weight = Math.min(12, unlockedByThisLesson * 4);
      score += weight;
      reasons.push(
        `Understanding it unlocks ${unlockedByThisLesson} next concept${unlockedByThisLesson === 1 ? "" : "s"}.`,
      );
      sources.push({ source: "knowledge_gap", weight });
    }

    const age = daysSince(
      progress?.lastReviewedAt ?? progress?.lastOpenedAt,
      nowDate,
    );
    if (
      progress &&
      age >= 21 &&
      progress.status !== "not_assessed"
    ) {
      score += 14;
      reasons.push(
        `You have not revisited this concept for ${age} days.`,
      );
      sources.push({ source: "review", weight: 14 });
    }

    if (missingPrerequisiteIds.length) {
      score -= missingPrerequisiteIds.length * 40;
      reasons.push(
        `Complete ${missingPrerequisiteIds
          .map(
            (id) => GUITAR_LESSON_BY_ID.get(id)?.title ?? "a prerequisite",
          )
          .join(", ")} first.`,
      );
    } else if (!progress) {
      score += 8;
      reasons.push("Its prerequisites are satisfied and it is ready now.");
      sources.push({ source: "path_progression", weight: 8 });
    }

    if (reasons.length === 0) {
      reasons.push("It is the next available concept in the curriculum.");
    }

    return [
      {
        recommendation: {
          lessonId: lesson.id,
          score,
          reasons,
          missingPrerequisiteIds,
          source: sourceFromReasons(sources),
        },
        catalogIndex,
      },
    ];
  })
    .sort(
      (a, b) =>
        a.recommendation.missingPrerequisiteIds.length -
          b.recommendation.missingPrerequisiteIds.length ||
        b.recommendation.score - a.recommendation.score ||
        a.catalogIndex - b.catalogIndex,
    )
    .slice(0, Math.max(1, limit))
    .map((entry) => entry.recommendation);
}
