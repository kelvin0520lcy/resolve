import type {
  AudioPattern,
  GlossaryTermId,
} from "@/features/guitar-learning/types";

export type GuitarGlossaryEntry = {
  id: GlossaryTermId;
  term: string;
  plainEnglish: string;
  analogy: string;
  visualExample: string;
  audioExample?: AudioPattern;
  guitarExample: string;
  prerequisiteLessonId?: string;
  whyItMatters: string;
  alternativeExplanation: string;
};

const entries: GuitarGlossaryEntry[] = [
  {
    id: "pulse",
    term: "Pulse",
    plainEnglish: "The steady repeating tap underneath the music.",
    analogy: "It is the music’s heartbeat: steady even when the surface changes.",
    visualExample: "One large circle flashes at equal distances.",
    audioExample: {
      kind: "rhythm",
      subdivisions: 4,
      activeSteps: [0, 1, 2, 3],
      accentedSteps: [0],
      bpm: 60,
    },
    guitarExample: "Tap your foot four times before you touch the strings.",
    prerequisiteLessonId: "rhythm:feeling-and-identifying-the-pulse",
    whyItMatters: "A steady pulse keeps chord changes and rests in the right place.",
    alternativeExplanation:
      "If you can nod evenly through the whole song, the repeating nod is following the pulse.",
  },
  {
    id: "beat",
    term: "Beat",
    plainEnglish: "One counted point in the pulse, such as 1, 2, 3, or 4.",
    analogy: "A pulse is the row of stepping stones; each stone is one beat.",
    visualExample: "Four circles are labelled 1, 2, 3, and 4.",
    guitarExample: "Play one relaxed downstroke on each counted number.",
    prerequisiteLessonId: "rhythm:quarter-note-counting",
    whyItMatters: "Beats give every stroke and chord change a shared address.",
    alternativeExplanation:
      "The beat is the exact moment where one of your steady foot taps lands.",
  },
  {
    id: "tempo",
    term: "Tempo",
    plainEnglish: "How fast the pulse moves, measured in beats per minute.",
    analogy: "It is the walking speed of the song, not the number of notes played.",
    visualExample: "The same four circles flash slowly at 60 BPM and faster at 100 BPM.",
    guitarExample: "Keep the same downstroke pattern while changing the metronome speed.",
    prerequisiteLessonId: "guitar-language:pulse-beat-tempo-and-bar",
    whyItMatters: "A comfortable tempo lets you practise accurately before adding speed.",
    alternativeExplanation:
      "Tempo changes the distance in time between taps; it does not change which tap is beat one.",
  },
  {
    id: "bar",
    term: "Bar",
    plainEnglish: "A repeating group of beats; many guitar songs group four beats together.",
    analogy: "A bar is one box that holds a complete count of 1, 2, 3, 4.",
    visualExample: "A border surrounds four numbered beats before the count restarts.",
    guitarExample: "Play G for one group of four beats, then C for the next group.",
    prerequisiteLessonId: "guitar-language:pulse-beat-tempo-and-bar",
    whyItMatters: "Bars make song sections, chord changes, and practice loops easy to locate.",
    alternativeExplanation:
      "When the count returns to one, a new bar has begun.",
  },
  {
    id: "rhythm",
    term: "Rhythm",
    plainEnglish: "The pattern of sounds and silences placed on the beats.",
    analogy: "The pulse is graph paper; rhythm is the drawing placed on it.",
    visualExample: "Some timing slots contain a stroke and others contain deliberate space.",
    guitarExample: "Keep eight hand movements but sound only D – D U – U D U.",
    prerequisiteLessonId: "rhythm:constructing-strumming-patterns",
    whyItMatters: "Rhythm turns a chord into a recognisable musical part.",
    alternativeExplanation:
      "Two guitarists can share one pulse but play different rhythms by choosing different moments to sound.",
  },
  {
    id: "subdivision",
    term: "Subdivision",
    plainEnglish: "Splitting one beat into equal smaller timing positions.",
    analogy: "Cut one sandwich into two equal halves without changing the whole sandwich.",
    visualExample: "Each large beat opens into a number slot and an “and” slot.",
    guitarExample: "Move down on the number and up on the “and”.",
    prerequisiteLessonId: "rhythm:eighth-note-subdivisions",
    whyItMatters: "Smaller timing positions let you place upstrokes and spaces accurately.",
    alternativeExplanation:
      "The beat stays the same size; subdivision adds evenly spaced places inside it.",
  },
  {
    id: "downstroke",
    term: "Downstroke",
    plainEnglish: "The pick moves toward the floor.",
    analogy: "Your hand travels down the face of the guitar.",
    visualExample: "Down ↓ appears under a numbered count.",
    guitarExample: "Brush from the thickest string toward the thinnest strings.",
    prerequisiteLessonId: "guitar-language:du-x-and-blank-spaces",
    whyItMatters: "Named directions make strumming and picking instructions readable.",
    alternativeExplanation: "Down describes the pick’s travel, not the pitch of the note.",
  },
  {
    id: "upstroke",
    term: "Upstroke",
    plainEnglish: "The pick moves toward the ceiling.",
    analogy: "Your hand returns upward after the downstroke.",
    visualExample: "Up ↑ appears under an “and” count.",
    guitarExample: "Lightly brush from the thin strings back toward the thick strings.",
    prerequisiteLessonId: "guitar-language:du-x-and-blank-spaces",
    whyItMatters: "Alternating directions keeps the hand moving evenly.",
    alternativeExplanation: "Up describes the physical return trip of the pick.",
  },
  {
    id: "missed-stroke",
    term: "Missed stroke",
    plainEnglish: "The hand makes its timed movement but passes above the strings.",
    analogy: "A train passes the station on time without stopping.",
    visualExample: "A hollow arrow moves through a timing slot without a sound dot.",
    guitarExample: "Keep the upstroke motion but lift the pick just clear of the strings.",
    prerequisiteLessonId: "rhythm:missed-strokes",
    whyItMatters: "The hand stays on time through spaces in a strumming pattern.",
    alternativeExplanation:
      "The movement is present; only contact with the strings is missing.",
  },
  {
    id: "rest",
    term: "Rest",
    plainEnglish: "A measured period of silence.",
    analogy: "It is punctuation with an exact length, not an uncertain pause.",
    visualExample: "A bordered empty timing block shows how long the silence lasts.",
    guitarExample: "Stop the chord cleanly but keep counting until the next entry.",
    prerequisiteLessonId: "improvisation:phrasing-with-rests",
    whyItMatters: "Deliberate silence gives grooves and phrases shape.",
    alternativeExplanation: "A rest tells you precisely when not to sound.",
  },
  {
    id: "accent",
    term: "Accent",
    plainEnglish: "One stroke is intentionally stronger than nearby strokes.",
    analogy: "It is an underlined word in a spoken sentence.",
    visualExample: "A > symbol marks the stronger stroke without moving its timing.",
    guitarExample: "Play beats 2 and 4 a little more firmly while keeping the pulse even.",
    prerequisiteLessonId: "rhythm:accents",
    whyItMatters: "Accents create groove and hierarchy without adding notes.",
    alternativeExplanation: "Change the weight of the stroke, not when it arrives.",
  },
  {
    id: "muted-stroke",
    term: "Muted stroke",
    plainEnglish: "Touched strings create a short percussive sound instead of a ringing chord.",
    analogy: "The guitar briefly behaves like a small drum.",
    visualExample: "An X marks a dry, pitchless contact with the strings.",
    guitarExample: "Release fretting pressure but keep the fingers touching the strings.",
    prerequisiteLessonId: "rhythm:muted-strokes",
    whyItMatters: "Muted strokes add rhythmic detail while keeping harmony clear.",
    alternativeExplanation: "The pick contacts the strings, but the strings cannot ring freely.",
  },
  {
    id: "root",
    term: "Root",
    plainEnglish: "The note that feels like home and gives a scale or chord its name.",
    analogy: "Other notes feel like journeys; the root feels like arriving home.",
    visualExample: "Every A root is highlighted with the same home icon.",
    audioExample: { kind: "notes", midiNotes: [57, 60, 64, 57], beatSeconds: 0.5 },
    guitarExample: "In A minor pentatonic, finish on A at string 6 fret 5.",
    prerequisiteLessonId: "improvisation:tonal-centre",
    whyItMatters: "Finding home makes scale shapes and phrase endings musical.",
    alternativeExplanation: "The root is the note that makes the phrase sound finished.",
  },
  {
    id: "tonal-centre",
    term: "Tonal centre",
    plainEnglish: "The note or chord that the music feels centred around.",
    analogy: "It is the home base that the whole musical scene keeps referring to.",
    visualExample: "Phrase arrows leave A and return to A.",
    guitarExample: "Loop Am and compare endings on A, C, and D.",
    prerequisiteLessonId: "improvisation:tonal-centre",
    whyItMatters: "It explains why the same note can feel stable in one song and tense in another.",
    alternativeExplanation:
      "After you can hear a home note, tonal centre is the formal name for that home relationship.",
  },
  {
    id: "interval",
    term: "Interval",
    plainEnglish: "The distance between two notes.",
    analogy: "It is the number of steps between two places on a staircase.",
    visualExample: "A line connects two frets and labels the fret distance.",
    guitarExample: "A to C on one string is three frets, called a minor third.",
    prerequisiteLessonId: "fretboard:intervals",
    whyItMatters: "Intervals explain scale sounds, chord ingredients, and movable shapes.",
    alternativeExplanation: "Name the gap between notes rather than memorising both dots.",
  },
  {
    id: "scale",
    term: "Scale",
    plainEnglish: "A selected family of notes organised around a home note.",
    analogy: "It is a palette of notes, not a sentence you must always play in order.",
    visualExample: "Five selected notes surround a highlighted A root.",
    guitarExample: "Use A, C, and D from A minor pentatonic to create a phrase.",
    prerequisiteLessonId: "improvisation:what-a-scale-actually-represents",
    whyItMatters: "A scale supplies note choices while phrasing turns them into music.",
    alternativeExplanation: "The scale tells you which notes belong; it does not tell you what to say.",
  },
  {
    id: "scale-degree",
    term: "Scale degree",
    plainEnglish: "A note’s numbered job inside a scale.",
    analogy: "It is a role number that stays meaningful when the key changes.",
    visualExample: "Scale notes are labelled 1, 2, 3, 4, 5, 6, and 7.",
    guitarExample: "In A major, C♯ is scale degree 3.",
    prerequisiteLessonId: "improvisation:scale-degrees",
    whyItMatters: "Numbered roles make transposition and chord building easier.",
    alternativeExplanation: "The note name can change, but its place in the scale can stay the same.",
  },
  {
    id: "chord-tone",
    term: "Chord tone",
    plainEnglish: "A note that belongs directly to the chord currently sounding.",
    analogy: "It is a member of the chord’s core team.",
    visualExample: "A, C, and E remain highlighted while Am sounds.",
    guitarExample: "End an Am phrase on A, C, or E and compare the stability.",
    prerequisiteLessonId: "chords:chord-tones",
    whyItMatters: "Chord tones help improvised notes connect to changing harmony.",
    alternativeExplanation: "If the note is inside the chord grip, it is a chord tone.",
  },
  {
    id: "triad",
    term: "Triad",
    plainEnglish: "A basic three-note chord containing a root, third, and fifth.",
    analogy: "It is the smallest complete team for many major and minor chords.",
    visualExample: "Three dots are labelled root, third, and fifth.",
    guitarExample: "Play A, C, and E together on three nearby strings.",
    prerequisiteLessonId: "chords:major-and-minor-triads",
    whyItMatters: "Triads reveal chord construction and useful small voicings.",
    alternativeExplanation: "A triad is a three-note version of the chord’s essential sound.",
  },
  {
    id: "inversion",
    term: "Inversion",
    plainEnglish: "The same chord notes rearranged so a different note is lowest.",
    analogy: "The same three people stand in a different order.",
    visualExample: "A–C–E, C–E–A, and E–A–C appear side by side.",
    guitarExample: "Move between three-string Am shapes while keeping the same note names.",
    prerequisiteLessonId: "chords:triad-inversions-across-string-sets",
    whyItMatters: "Inversions create smoother chord movement and different bass sounds.",
    alternativeExplanation: "Nothing leaves the chord; only the lowest note changes.",
  },
  {
    id: "arpeggio",
    term: "Arpeggio",
    plainEnglish: "The notes of a chord played one after another.",
    analogy: "It is a chord opened into a line.",
    visualExample: "A–C–E appear together, then the same notes appear across time.",
    audioExample: { kind: "notes", midiNotes: [57, 60, 64], beatSeconds: 0.45 },
    guitarExample: "Hold Am and pick one string at a time.",
    prerequisiteLessonId: "chords:what-an-arpeggio-is",
    whyItMatters: "Arpeggios turn harmony into melodic picking patterns.",
    alternativeExplanation: "Same chord ingredients, played separately instead of together.",
  },
  {
    id: "phrase",
    term: "Phrase",
    plainEnglish: "A short musical sentence with a beginning, direction, and ending.",
    analogy: "It needs shape and punctuation, not every possible word.",
    visualExample: "A timeline shows notes, a rest, and a clear ending.",
    guitarExample: "Play three notes, leave two beats, then answer.",
    prerequisiteLessonId: "improvisation:playing-with-only-two-or-three-notes",
    whyItMatters: "Phrases make scale notes sound intentional.",
    alternativeExplanation: "A phrase is one complete musical thought you could sing back.",
  },
  {
    id: "motif",
    term: "Motif",
    plainEnglish: "A small recognisable musical idea that can be repeated or changed.",
    analogy: "It is a memorable catchphrase inside a longer conversation.",
    visualExample: "A three-note shape appears twice, then returns with one note changed.",
    guitarExample: "Repeat A–C–D, then play A–C–E.",
    prerequisiteLessonId: "improvisation:motif-development",
    whyItMatters: "Motifs give a solo identity and make variation easy to hear.",
    alternativeExplanation: "Keep enough of the tiny idea that a listener recognises it.",
  },
  {
    id: "articulation",
    term: "Articulation",
    plainEnglish: "How a note is started, connected, and ended.",
    analogy: "It is guitar pronunciation.",
    visualExample: "The same note is shown picked, slid, bent, and muted.",
    guitarExample: "Play one note normally, then slide into it and compare.",
    prerequisiteLessonId: "lead:articulation",
    whyItMatters: "Articulation changes expression without changing the note name.",
    alternativeExplanation: "The pitch tells you what note; articulation tells you how it speaks.",
  },
];

export const GUITAR_GLOSSARY = new Map(
  entries.map((entry) => [entry.id, entry]),
);

export const GUITAR_GLOSSARY_ENTRIES = entries;

export function getGuitarGlossaryEntry(termId: GlossaryTermId) {
  return GUITAR_GLOSSARY.get(termId);
}

export const GUITAR_GLOSSARY_SEARCH_ALIASES: Partial<
  Record<GlossaryTermId, string>
> = {
  pulse: "steady tap heartbeat click",
  "tonal-centre": "home note home chord key centre center",
  root: "home note chord name scale name",
  "missed-stroke": "air strum silent pass",
  rest: "planned counted silence pause",
  motif: "small repeatable musical idea riff theme hook",
  phrase: "musical sentence short idea lick",
  articulation: "note attack ending expression",
};
