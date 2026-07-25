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
  variation?: number;
};

const GUITAR_TONE_MODEL_VERSION = "steel-string-v2";

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
  variation = 0,
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
  const safeVariation =
    Math.abs(
      Math.round(Number.isFinite(variation) ? variation : 0),
    ) % 4;
  const noise = createNoise(
    safeMidi * 2_654_435_761 +
      Math.round(safeDuration * 1_000) +
      (muted ? 97 : 0) +
      safeVariation * 1_013_904_223,
  );

  // A steel string starts with a broad, asymmetric pick impulse. Keeping most
  // of the noise uncorrelated preserves the upper partials; the delayed
  // subtraction models the harmonic notch created by the pick position.
  const excitation = new Float32Array(delayLength);
  const pickOffset = Math.max(
    1,
    Math.min(
      delayLength - 1,
      Math.round(delayLength * (0.17 + safeVariation * 0.013)),
    ),
  );
  let previousExcitation = 0;
  for (let index = 0; index < delayLength; index += 1) {
    const raw = noise();
    const correlated = muted
      ? raw * 0.64 + previousExcitation * 0.36
      : raw * 0.84 + previousExcitation * 0.16;
    excitation[index] = correlated;
    const pickReflection =
      index >= pickOffset ? excitation[index - pickOffset] : 0;
    delayLine[index] =
      correlated - pickReflection * (muted ? 0.12 : 0.28);
    previousExcitation = raw;
  }

  const damping = muted
    ? 0.8
    : Math.max(0.993, 0.9982 - Math.max(0, safeMidi - 40) * 0.00004);
  const currentWeight = muted ? 0.5 : 0.68;
  const nextWeight = 1 - currentWeight;
  const pickAttackSamples = Math.max(
    1,
    Math.round(safeSampleRate * 0.00018),
  );
  const fadeSamples = Math.min(
    sampleCount,
    Math.max(1, Math.round(safeSampleRate * (muted ? 0.008 : 0.022))),
  );
  const pickDecaySamples = Math.max(
    1,
    safeSampleRate * (muted ? 0.0012 : 0.0032),
  );
  const pickupLowPassCoefficient =
    1 - Math.exp((-2 * Math.PI * 1_650) / safeSampleRate);
  const dcBlockCoefficient = Math.exp(
    (-2 * Math.PI * 38) / safeSampleRate,
  );
  let pickupLowPass = 0;
  let previousVoicedSample = 0;
  let previousHighPassedSample = 0;

  for (let index = 0; index < sampleCount; index += 1) {
    const delayIndex = index % delayLength;
    const current = delayLine[delayIndex];
    const next = delayLine[(delayIndex + 1) % delayLength];
    delayLine[delayIndex] =
      (current * currentWeight + next * nextWeight) * damping;

    const attack =
      index < pickAttackSamples ? index / pickAttackSamples : 1;
    const remaining = sampleCount - index;
    const fade = remaining < fadeSamples ? remaining / fadeSamples : 1;
    const pickTransient =
      noise() *
      Math.exp(-index / pickDecaySamples) *
      (muted ? 0.24 : 0.16);
    const stringSample = (current + pickTransient) * attack * fade;

    // A clean electric-guitar pickup has more presence than the raw delay
    // line. This gentle high shelf adds pick definition without the brittle
    // fizz of simply mixing in more white noise.
    pickupLowPass +=
      (stringSample - pickupLowPass) * pickupLowPassCoefficient;
    const presence = stringSample - pickupLowPass;
    const voicedSample =
      stringSample + presence * (muted ? 0.18 : 0.42);

    // Remove sub-audio drift before a mild saturation stage. The saturation
    // adds the subtle upper harmonics and compression of a clean guitar amp.
    const highPassed =
      voicedSample -
      previousVoicedSample +
      dcBlockCoefficient * previousHighPassedSample;
    previousVoicedSample = voicedSample;
    previousHighPassedSample = highPassed;
    output[index] = Math.tanh(highPassed * (muted ? 1.05 : 1.16));
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
  private pluckSequence = 0;

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
    variation: number,
  ) {
    const normalizedDuration = Math.max(0.05, duration);
    const key = [
      GUITAR_TONE_MODEL_VERSION,
      Math.round(midi),
      normalizedDuration.toFixed(3),
      muted ? "muted" : "open",
      variation,
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
      variation,
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
    const variation = this.pluckSequence % 4;
    this.pluckSequence += 1;
    source.buffer = this.getPluckBuffer(
      context,
      midi,
      safeDuration,
      muted,
      variation,
    );
    gain.gain.setValueAtTime(Math.max(0.001, volume), startAt);
    const releaseSeconds = Math.min(
      muted ? 0.012 : 0.045,
      safeDuration * (muted ? 0.18 : 0.16),
    );
    const releaseAt = startAt + safeDuration - releaseSeconds;
    gain.gain.setValueAtTime(Math.max(0.001, volume), releaseAt);
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
