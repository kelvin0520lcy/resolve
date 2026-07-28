import {
  GUITAR_LESSONS,
  GUITAR_LESSON_BY_ID,
  GUITAR_PATHS,
} from "@/features/guitar-learning/data/curriculum";
import type {
  GuitarLearningState,
  GuitarApplicationResult,
  GuitarLesson,
  GuitarLessonProgress,
  GuitarLearnerRoute,
  GuitarMasteryStatus,
  GuitarPathId,
  PlacementAnswer,
  PlacementResult,
} from "@/features/guitar-learning/types";

const SATISFIED_STATUSES: GuitarMasteryStatus[] = [
  "understood",
  "already_known",
];

const MASTERY_STATUSES: GuitarMasteryStatus[] = [
  "not_assessed",
  "locked",
  "ready",
  "learning",
  "understood",
  "needs_review",
  "already_known",
];

const APPLICATION_RESULTS: GuitarApplicationResult[] = [
  "achieved",
  "partial",
  "not_yet",
];

const TOOL_IDS = [
  "fretboard",
  "scales",
  "rhythm",
  "picking",
  "chords",
  "triads",
  "arpeggios",
  "progressions",
  "emotional",
  "improvisation",
  "phrase-builder",
  "ear-training",
  "theory",
  "metronome",
  "drone",
  "tuner",
  "chord-trainer",
] as const;

const ALL_PATH_IDS: GuitarPathId[] = [
  "guitar-language",
  "rhythm",
  "lead",
  "fretboard",
  "improvisation",
  "chords",
  "ear-theory",
  "application",
];

const LEARNER_ROUTES: GuitarLearnerRoute[] = [
  "new-to-guitar",
  "songs-and-tabs",
  "theory-practice",
];

export function createEmptyGuitarLearningState(
  userId: string,
  now = new Date().toISOString(),
): GuitarLearningState {
  return {
    profile: {
      userId,
      preferredTuning: ["E2", "A2", "D3", "G3", "B3", "E4"],
      handedness: "right",
      selectedPathIds: [],
      placementCompleted: false,
      confusingConceptIds: [],
      bookmarkedLessonIds: [],
      hiddenRecommendationIds: [],
      chordChangeBests: {},
      updatedAt: now,
    },
    progress: [],
  };
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function cleanStringArray(
  value: unknown,
  isValid: (candidate: string) => boolean = () => true,
) {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (candidate): candidate is string =>
              typeof candidate === "string" &&
              candidate.length > 0 &&
              isValid(candidate),
          ),
        ),
      ]
    : [];
}

export function normalizeGuitarLearningState(
  value: unknown,
  userId: string,
  now = new Date().toISOString(),
): GuitarLearningState {
  const seed = createEmptyGuitarLearningState(userId, now);
  const stored = recordValue(value);
  if (!stored) return seed;
  const profile = recordValue(stored.profile);
  const validLessonId = (candidate: string) =>
    GUITAR_LESSON_BY_ID.has(candidate);
  const validPathIds = new Set(ALL_PATH_IDS);
  const validPathId = (candidate: string): candidate is GuitarPathId =>
    validPathIds.has(candidate as GuitarPathId);
  const preferredTuning = cleanStringArray(profile?.preferredTuning);
  const placement = recordValue(profile?.placementResult);
  const recommendedPathId =
    typeof placement?.recommendedPathId === "string" &&
    validPathId(placement.recommendedPathId)
      ? placement.recommendedPathId
      : undefined;
  const recommendedLessonId =
    typeof placement?.recommendedLessonId === "string" &&
    validLessonId(placement.recommendedLessonId)
      ? placement.recommendedLessonId
      : undefined;
  const placementResult: PlacementResult | undefined =
    placement && recommendedPathId && recommendedLessonId
      ? {
          recommendedPathId,
          recommendedLessonId,
          alreadyKnownLessonIds: cleanStringArray(
            placement.alreadyKnownLessonIds,
            validLessonId,
          ),
          reviewLessonIds: cleanStringArray(
            placement.reviewLessonIds,
            validLessonId,
          ),
          missingPrerequisiteIds: cleanStringArray(
            placement.missingPrerequisiteIds,
            validLessonId,
          ),
          relevantToolIds: cleanStringArray(
            placement.relevantToolIds,
            (candidate) =>
              TOOL_IDS.includes(
                candidate as (typeof TOOL_IDS)[number],
              ),
          ) as PlacementResult["relevantToolIds"],
          explanation:
            typeof placement.explanation === "string"
              ? placement.explanation.slice(0, 1000)
              : "",
          completedAt:
            typeof placement.completedAt === "string"
              ? placement.completedAt
              : now,
          learnerRoute: LEARNER_ROUTES.includes(
            placement.learnerRoute as GuitarLearnerRoute,
          )
            ? (placement.learnerRoute as GuitarLearnerRoute)
            : undefined,
        }
      : undefined;
  const chordChangeBests = recordValue(profile?.chordChangeBests);

  const progressByLessonId = new Map<string, GuitarLessonProgress>();
  if (Array.isArray(stored.progress)) {
    for (const value of stored.progress) {
      const entry = recordValue(value);
      if (
        !entry ||
        typeof entry.lessonId !== "string" ||
        !validLessonId(entry.lessonId)
      ) {
        continue;
      }
      const lesson = GUITAR_LESSON_BY_ID.get(entry.lessonId)!;
      const validSectionIds = new Set(
        lesson.sections.map((section) => section.id),
      );
      const status = MASTERY_STATUSES.includes(
        entry.status as GuitarMasteryStatus,
      )
        ? (entry.status as GuitarMasteryStatus)
        : "not_assessed";
      const checkpointScore = Number.isFinite(entry.checkpointScore)
        ? Math.max(0, Math.min(1, Number(entry.checkpointScore)))
        : undefined;
      const selfConfidence = Number.isFinite(entry.selfConfidence)
        ? (Math.max(
            1,
            Math.min(5, Math.round(Number(entry.selfConfidence))),
          ) as 1 | 2 | 3 | 4 | 5)
        : undefined;
      progressByLessonId.set(entry.lessonId, {
        lessonId: entry.lessonId,
        status,
        checkpointScore,
        attempts: Number.isFinite(entry.attempts)
          ? Math.max(0, Math.min(999, Math.round(Number(entry.attempts))))
          : 0,
        confusingSectionIds: cleanStringArray(
          entry.confusingSectionIds,
          (candidate) => validSectionIds.has(candidate),
        ),
        completedSectionIds: cleanStringArray(
          entry.completedSectionIds,
          (candidate) => validSectionIds.has(candidate),
        ),
        applicationCompleted: entry.applicationCompleted === true,
        applicationResult: APPLICATION_RESULTS.includes(
          entry.applicationResult as GuitarApplicationResult,
        )
          ? (entry.applicationResult as GuitarApplicationResult)
          : undefined,
        lastOpenedAt:
          typeof entry.lastOpenedAt === "string"
            ? entry.lastOpenedAt
            : undefined,
        lastReviewedAt:
          typeof entry.lastReviewedAt === "string"
            ? entry.lastReviewedAt
            : undefined,
        understoodAt:
          typeof entry.understoodAt === "string"
            ? entry.understoodAt
            : undefined,
        selfConfidence,
      });
    }
  }

  return {
    profile: {
      userId,
      preferredTuning:
        preferredTuning.length === 6
          ? preferredTuning
          : seed.profile.preferredTuning,
      handedness: profile?.handedness === "left" ? "left" : "right",
      selectedPathIds: cleanStringArray(
        profile?.selectedPathIds,
        validPathId,
      ) as GuitarPathId[],
      placementCompleted:
        profile?.placementCompleted === true && Boolean(placementResult),
      placementResult,
      currentLessonId:
        typeof profile?.currentLessonId === "string" &&
        validLessonId(profile.currentLessonId)
          ? profile.currentLessonId
          : undefined,
      confusingConceptIds: cleanStringArray(
        profile?.confusingConceptIds,
        validLessonId,
      ),
      bookmarkedLessonIds: cleanStringArray(
        profile?.bookmarkedLessonIds,
        validLessonId,
      ),
      hiddenRecommendationIds: cleanStringArray(
        profile?.hiddenRecommendationIds,
        validLessonId,
      ),
      learnerRoute: LEARNER_ROUTES.includes(
        profile?.learnerRoute as GuitarLearnerRoute,
      )
        ? (profile?.learnerRoute as GuitarLearnerRoute)
        : placementResult?.learnerRoute,
      chordChangeBests: Object.fromEntries(
        Object.entries(chordChangeBests ?? {})
          .filter(
            ([key, score]) =>
              key.length > 0 &&
              key.length <= 80 &&
              Number.isFinite(score),
          )
          .map(([key, score]) => [
            key,
            Math.max(0, Math.min(999, Math.round(Number(score)))),
          ]),
      ),
      updatedAt:
        typeof profile?.updatedAt === "string"
          ? profile.updatedAt
          : now,
    },
    progress: [...progressByLessonId.values()],
  };
}

export function getLessonProgress(
  state: GuitarLearningState,
  lessonId: string,
): GuitarLessonProgress | undefined {
  return state.progress.find((entry) => entry.lessonId === lessonId);
}

export function arePrerequisitesSatisfied(
  lesson: GuitarLesson,
  state: GuitarLearningState,
): boolean {
  return lesson.prerequisiteIds.every((prerequisiteId) => {
    const progress = getLessonProgress(state, prerequisiteId);
    return progress
      ? SATISFIED_STATUSES.includes(progress.status)
      : false;
  });
}

export function getEffectiveLessonStatus(
  lesson: GuitarLesson,
  state: GuitarLearningState,
): GuitarMasteryStatus {
  const saved = getLessonProgress(state, lesson.id);
  if (saved) return saved.status;
  return arePrerequisitesSatisfied(lesson, state) ||
    lesson.prerequisiteIds.length === 0
    ? "ready"
    : "locked";
}

function upsertProgress(
  state: GuitarLearningState,
  lessonId: string,
  update: (
    current: GuitarLessonProgress,
  ) => GuitarLessonProgress,
): GuitarLearningState {
  const index = state.progress.findIndex(
    (entry) => entry.lessonId === lessonId,
  );
  const current =
    index >= 0
      ? state.progress[index]
      : {
          lessonId,
          status: "not_assessed" as const,
          attempts: 0,
        };
  const nextProgress = update(current);
  const progress =
    index >= 0
      ? state.progress.map((entry, entryIndex) =>
          entryIndex === index ? nextProgress : entry,
        )
      : [...state.progress, nextProgress];
  return { ...state, progress };
}

function touchProfile(
  state: GuitarLearningState,
  now: string,
  changes: Partial<GuitarLearningState["profile"]> = {},
): GuitarLearningState {
  return {
    ...state,
    profile: {
      ...state.profile,
      ...changes,
      updatedAt: now,
    },
  };
}

export function openGuitarLesson(
  state: GuitarLearningState,
  lessonId: string,
  now = new Date().toISOString(),
): GuitarLearningState {
  const lesson = GUITAR_LESSON_BY_ID.get(lessonId);
  if (!lesson || getEffectiveLessonStatus(lesson, state) === "locked") {
    return state;
  }
  const withProgress = upsertProgress(state, lessonId, (current) => ({
    ...current,
    status: SATISFIED_STATUSES.includes(current.status)
      ? current.status
      : "learning",
    lastOpenedAt: now,
  }));
  return touchProfile(withProgress, now, { currentLessonId: lessonId });
}

export function completeLessonSection(
  state: GuitarLearningState,
  lessonId: string,
  sectionId: string,
  completed = true,
): GuitarLearningState {
  const lesson = GUITAR_LESSON_BY_ID.get(lessonId);
  if (!lesson?.sections.some((section) => section.id === sectionId)) {
    return state;
  }
  return upsertProgress(state, lessonId, (current) => {
    const ids = new Set(current.completedSectionIds ?? []);
    if (completed) ids.add(sectionId);
    else ids.delete(sectionId);
    return {
      ...current,
      status: SATISFIED_STATUSES.includes(current.status)
        ? current.status
        : "learning",
      completedSectionIds: [...ids],
    };
  });
}

export function setLessonSectionConfusing(
  state: GuitarLearningState,
  lessonId: string,
  sectionId: string,
  confusing: boolean,
  now = new Date().toISOString(),
): GuitarLearningState {
  const lesson = GUITAR_LESSON_BY_ID.get(lessonId);
  if (!lesson?.sections.some((section) => section.id === sectionId)) {
    return state;
  }
  const withProgress = upsertProgress(state, lessonId, (current) => {
    const ids = new Set(current.confusingSectionIds ?? []);
    if (confusing) ids.add(sectionId);
    else ids.delete(sectionId);
    return {
      ...current,
      confusingSectionIds: [...ids],
      status:
        confusing && current.status === "understood"
          ? "needs_review"
          : current.status,
    };
  });
  const concepts = new Set(withProgress.profile.confusingConceptIds);
  if (confusing) concepts.add(lessonId);
  else concepts.delete(lessonId);
  return touchProfile(withProgress, now, {
    confusingConceptIds: [...concepts],
  });
}

export function recordLessonCheckpoint(
  state: GuitarLearningState,
  lessonId: string,
  score: number,
  now = new Date().toISOString(),
): GuitarLearningState {
  const lesson = GUITAR_LESSON_BY_ID.get(lessonId);
  if (!lesson || !Number.isFinite(score)) return state;
  const normalizedScore = Math.max(0, Math.min(1, score));
  return upsertProgress(state, lessonId, (current) => ({
    ...current,
    attempts: current.attempts + 1,
    checkpointScore: normalizedScore,
    lastReviewedAt: now,
    status:
      normalizedScore >= lesson.checkpoint.passingScore
        ? current.status === "already_known"
          ? "already_known"
          : "learning"
        : "needs_review",
  }));
}

export function setLessonApplicationComplete(
  state: GuitarLearningState,
  lessonId: string,
  completed: boolean,
): GuitarLearningState {
  if (!GUITAR_LESSON_BY_ID.has(lessonId)) return state;
  return upsertProgress(state, lessonId, (current) => ({
    ...current,
    applicationCompleted: completed,
    applicationResult: completed ? "achieved" : undefined,
    status: SATISFIED_STATUSES.includes(current.status)
      ? current.status
      : "learning",
  }));
}

export function recordLessonApplicationResult(
  state: GuitarLearningState,
  lessonId: string,
  result: GuitarApplicationResult,
  now = new Date().toISOString(),
): GuitarLearningState {
  if (
    !GUITAR_LESSON_BY_ID.has(lessonId) ||
    !APPLICATION_RESULTS.includes(result)
  ) {
    return state;
  }
  return upsertProgress(state, lessonId, (current) => ({
    ...current,
    applicationCompleted: true,
    applicationResult: result,
    lastReviewedAt: result === "achieved" ? current.lastReviewedAt : now,
    selfConfidence:
      result === "achieved" ? 4 : result === "partial" ? 3 : 2,
    status:
      result === "achieved"
        ? SATISFIED_STATUSES.includes(current.status)
          ? current.status
          : "learning"
        : "needs_review",
  }));
}

export function getLessonCompletionRequirements(
  state: GuitarLearningState,
  lesson: GuitarLesson,
) {
  const progress = getLessonProgress(state, lesson.id);
  const completedIds = new Set(progress?.completedSectionIds ?? []);
  const requiredSectionIds = lesson.sections
    .filter((section) => section.required)
    .map((section) => section.id);
  const incompleteSectionIds = requiredSectionIds.filter(
    (sectionId) => !completedIds.has(sectionId),
  );
  return {
    incompleteSectionIds,
    checkpointPassed:
      (progress?.checkpointScore ?? -1) >=
      lesson.checkpoint.passingScore,
    applicationCompleted: progress?.applicationCompleted === true,
    canMarkUnderstood:
      incompleteSectionIds.length === 0 &&
      (progress?.checkpointScore ?? -1) >=
        lesson.checkpoint.passingScore &&
      progress?.applicationCompleted === true &&
      (!progress.applicationResult ||
        progress.applicationResult === "achieved"),
  };
}

export function markLessonUnderstood(
  state: GuitarLearningState,
  lessonId: string,
  now = new Date().toISOString(),
): GuitarLearningState {
  const lesson = GUITAR_LESSON_BY_ID.get(lessonId);
  if (
    !lesson ||
    !getLessonCompletionRequirements(state, lesson).canMarkUnderstood
  ) {
    return state;
  }
  return upsertProgress(state, lessonId, (current) => ({
    ...current,
    status: "understood",
    understoodAt: now,
    lastReviewedAt: now,
  }));
}

export function markLessonAlreadyKnown(
  state: GuitarLearningState,
  lessonId: string,
  now = new Date().toISOString(),
): GuitarLearningState {
  if (!GUITAR_LESSON_BY_ID.has(lessonId)) return state;
  return touchProfile(
    upsertProgress(state, lessonId, (current) => ({
      ...current,
      status: "already_known",
      lastReviewedAt: now,
    })),
    now,
  );
}

export function setSelectedGuitarPaths(
  state: GuitarLearningState,
  pathIds: GuitarPathId[],
  now = new Date().toISOString(),
): GuitarLearningState {
  const valid = new Set(GUITAR_PATHS.map((path) => path.id));
  return touchProfile(state, now, {
    selectedPathIds: [...new Set(pathIds.filter((id) => valid.has(id)))],
  });
}

export function toggleLessonBookmark(
  state: GuitarLearningState,
  lessonId: string,
  now = new Date().toISOString(),
): GuitarLearningState {
  if (!GUITAR_LESSON_BY_ID.has(lessonId)) return state;
  const ids = new Set(state.profile.bookmarkedLessonIds);
  if (ids.has(lessonId)) ids.delete(lessonId);
  else ids.add(lessonId);
  return touchProfile(state, now, { bookmarkedLessonIds: [...ids] });
}

export function recordChordChangeBest(
  state: GuitarLearningState,
  chordPair: string,
  cleanChanges: number,
  now = new Date().toISOString(),
): GuitarLearningState {
  const normalizedPair = chordPair.trim().toUpperCase();
  const normalizedScore = Math.max(0, Math.floor(cleanChanges));
  if (!normalizedPair || !Number.isFinite(normalizedScore)) return state;
  const previous = state.profile.chordChangeBests?.[normalizedPair] ?? 0;
  if (normalizedScore <= previous) return state;
  return touchProfile(state, now, {
    chordChangeBests: {
      ...(state.profile.chordChangeBests ?? {}),
      [normalizedPair]: normalizedScore,
    },
  });
}

export function hideLessonRecommendation(
  state: GuitarLearningState,
  lessonId: string,
  now = new Date().toISOString(),
): GuitarLearningState {
  if (!GUITAR_LESSON_BY_ID.has(lessonId)) return state;
  return touchProfile(state, now, {
    hiddenRecommendationIds: [
      ...new Set([...state.profile.hiddenRecommendationIds, lessonId]),
    ],
  });
}

export function calculatePlacementResult(
  answers: PlacementAnswer[],
  preferredPathId?: GuitarPathId,
  now = new Date().toISOString(),
): PlacementResult {
  const scores = new Map<string, number[]>();
  for (const answer of answers) {
    for (const lessonId of answer.lessonIds) {
      if (!GUITAR_LESSON_BY_ID.has(lessonId)) continue;
      scores.set(lessonId, [
        ...(scores.get(lessonId) ?? []),
        Math.max(0, Math.min(2, answer.score)),
      ]);
    }
  }

  const averageFor = (lessonId: string) => {
    const values = scores.get(lessonId) ?? [];
    return values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : undefined;
  };
  const alreadyKnownLessonIds = [...scores.keys()].filter(
    (lessonId) => (averageFor(lessonId) ?? 0) >= 1.7,
  );
  const reviewLessonIds = [...scores.keys()].filter((lessonId) => {
    const score = averageFor(lessonId) ?? 0;
    return score >= 0.75 && score < 1.7;
  });
  const learnLessonIds = [...scores.keys()].filter(
    (lessonId) => (averageFor(lessonId) ?? 0) < 0.75,
  );

  const pathScores = GUITAR_PATHS.map((path) => {
    const assessed = path.lessonIds.filter((lessonId) =>
      scores.has(lessonId),
    );
    const need = assessed.reduce(
      (sum, lessonId) => sum + (2 - (averageFor(lessonId) ?? 0)),
      0,
    );
    return {
      path,
      score:
        need +
        (path.id === preferredPathId ? 10 : 0) +
        (assessed.length ? 1 : 0),
    };
  }).sort(
    (a, b) =>
      b.score - a.score ||
      GUITAR_PATHS.indexOf(a.path) - GUITAR_PATHS.indexOf(b.path),
  );

  const recommendedPathId =
    pathScores[0]?.path.id ?? preferredPathId ?? "rhythm";
  const recommendedPath = GUITAR_PATHS.find(
    (path) => path.id === recommendedPathId,
  )!;
  const recommendedLessonId =
    recommendedPath.lessonIds.find((id) => learnLessonIds.includes(id)) ??
    recommendedPath.lessonIds.find((id) => reviewLessonIds.includes(id)) ??
    recommendedPath.lessonIds.find(
      (id) => !alreadyKnownLessonIds.includes(id),
    ) ??
    recommendedPath.lessonIds[0];
  const lesson = GUITAR_LESSON_BY_ID.get(recommendedLessonId)!;
  const missingPrerequisiteIds = lesson.prerequisiteIds.filter(
    (id) => !alreadyKnownLessonIds.includes(id),
  );

  return {
    recommendedPathId,
    recommendedLessonId,
    alreadyKnownLessonIds,
    reviewLessonIds,
    missingPrerequisiteIds,
    relevantToolIds: [...new Set(lesson.relatedToolIds)],
    explanation:
      reviewLessonIds.length || learnLessonIds.length
        ? `Start with ${lesson.title}. Your answers show the biggest useful gap in ${recommendedPath.title.toLowerCase()}, while stronger answers can be marked as already known.`
        : `Your answers show a strong baseline. Start with ${lesson.title} to apply that knowledge in a more musical context.`,
    completedAt: now,
  };
}

export function applyPlacementResult(
  state: GuitarLearningState,
  result: PlacementResult,
): GuitarLearningState {
  let next = state;
  for (const lessonId of result.alreadyKnownLessonIds) {
    next = upsertProgress(next, lessonId, (current) => ({
      ...current,
      status: "already_known",
      lastReviewedAt: result.completedAt,
    }));
  }
  for (const lessonId of result.reviewLessonIds) {
    next = upsertProgress(next, lessonId, (current) => ({
      ...current,
      status:
        current.status === "already_known"
          ? current.status
          : "needs_review",
      lastReviewedAt: result.completedAt,
    }));
  }
  return touchProfile(next, result.completedAt, {
    placementCompleted: true,
    placementResult: result,
    learnerRoute: result.learnerRoute,
    currentLessonId: result.recommendedLessonId,
    selectedPathIds: [
      ...new Set([
        ...next.profile.selectedPathIds,
        result.recommendedPathId,
      ]),
    ],
  });
}

export function getCurriculumIntegrityIssues(
  lessons: GuitarLesson[] = GUITAR_LESSONS,
): string[] {
  const issues: string[] = [];
  const ids = new Set(lessons.map((lesson) => lesson.id));
  if (ids.size !== lessons.length) issues.push("Lesson IDs are not unique.");

  for (const lesson of lessons) {
    for (const relatedId of [
      ...lesson.prerequisiteIds,
      ...lesson.nextLessonIds,
      ...lesson.unlocksConceptIds,
    ]) {
      if (!ids.has(relatedId)) {
        issues.push(`${lesson.id} references missing lesson ${relatedId}.`);
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const visit = (lessonId: string): boolean => {
    if (visiting.has(lessonId)) return true;
    if (visited.has(lessonId)) return false;
    visiting.add(lessonId);
    const hasCycle = (byId.get(lessonId)?.prerequisiteIds ?? []).some(
      visit,
    );
    visiting.delete(lessonId);
    visited.add(lessonId);
    return hasCycle;
  };
  for (const lesson of lessons) {
    if (visit(lesson.id)) {
      issues.push(`Prerequisite cycle detected at ${lesson.id}.`);
      break;
    }
  }
  return issues;
}
