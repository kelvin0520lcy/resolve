import type { GuitarPracticeSession } from "@/types";

export type GuitarLearningArea = {
  id: string;
  name: string;
  description: string;
  topics: string[];
  aliases?: string[];
};

export const GUITAR_LEARNING_AREAS: GuitarLearningArea[] = [
  {
    id: "foundations",
    name: "Foundations",
    description: "Build relaxed, accurate movement before speed.",
    topics: [
      "Posture and fretting",
      "Tuning and string names",
      "Clean chord changes",
      "Muting unwanted strings",
      "Metronome timing",
    ],
  },
  {
    id: "rhythm",
    name: "Rhythm guitar",
    description: "Become the steady pulse another musician can trust.",
    topics: [
      "Open chords",
      "Barre chords",
      "Power chords",
      "Strumming patterns",
      "Palm muting",
      "Syncopation",
    ],
  },
  {
    id: "lead",
    name: "Lead guitar",
    description: "Make single-note lines clean, controlled, and expressive.",
    topics: [
      "Alternate picking",
      "Legato",
      "Bends and intonation",
      "Vibrato",
      "Slides",
      "String skipping",
    ],
  },
  {
    id: "fretboard",
    name: "Fretboard & scales",
    aliases: ["Scales"],
    description: "See notes, intervals, shapes, and harmony across the neck.",
    topics: [
      "Fretboard note names",
      "Intervals",
      "Minor pentatonic",
      "Major scale",
      "Natural minor scale",
      "CAGED triads",
    ],
  },
  {
    id: "ear",
    name: "Ear training",
    description: "Connect the sound in your head to the instrument.",
    topics: [
      "Interval recognition",
      "Chord quality",
      "Melody transcription",
      "Rhythm transcription",
      "Tuning by ear",
    ],
  },
  {
    id: "theory",
    name: "Music theory",
    description: "Understand why chords and melodies work together.",
    topics: [
      "Building major scales",
      "Diatonic chords",
      "Chord construction",
      "Keys and progressions",
      "Rhythm notation",
    ],
  },
  {
    id: "improvisation",
    name: "Improvisation",
    description: "Turn vocabulary into phrases that sound intentional.",
    topics: [
      "Motif development",
      "Chord-tone targeting",
      "Phrasing with rests",
      "Call and response",
      "Backing-track practice",
    ],
  },
  {
    id: "repertoire",
    name: "Repertoire",
    description: "Learn complete songs instead of collecting loose riffs.",
    topics: [
      "Riff accuracy",
      "Song structure",
      "Section transitions",
      "Full-song endurance",
      "Memorisation",
      "Play-along performance",
    ],
  },
  {
    id: "songwriting",
    name: "Songwriting",
    description: "Shape riffs and ideas into complete musical statements.",
    topics: [
      "Riff writing",
      "Chord progressions",
      "Melody writing",
      "Arrangement",
      "Demo recording",
    ],
  },
  {
    id: "tone",
    name: "Tone & gear",
    description: "Learn the signal chain without letting gear replace practice.",
    topics: [
      "Pickup and control use",
      "Amp EQ",
      "Gain staging",
      "Effects order",
      "String changes",
      "Basic setup care",
    ],
  },
  {
    id: "performance",
    name: "Performance",
    description: "Keep the song moving when nerves or mistakes appear.",
    topics: [
      "Playing while standing",
      "Recording a full take",
      "Recovering from mistakes",
      "Stage confidence",
      "Listening in a band",
    ],
  },
];

export function getGuitarLearningStats(
  sessions: GuitarPracticeSession[],
) {
  return GUITAR_LEARNING_AREAS.map((area) => {
    const names = new Set([area.name, ...(area.aliases ?? [])]);
    const matchingSessions = sessions.filter((session) =>
      names.has(session.category),
    );
    const practisedTopics = new Set(
      matchingSessions.flatMap((session) => session.techniques),
    );
    return {
      ...area,
      minutes: matchingSessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ),
      sessionCount: matchingSessions.length,
      practisedTopics: area.topics.filter((topic) =>
        practisedTopics.has(topic),
      ),
    };
  });
}

export function getSuggestedGuitarArea(
  sessions: GuitarPracticeSession[],
) {
  return [...getGuitarLearningStats(sessions)].sort(
    (a, b) =>
      a.sessionCount - b.sessionCount ||
      a.minutes - b.minutes,
  )[0];
}
