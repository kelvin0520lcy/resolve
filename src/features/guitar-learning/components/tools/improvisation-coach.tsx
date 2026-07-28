"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Ear,
  MessageCircleReply,
  Play,
  Sparkles,
} from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/resolve";
import { guitarAudioEngine } from "@/features/guitar-learning/lib/audio-engine";
import {
  buildScale,
  CHROMATIC_NOTES,
  type ScaleType,
} from "@/features/guitar-learning/lib/music-theory";
import {
  analyzePhrase,
  buildResponsePhrase,
  createCallPhrase,
  PHRASE_CONSTRAINTS,
  phraseEventsToMidi,
  type PhraseArticulation,
  type PhraseEvent,
  type PhraseConstraint,
} from "@/features/guitar-learning/lib/phrasing";

const SCALE_OPTIONS: Array<{ value: ScaleType; label: string }> = [
  { value: "minor-pentatonic", label: "Minor pentatonic" },
  { value: "major-pentatonic", label: "Major pentatonic" },
  { value: "major", label: "Major" },
  { value: "natural-minor", label: "Natural minor" },
  { value: "dorian", label: "Dorian" },
  { value: "mixolydian", label: "Mixolydian" },
];

const ARTICULATIONS: PhraseArticulation[] = [
  "pick",
  "slide",
  "hammer",
  "pull",
  "bend",
  "vibrato",
  "mute",
];

function playPhrase(events: PhraseEvent[], tempo: number) {
  return guitarAudioEngine.play({
    kind: "notes",
    midiNotes: phraseEventsToMidi(events),
    beatSeconds: 60 / tempo / 2,
  });
}

function PhraseTimeline({
  events,
  root,
  editable,
  scaleNotes,
  onChange,
}: {
  events: PhraseEvent[];
  root: string;
  editable?: boolean;
  scaleNotes: string[];
  onChange?: (events: PhraseEvent[]) => void;
}) {
  return (
    <div className="sm:overflow-x-auto sm:pb-2">
      <div
        data-testid="phrase-timeline-layout"
        className="grid gap-2 sm:flex sm:min-w-[680px]"
        aria-label="Phrase timeline"
      >
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`min-w-0 flex-1 rounded-2xl border-2 p-3 sm:min-w-36 ${
              event.rest
                ? "border-dashed border-border bg-surface-muted/35"
                : event.note === root
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-wide text-muted">
              Event {index + 1} · {event.durationSteps} step
              {event.durationSteps > 1 ? "s" : ""}
            </p>
            {editable ? (
              <>
                <label className="mt-2 block text-xs font-black">
                  Pitch or rest
                  <select
                    className={`${fieldClassName} mt-1 h-9 px-2 text-xs`}
                    value={event.rest ? "rest" : event.note}
                    onChange={(change) =>
                      onChange?.(
                        events.map((candidate) =>
                          candidate.id === event.id
                            ? change.target.value === "rest"
                              ? {
                                  ...candidate,
                                  rest: true,
                                  note: undefined,
                                }
                              : {
                                  ...candidate,
                                  rest: false,
                                  note: change.target.value,
                                }
                            : candidate,
                        ),
                      )
                    }
                  >
                    <option value="rest">Rest</option>
                    {scaleNotes.map((note) => (
                      <option key={note}>{note}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-2 block text-[11px] font-black">
                  Articulation
                  <select
                    className={`${fieldClassName} mt-1 h-9 px-2 text-xs`}
                    value={event.articulation}
                    disabled={event.rest}
                    onChange={(change) =>
                      onChange?.(
                        events.map((candidate) =>
                          candidate.id === event.id
                            ? {
                                ...candidate,
                                articulation: change.target
                                  .value as PhraseArticulation,
                              }
                            : candidate,
                        ),
                      )
                    }
                  >
                    {ARTICULATIONS.map((articulation) => (
                      <option key={articulation}>{articulation}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <p className="font-display mt-2 text-2xl">
                  {event.rest ? "—" : event.note}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {event.rest ? "measured rest" : event.articulation}
                </p>
              </>
            )}
            {!event.rest && event.accented && (
              <Badge variant="warning" className="mt-2">
                accent
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImprovisationCoach({
  mode,
}: {
  mode: "improvisation" | "phrase-builder";
}) {
  const [root, setRoot] = useState("A");
  const [scale, setScale] =
    useState<ScaleType>("minor-pentatonic");
  const [tempo, setTempo] = useState(84);
  const [phraseBars, setPhraseBars] = useState(2);
  const [difficulty, setDifficulty] = useState(2);
  const [backing, setBacking] = useState("Am drone");
  const [constraint, setConstraint] =
    useState<PhraseConstraint>("motif");
  const [callVariant, setCallVariant] = useState(0);
  const [responseType, setResponseType] =
    useState<"echo" | "answer" | "contrast">("answer");
  const scaleNotes = useMemo(() => buildScale(root, scale), [root, scale]);
  const call = useMemo(
    () => createCallPhrase(root, scale, callVariant),
    [callVariant, root, scale],
  );
  const generatedResponse = useMemo(
    () => buildResponsePhrase(call, root, responseType),
    [call, responseType, root],
  );
  const [phrase, setPhrase] = useState<PhraseEvent[]>(() =>
    createCallPhrase("A", "minor-pentatonic", 1).map((event, index) => ({
      ...event,
      id: `builder-${index}`,
    })),
  );
  const [comparisonPhrase, setComparisonPhrase] =
    useState<PhraseEvent[]>(phrase);
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const activePhrase =
    mode === "phrase-builder" ? phrase : generatedResponse;
  const analysis = analyzePhrase(activePhrase, root, "minor");
  const selectedConstraint =
    PHRASE_CONSTRAINTS.find((item) => item.id === constraint) ??
    PHRASE_CONSTRAINTS[0];

  function resetBuilderForScale() {
    const next = createCallPhrase(root, scale, 1).map((event, index) => ({
      ...event,
      id: `builder-${index}`,
    }));
    setPhrase(next);
    setComparisonPhrase(next);
    setAnalysisVisible(false);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <label className="text-xs font-black">
          Key centre
          <select
            className={`${fieldClassName} mt-2`}
            value={root}
            onChange={(event) => {
              const nextRoot = event.target.value;
              setRoot(nextRoot);
              setBacking((current) => {
                if (current.endsWith(" major drone")) {
                  return `${nextRoot} major drone`;
                }
                if (current.endsWith("m drone")) {
                  return `${nextRoot}m drone`;
                }
                return current;
              });
              setAnalysisVisible(false);
            }}
          >
            {CHROMATIC_NOTES.map((note) => (
              <option key={note}>{note}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black">
          Note vocabulary
          <select
            className={`${fieldClassName} mt-2`}
            value={scale}
            onChange={(event) => {
              setScale(event.target.value as ScaleType);
              setAnalysisVisible(false);
            }}
          >
            {SCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-black">
          Tempo · {tempo} BPM
          <input
            className="mt-4 w-full accent-[var(--accent)]"
            type="range"
            min="40"
            max="180"
            value={tempo}
            onChange={(event) => setTempo(Number(event.target.value))}
          />
        </label>
        <label className="text-xs font-black">
          Phrase length
          <select
            className={`${fieldClassName} mt-2`}
            value={phraseBars}
            onChange={(event) => setPhraseBars(Number(event.target.value))}
          >
            <option value="1">1 bar</option>
            <option value="2">2 bars</option>
            <option value="4">4 bars</option>
          </select>
        </label>
        <label className="text-xs font-black">
          Difficulty
          <select
            className={`${fieldClassName} mt-2`}
            value={difficulty}
            onChange={(event) => setDifficulty(Number(event.target.value))}
          >
            <option value="1">1 · constrained</option>
            <option value="2">2 · guided</option>
            <option value="3">3 · open</option>
          </select>
        </label>
        <label className="text-xs font-black">
          Backing context
          <select
            className={`${fieldClassName} mt-2`}
            value={backing}
            onChange={(event) => setBacking(event.target.value)}
          >
            <option>{root}m drone</option>
            <option>{root} major drone</option>
            <option>I–V–vi–IV progression</option>
            <option>Two-chord call and response</option>
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black">
              Available notes · {root} {scale.replace("-", " ")}
            </p>
            <p className="mt-1 text-xs text-muted">
              {phraseBars} bar{phraseBars > 1 ? "s" : ""} over {backing}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {scaleNotes.map((note) => (
              <Badge key={note} variant={note === root ? "accent" : "default"}>
                {note}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {mode === "improvisation" ? (
        <>
          <div
            data-testid="improvisation-practice-layout"
            className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]"
          >
            <div className="min-w-0 rounded-2xl border border-border bg-surface p-4">
              <label className="text-xs font-black">
                Practice constraint
                <select
                  className={`${fieldClassName} mt-2`}
                  value={constraint}
                  onChange={(event) =>
                    setConstraint(event.target.value as PhraseConstraint)
                  }
                >
                  {PHRASE_CONSTRAINTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-4 rounded-xl bg-accent/10 p-3 text-xs leading-5">
                <strong>{selectedConstraint.label}:</strong>{" "}
                {selectedConstraint.instruction}
              </div>
              <p className="mt-4 text-xs leading-5 text-muted">
                Difficulty {difficulty} keeps the constraint fixed while you
                vary timing, register, and articulation.
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-black">
                    <MessageCircleReply className="h-4 w-4 text-accent" />
                    Call and response
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Hear the call, leave its rest intact, then compare three
                    different ways an answer can relate to it.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setCallVariant((current) => current + 1)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  New call
                </Button>
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-wide text-muted">
                Call
              </p>
              <PhraseTimeline
                events={call}
                root={root}
                scaleNotes={scaleNotes}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => void playPhrase(call, tempo)}
              >
                <Play className="h-3.5 w-3.5" />
                Hear call
              </Button>
              <div className="mt-5 flex flex-wrap gap-2">
                {(["echo", "answer", "contrast"] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    size="sm"
                    variant={responseType === type ? "default" : "secondary"}
                    onClick={() => {
                      setResponseType(type);
                      setAnalysisVisible(false);
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-wide text-muted">
                Response
              </p>
              <PhraseTimeline
                events={generatedResponse}
                root={root}
                scaleNotes={scaleNotes}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => void playPhrase(generatedResponse, tempo)}
              >
                <Play className="h-3.5 w-3.5" />
                Hear response
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-black">Phrase event editor</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Every event carries pitch, duration, articulation, accent, or
                an explicit rest. Change one parameter and compare the result.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setComparisonPhrase(phrase)}
              >
                <Copy className="h-3.5 w-3.5" />
                Save comparison A
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={resetBuilderForScale}
              >
                Reset for key
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <PhraseTimeline
              events={phrase}
              root={root}
              editable
              scaleNotes={scaleNotes}
              onChange={(events) => {
                setPhrase(events);
                setAnalysisVisible(false);
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void playPhrase(phrase, tempo)}
            >
              <Play className="h-4 w-4" />
              Hear edited phrase
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void playPhrase(comparisonPhrase, tempo)}
            >
              <Ear className="h-4 w-4" />
              Hear comparison A
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black">Phrase evidence</p>
            <p className="mt-1 text-xs text-muted">
              Analysis checks rests, ending stability, chord-tone arrivals,
              contour, and repeated relationships.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAnalysisVisible(true)}
          >
            Analyse phrase
          </Button>
        </div>
        {analysisVisible && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-2xl">
                {analysis.score}/100
              </span>
              <Badge variant={analysis.score >= 65 ? "success" : "warning"}>
                musical evidence
              </Badge>
            </div>
            <ProgressBar
              className="mt-3"
              value={analysis.score}
              label={`Phrase evidence score ${analysis.score} out of 100`}
            />
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {analysis.feedback.map((feedback) => (
                <li
                  key={feedback}
                  className="rounded-xl bg-surface-muted p-3 text-xs leading-5"
                >
                  {feedback}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="rounded-2xl border border-accent/25 bg-accent/5 p-4 text-xs leading-5 text-muted">
        <Ear className="mr-2 inline h-4 w-4 text-accent" />
        The coach never scores microphone input. Use the generated phrase as a
        listening and composition model, then apply the constraint on your
        guitar and judge whether the musical evidence matches.
      </p>
    </div>
  );
}
