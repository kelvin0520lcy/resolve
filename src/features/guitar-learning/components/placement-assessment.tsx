"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Headphones, Sparkles } from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PLACEMENT_PATH_OPTIONS,
  PLACEMENT_QUESTIONS,
  toPlacementAnswers,
} from "@/features/guitar-learning/data/placement";
import { calculatePlacementResult } from "@/features/guitar-learning/lib/learning-state";
import type {
  GuitarPathId,
  PlacementResult,
} from "@/features/guitar-learning/types";

export function PlacementAssessment({
  onComplete,
}: {
  onComplete: (result: PlacementResult) => void;
}) {
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [preferredPathId, setPreferredPathId] =
    useState<GuitarPathId>("rhythm");
  const question = PLACEMENT_QUESTIONS[questionIndex];
  const selectedScore = scores[question?.id];

  if (!started) {
    return (
      <Card className="overflow-hidden border-accent/35">
        <div className="h-1.5 bg-gradient-to-r from-accent via-warning to-cyan" />
        <CardHeader>
          <Badge variant="accent" className="mb-2 w-fit">
            Friendly placement · about 3 minutes
          </Badge>
          <CardTitle className="text-2xl">
            Find the first useful gap
          </CardTitle>
          <CardDescription>
            This is not an exam. Pick the answer that describes what you can
            do reliably today; the result only chooses a starting point and
            you can override it later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [
                "No microphone",
                "Listening examples use generated guitar notes.",
              ],
              ["No lost progress", "Strong concepts can be marked already known."],
              ["No fixed track", "Change paths whenever your goal changes."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <p className="font-black">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{body}</p>
              </div>
            ))}
          </div>
          <fieldset>
            <legend className="text-sm font-black">
              What would you most like to improve?
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLACEMENT_PATH_OPTIONS.map((path) => (
                <label
                  key={path.id}
                  className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                    preferredPathId === path.id
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border bg-surface hover:border-accent/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="placement-path"
                    className="sr-only"
                    checked={preferredPathId === path.id}
                    onChange={() => setPreferredPathId(path.id)}
                  />
                  {path.label}
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="button" onClick={() => setStarted(true)}>
            <Sparkles className="h-4 w-4" />
            Start the soundcheck
          </Button>
        </CardContent>
      </Card>
    );
  }

  const atLastQuestion =
    questionIndex === PLACEMENT_QUESTIONS.length - 1;
  const progress =
    ((questionIndex + 1) / PLACEMENT_QUESTIONS.length) * 100;

  function continueAssessment() {
    if (selectedScore === undefined) return;
    if (!atLastQuestion) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    onComplete(
      calculatePlacementResult(
        toPlacementAnswers(scores),
        preferredPathId,
      ),
    );
  }

  return (
    <Card className="overflow-hidden border-accent/35">
      <div className="h-1.5 bg-gradient-to-r from-accent via-warning to-cyan" />
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">
              {question.eyebrow}
            </p>
            <CardTitle className="mt-1">
              Soundcheck {questionIndex + 1} of{" "}
              {PLACEMENT_QUESTIONS.length}
            </CardTitle>
          </div>
          <Badge>
            <Headphones className="mr-1 h-3 w-3" />
            {question.kind.replace("-", " ")}
          </Badge>
        </div>
        <ProgressBar
          className="mt-3"
          value={progress}
          label={`Placement progress: ${questionIndex + 1} of ${PLACEMENT_QUESTIONS.length}`}
        />
      </CardHeader>
      <CardContent>
        <fieldset>
          <legend className="max-w-3xl text-lg font-black leading-7">
            {question.prompt}
          </legend>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {question.options.map((option) => (
              <label
                key={option.label}
                className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                  selectedScore === option.score
                    ? "border-accent bg-accent/12 shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
                    : "border-border bg-surface hover:border-accent/60"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.score}
                  className="sr-only"
                  checked={selectedScore === option.score}
                  onChange={() =>
                    setScores((current) => ({
                      ...current,
                      [question.id]: option.score,
                    }))
                  }
                />
                <span className="font-black">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  {option.detail}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={questionIndex === 0}
            onClick={() =>
              setQuestionIndex((current) => Math.max(0, current - 1))
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            type="button"
            disabled={selectedScore === undefined}
            onClick={continueAssessment}
          >
            {atLastQuestion ? "Build my learning plan" : "Next soundcheck"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
