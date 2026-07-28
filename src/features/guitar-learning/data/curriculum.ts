import { categoryDefaultMidi } from "@/features/guitar-learning/lib/music-theory";
import {
  AUTHORED_GUITAR_LESSONS,
  AUTHORED_GUITAR_PATHS,
} from "@/features/guitar-learning/data/authored-curriculum";
import type {
  GuitarCoach,
  GuitarLearningPath,
  GuitarLesson,
  GuitarLessonCategory,
  GuitarLessonSection,
  GuitarPathId,
  GuitarToolId,
} from "@/features/guitar-learning/types";

type PathDefinition = {
  id: GuitarPathId;
  title: string;
  description: string;
  coach: GuitarCoach;
  category: GuitarLessonCategory;
  concepts: string[];
};

const PATH_DEFINITIONS: PathDefinition[] = [
  {
    id: "rhythm",
    title: "Rhythm Guitar",
    description:
      "Turn a steady pulse into convincing strumming, tight power-chord parts, and dynamic Japanese-rock grooves.",
    coach: "nijika",
    category: "rhythm",
    concepts: [
      "Feeling and identifying the pulse",
      "Quarter-note counting",
      "Eighth-note subdivisions",
      "Continuous strumming-hand movement",
      "Downstroke and upstroke placement",
      "Missed strokes",
      "Accents",
      "Muted strokes",
      "Sixteenth-note subdivisions",
      "Constructing strumming patterns",
      "Rests",
      "Syncopation",
      "Anticipated chord changes",
      "Palm muting",
      "Power-chord rhythm",
      "Dynamic control",
      "Arpeggiated rhythm",
      "Combining full and partial chords",
      "Rhythmic fills",
      "Creating a rhythm part from a groove",
      "Recovering after rhythmic mistakes",
      "Creating rhythm variation between sections",
      "Building intensity through rhythm",
      "Japanese-rock rhythm vocabulary",
    ],
  },
  {
    id: "lead",
    title: "Lead Guitar",
    description:
      "Build relaxed mechanics and turn bends, vibrato, articulation, and dynamics into expressive melodic lines.",
    coach: "kita",
    category: "lead",
    concepts: [
      "Relaxed pick grip",
      "Pick depth",
      "Alternate picking",
      "One-string picking",
      "String crossing",
      "Inside picking",
      "Outside picking",
      "String skipping",
      "Hammer-ons",
      "Pull-offs",
      "Slides",
      "Position shifts",
      "Basic bends",
      "Whole-step bends",
      "Bend pitch targeting",
      "Pre-bends",
      "Vibrato",
      "Combining bends and vibrato",
      "Legato phrasing",
      "Tremolo picking",
      "Double stops",
      "Octave melodies",
      "Muting unused strings",
      "Articulation",
      "Dynamics",
      "Building a lead phrase",
      "Building a melodic fill",
      "Creating a short solo",
      "Emotional lead-guitar phrasing",
    ],
  },
  {
    id: "fretboard",
    title: "Fretboard Knowledge",
    description:
      "Replace shape memorisation with a connected view of notes, intervals, octaves, triads, and chord tones.",
    coach: "ryo",
    category: "fretboard",
    concepts: [
      "Open-string names",
      "The musical alphabet",
      "Sharps and flats",
      "Natural notes on the sixth string",
      "Natural notes on the fifth string",
      "Octave shapes",
      "Finding root notes",
      "Whole tones and semitones",
      "Intervals",
      "Interval shapes",
      "Notes on all six strings",
      "Major triads",
      "Minor triads",
      "Triad inversions",
      "Triads across string sets",
      "CAGED chord relationships",
      "Chord tones within scale shapes",
      "Connecting adjacent scale positions",
      "Horizontal fretboard movement",
      "Visualising without diagrams",
    ],
  },
  {
    id: "improvisation",
    title: "Scales & Improvisation",
    description:
      "Learn where notes come from, then shape them into intentional phrases rather than running patterns.",
    coach: "bocchi",
    category: "improvisation",
    concepts: [
      "What a scale actually represents",
      "Tonal centre",
      "Root-note targeting",
      "Minor pentatonic position one",
      "Playing with only two or three notes",
      "Phrase endings",
      "Phrasing with rests",
      "Motif development",
      "Repetition and variation",
      "Call and response",
      "Slides between phrases",
      "Bend targets",
      "Major pentatonic",
      "Major versus minor pentatonic",
      "Relative major and minor",
      "Natural-minor construction",
      "Major-scale construction",
      "Scale degrees",
      "Stable notes and tension notes",
      "Chord-tone targeting over a progression",
      "Connecting pentatonic positions",
      "Horizontal movement",
      "Improvising over one chord",
      "Improvising over a progression",
      "Following chord changes",
      "Tension and resolution",
      "Phrase contour",
      "Building an emotional guitar phrase",
      "Creating a complete solo",
    ],
  },
  {
    id: "chords",
    title: "Chords, Triads & Arpeggios",
    description:
      "Understand chord ingredients, economical voicings, smooth voice leading, and melodic arpeggio use.",
    coach: "ryo",
    category: "chords",
    concepts: [
      "Root, third, and fifth",
      "Major and minor chord construction",
      "Power chords",
      "Open-chord construction",
      "Barre-chord construction",
      "Movable chord shapes",
      "Add9 and suspended chord colours",
      "Seventh chords",
      "Major and minor triads",
      "Triad inversions across string sets",
      "Connecting triads",
      "What an arpeggio is",
      "Scale versus arpeggio",
      "Chord tones",
      "Arpeggiated rhythm",
      "Chord-tone targeting",
      "Voice leading",
      "Pedal tones",
      "Chord embellishments",
      "Partial chords",
      "Creating melodic chord movement",
      "Emotional chord voicings",
    ],
  },
  {
    id: "ear-theory",
    title: "Ear & Theory",
    description:
      "Connect sounds to useful names: pitch distance, chord quality, harmony, transcription, and transposition.",
    coach: "nijika",
    category: "ear",
    concepts: [
      "Higher and lower pitch",
      "Same and different notes",
      "Semitone and whole-tone sound",
      "Major versus minor",
      "Interval recognition",
      "Matching a heard note",
      "Finding a heard note on the guitar",
      "Rhythm imitation",
      "Chord-quality recognition",
      "Tension and resolution by ear",
      "Scale construction",
      "Chord construction",
      "Diatonic chords",
      "Roman-numeral progressions",
      "Tonic function",
      "Predominant function",
      "Dominant function",
      "Common progressions",
      "Relative major and minor",
      "Transposition",
      "Melody transcription",
      "Rhythm transcription",
      "Hearing chord changes",
      "Recognising phrase endings",
    ],
  },
  {
    id: "application",
    title: "Musical Application",
    description:
      "Turn isolated skills into riffs, arrangements, transitions, solos, and complete playable song sections.",
    coach: "kita",
    category: "application",
    concepts: [
      "Learning a riff efficiently",
      "Dividing a song into sections",
      "Identifying repeated ideas",
      "Simplifying difficult passages",
      "Section transitions",
      "Turning chords into arpeggios",
      "Adding chord embellishments",
      "Creating a rhythmic variation",
      "Creating a melodic fill",
      "Creating an intro",
      "Creating an outro",
      "Building a solo",
      "Playing over a progression",
      "Controlling dynamics",
      "Recovering after mistakes",
      "Building emotional intensity",
      "Creating contrast between sections",
      "Japanese-rock arrangement concepts",
    ],
  },
];

export const REQUIRED_SEED_TITLES = [
  "Continuous strumming-hand movement",
  "Eighth-note subdivisions",
  "Sixteenth-note subdivisions",
  "Missed strokes",
  "Accents",
  "Muted strokes",
  "Syncopation",
  "Palm muting",
  "Power-chord rhythm",
  "Alternate picking",
  "String crossing",
  "Minor pentatonic position one",
  "Root-note targeting",
  "Phrase endings",
  "Motif development",
  "Repetition and variation",
  "Call and response",
  "Phrasing with rests",
  "Basic bends",
  "Bend pitch targeting",
  "Vibrato",
  "Natural notes on the sixth string",
  "Natural notes on the fifth string",
  "Octave shapes",
  "Intervals",
  "Major triads",
  "Minor triads",
  "Triad inversions",
  "Chord tones",
  "Major-scale construction",
  "Natural-minor construction",
  "Scale versus arpeggio",
  "Major and minor chord construction",
  "Roman-numeral progressions",
  "Tension and resolution",
  "Building an emotional guitar phrase",
  "Connecting pentatonic positions",
  "Chord-tone targeting over a progression",
  "Add9 and suspended chord colours",
  "Creating rhythm variation between sections",
] as const;

const CORE_LESSON_COPY: Partial<
  Record<
    (typeof REQUIRED_SEED_TITLES)[number],
    {
      explanation: string;
      connection: string;
      technique: string;
      confusion: string;
      application: string;
      listenFor: string;
    }
  >
> = {
  "Continuous strumming-hand movement": {
    explanation:
      "The hand keeps tracing equal down-up subdivisions even when the pick intentionally misses the strings. The sounding strokes are selections from that uninterrupted motion.",
    connection:
      "Think of the motion as a visible metronome: the numbered eighth-note counts travel down and every ‘and’ returns up.",
    technique:
      "Use a small, loose wrist arc and let the pick skim through the strings. Keep the arc identical on sounding and missed strokes.",
    confusion:
      "A missed stroke is still a timed movement. Freezing the hand during silence makes the next attack late.",
    application:
      "Keep one continuous eighth-note motion while changing a plain four-beat chord part into D – D U – U D U.",
    listenFor:
      "The pulse should remain even through the two silent passes; no stroke should sound rushed after a gap.",
  },
  "Eighth-note subdivisions": {
    explanation:
      "Eighth notes divide each beat into two equal locations: the number and the ‘and’. They create eight possible attack points in a four-beat bar.",
    connection:
      "Quarter notes already mark the four main beats; eighth notes add one evenly spaced point between each pair.",
    technique:
      "Count aloud while tapping first, then map downstrokes to numbers and upstrokes to ‘ands’ with a relaxed wrist.",
    confusion:
      "The ‘and’ is a location in time, not an instruction to play. It may be sounded or passed through silently.",
    application:
      "Build a one-bar groove that plays all four numbered beats and only the ‘and’ after beats two and four.",
    listenFor:
      "Every number-to-and distance should equal every and-to-number distance.",
  },
  "Sixteenth-note subdivisions": {
    explanation:
      "Sixteenth notes divide every beat into four equal locations counted number-e-and-a, providing sixteen possible attacks per bar.",
    connection:
      "They refine the same beat used by eighth notes: each eighth-note half is divided once more.",
    technique:
      "Start below performance speed, keep the wrist compact, and say all four syllables even when only some strokes sound.",
    confusion:
      "Sixteenth-note rhythm does not mean playing every subdivision; it means keeping all locations available.",
    application:
      "Accent the numbered pulse, add one muted ‘e’, and leave an ‘a’ silent without changing hand speed.",
    listenFor:
      "The subdivision must stay square and even; accents change weight, not spacing.",
  },
  "Missed strokes": {
    explanation:
      "A missed stroke is a deliberate pass above the strings that preserves the strumming cycle while creating space.",
    connection:
      "It uses the same hand path as a played stroke, just with slightly less depth so the pick does not contact the strings.",
    technique:
      "Move from the wrist at the same speed and lift the pick only enough to clear the strings.",
    confusion:
      "Missed does not mean stopped. Stopping turns a rhythmic choice into a timing problem.",
    application:
      "Transform eight straight attacks into D – D U – U D U by missing two positions while counting every subdivision.",
    listenFor:
      "The attack after each gap should land without a lurch or extra emphasis.",
  },
  Accents: {
    explanation:
      "An accent gives one attack more weight than its neighbours, creating hierarchy without changing the grid.",
    connection:
      "The timing stays identical to an unaccented groove; only pick speed, depth, or string range changes.",
    technique:
      "Use a slightly faster, broader stroke for the accent, then immediately return to the quiet motion.",
    confusion:
      "Accenting by arriving early damages time. Loudness and placement are separate controls.",
    application:
      "Play continuous eighth notes and make beats two and four speak above the surrounding strokes.",
    listenFor:
      "The backbeat should stand forward while the distance between strokes remains unchanged.",
  },
  "Muted strokes": {
    explanation:
      "A muted stroke replaces ringing pitch with a short percussive attack while keeping the subdivision audible.",
    connection:
      "The strumming hand performs a normal stroke while the fretting hand releases pressure without leaving the strings.",
    technique:
      "Maintain light fretting-hand contact across the strings and check that no harmonic or open string rings.",
    confusion:
      "Lifting the fingers completely can expose open strings; pressing too hard produces a chord.",
    application:
      "Place muted attacks between two ringing power-chord hits to create a drum-like conversation.",
    listenFor:
      "Hear a dry, pitchless click with the same rhythmic authority as the chord attacks.",
  },
  Syncopation: {
    explanation:
      "Syncopation gives emphasis to weaker subdivisions or sustains across expected strong beats.",
    connection:
      "The underlying numbered pulse remains stable even when the most noticeable attacks occur between it.",
    technique:
      "Keep the body feeling the main beat and count the complete grid instead of chasing only the sounding notes.",
    confusion:
      "Syncopation is not random displacement; every attack still has an exact subdivision address.",
    application:
      "Move one chord attack from beat four to the ‘and’ of three and let it ring across four.",
    listenFor:
      "The offbeat should create forward pull while the hidden main pulse remains easy to feel.",
  },
  "Palm muting": {
    explanation:
      "Palm muting shortens sustain by resting the picking-hand edge near the bridge while the note is attacked.",
    connection:
      "It changes the envelope of the same fretted note: pitch remains, but the sound becomes shorter and denser.",
    technique:
      "Touch the strings where they leave the saddles; move millimetres at a time until pitch and controlled thump coexist.",
    confusion:
      "Moving too far toward the neck chokes the pitch, while moving behind the saddles has no effect.",
    application:
      "Palm-mute a verse power-chord pulse, then lift the hand for the final two open chorus attacks.",
    listenFor:
      "The muted note needs a clear pitch centre and fast decay, not a dead click.",
  },
  "Power-chord rhythm": {
    explanation:
      "Power chords reduce harmony to root and fifth, leaving a stable shape that can carry precise, high-energy rhythm.",
    connection:
      "Because the shape moves as one unit, attention can shift from chord spelling to attacks, releases, muting, and accents.",
    technique:
      "Fret the root and fifth cleanly, mute unused strings with spare finger contact, and release pressure between short attacks.",
    confusion:
      "Gain cannot hide uncontrolled string noise; both hands must define when the chord starts and stops.",
    application:
      "Create a two-chord part using short palm-muted eighths and two open accented hits at the end of the bar.",
    listenFor:
      "Every attack should have one clear low root, a stable fifth, and intentional silence around it.",
  },
  "Alternate picking": {
    explanation:
      "Alternate picking assigns consecutive subdivisions to alternating down and up movements.",
    connection:
      "It is the single-note version of continuous strumming: the pick keeps a predictable pendulum motion.",
    technique:
      "Expose only a small pick tip, use a shallow path, and let wrist rotation do more work than the forearm.",
    confusion:
      "Restarting with a downstroke after every pause can destroy the subdivision orientation.",
    application:
      "Play four notes on one string as D U D U, rest for four subdivisions, then resume with the direction the grid requires.",
    listenFor:
      "Down and up attacks should match in volume and timing.",
  },
  "String crossing": {
    explanation:
      "String crossing coordinates alternate picking with movement from one string plane to another.",
    connection:
      "The down-up sequence continues; only the string target changes.",
    technique:
      "Use the smallest vertical motion that clears the adjacent string and prepare the new string before the beat.",
    confusion:
      "Large hopping motions waste time, while ignoring pick escape can trap the pick between strings.",
    application:
      "Play two notes per string across three adjacent strings, then reverse without resetting the pick direction.",
    listenFor:
      "The note at each crossing should be as even and clean as notes played on one string.",
  },
  "Minor pentatonic position one": {
    explanation:
      "The first minor-pentatonic position places five pitch classes in a compact two-notes-per-string shape around a minor root.",
    connection:
      "It is a map of intervals—root, minor third, fourth, fifth, and minor seventh—not a lick by itself.",
    technique:
      "Keep fingers close to the frets, use one finger per assigned fret, and pause on every root to hear the centre.",
    confusion:
      "Owning the shape means locating its roots and making phrases, not merely running from bottom to top.",
    application:
      "Improvise for four bars using only three notes from the shape, ending every second phrase on a root.",
    listenFor:
      "Root endings should sound settled; the other notes should sound like different shades around that centre.",
  },
  "Root-note targeting": {
    explanation:
      "Root-note targeting deliberately places the tonal centre at structurally important moments such as phrase endings.",
    connection:
      "A scale shape becomes musical when its repeated root locations act as destinations rather than just dots.",
    technique:
      "Locate every root in the working position before playing and approach one from above, below, and by a slide.",
    confusion:
      "Landing on the root constantly sounds static; targeting means choosing meaningful arrivals.",
    application:
      "Create two phrases that wander through A minor pentatonic and resolve to different A roots.",
    listenFor:
      "Notice the drop in harmonic tension at the target even when the rhythm and register change.",
  },
  "Phrase endings": {
    explanation:
      "A phrase ending combines pitch stability, rhythm, articulation, and space to signal a musical full stop or comma.",
    connection:
      "Like spoken language, a guitar line can sound complete, questioning, or interrupted depending on its final gesture.",
    technique:
      "Plan the destination before the phrase begins and leave enough time to control the final note’s release.",
    confusion:
      "Stopping because the shape ran out is not the same as composing an ending.",
    application:
      "Play the same opening twice, ending once on the root and once on a tense note followed by silence.",
    listenFor:
      "Compare closure: one ending should settle, while the other invites a response.",
  },
  "Motif development": {
    explanation:
      "A motif is a small recognisable rhythmic-pitch idea; development preserves its identity while changing one feature.",
    connection:
      "It works like repeating a sentence with a different final word: the listener recognises both continuity and movement.",
    technique:
      "Keep the original motif short enough to remember, then vary only ending note, rhythm, register, or articulation.",
    confusion:
      "Changing every detail creates a new idea rather than developing the existing one.",
    application:
      "Invent a three-note motif and produce three versions: new ending, displaced rhythm, and octave shift.",
    listenFor:
      "Each version should still make the original idea easy to recognise.",
  },
  "Repetition and variation": {
    explanation:
      "Repetition gives a phrase identity; variation prevents that identity from becoming predictable.",
    connection:
      "A motif can be stated, confirmed, and then altered just enough to create direction.",
    technique:
      "Repeat accurately before varying, so differences are intentional rather than accidental.",
    confusion:
      "Constant variation can sound like wandering, while exact endless repetition loses narrative.",
    application:
      "Use an A-A-B-A phrase plan, changing only the final two notes in B.",
    listenFor:
      "The listener should anticipate the return and clearly notice the purposeful surprise.",
  },
  "Call and response": {
    explanation:
      "Call and response pairs one musical statement with a second phrase that answers its rhythm, contour, or emotional claim.",
    connection:
      "Phrase endings already create punctuation; a call uses an open ending and a response supplies closure.",
    technique:
      "Leave a real gap between phrases and give the answer one obvious relationship to the call.",
    confusion:
      "Two uninterrupted licks do not converse because the ear never receives space to interpret the first.",
    application:
      "Record or imagine a two-beat call, leave two beats empty, then answer in a different register.",
    listenFor:
      "The response should feel causally connected yet complete the thought.",
  },
  "Phrasing with rests": {
    explanation:
      "Rests frame musical ideas, reveal the backing groove, and create anticipation before the next attack.",
    connection:
      "A rest occupies measured time just like a played note, so it can be composed and repeated.",
    technique:
      "Mute cleanly with both hands at the start of the rest and keep counting through the silence.",
    confusion:
      "Silence caused by uncertainty feels different from a precisely placed, confidently released rest.",
    application:
      "Limit each one-bar phrase to two beats of sound and two beats of deliberate silence.",
    listenFor:
      "The groove should continue in your mind, and the next phrase should enter exactly where intended.",
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toolForCategory(category: GuitarLessonCategory): GuitarToolId {
  if (category === "rhythm") return "rhythm";
  if (category === "lead") return "picking";
  if (category === "fretboard") return "fretboard";
  if (category === "improvisation") return "improvisation";
  if (category === "chords") return "chords";
  if (category === "ear") return "ear-training";
  return "phrase-builder";
}

function visualTypeForCategory(
  category: GuitarLessonCategory,
):
  | "fretboard"
  | "rhythm-grid"
  | "picking-animation"
  | "chord-diagram"
  | "scale-comparison"
  | "song-structure" {
  if (category === "rhythm") return "rhythm-grid";
  if (category === "lead") return "picking-animation";
  if (category === "chords") return "chord-diagram";
  if (category === "ear" || category === "theory") {
    return "scale-comparison";
  }
  if (category === "application") return "song-structure";
  return "fretboard";
}

function visualGuideForCategory(
  title: string,
  category: GuitarLessonCategory,
) {
  if (category === "rhythm") {
    return {
      body:
        "Read the diagram from top to bottom: count location, continuous hand direction, then the stroke that actually sounds.",
      observationGuide: [
        "Point to every numbered beat before reading the smaller subdivisions.",
        "Trace the D/U row without stopping at a silent or muted cell.",
        `Find the cell where ${title.toLowerCase()} changes the groove without moving the pulse.`,
      ],
      successCriteria:
        "You can count the entire grid aloud and identify exactly which hand movements create sound, silence, or emphasis.",
    };
  }
  if (category === "lead") {
    return {
      body:
        "Follow the pick path one event at a time. String height, pick direction, and articulation are separate controls.",
      observationGuide: [
        "Say down or up before following each arrow.",
        "Notice whether the next event stays on one string or crosses to another.",
        `Identify the smallest movement that performs ${title.toLowerCase()} cleanly.`,
      ],
      successCriteria:
        "You can predict the next pick direction and string before playing the sequence.",
    };
  }
  if (category === "chords") {
    return {
      body:
        "Use the interval recipe first, then inspect how one playable voicing distributes those ingredients across the strings.",
      observationGuide: [
        "Name the root before reading any chord-shape dots.",
        "Trace the third or suspended note that determines the chord colour.",
        `Compare the formula with the voicing used for ${title.toLowerCase()}.`,
      ],
      successCriteria:
        "You can name the chord ingredients and locate which string carries each important colour tone.",
    };
  }
  if (category === "ear" || category === "theory") {
    return {
      body:
        "Connect three representations of the same idea: what you hear, the interval or function label, and where it can be played.",
      observationGuide: [
        "Start with the sound description instead of the theory name.",
        "Follow the distance or harmonic-function arrow in the centre.",
        `Use the final guitar example to verify ${title.toLowerCase()} physically.`,
      ],
      successCriteria:
        "You can move from sound to label to guitar location—and reverse that route—without guessing.",
    };
  }
  if (category === "application") {
    return {
      body:
        "Treat the song as a timeline of sections, transitions, and intensity rather than one uninterrupted block.",
      observationGuide: [
        "Find the smallest section or transition that contains the problem.",
        "Separate what repeats from what changes on the next pass.",
        `Choose where ${title.toLowerCase()} belongs in the arrangement timeline.`,
      ],
      successCriteria:
        "You can point to the exact section, transition, or repeat where the musical decision happens.",
    };
  }
  return {
    body:
      "Use the root as an anchor, then read the highlighted notes as interval relationships rather than isolated dots.",
    observationGuide: [
      "Find every highlighted root before following the surrounding notes.",
      "Trace one relationship across two neighbouring strings.",
      `Explain how the repeated shape supports ${title.toLowerCase()}.`,
    ],
    successCriteria:
      "You can find the same relationship in at least two places and explain it without relying on the diagram.",
  };
}

function guidedExerciseForCategory(
  title: string,
  category: GuitarLessonCategory,
) {
  if (category === "rhythm") {
    return {
      body: `Build ${title.toLowerCase()} from a counted hand motion before adding chord changes.`,
      steps: [
        "Mute the strings with the fretting hand and count one complete bar aloud.",
        "Move the strumming hand through every subdivision, including the silent positions.",
        "Add only the required sounding strokes at 60 BPM and repeat the bar three times.",
        "Play the same bar with one chord change while keeping the count and hand motion unchanged.",
      ],
      completionPrompt:
        "The exercise is complete when three bars have identical timing and the silent hand passes remain visible.",
    };
  }
  if (category === "lead") {
    return {
      body: `Isolate the smallest physical motion required for ${title.toLowerCase()}, then place it inside a phrase.`,
      steps: [
        "Choose one comfortable note or two adjacent strings and remove all unnecessary fretting pressure.",
        "Perform the motion five times slowly while watching pick depth and unused-string muting.",
        "Add a 60 BPM pulse and place one clean movement on each click without increasing its size.",
        "Use the movement once inside a short three-note phrase, leaving a rest after it.",
      ],
      completionPrompt:
        "Continue only when the isolated motion and the phrase version feel equally relaxed and controlled.",
    };
  }
  if (category === "fretboard") {
    return {
      body: `Turn ${title.toLowerCase()} into a location-and-sound relationship rather than a memorised diagram.`,
      steps: [
        "Choose A as a temporary root and find the first example shown in the visual.",
        "Say the note name and interval role aloud before playing it.",
        "Find the same relationship on another string or in another octave.",
        "Hide the visual, locate both examples again, and describe the route you used.",
      ],
      completionPrompt:
        "You are ready when you can relocate the relationship from an anchor note instead of scanning every fret.",
    };
  }
  if (category === "improvisation") {
    return {
      body: `Use ${title.toLowerCase()} as one audible phrase decision over a stable tonal centre.`,
      steps: [
        "Start an A minor drone or backing context and locate two safe anchor notes.",
        "Create a two-beat call using no more than three notes, then leave two beats of silence.",
        `Create an answer that demonstrates ${title.toLowerCase()} while preserving one feature of the call.`,
        "Repeat both phrases, changing only the ending, and compare which version communicates more clearly.",
      ],
      completionPrompt:
        "The result should sound like two intentional phrases, not a scale run with an accidental pause.",
    };
  }
  if (category === "chords") {
    return {
      body: `Build ${title.toLowerCase()} from interval ingredients before relying on a memorised grip.`,
      steps: [
        "Name the root and write or say the interval recipe shown in the visual.",
        "Locate each ingredient in one small three- or four-string area.",
        "Fret the notes together and check every string individually for clean sound or intentional muting.",
        "Move to a second voicing while keeping shared notes still whenever possible.",
      ],
      completionPrompt:
        "The voicing is understood when you can identify its ingredients and move it without losing clean note separation.",
    };
  }
  if (category === "ear" || category === "theory") {
    return {
      body: `Learn ${title.toLowerCase()} through sound first, then confirm the label on the guitar.`,
      steps: [
        "Play the listening example three times without looking at the answer or touching the guitar.",
        "Hum the final note or clap the rhythm back from memory.",
        "State one audible clue—direction, distance, chord colour, function, or rhythmic location.",
        "Use the fretboard, chord, or rhythm tool to reproduce the answer and compare it with the original.",
      ],
      completionPrompt:
        "The exercise is complete when your audible clue predicts the answer before the theory label appears.",
    };
  }
  return {
    body: `Place ${title.toLowerCase()} inside a real song section instead of practising it as an isolated trick.`,
    steps: [
      "Choose a four- or eight-bar section and identify its musical job in one sentence.",
      "Mark the exact beat or transition where the target idea begins and ends.",
      "Practise that small unit three times, then reconnect one bar before and one bar after it.",
      "Record or play the full section twice and compare timing, dynamics, and recovery after mistakes.",
    ],
    completionPrompt:
      "The application is ready when the complete section flows through the edited moment without a visible restart.",
  };
}

function getCoreCopy(title: string, category: GuitarLessonCategory) {
  const explicit =
    CORE_LESSON_COPY[title as keyof typeof CORE_LESSON_COPY];
  if (explicit) return explicit;

  const domain =
    category === "rhythm"
      ? "the subdivision grid and continuous hand motion"
      : category === "lead"
        ? "relaxed picking mechanics and intentional articulation"
        : category === "fretboard"
          ? "the repeating note-and-interval map"
          : category === "improvisation"
            ? "tonal centre, phrase shape, and purposeful note choice"
            : category === "chords"
              ? "root, interval roles, and economical fretting"
              : category === "ear"
                ? "the audible relationship before its theory label"
                : "the musical role of each section";

  return {
    explanation: `${title} is a practical way to organise ${domain}. The concept is useful only when you can hear, locate, and apply it—not merely name it.`,
    connection: `Connect ${title.toLowerCase()} to ${domain}; keep one familiar reference stable while noticing the new relationship.`,
    technique: `Work slowly enough to keep both hands relaxed. Prepare the next movement early, minimise excess motion, and stop if tension changes the sound.`,
    confusion: `A common trap is memorising the visible shape or label without checking its timing, sound, and function in context.`,
    application: `Create a two-bar guitar part that makes ${title.toLowerCase()} audible, then make one controlled variation while preserving the pulse.`,
    listenFor: `Listen for a clear before-and-after difference and check that the intended relationship remains stable when the context changes.`,
  };
}

function buildSections(
  id: string,
  title: string,
  category: GuitarLessonCategory,
  previousTitle?: string,
): GuitarLessonSection[] {
  const copy = getCoreCopy(title, category);
  const toolId = toolForCategory(category);
  const midiNotes = categoryDefaultMidi(category);
  const visualGuide = visualGuideForCategory(title, category);
  const guidedExercise = guidedExerciseForCategory(title, category);

  return [
    {
      id: `${id}:explanation`,
      type: "explanation",
      title: "Hear the idea",
      body: copy.explanation,
      takeaway: `You understand ${title.toLowerCase()} when you can identify it by sound, explain its role, and use it deliberately.`,
      required: true,
    },
    {
      id: `${id}:connection`,
      type: "connection",
      title: "Connect what you know",
      knownConcept: previousTitle ?? "A steady pulse and a clear tonal centre",
      body: copy.connection,
      required: true,
    },
    {
      id: `${id}:visual`,
      type: visualTypeForCategory(category),
      title: "See it in motion",
      body: visualGuide.body,
      toolId,
      prompt: `Locate or construct ${title.toLowerCase()}, then explain what changed and what stayed constant.`,
      observationGuide: visualGuide.observationGuide,
      successCriteria: visualGuide.successCriteria,
      required: true,
    },
    {
      id: `${id}:audio`,
      type: "audio-comparison",
      title: "Compare the sound",
      body: "Listen to the controlled example and the deliberately unstable version before looking at the explanation.",
      correctLabel: "Controlled",
      incorrectLabel: "Unstable",
      correctPattern:
        category === "rhythm"
          ? {
              kind: "rhythm",
              subdivisions: 8,
              activeSteps: [0, 2, 3, 5, 6, 7],
              accentedSteps: [2, 6],
              bpm: 84,
            }
          : { kind: "notes", midiNotes, beatSeconds: 0.42 },
      incorrectPattern:
        category === "rhythm"
          ? {
              kind: "rhythm",
              subdivisions: 8,
              activeSteps: [0, 2, 4, 5, 7],
              bpm: 84,
            }
          : {
              kind: "notes",
              midiNotes: midiNotes.map((note, index) =>
                index === midiNotes.length - 1 ? note + 1 : note,
              ),
              beatSeconds: 0.42,
            },
      listenFor: copy.listenFor,
      required: true,
    },
    {
      id: `${id}:technique`,
      type: "correct-vs-incorrect",
      title: "Technique check",
      incorrect: copy.confusion,
      correct: copy.technique,
      listenFor: copy.listenFor,
      required: true,
    },
    {
      id: `${id}:exercise`,
      type: "guided-exercise",
      title: "Try it",
      body: guidedExercise.body,
      steps: guidedExercise.steps,
      completionPrompt: guidedExercise.completionPrompt,
      required: true,
    },
    {
      id: `${id}:mistakes`,
      type: "common-mistakes",
      title: "Debug the movement",
      items: [
        { mistake: copy.confusion, fix: copy.technique },
        {
          mistake: "Increasing speed before the result is repeatable.",
          fix: "Reduce the tempo until three consecutive repetitions sound and feel alike.",
        },
      ],
      required: true,
    },
    {
      id: `${id}:application`,
      type: "musical-application",
      title: "Use it musically",
      body: copy.application,
      prompt: "Which version made the musical role clearest?",
      options: [
        "The simpler version",
        "The varied version",
        "Both, in different sections",
      ],
      required: true,
    },
    {
      id: `${id}:question`,
      type: "interactive-question",
      title: "Check the concept",
      prompt: `What is the strongest evidence that you understand ${title.toLowerCase()}?`,
      options: [
        "I can recognise, explain, and apply it in time",
        "I read the lesson once",
        "I can move through the shape as fast as possible",
      ],
      correctIndex: 0,
      explanation:
        "Understanding transfers across sound, explanation, and musical use; recognition alone is only the first step.",
      required: true,
    },
    {
      id: `${id}:reflection`,
      type: "reflection",
      title: "One-sentence reflection",
      prompt:
        "What changed in the sound, and what physical or theoretical choice caused that change?",
    },
  ];
}

const legacyLessons: GuitarLesson[] = PATH_DEFINITIONS.flatMap((path) =>
  path.concepts.map((title, index) => {
    const id = `${path.id}:${slugify(title)}`;
    const previousTitle = path.concepts[index - 1];
    const nextTitle = path.concepts[index + 1];
    const copy = getCoreCopy(title, path.category);
    return {
      id,
      slug: slugify(title),
      pathId: path.id,
      title,
      summary: copy.explanation,
      whyItMatters: copy.application,
      category: path.category,
      difficulty: Math.min(5, Math.floor(index / 6) + 1) as
        | 1
        | 2
        | 3
        | 4
        | 5,
      prerequisiteIds: previousTitle
        ? [`${path.id}:${slugify(previousTitle)}`]
        : [],
      learningObjectives: [
        `Recognise ${title.toLowerCase()} by sound or movement.`,
        `Explain how ${title.toLowerCase()} connects to the current musical context.`,
        `Apply ${title.toLowerCase()} in a short original guitar part.`,
      ],
      estimatedMinutes: 12 + Math.min(12, Math.floor(index / 4) * 2),
      coach: path.coach,
      sections: buildSections(id, title, path.category, previousTitle),
      checkpoint: {
        prompt: `Which statement best demonstrates usable understanding of ${title.toLowerCase()}?`,
        options: [
          "I can hear it, explain the relationship, and apply it deliberately",
          "I remember where it appeared on the page",
          "I can copy one example without knowing why it works",
        ],
        correctIndex: 0,
        explanation:
          "The studio treats a concept as understood only when knowledge transfers into listening and musical action.",
        passingScore: 1,
      },
      applicationActivity: {
        prompt: copy.application,
        options: [
          "I created and compared both versions",
          "I need another explanation",
        ],
        completionMessage: `You used ${title.toLowerCase()} as a musical choice rather than an isolated drill.`,
      },
      relatedToolIds: [
        toolForCategory(path.category),
        path.category === "rhythm" ? "metronome" : "fretboard",
      ],
      nextLessonIds: nextTitle
        ? [`${path.id}:${slugify(nextTitle)}`]
        : [],
      unlocksConceptIds: nextTitle
        ? [`${path.id}:${slugify(nextTitle)}`]
        : [],
      alternativeExplanation: `Imagine ${title.toLowerCase()} as one control on a small effects panel. Hold the pulse and musical context steady, move only that control, and compare the two results. If you cannot hear the change yet, simplify the example before adding speed or notes.`,
      publicationStatus: "legacy",
      authored: false,
    };
  }),
);

export const GUITAR_LEGACY_LESSONS = legacyLessons;

export const GUITAR_LESSONS = AUTHORED_GUITAR_LESSONS;

export const PUBLISHED_GUITAR_LESSON_BY_ID = new Map(
  GUITAR_LESSONS.map((lesson) => [lesson.id, lesson]),
);

/**
 * Migration-only union. UI rendering must use PUBLISHED_GUITAR_LESSON_BY_ID
 * so old stored IDs cannot reopen generic legacy lessons.
 */
export const GUITAR_LESSON_BY_ID = new Map(
  [...GUITAR_LEGACY_LESSONS, ...GUITAR_LESSONS].map((lesson) => [
    lesson.id,
    lesson,
  ]),
);

export const GUITAR_PATHS: GuitarLearningPath[] = AUTHORED_GUITAR_PATHS;

export const REQUIRED_SEED_LESSON_IDS = REQUIRED_SEED_TITLES.map(
  (title) => {
    const lesson = GUITAR_LESSON_BY_ID.get(
      PATH_DEFINITIONS.flatMap((path) =>
        path.concepts.map((concept) => [
          concept,
          `${path.id}:${slugify(concept)}`,
        ] as const),
      ).find(([concept]) => concept === title)?.[1] ?? "",
    ) ?? GUITAR_LEGACY_LESSONS.find(
      (candidate) => candidate.title === title,
    );
    if (!lesson) {
      throw new Error(`Required guitar lesson is missing: ${title}`);
    }
    return lesson.id;
  },
);

export function getGuitarLesson(lessonId: string) {
  return PUBLISHED_GUITAR_LESSON_BY_ID.get(lessonId);
}

export function getGuitarPath(pathId: GuitarPathId) {
  return GUITAR_PATHS.find((path) => path.id === pathId);
}
