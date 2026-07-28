"use client";

import { useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GuitarToolId } from "@/features/guitar-learning/types";

export const PRACTICE_TROUBLESHOOTER_PROBLEMS: Array<{
  id: string;
  symptom: string;
  cause: string;
  test: string;
  correction: string;
  lessonId: string;
  toolId: GuitarToolId;
  presetId: string;
}> = [
  {
    id: "rhythm-falls-apart",
    symptom: "My strumming falls apart",
    cause: "The hand may be stopping at silent strokes or the count is not stable yet.",
    test: "Mute all strings and say “1 and 2 and 3 and 4 and” while the hand moves down-up eight times.",
    correction: "Practise the motion without chords at 60 BPM. Add sound only after three even bars.",
    lessonId: "rhythm:continuous-strumming-hand-movement",
    toolId: "rhythm",
    presetId: "rhythm:continuous-hand",
  },
  {
    id: "chord-buzzes",
    symptom: "My chord buzzes or has dead strings",
    cause: "A fingertip may be too far from the fret, too flat, or touching a nearby string.",
    test: "Pick each string slowly from string 6 to string 1 and name the first string that fails.",
    correction: "Move only the finger responsible closer behind its fret; use the least pressure that produces a clean note.",
    lessonId: "guitar-language:fret-one-clean-note",
    toolId: "chord-trainer",
    presetId: "chords:g-to-c-change",
  },
  {
    id: "changes-slow",
    symptom: "My chord changes are too slow",
    cause: "The fingers may travel one by one without an anchor or shared shape.",
    test: "Make the change silently five times. Watch which finger arrives last.",
    correction: "Lead with that finger or preserve a shared finger. Count clean changes for 30 seconds.",
    lessonId: "guitar-language:first-two-chord-groove",
    toolId: "chord-trainer",
    presetId: "chords:g-to-c-change",
  },
  {
    id: "scale-runs",
    symptom: "My solo sounds like a scale exercise",
    cause: "Every note may have the same length and there may be no rests or repeated idea.",
    test: "Play only three notes, then force a two-beat silence.",
    correction: "Repeat a tiny motif, change just its ending, and leave a gap before the answer.",
    lessonId: "improvisation:motif-development",
    toolId: "scales",
    presetId: "scales:a-minor-pentatonic-three-notes",
  },
  {
    id: "timing-drifts",
    symptom: "My timing drifts away from the click",
    cause: "You may be reacting to each click rather than carrying the pulse between clicks.",
    test: "Tap four beats with the sound, mute one bar mentally, then predict the next beat one.",
    correction: "Return to one sound per beat and keep counting during every gap.",
    lessonId: "rhythm:feeling-and-identifying-the-pulse",
    toolId: "rhythm",
    presetId: "rhythm:pulse-at-60",
  },
  {
    id: "string-noise",
    symptom: "I hear unwanted string noise",
    cause: "Unused strings may keep ringing because neither hand is muting them.",
    test: "Play one note and deliberately touch every neighbouring string without fretting it.",
    correction: "Use the underside of a fretting finger above the note and the picking-hand palm below it.",
    lessonId: "guitar-language:fret-one-clean-note",
    toolId: "fretboard",
    presetId: "fretboard:a-home",
  },
  {
    id: "pick-catches",
    symptom: "My pick catches on the strings",
    cause: "Too much pick may be below the string or the grip may be rigid.",
    test: "Expose only a small triangle of the pick and brush one muted string in both directions.",
    correction: "Use a shallow angle and let the pick give slightly; do not dig downward.",
    lessonId: "guitar-language:pick-grip-and-depth",
    toolId: "picking",
    presetId: "picking:pick-depth",
  },
  {
    id: "bend-flat-sharp",
    symptom: "My bends sound out of tune",
    cause: "The target pitch has not been heard before the bend.",
    test: "Play the target note normally, sing it, then bend the lower note until both match.",
    correction: "Support the bending finger with the fingers behind it and stop at the heard target.",
    lessonId: "improvisation:bend-to-a-heard-target",
    toolId: "tuner",
    presetId: "tuner:bend-target-a4",
  },
  {
    id: "dont-know-what",
    symptom: "I do not know what to practise",
    cause: "The goal is too broad to choose a measurable next action.",
    test: "Name one thing that fails right now: sound, timing, movement, memory, or phrasing.",
    correction: "Pick the matching symptom above or start the suggested 15-minute routine.",
    lessonId: "guitar-language:guitar-orientation",
    toolId: "tuner",
    presetId: "tuner:standard",
  },
];

export function PracticeTroubleshooter({
  onOpenLesson,
  onOpenTool,
}: {
  onOpenLesson: (lessonId: string) => void;
  onOpenTool: (toolId: GuitarToolId, presetId?: string) => void;
}) {
  const [openId, setOpenId] = useState<string>();
  return (
    <section aria-labelledby="practice-help-title" className="space-y-3">
      <div>
        <Badge variant="accent"><CircleHelp className="mr-1 h-3.5 w-3.5" /> Diagnose a problem</Badge>
        <h2 id="practice-help-title" className="font-display mt-2 text-2xl">
          Practice troubleshooter
        </h2>
        <p className="mt-1 text-sm text-muted">
          Choose what you can hear or feel. Each answer gives one test and one
          correction—not a list of random lessons.
        </p>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {PRACTICE_TROUBLESHOOTER_PROBLEMS.map((problem) => {
          const open = openId === problem.id;
          return (
            <article key={problem.id} className="rounded-2xl border-2 border-border bg-surface">
              <button
                type="button"
                aria-expanded={open}
                className="flex min-h-14 w-full items-center justify-between gap-3 p-4 text-left text-sm font-black"
                onClick={() => setOpenId(open ? undefined : problem.id)}
              >
                {problem.symptom}
                <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="border-t border-border p-4 text-xs leading-5">
                  <p><strong>Likely cause:</strong> {problem.cause}</p>
                  <p className="mt-2"><strong>Quick test:</strong> {problem.test}</p>
                  <p className="mt-2"><strong>Correction:</strong> {problem.correction}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => onOpenTool(problem.toolId, problem.presetId)}>
                      Open guided tool
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => onOpenLesson(problem.lessonId)}>
                      Open lesson
                    </Button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
