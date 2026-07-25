"use client";

import { useMemo, useState } from "react";
import {
  Ear,
  Headphones,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import {
  createEarQuestion,
  type EarExerciseId,
} from "@/features/guitar-learning/lib/ear-training";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import { CHROMATIC_NOTES } from "@/features/guitar-learning/lib/music-theory";

const EXERCISES: Array<{
  id: EarExerciseId;
  label: string;
  description: string;
}> = [
  {
    id: "higher-lower",
    label: "Higher or lower",
    description: "Track basic pitch direction.",
  },
  {
    id: "same-different",
    label: "Same or different",
    description: "Hold one pitch in auditory memory.",
  },
  {
    id: "interval",
    label: "Interval recognition",
    description: "Hear distance before naming it.",
  },
  {
    id: "major-minor",
    label: "Major versus minor",
    description: "Focus on the chord’s third.",
  },
  {
    id: "chord-quality",
    label: "Chord quality",
    description: "Separate thirds, sevenths, and suspensions.",
  },
  {
    id: "tension-resolution",
    label: "Tension and resolution",
    description: "Hear arrival at the tonal centre.",
  },
  {
    id: "note-matching",
    label: "Match a heard note",
    description: "Carry a generated target to the fretboard.",
  },
  {
    id: "rhythm-imitation",
    label: "Rhythm imitation",
    description: "Map heard attacks onto a complete grid.",
  },
  {
    id: "phrase-ending",
    label: "Phrase endings",
    description: "Recognise closure and open punctuation.",
  },
];

export function EarTrainingLab() {
  const [exerciseId, setExerciseId] =
    useState<EarExerciseId>("higher-lower");
  const [root, setRoot] = useState("A");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number>();
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<boolean[]>([]);
  const question = useMemo(
    () => createEarQuestion(exerciseId, questionIndex, root),
    [exerciseId, questionIndex, root],
  );
  const correct = selected === question.correctIndex;
  const recent = history.slice(-10);
  const accuracy = recent.length
    ? (recent.filter(Boolean).length / recent.length) * 100
    : 0;

  function resetQuestion(nextExercise = exerciseId) {
    setExerciseId(nextExercise);
    setQuestionIndex(0);
    setSelected(undefined);
    setSubmitted(false);
    setHistory([]);
    guitarAudioEngine.stop();
  }

  function submit() {
    if (selected === undefined || submitted) return;
    setSubmitted(true);
    setHistory((current) => [
      ...current.slice(-9),
      selected === question.correctIndex,
    ]);
  }

  function nextQuestion() {
    setQuestionIndex((current) => current + 1);
    setSelected(undefined);
    setSubmitted(false);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_12rem_auto]">
        <label className="text-xs font-black">
          Listening exercise
          <select
            className={`${fieldClassName} mt-2`}
            value={exerciseId}
            onChange={(event) =>
              resetQuestion(event.target.value as EarExerciseId)
            }
          >
            {EXERCISES.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black">
          Tonal centre
          <select
            className={`${fieldClassName} mt-2`}
            value={root}
            onChange={(event) => {
              setRoot(event.target.value);
              setQuestionIndex(0);
              setSelected(undefined);
              setSubmitted(false);
            }}
          >
            {CHROMATIC_NOTES.map((note) => (
              <option key={note}>{note}</option>
            ))}
          </select>
        </label>
        <div className="self-end rounded-2xl border border-border bg-surface px-4 py-2">
          <p className="text-[9px] font-black uppercase tracking-wide text-muted">
            Last {recent.length || 0}
          </p>
          <p className="font-display text-xl">{Math.round(accuracy)}%</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {EXERCISES.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            aria-pressed={exerciseId === exercise.id}
            onClick={() => resetQuestion(exercise.id)}
            className={`rounded-2xl border-2 p-3 text-left transition ${
              exerciseId === exercise.id
                ? "border-accent bg-accent/10"
                : "border-border bg-surface hover:border-accent/50"
            }`}
          >
            <span className="font-black">{exercise.label}</span>
            <span className="mt-1 block text-xs leading-5 text-muted">
              {exercise.description}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-[22px] border-2 border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="accent">
              <Headphones className="mr-1 h-3 w-3" />
              Question {questionIndex + 1}
            </Badge>
            <h3 className="font-display mt-3 text-2xl tracking-wide">
              {question.prompt}
            </h3>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => resetQuestion()}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset set
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {question.referencePattern && (
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                void guitarAudioEngine.play(question.referencePattern!)
              }
            >
              <Volume2 className="h-4 w-4" />
              {question.referenceLabel}
            </Button>
          )}
          <Button
            type="button"
            onClick={() =>
              void guitarAudioEngine.play(question.targetPattern)
            }
          >
            <Play className="h-4 w-4" />
            {question.targetLabel}
          </Button>
        </div>

        <div className="mt-4 rounded-2xl border border-warning/25 bg-warning/10 p-4 text-sm leading-6">
          <Ear className="mr-2 inline h-4 w-4 text-warning" />
          <strong>Listen for:</strong> {question.listenFor}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-black">Choose what you hear</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, index) => (
              <label
                key={option}
                className={`cursor-pointer rounded-xl border-2 p-3 text-sm ${
                  selected === index
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface-muted/45"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  className="mr-2 accent-[var(--accent)]"
                  checked={selected === index}
                  disabled={submitted}
                  onChange={() => setSelected(index)}
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap gap-2">
          {!submitted ? (
            <Button
              type="button"
              disabled={selected === undefined}
              onClick={submit}
            >
              Check answer
            </Button>
          ) : (
            <Button type="button" onClick={nextQuestion}>
              Next question
            </Button>
          )}
        </div>

        {submitted && (
          <div
            role="status"
            className={`mt-4 rounded-2xl p-4 text-sm leading-6 ${
              correct
                ? "border border-success/30 bg-success/10"
                : "border border-warning/30 bg-warning/10"
            }`}
          >
            <strong>{correct ? "Correct." : "Not this time."}</strong>{" "}
            {question.explanation}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface/80 p-4">
        <div className="flex items-center justify-between text-xs font-black">
          <span>Recent listening accuracy</span>
          <span>{recent.filter(Boolean).length}/{recent.length}</span>
        </div>
        <ProgressBar
          className="mt-2"
          value={accuracy}
          label={`Recent ear training accuracy ${Math.round(accuracy)} percent`}
        />
        <p className="mt-3 text-xs leading-5 text-muted">
          Questions advance through a fixed sequence, so the same exercise
          index always produces the same answer. No microphone, uploads, or
          external recognition service is involved.
        </p>
      </div>
    </div>
  );
}
