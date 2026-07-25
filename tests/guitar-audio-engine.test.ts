import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GuitarAudioEngine,
  renderGuitarPluck,
  slowAudioPattern,
} from "@/features/guitar-learning/lib/audio-engine";

const starts: number[] = [];
const stops: number[] = [];
const renderedBuffers: Float32Array[] = [];
const resume = vi.fn(async () => {});
const constructorSpy = vi.fn();

class MockAudioContext {
  currentTime = 10;
  sampleRate = 48_000;
  state: AudioContextState = "suspended";
  destination = {};

  constructor() {
    constructorSpy();
  }

  resume = resume;

  createBuffer(_channels: number, length: number) {
    const channel = new Float32Array(length);
    renderedBuffers.push(channel);
    return {
      getChannelData: () => channel,
    } as AudioBuffer;
  }

  createBufferSource() {
    const listeners = new Map<string, () => void>();
    return {
      buffer: null as AudioBuffer | null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      addEventListener(event: string, listener: () => void) {
        listeners.set(event, listener);
      },
      start(at: number) {
        starts.push(at);
      },
      stop(at?: number) {
        stops.push(at ?? -1);
        listeners.get("ended")?.();
      },
    };
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
}

function averageEnergy(samples: Float32Array) {
  return (
    samples.reduce((sum, sample) => sum + sample * sample, 0) /
    Math.max(1, samples.length)
  );
}

describe("procedural guitar pluck", () => {
  it("creates slower recovery examples without mutating lesson audio", () => {
    const notes = {
      kind: "notes" as const,
      midiNotes: [57, 60],
      beatSeconds: 0.4,
    };
    const rhythm = {
      kind: "rhythm" as const,
      subdivisions: 8 as const,
      activeSteps: [0, 2],
      bpm: 100,
    };
    const slowerNotes = slowAudioPattern(notes);
    expect(
      slowerNotes.kind === "notes" ? slowerNotes.beatSeconds : 0,
    ).toBeCloseTo(0.64);
    expect(slowAudioPattern(rhythm)).toMatchObject({ bpm: 70 });
    expect(notes.beatSeconds).toBe(0.4);
    expect(rhythm.bpm).toBe(100);
  });

  it("is deterministic, non-silent, and decays like a plucked string", () => {
    const first = renderGuitarPluck({
      midi: 57,
      durationSeconds: 0.6,
      sampleRate: 12_000,
    });
    const second = renderGuitarPluck({
      midi: 57,
      durationSeconds: 0.6,
      sampleRate: 12_000,
    });
    expect(first).toEqual(second);
    expect(Math.max(...first.map(Math.abs))).toBeCloseTo(0.86, 2);
    expect(averageEnergy(first.slice(300, 1_500))).toBeGreaterThan(
      averageEnergy(first.slice(-1_200)),
    );
  });

  it("gives muted-string ticks a much shorter tail", () => {
    const open = renderGuitarPluck({
      midi: 52,
      durationSeconds: 0.35,
      sampleRate: 12_000,
    });
    const muted = renderGuitarPluck({
      midi: 52,
      durationSeconds: 0.35,
      sampleRate: 12_000,
      muted: true,
    });
    expect(averageEnergy(open.slice(1_800, 3_000))).toBeGreaterThan(
      averageEnergy(muted.slice(1_800, 3_000)) * 8,
    );
  });

  it("falls back safely when external pattern values are not finite", () => {
    const pluck = renderGuitarPluck({
      midi: Number.NaN,
      durationSeconds: Number.NaN,
      sampleRate: Number.NaN,
    });
    expect(pluck.length).toBe(22_050);
    expect(pluck.every(Number.isFinite)).toBe(true);
  });
});

describe("guitar Web Audio engine", () => {
  beforeEach(() => {
    starts.length = 0;
    stops.length = 0;
    renderedBuffers.length = 0;
    resume.mockClear();
    constructorSpy.mockClear();
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: MockAudioContext,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, "AudioContext");
  });

  it("creates its context only after play and renders guitar buffers", async () => {
    const engine = new GuitarAudioEngine();
    expect(constructorSpy).not.toHaveBeenCalled();
    expect(await engine.play({ kind: "notes", midiNotes: [69, 72] }))
      .toBe(true);
    expect(constructorSpy).toHaveBeenCalledTimes(1);
    expect(resume).toHaveBeenCalledTimes(1);
    expect(starts).toEqual([10.04, 10.459999999999999]);
    expect(renderedBuffers).toHaveLength(2);
    expect(renderedBuffers[0].some((sample) => sample !== 0)).toBe(true);
  });

  it("strums chords from low to high with a guitar buffer per note", async () => {
    const engine = new GuitarAudioEngine();
    await engine.play({
      kind: "chord",
      midiNotes: [45, 52, 57],
      durationSeconds: 1,
    });
    expect(starts).toHaveLength(3);
    expect(starts[0]).toBeCloseTo(10.04, 5);
    expect(starts[1]).toBeCloseTo(10.052, 5);
    expect(starts[2]).toBeCloseTo(10.064, 5);
    expect(renderedBuffers).toHaveLength(3);
  });

  it("uses muted guitar plucks for rhythm and ignores invalid steps", async () => {
    const engine = new GuitarAudioEngine();
    await engine.play({
      kind: "rhythm",
      subdivisions: 8,
      activeSteps: [0, 2, 7, 99],
      accentedSteps: [2],
      bpm: 120,
    });
    expect(starts).toEqual([10.04, 10.54, 11.79]);
    // Repeated unaccented ticks reuse the same rendered guitar buffer.
    expect(renderedBuffers).toHaveLength(2);
    expect(renderedBuffers.every((buffer) => buffer.length < 6_000)).toBe(
      true,
    );
  });

  it("reports unsupported browsers without throwing", async () => {
    Reflect.deleteProperty(window, "AudioContext");
    const engine = new GuitarAudioEngine();
    expect(engine.isSupported()).toBe(false);
    expect(await engine.play({ kind: "chord", midiNotes: [57, 60, 64] }))
      .toBe(false);
  });
});
