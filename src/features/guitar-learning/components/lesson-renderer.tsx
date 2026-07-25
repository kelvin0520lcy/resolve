"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  CircleHelp,
  Headphones,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Wrench,
} from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import {
  completeLessonSection,
  getLessonCompletionRequirements,
  getLessonProgress,
  markLessonUnderstood,
  recordLessonCheckpoint,
  setLessonApplicationComplete,
  setLessonSectionConfusing,
  toggleLessonBookmark,
} from "@/features/guitar-learning/lib/learning-state";
import type {
  AudioComparisonSection,
  GuitarLearningState,
  GuitarLesson,
  GuitarLessonSection,
  GuitarToolId,
  GuidedExerciseSection,
  InteractiveQuestionSection,
  MusicalApplicationSection,
} from "@/features/guitar-learning/types";

type UpdateLearningState = (
  updater: (current: GuitarLearningState) => GuitarLearningState,
) => void;

function SectionFrame({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section
      className="rounded-[22px] border-2 border-border bg-surface p-4 sm:p-6"
      aria-labelledby={`lesson-section-${title.replaceAll(" ", "-")}`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h3
        id={`lesson-section-${title.replaceAll(" ", "-")}`}
        className="font-display mt-1 text-xl tracking-wide"
      >
        {title}
      </h3>
      <div className="mt-4">{children}</div>
      {footer && (
        <div className="mt-5 border-t border-border pt-4">{footer}</div>
      )}
    </section>
  );
}

function CompletionButton({
  completed,
  label,
  disabled,
  onClick,
}: {
  completed: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={completed ? "secondary" : "outline"}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={completed}
    >
      <Check className="h-3.5 w-3.5" />
      {completed ? "Stage checked" : label}
    </Button>
  );
}

function AudioComparison({
  section,
  completed,
  onComplete,
}: {
  section: AudioComparisonSection;
  completed: boolean;
  onComplete: () => void;
}) {
  const [heard, setHeard] = useState<string[]>([]);
  const [audioError, setAudioError] = useState("");

  async function play(which: "correct" | "incorrect") {
    const pattern =
      which === "correct"
        ? section.correctPattern
        : section.incorrectPattern;
    const played = await guitarAudioEngine.play(pattern);
    if (!played) {
      setAudioError(
        "Web Audio is unavailable in this browser. The written listening cue remains usable.",
      );
      return;
    }
    setAudioError("");
    setHeard((current) => [...new Set([...current, which])]);
  }

  return (
    <SectionFrame
      eyebrow="Listen before reading"
      title={section.title}
      footer={
        <CompletionButton
          completed={completed}
          disabled={heard.length < 2 && !audioError}
          label="I compared both examples"
          onClick={onComplete}
        />
      }
    >
      <p className="text-sm leading-6 text-muted">{section.body}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => void play("correct")}
        >
          <Play className="h-4 w-4" />
          A · {section.correctLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void play("incorrect")}
        >
          <Play className="h-4 w-4" />
          B · {section.incorrectLabel}
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={() => guitarAudioEngine.stop()}
      >
        <Pause className="h-3.5 w-3.5" />
        Stop audio
      </Button>
      <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6">
        <strong>Listen for:</strong> {section.listenFor}
      </div>
      {audioError && (
        <p role="status" className="mt-3 text-xs leading-5 text-warning">
          {audioError}
        </p>
      )}
    </SectionFrame>
  );
}

function GuidedExercise({
  section,
  completed,
  onComplete,
}: {
  section: GuidedExerciseSection;
  completed: boolean;
  onComplete: () => void;
}) {
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  return (
    <SectionFrame
      eyebrow="Guitar in hand"
      title={section.title}
      footer={
        <CompletionButton
          completed={completed}
          disabled={checkedSteps.length !== section.steps.length}
          label="I completed every repetition"
          onClick={onComplete}
        />
      }
    >
      <p className="text-sm leading-6 text-muted">{section.body}</p>
      <ol className="mt-4 space-y-3">
        {section.steps.map((step, index) => {
          const checked = checkedSteps.includes(index);
          return (
            <li key={step}>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface-muted/45 p-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--accent)]"
                  checked={checked}
                  onChange={() =>
                    setCheckedSteps((current) =>
                      checked
                        ? current.filter((item) => item !== index)
                        : [...current, index],
                    )
                  }
                />
                <span className="text-sm leading-6">
                  <strong className="mr-1 text-accent">
                    {index + 1}.
                  </strong>
                  {step}
                </span>
              </label>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs leading-5 text-muted">
        {section.completionPrompt}
      </p>
    </SectionFrame>
  );
}

function InteractiveQuestion({
  section,
  completed,
  onComplete,
}: {
  section: InteractiveQuestionSection;
  completed: boolean;
  onComplete: () => void;
}) {
  const [selected, setSelected] = useState<number>();
  const isCorrect = selected === section.correctIndex;
  return (
    <SectionFrame
      eyebrow="Concept check"
      title={section.title}
      footer={
        <CompletionButton
          completed={completed}
          disabled={!isCorrect}
          label="Save this answer"
          onClick={onComplete}
        />
      }
    >
      <fieldset>
        <legend className="text-sm font-black leading-6">
          {section.prompt}
        </legend>
        <div className="mt-3 grid gap-2">
          {section.options.map((option, index) => (
            <label
              key={option}
              className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-sm ${
                selected === index
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface-muted/40"
              }`}
            >
              <input
                type="radio"
                name={section.id}
                className="mr-2 accent-[var(--accent)]"
                checked={selected === index}
                onChange={() => setSelected(index)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
      {selected !== undefined && (
        <p
          role="status"
          className={`mt-4 rounded-xl p-3 text-sm leading-6 ${
            isCorrect
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning"
          }`}
        >
          {isCorrect
            ? section.explanation
            : "Not quite. Compare the answer with the lesson’s sound, physical motion, and musical application, then try again."}
        </p>
      )}
    </SectionFrame>
  );
}

function MusicalApplication({
  section,
  completed,
  onComplete,
}: {
  section: MusicalApplicationSection;
  completed: boolean;
  onComplete: () => void;
}) {
  const [selected, setSelected] = useState("");
  return (
    <SectionFrame
      eyebrow="Make a musical decision"
      title={section.title}
      footer={
        <CompletionButton
          completed={completed}
          disabled={!selected}
          label="Save my comparison"
          onClick={onComplete}
        />
      }
    >
      <p className="text-sm leading-6 text-muted">{section.body}</p>
      <fieldset className="mt-4">
        <legend className="text-sm font-black">{section.prompt}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {section.options.map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-xs font-bold ${
                selected === option
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface-muted"
              }`}
            >
              <input
                type="radio"
                name={section.id}
                className="sr-only"
                checked={selected === option}
                onChange={() => setSelected(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    </SectionFrame>
  );
}

export function LessonRenderer({
  lesson,
  state,
  updateState,
  onOpenTool,
  onExit,
}: {
  lesson: GuitarLesson;
  state: GuitarLearningState;
  updateState: UpdateLearningState;
  onOpenTool: (toolId: GuitarToolId) => void;
  onExit: () => void;
}) {
  const [stage, setStage] = useState(0);
  const [showAlternative, setShowAlternative] = useState(false);
  const [checkpointAnswer, setCheckpointAnswer] = useState<number>();
  const [checkpointFeedback, setCheckpointFeedback] = useState("");
  const [applicationChoice, setApplicationChoice] = useState("");
  const progress = getLessonProgress(state, lesson.id);
  const completedSectionIds = useMemo(
    () => new Set(progress?.completedSectionIds ?? []),
    [progress?.completedSectionIds],
  );
  const requirements = getLessonCompletionRequirements(state, lesson);
  const totalStages = lesson.sections.length + 2;
  const currentSection = lesson.sections[stage];
  const atCheckpoint = stage === lesson.sections.length;
  const atApplication = stage === lesson.sections.length + 1;
  const completedRequiredCount = lesson.sections.filter(
    (section) =>
      section.required && completedSectionIds.has(section.id),
  ).length;
  const requiredCount = lesson.sections.filter(
    (section) => section.required,
  ).length;

  useEffect(
    () => () => guitarAudioEngine.stop(),
    [lesson.id],
  );

  function completeSection(section: GuitarLessonSection) {
    updateState((current) =>
      completeLessonSection(current, lesson.id, section.id),
    );
  }

  function renderSection(section: GuitarLessonSection) {
    const completed = completedSectionIds.has(section.id);
    if (section.type === "audio-comparison") {
      return (
        <AudioComparison
          section={section}
          completed={completed}
          onComplete={() => completeSection(section)}
        />
      );
    }
    if (section.type === "guided-exercise") {
      return (
        <GuidedExercise
          section={section}
          completed={completed}
          onComplete={() => completeSection(section)}
        />
      );
    }
    if (section.type === "interactive-question") {
      return (
        <InteractiveQuestion
          section={section}
          completed={completed}
          onComplete={() => completeSection(section)}
        />
      );
    }
    if (section.type === "musical-application") {
      return (
        <MusicalApplication
          section={section}
          completed={completed}
          onComplete={() => completeSection(section)}
        />
      );
    }
    if (
      section.type === "fretboard" ||
      section.type === "rhythm-grid" ||
      section.type === "picking-animation" ||
      section.type === "chord-diagram" ||
      section.type === "scale-comparison"
    ) {
      return (
        <SectionFrame
          eyebrow="Interactive visual"
          title={section.title}
          footer={
            <CompletionButton
              completed={completed}
              label="I located the relationship"
              onClick={() => completeSection(section)}
            />
          }
        >
          <p className="text-sm leading-6 text-muted">{section.body}</p>
          <div className="mt-4 rounded-2xl border-2 border-dashed border-accent/35 bg-accent/5 p-4">
            <p className="text-sm leading-6">{section.prompt}</p>
            <Button
              type="button"
              size="sm"
              className="mt-3"
              onClick={() => {
                onOpenTool(section.toolId);
                completeSection(section);
              }}
            >
              <Wrench className="h-3.5 w-3.5" />
              Open {section.toolId.replace("-", " ")}
            </Button>
          </div>
        </SectionFrame>
      );
    }
    if (section.type === "explanation") {
      return (
        <SectionFrame
          eyebrow="What it is"
          title={section.title}
          footer={
            <CompletionButton
              completed={completed}
              label="I can say this in my own words"
              onClick={() => completeSection(section)}
            />
          }
        >
          <p className="text-sm leading-7">{section.body}</p>
          <div className="mt-4 rounded-2xl bg-accent/10 p-4 text-sm leading-6">
            <strong>Keep:</strong> {section.takeaway}
          </div>
        </SectionFrame>
      );
    }
    if (section.type === "connection") {
      return (
        <SectionFrame
          eyebrow="Connect it"
          title={section.title}
          footer={
            <CompletionButton
              completed={completed}
              label="The connection makes sense"
              onClick={() => completeSection(section)}
            />
          }
        >
          <Badge variant="accent">{section.knownConcept}</Badge>
          <p className="mt-4 text-sm leading-7">{section.body}</p>
        </SectionFrame>
      );
    }
    if (section.type === "correct-vs-incorrect") {
      return (
        <SectionFrame
          eyebrow="Technique comparison"
          title={section.title}
          footer={
            <CompletionButton
              completed={completed}
              label="I can tell these apart"
              onClick={() => completeSection(section)}
            />
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-danger">
                Usually unstable
              </p>
              <p className="mt-2 text-sm leading-6">{section.incorrect}</p>
            </div>
            <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-success">
                Controlled
              </p>
              <p className="mt-2 text-sm leading-6">{section.correct}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            <strong className="text-foreground">Listen for:</strong>{" "}
            {section.listenFor}
          </p>
        </SectionFrame>
      );
    }
    if (section.type === "common-mistakes") {
      return (
        <SectionFrame
          eyebrow="Troubleshooting"
          title={section.title}
          footer={
            <CompletionButton
              completed={completed}
              label="I know what to adjust"
              onClick={() => completeSection(section)}
            />
          }
        >
          <div className="space-y-3">
            {section.items.map((item) => (
              <div
                key={item.mistake}
                className="rounded-2xl border border-border bg-surface-muted/45 p-4"
              >
                <p className="text-sm font-black">{item.mistake}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  <strong className="text-success">Try:</strong> {item.fix}
                </p>
              </div>
            ))}
          </div>
        </SectionFrame>
      );
    }
    return (
      <SectionFrame
        eyebrow="Reflection"
        title={section.title}
        footer={
          <CompletionButton
            completed={completed}
            label="I answered this aloud"
            onClick={() => completeSection(section)}
          />
        }
      >
        <p className="text-lg font-black leading-7">{section.prompt}</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          No journal entry is required. A clear spoken answer is enough.
        </p>
      </SectionFrame>
    );
  }

  function submitCheckpoint() {
    if (checkpointAnswer === undefined) return;
    const correct =
      checkpointAnswer === lesson.checkpoint.correctIndex;
    updateState((current) =>
      recordLessonCheckpoint(
        current,
        lesson.id,
        correct ? 1 : 0,
      ),
    );
    setCheckpointFeedback(
      correct
        ? lesson.checkpoint.explanation
        : "That answer does not transfer the idea into sound and musical use yet. Revisit the stage you found least clear.",
    );
  }

  function submitApplication() {
    if (!applicationChoice) return;
    if (applicationChoice === lesson.applicationActivity.options[0]) {
      updateState((current) =>
        setLessonApplicationComplete(current, lesson.id, true),
      );
    } else {
      setShowAlternative(true);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-accent/35">
        <div className="h-1.5 bg-gradient-to-r from-accent via-warning to-cyan" />
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">
                  Difficulty {lesson.difficulty}/5
                </Badge>
                <Badge>{lesson.estimatedMinutes} minutes</Badge>
                <Badge>{lesson.coach} lesson</Badge>
              </div>
              <CardTitle className="mt-3 text-2xl">
                {lesson.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {lesson.whyItMatters}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={
                  state.profile.bookmarkedLessonIds.includes(lesson.id)
                    ? "secondary"
                    : "ghost"
                }
                onClick={() =>
                  updateState((current) =>
                    toggleLessonBookmark(current, lesson.id),
                  )
                }
              >
                <Bookmark className="h-3.5 w-3.5" />
                Bookmark
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onExit}>
                Back to Learn
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
            <ProgressBar
              value={(completedRequiredCount / Math.max(1, requiredCount)) * 100}
              label={`${completedRequiredCount} of ${requiredCount} required lesson stages checked`}
            />
            <p className="text-xs font-bold text-muted">
              {completedRequiredCount}/{requiredCount} lesson stages
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {lesson.learningObjectives.map((objective) => (
              <span
                key={objective}
                className="rounded-xl border border-border bg-surface px-3 py-2 text-xs leading-5"
              >
                {objective}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          {currentSection && renderSection(currentSection)}

          {atCheckpoint && (
            <SectionFrame
              eyebrow="Checkpoint"
              title="Can the idea transfer?"
            >
              <fieldset>
                <legend className="text-lg font-black leading-7">
                  {lesson.checkpoint.prompt}
                </legend>
                <div className="mt-4 grid gap-2">
                  {lesson.checkpoint.options.map((option, index) => (
                    <label
                      key={option}
                      className={`cursor-pointer rounded-xl border-2 px-3 py-3 text-sm ${
                        checkpointAnswer === index
                          ? "border-accent bg-accent/10"
                          : "border-border bg-surface-muted/45"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${lesson.id}:checkpoint`}
                        className="mr-2 accent-[var(--accent)]"
                        checked={checkpointAnswer === index}
                        onChange={() => {
                          setCheckpointAnswer(index);
                          setCheckpointFeedback("");
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button
                type="button"
                className="mt-4"
                disabled={checkpointAnswer === undefined}
                onClick={submitCheckpoint}
              >
                Check my reasoning
              </Button>
              {checkpointFeedback && (
                <p
                  role="status"
                  className="mt-4 rounded-xl bg-surface-muted p-4 text-sm leading-6"
                >
                  {checkpointFeedback}
                </p>
              )}
            </SectionFrame>
          )}

          {atApplication && (
            <SectionFrame
              eyebrow="Final musical application"
              title="Use it outside the example"
            >
              <p className="text-sm leading-7">
                {lesson.applicationActivity.prompt}
              </p>
              <fieldset className="mt-4">
                <legend className="text-sm font-black">
                  What happened when you tried it?
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {lesson.applicationActivity.options.map((option) => (
                    <label
                      key={option}
                      className={`cursor-pointer rounded-xl border-2 p-3 text-sm ${
                        applicationChoice === option
                          ? "border-accent bg-accent/10"
                          : "border-border bg-surface-muted/45"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${lesson.id}:application`}
                        className="mr-2 accent-[var(--accent)]"
                        checked={applicationChoice === option}
                        onChange={() => setApplicationChoice(option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button
                type="button"
                className="mt-4"
                disabled={!applicationChoice}
                onClick={submitApplication}
              >
                Save application result
              </Button>
              {requirements.applicationCompleted && (
                <p
                  role="status"
                  className="mt-4 rounded-xl bg-success/10 p-4 text-sm leading-6 text-success"
                >
                  {lesson.applicationActivity.completionMessage}
                </p>
              )}
            </SectionFrame>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={stage === 0}
              onClick={() =>
                setStage((current) => Math.max(0, current - 1))
              }
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <p className="text-xs font-bold text-muted">
              Stage {stage + 1} of {totalStages}
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={stage === totalStages - 1}
              onClick={() =>
                setStage((current) =>
                  Math.min(totalStages - 1, current + 1),
                )
              }
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Studio checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                [
                  requirements.incompleteSectionIds.length === 0,
                  `${completedRequiredCount}/${requiredCount} lesson stages`,
                ],
                [
                  requirements.checkpointPassed,
                  "Concept checkpoint passed",
                ],
                [
                  requirements.applicationCompleted,
                  "Musical application tried",
                ],
              ].map(([complete, label]) => (
                <div
                  key={String(label)}
                  className="flex items-center gap-2"
                >
                  {complete ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <CircleHelp className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  <span>{label}</span>
                </div>
              ))}
              <Button
                type="button"
                className="mt-2 w-full"
                disabled={!requirements.canMarkUnderstood}
                onClick={() =>
                  updateState((current) =>
                    markLessonUnderstood(current, lesson.id),
                  )
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm understanding
              </Button>
              {!requirements.canMarkUnderstood && (
                <p className="text-xs leading-5 text-muted">
                  Finish all three checklist items before confirming
                  understanding.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Still confusing?</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAlternative((current) => !current)}
              >
                <Lightbulb className="h-4 w-4" />
                Explain differently
              </Button>
              {showAlternative && (
                <div className="mt-4 rounded-2xl bg-warning/10 p-4 text-sm leading-6">
                  {lesson.alternativeExplanation}
                </div>
              )}
              {currentSection && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() =>
                    updateState((current) =>
                      setLessonSectionConfusing(
                        current,
                        lesson.id,
                        currentSection.id,
                        !progress?.confusingSectionIds?.includes(
                          currentSection.id,
                        ),
                      ),
                    )
                  }
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {progress?.confusingSectionIds?.includes(currentSection.id)
                    ? "Clear confusion flag"
                    : "Mark this stage confusing"}
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-accent/25 bg-accent/5 p-4 text-xs leading-5 text-muted">
            <Headphones className="mb-2 h-4 w-4 text-accent" />
            Audio starts only after you press play. No microphone or external
            recording is used.
          </div>
        </aside>
      </div>
    </div>
  );
}
