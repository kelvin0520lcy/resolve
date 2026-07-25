import { midiToFrequency } from "@/features/guitar-learning/lib/music-theory";
import type { AudioPattern } from "@/features/guitar-learning/types";

type BrowserAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

type GuitarPluckOptions = {
  midi: number;
  durationSeconds: number;
  sampleRate: number;
  muted?: boolean;
};

export function slowAudioPattern(pattern: AudioPattern): AudioPattern {
  if (pattern.kind === "notes") {
    return {
      ...pattern,
      beatSeconds: Math.max(0.55, (pattern.beatSeconds ?? 0.42) * 1.6),
    };
  }
  if (pattern.kind === "chord") {
    return {
      ...pattern,
      durationSeconds: Math.max(
        1.6,
        (pattern.durationSeconds ?? 1.25) * 1.4,
      ),
    };
  }
  return {
    ...pattern,
    bpm: Math.max(30, Math.round((pattern.bpm ?? 84) * 0.7)),
  };
}

function createNoise(seed: number) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 4_294_967_296) * 2 - 1;
  };
}

/**
 * Renders a deterministic Karplus–Strong plucked string.
 *
 * The short noise excitation represents the pick attack. Repeated averaging
 * around a pitch-sized delay line models energy travelling along a string,
 * naturally producing guitar-like harmonics and decay without audio samples.
 */
export function renderGuitarPluck({
  midi,
  durationSeconds,
  sampleRate,
  muted = false,
}: GuitarPluckOptions): Float32Array {
  const safeMidi = Math.max(
    28,
    Math.min(96, Math.round(Number.isFinite(midi) ? midi : 60)),
  );
  const safeSampleRate = Math.max(
    8_000,
    Math.round(Number.isFinite(sampleRate) ? sampleRate : 44_100),
  );
  const frequency = midiToFrequency(safeMidi);
  const delayLength = Math.max(
    2,
    Math.round(safeSampleRate / frequency - 0.5),
  );
  const safeDuration = Math.max(
    0.05,
    Number.isFinite(durationSeconds) ? durationSeconds : 0.5,
  );
  const sampleCount = Math.max(
    delayLength * 2,
    Math.ceil(safeDuration * safeSampleRate),
  );
  const output = new Float32Array(sampleCount);
  const delayLine = new Float32Array(delayLength);
  const noise = createNoise(
    safeMidi * 2_654_435_761 +
      Math.round(safeDuration * 1_000) +
      (muted ? 97 : 0),
  );

  // A little correlation removes harsh white-noise fizz while retaining the
  // bright transient of a plectrum against a string.
  let previousExcitation = 0;
  for (let index = 0; index < delayLength; index += 1) {
    const excitation = noise();
    delayLine[index] =
      excitation * 0.72 + previousExcitation * 0.28;
    previousExcitation = excitation;
  }

  const damping = muted
    ? 0.82
    : Math.max(0.988, 0.997 - Math.max(0, safeMidi - 40) * 0.000055);
  const pickAttackSamples = Math.max(
    1,
    Math.round(safeSampleRate * 0.0007),
  );
  const fadeSamples = Math.min(
    sampleCount,
    Math.max(1, Math.round(safeSampleRate * (muted ? 0.012 : 0.035))),
  );

  for (let index = 0; index < sampleCount; index += 1) {
    const delayIndex = index % delayLength;
    const current = delayLine[delayIndex];
    const next = delayLine[(delayIndex + 1) % delayLength];
    delayLine[delayIndex] = (current + next) * 0.5 * damping;

    const attack =
      index < pickAttackSamples ? index / pickAttackSamples : 1;
    const remaining = sampleCount - index;
    const fade = remaining < fadeSamples ? remaining / fadeSamples : 1;
    output[index] = current * attack * fade;
  }

  let peak = 0;
  for (const sample of output) {
    peak = Math.max(peak, Math.abs(sample));
  }
  if (peak > 0) {
    const normalizer = 0.86 / peak;
    for (let index = 0; index < output.length; index += 1) {
      output[index] *= normalizer;
    }
  }

  return output;
}

export class GuitarAudioEngine {
  private context: AudioContext | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  private bufferCache = new Map<string, AudioBuffer>();

  isSupported() {
    if (typeof window === "undefined") return false;
    const browserWindow = window as BrowserAudioWindow;
    return Boolean(
      browserWindow.AudioContext ?? browserWindow.webkitAudioContext,
    );
  }

  private async ensureContext() {
    if (!this.isSupported()) return null;
    if (!this.context) {
      const browserWindow = window as BrowserAudioWindow;
      const AudioContextConstructor =
        browserWindow.AudioContext ?? browserWindow.webkitAudioContext!;
      this.context = new AudioContextConstructor();
      this.bufferCache.clear();
    }
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
    return this.context;
  }

  private getPluckBuffer(
    context: AudioContext,
    midi: number,
    duration: number,
    muted: boolean,
  ) {
    const normalizedDuration = Math.max(0.05, duration);
    const key = [
      Math.round(midi),
      normalizedDuration.toFixed(3),
      muted ? "muted" : "open",
      context.sampleRate,
    ].join(":");
    const cached = this.bufferCache.get(key);
    if (cached) {
      this.bufferCache.delete(key);
      this.bufferCache.set(key, cached);
      return cached;
    }

    const rendered = renderGuitarPluck({
      midi,
      durationSeconds: normalizedDuration,
      sampleRate: context.sampleRate,
      muted,
    });
    const buffer = context.createBuffer(
      1,
      rendered.length,
      context.sampleRate,
    );
    buffer.getChannelData(0).set(rendered);
    this.bufferCache.set(key, buffer);
    if (this.bufferCache.size > 64) {
      const oldestKey = this.bufferCache.keys().next().value;
      if (oldestKey) this.bufferCache.delete(oldestKey);
    }
    return buffer;
  }

  private schedulePluck(
    context: AudioContext,
    midi: number,
    startAt: number,
    duration: number,
    volume = 0.16,
    muted = false,
  ) {
    const source = context.createBufferSource();
    const gain = context.createGain();
    const safeDuration = Math.max(
      0.05,
      Number.isFinite(duration) ? duration : 0.5,
    );
    source.buffer = this.getPluckBuffer(
      context,
      midi,
      safeDuration,
      muted,
    );
    gain.gain.setValueAtTime(Math.max(0.001, volume), startAt);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startAt + safeDuration,
    );
    source.connect(gain);
    gain.connect(context.destination);
    this.activeSources.add(source);
    source.addEventListener(
      "ended",
      () => {
        this.activeSources.delete(source);
        source.disconnect();
        gain.disconnect();
      },
      { once: true },
    );
    source.start(startAt);
    source.stop(startAt + safeDuration + 0.015);
  }

  async play(pattern: AudioPattern): Promise<boolean> {
    const context = await this.ensureContext();
    if (!context) return false;
    this.stop();
    const startAt = context.currentTime + 0.04;

    if (pattern.kind === "notes") {
      const requestedStep = pattern.beatSeconds ?? 0.42;
      const step = Math.max(
        0.12,
        Number.isFinite(requestedStep) ? requestedStep : 0.42,
      );
      pattern.midiNotes.forEach((midi, index) => {
        this.schedulePluck(
          context,
          midi,
          startAt + index * step,
          Math.max(0.24, step * 1.22),
        );
      });
      return true;
    }

    if (pattern.kind === "chord") {
      const requestedDuration = pattern.durationSeconds ?? 1.25;
      const duration = Math.max(
        0.24,
        Number.isFinite(requestedDuration) ? requestedDuration : 1.25,
      );
      pattern.midiNotes.forEach((midi, index) => {
        this.schedulePluck(
          context,
          midi,
          startAt + index * 0.012,
          duration,
          0.095,
        );
      });
      return true;
    }

    const requestedBpm = pattern.bpm ?? 84;
    const bpm = Number.isFinite(requestedBpm) ? requestedBpm : 84;
    const beatSeconds = 60 / Math.max(30, Math.min(240, bpm));
    const stepSeconds = beatSeconds * (4 / pattern.subdivisions);
    const accents = new Set(pattern.accentedSteps ?? []);
    const muted = new Set(pattern.mutedSteps ?? []);
    for (const step of pattern.activeSteps) {
      if (
        !Number.isInteger(step) ||
        step < 0 ||
        step >= pattern.subdivisions
      ) {
        continue;
      }
      const isAccent = accents.has(step);
      const isMuted = muted.has(step);
      this.schedulePluck(
        context,
        isMuted ? 45 : isAccent ? 64 : 52,
        startAt + step * stepSeconds,
        isMuted ? 0.07 : 0.12,
        isAccent ? 0.18 : 0.105,
        true,
      );
    }
    return true;
  }

  stop() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // A scheduled source may already have ended.
      }
      try {
        source.disconnect();
      } catch {
        // Some browser implementations throw after automatic disconnect.
      }
    }
    this.activeSources.clear();
  }
}

export const guitarAudioEngine = new GuitarAudioEngine();
