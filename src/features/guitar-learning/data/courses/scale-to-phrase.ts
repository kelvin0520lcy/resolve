import type {
  AuthoredCourseDefinition,
  AuthoredLessonDefinition,
} from "@/features/guitar-learning/data/courses/types";

export const SCALE_TO_PHRASE_LESSONS = [
  {
    id: "improvisation:tonal-centre",
    pathId: "improvisation",
    title: "Find the home note",
    learnerProblem: "My scale box has no note that feels more important than the others.",
    category: "improvisation",
    skillType: "ear",
    difficulty: 1,
    coach: "bocchi",
    prerequisiteIds: [],
    termsIntroduced: ["root", "tonal-centre"],
    assumedTerms: [],
    estimatedMinutes: 7,
    experience:
      "Hear A–C–D, then A again. Compare that ending with the same notes ending on D.",
    plainEnglishExplanation:
      "A sounds settled against an A-minor backing. Call it the home note first. The formal name is root; when the whole music feels centred on it, musicians also say tonal centre.",
    analogy:
      "Other notes are places you visit. A is the front door that makes the trip feel complete.",
    whyItMatters:
      "A home note turns a memorised shape into a musical map with direction and endings.",
    visual: {
      kind: "fretboard",
      fretCount: 8,
      root: "A",
      notes: [
        { string: 6, fret: 5, label: "A · home", role: "root", finger: 1 },
        { string: 4, fret: 7, label: "A · home", role: "root", finger: 3 },
      ],
      showStringThickness: true,
      showNoteNames: true,
    },
    visualPrompt: "Find both A home notes and choose one as the ending of every short idea.",
    visualObservationGuide: [
      "Play the backing or drone before testing a note.",
      "Hold each A long enough to hear whether it settles.",
      "Compare A with D without changing volume or technique.",
    ],
    visualSuccess: "You can predict which visible note will sound finished before playing it.",
    audio: {
      body: "Compare an A-minor phrase that returns home with one that stops away from home.",
      correctLabel: "Ends on A · settled",
      incorrectLabel: "Ends on D · open",
      correctPattern: { kind: "notes", midiNotes: [57, 60, 62, 57], beatSeconds: 0.5 },
      incorrectPattern: { kind: "notes", midiNotes: [57, 60, 62, 62], beatSeconds: 0.5 },
      listenFor: "The A ending feels complete while D feels ready to continue.",
    },
    guidedPractice: {
      body: "Use only two visible A notes.",
      steps: [
        "Start the A-minor backing and play string 6 fret 5.",
        "Play string 4 fret 7 and compare the same note in a higher register.",
        "Play C or D, pause, then return to either A.",
      ],
      success: "Three short ideas deliberately leave and return to A.",
    },
    objectiveCheck: {
      prompt: "Why is A called the root in this lesson?",
      options: ["It feels like home and names A minor", "It is always the lowest guitar string", "It must be the loudest note"],
      correctIndex: 0,
      explanation: "The root provides the home identity; register and loudness can change.",
    },
    checkpoint: {
      prompt: "Which phrase ending should sound most settled over Am?",
      options: ["A", "D", "F♯"],
      correctIndex: 0,
      explanation: "A is the home note of the A-minor context.",
    },
    commonMistakes: [
      { mistake: "Choosing the lowest note as home automatically.", fix: "Judge home against the backing, not by physical height." },
    ],
    musicalApplication: {
      body: "Create three two-note journeys that all finish on A.",
      prompt: "Could you hear the arrival before reading the label?",
      options: ["Three times", "Once", "Not yet"],
      outcomes: ["achieved", "partial", "not_yet"],
      completionMessage: "You used the root as an audible home rather than a diagram label.",
    },
    alternativeExplanation:
      "Let the backing ask a question, then test which note makes the question stop asking. That note is home.",
    toolPresetId: "fretboard:a-home",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "improvisation:minor-pentatonic-position-one",
    pathId: "improvisation",
    title: "See one minor-pentatonic shape",
    learnerProblem: "I know a scale box but cannot tell what the dots mean.",
    category: "improvisation",
    skillType: "knowledge",
    difficulty: 1,
    coach: "bocchi",
    prerequisiteIds: ["improvisation:tonal-centre"],
    termsIntroduced: ["scale"],
    assumedTerms: ["root"],
    estimatedMinutes: 8,
    experience:
      "Start with the A home note, then reveal C and D beside it before showing the rest of the shape.",
    plainEnglishExplanation:
      "A scale is a selected family of notes organised around a home note. A minor pentatonic uses five note names; position one is one convenient area where those notes repeat.",
    analogy:
      "The scale is a palette of note colours, not a sentence you must always play from bottom to top.",
    whyItMatters:
      "Knowing the home notes and selected family stops the box from becoming a finger exercise.",
    visual: {
      kind: "fretboard",
      fretCount: 8,
      root: "A",
      notes: [
        { string: 6, fret: 5, label: "A · home", role: "root", finger: 1 },
        { string: 6, fret: 8, label: "C", role: "scale", finger: 4 },
        { string: 5, fret: 5, label: "D", role: "scale", finger: 1 },
        { string: 5, fret: 7, label: "E", role: "scale", finger: 3 },
        { string: 4, fret: 5, label: "G", role: "scale", finger: 1 },
        { string: 4, fret: 7, label: "A · home", role: "root", finger: 3 },
        { string: 3, fret: 5, label: "C", role: "scale", finger: 1 },
        { string: 3, fret: 7, label: "D", role: "scale", finger: 3 },
        { string: 2, fret: 5, label: "E", role: "scale", finger: 1 },
        { string: 2, fret: 8, label: "G", role: "scale", finger: 4 },
        { string: 1, fret: 5, label: "A · home", role: "root", finger: 1 },
        { string: 1, fret: 8, label: "C", role: "scale", finger: 4 },
      ],
      showStringThickness: true,
      showNoteNames: true,
    },
    visualPrompt: "Find every A before tracing any other note in the position.",
    visualObservationGuide: [
      "Use fret 5 as the first-finger boundary and fret 8 as the little-finger reach.",
      "Say “home” at each A root.",
      "Notice that the five note names repeat in higher registers.",
    ],
    visualSuccess: "You locate all three visible A roots and play the shape slowly without losing them.",
    audio: {
      body: "Hear the five-note family ascending and returning to A.",
      correctLabel: "A C D E G A",
      incorrectLabel: "One outside note added",
      correctPattern: { kind: "notes", midiNotes: [57, 60, 62, 64, 67, 69], beatSeconds: 0.45 },
      incorrectPattern: { kind: "notes", midiNotes: [57, 60, 62, 63, 67, 69], beatSeconds: 0.45 },
      listenFor: "The correct version keeps the same five-note family around A.",
    },
    guidedPractice: {
      body: "Learn the roots before running the box.",
      steps: [
        "Play only the three visible A roots from low to high.",
        "Add C and D on the lowest two strings.",
        "Play the full position slowly and stop on every A.",
      ],
      success: "You can interrupt the shape at any point and move to the nearest A.",
    },
    objectiveCheck: {
      prompt: "What does the scale provide?",
      options: ["A selected family of note choices around home", "A required order for every solo", "A chord-change timer"],
      correctIndex: 0,
      explanation: "A scale supplies note material; phrasing decides order, timing, and meaning.",
    },
    checkpoint: {
      prompt: "Which notes are the A roots in position one?",
      options: ["String 6 fret 5, string 4 fret 7, string 1 fret 5", "Every fret 8", "Only the lowest note"],
      correctIndex: 0,
      explanation: "Those three positions repeat the A home note.",
    },
    commonMistakes: [
      { mistake: "Playing the box continuously without recognising roots.", fix: "Stop on each A and let it ring against the backing." },
    ],
    musicalApplication: {
      body: "Play any four scale notes and make the fifth note an A root.",
      prompt: "Did the final A sound like an intentional ending?",
      options: ["Yes", "Sometimes", "I need the backing again"],
      outcomes: ["achieved", "partial", "not_yet"],
      completionMessage: "The scale position became a map organised around home.",
    },
    alternativeExplanation:
      "Do not memorise twelve dots at once. Memorise the three home dots, then see the remaining notes as nearby choices.",
    toolPresetId: "scales:a-minor-pentatonic-three-notes",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "improvisation:playing-with-only-two-or-three-notes",
    pathId: "improvisation",
    title: "Make a three-note phrase",
    learnerProblem: "My improvisation sounds like the scale exercise I memorised.",
    category: "improvisation",
    skillType: "creative-application",
    difficulty: 1,
    coach: "bocchi",
    prerequisiteIds: ["improvisation:minor-pentatonic-position-one"],
    termsIntroduced: ["phrase"],
    assumedTerms: ["root", "scale"],
    estimatedMinutes: 9,
    experience:
      "Hear A, C, and D played as a straight exercise, then hear the same notes arranged as a short sentence.",
    plainEnglishExplanation:
      "A phrase is a short musical sentence with a beginning, direction, and ending. Limiting yourself to A, C, and D makes timing and shape more important than searching for more notes.",
    analogy:
      "A clear sentence can use three familiar words; it does not need the whole dictionary.",
    whyItMatters:
      "Note limits expose whether your timing and endings communicate something musical.",
    visual: {
      kind: "phrase-timeline",
      beats: 4,
      events: [
        { beat: 1, duration: 1, label: "A · home", string: 6, fret: 5, role: "root" },
        { beat: 2, duration: 0.5, label: "C", string: 6, fret: 8, role: "scale" },
        { beat: 2.5, duration: 0.5, label: "D", string: 5, fret: 5, role: "scale" },
        { beat: 3, duration: 1, label: "A · home", string: 6, fret: 5, role: "root" },
      ],
    },
    visualPrompt: "Play only A, C, and D, then make the final A last longer.",
    visualObservationGuide: [
      "Use the timeline position instead of playing every note immediately.",
      "Let one note last longer than the others.",
      "Make the home-note ending obvious.",
    ],
    visualSuccess: "A listener can sing the four-beat idea back after one repeat.",
    audio: {
      body: "Compare a scale-like loop with a phrase that has a longer ending.",
      correctLabel: "Short sentence with ending",
      incorrectLabel: "Endless A–C–D loop",
      correctPattern: { kind: "notes", midiNotes: [57, 60, 62, 57], beatSeconds: 0.55 },
      incorrectPattern: { kind: "notes", midiNotes: [57, 60, 62, 57, 60, 62], beatSeconds: 0.3 },
      listenFor: "The phrase creates a clear stopping point rather than continuing automatically.",
    },
    guidedPractice: {
      body: "Use fewer notes and make more timing decisions.",
      steps: [
        "Play A once and let it ring for two beats.",
        "Create one four-beat idea using only A and C.",
        "Add D once, then finish on A.",
      ],
      success: "Three different ideas use the same three notes and each has a clear end.",
    },
    objectiveCheck: {
      prompt: "What makes the three notes into a phrase?",
      options: ["Intentional timing, direction, and ending", "Playing every note quickly", "Adding the whole scale"],
      correctIndex: 0,
      explanation: "Phrasing comes from organisation, not note quantity.",
    },
    checkpoint: {
      prompt: "Why limit the available notes?",
      options: ["To focus on timing and shape", "Because scales only contain three notes", "To avoid the pulse"],
      correctIndex: 0,
      explanation: "The limit removes note-searching and exposes musical choices.",
    },
    commonMistakes: [
      { mistake: "Filling all four beats with equal short notes.", fix: "Hold one note and leave one position empty." },
    ],
    musicalApplication: {
      body: "Create a four-beat original phrase with A, C, and D and repeat it accurately.",
      prompt: "What made your phrase recognisable?",
      options: ["Its rhythm", "Its ending", "Both"],
      outcomes: ["partial", "partial", "achieved"],
      completionMessage: "Three scale notes became one repeatable musical sentence.",
    },
    alternativeExplanation:
      "Choose only three words, then use pauses, repetition, and emphasis to make a sentence.",
    toolPresetId: "scales:a-minor-pentatonic-three-notes",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "improvisation:phrasing-with-rests",
    pathId: "improvisation",
    title: "Leave a deliberate rest",
    learnerProblem: "I play continuously because silence feels like running out of ideas.",
    category: "improvisation",
    skillType: "creative-application",
    difficulty: 1,
    coach: "bocchi",
    prerequisiteIds: ["improvisation:playing-with-only-two-or-three-notes"],
    termsIntroduced: ["rest", "pulse"],
    assumedTerms: ["phrase"],
    estimatedMinutes: 8,
    experience:
      "Hear a two-beat idea followed by two counted beats of silence, then hear the same notes without space.",
    plainEnglishExplanation:
      "A rest is a measured period of silence. The pulse continues through it, so the next phrase enters deliberately rather than whenever your fingers are ready.",
    analogy:
      "A rest is punctuation with a known length, not forgetting the next word.",
    whyItMatters:
      "Space lets listeners recognise the first phrase and gives the next one a clear entrance.",
    visual: {
      kind: "phrase-timeline",
      beats: 4,
      events: [
        { beat: 1, duration: 0.5, label: "A", string: 6, fret: 5, role: "root" },
        { beat: 1.5, duration: 0.5, label: "C", string: 6, fret: 8, role: "scale" },
        { beat: 2, duration: 1, label: "D", string: 5, fret: 5, role: "scale" },
        { beat: 3, duration: 2, label: "Count the silence", role: "rest" },
      ],
    },
    visualPrompt: "Play on beats 1 and 2, then count beats 3 and 4 without sounding.",
    visualObservationGuide: [
      "Stop the final note cleanly at the start of the rest.",
      "Keep tapping the pulse through both silent beats.",
      "Prepare the next A before the following beat 1.",
    ],
    visualSuccess: "The two-beat silence lasts exactly as planned and the repeat re-enters on beat 1.",
    audio: {
      body: "Compare a measured rest with uncertain stopping and restarting.",
      correctLabel: "Two-beat phrase, two-beat rest",
      incorrectLabel: "Unmeasured pause",
      correctPattern: { kind: "notes", midiNotes: [57, 60, 62], beatSeconds: 0.6 },
      incorrectPattern: { kind: "notes", midiNotes: [57, 60, 62, 60, 57], beatSeconds: 0.28 },
      listenFor: "The correct version gives the phrase room and preserves an expected return.",
    },
    guidedPractice: {
      body: "Make silence a counted action.",
      steps: [
        "Play A–C on beats 1 and 2, then tap beats 3 and 4.",
        "Repeat three times and enter on each new beat 1.",
        "Move the rest to beats 2 and 3 and compare the shape.",
      ],
      success: "Three repeats contain the same amount of intentional silence.",
    },
    objectiveCheck: {
      prompt: "What continues during a rest?",
      options: ["The pulse and count", "The ringing note forever", "Nothing at all"],
      correctIndex: 0,
      explanation: "A rest has measured timing even though no note sounds.",
    },
    checkpoint: {
      prompt: "Which silence is a rest?",
      options: ["A planned two-beat silence", "Stopping because the next note is forgotten", "Any pause with no count"],
      correctIndex: 0,
      explanation: "A rest has a deliberate start and duration.",
    },
    commonMistakes: [
      { mistake: "Ending the note vaguely so it leaks into the rest.", fix: "Mute at the exact rest boundary and keep counting." },
    ],
    musicalApplication: {
      body: "Play a two-beat idea, leave two beats, and repeat it four times over Am.",
      prompt: "Did every repeat return on beat 1?",
      options: ["Four times", "Most times", "Not yet"],
      outcomes: ["achieved", "partial", "not_yet"],
      completionMessage: "Silence became part of the phrase design.",
    },
    alternativeExplanation:
      "A rest is something you perform: stop sound, keep time, and enter again at a chosen point.",
    toolPresetId: "scales:a-minor-pentatonic-three-notes",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "improvisation:phrase-endings",
    pathId: "improvisation",
    title: "Make the ending clear",
    learnerProblem: "My phrases stop, but they do not sound finished.",
    category: "improvisation",
    skillType: "ear",
    difficulty: 2,
    coach: "bocchi",
    prerequisiteIds: ["improvisation:phrasing-with-rests"],
    termsIntroduced: [],
    assumedTerms: ["phrase", "root", "rest"],
    estimatedMinutes: 8,
    experience:
      "Hear the same phrase end on D and then on A while an Am backing continues.",
    plainEnglishExplanation:
      "An ending is clear when timing, note choice, and note length point to completion. Ending on the A home note often sounds settled; D can sound open and invite another phrase.",
    analogy:
      "A is a full stop in this context; D can sound like a comma.",
    whyItMatters:
      "Intentional endings stop improvisation from sounding like an interrupted scale run.",
    visual: {
      kind: "phrase-timeline",
      beats: 4,
      events: [
        { beat: 1, duration: 0.5, label: "C", string: 6, fret: 8, role: "scale" },
        { beat: 1.5, duration: 0.5, label: "D", string: 5, fret: 5, role: "scale" },
        { beat: 2, duration: 2, label: "A · stable ending", string: 6, fret: 5, role: "root" },
        { beat: 4, duration: 1, label: "Rest", role: "rest" },
      ],
    },
    visualPrompt: "Hold the final A for two beats, mute it cleanly, then leave one beat of space.",
    visualObservationGuide: [
      "Approach A from C or D rather than beginning and ending immediately.",
      "Give the final note more duration than the passing notes.",
      "Mute deliberately before the next phrase.",
    ],
    visualSuccess: "A listener can point to the exact ending without watching your hands.",
    audio: {
      body: "Compare a stable A ending with an open D ending.",
      correctLabel: "A · settled ending",
      incorrectLabel: "D · wants continuation",
      correctPattern: { kind: "notes", midiNotes: [60, 62, 57], beatSeconds: 0.6 },
      incorrectPattern: { kind: "notes", midiNotes: [60, 62, 62], beatSeconds: 0.6 },
      listenFor: "The A ending releases the musical question more completely.",
    },
    guidedPractice: {
      body: "Change only the final note.",
      steps: [
        "Play C–D–A and hold A for two beats.",
        "Play C–D–D with the same rhythm.",
        "Choose the ending that fits a finished phrase and explain why.",
      ],
      success: "You hear and reproduce both stable and open endings on purpose.",
    },
    objectiveCheck: {
      prompt: "Which change makes the ending clearer without adding notes?",
      options: ["Hold the final A longer", "Play every note faster", "Remove the pulse"],
      correctIndex: 0,
      explanation: "A longer home-note arrival gives the phrase clear punctuation.",
    },
    checkpoint: {
      prompt: "Why can D still be useful at an ending?",
      options: ["It can create an open ending that invites an answer", "It always sounds wrong", "It changes the guitar tuning"],
      correctIndex: 0,
      explanation: "Not every ending must be final; open endings can create conversation.",
    },
    commonMistakes: [
      { mistake: "Stopping the hand without ending the sound cleanly.", fix: "Choose the ending duration and mute point before playing." },
    ],
    musicalApplication: {
      body: "Create one settled phrase ending on A and one open phrase ending on D.",
      prompt: "Could you make both intentions audible?",
      options: ["Both", "Only the settled ending", "Not yet"],
      outcomes: ["achieved", "partial", "not_yet"],
      completionMessage: "Your final note became a deliberate punctuation choice.",
    },
    alternativeExplanation:
      "An ending is not just the last note. It is the combination of which note, when it arrives, how long it lasts, and what follows.",
    toolPresetId: "fretboard:a-home",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "improvisation:motif-development",
    pathId: "improvisation",
    title: "Repeat one small motif",
    learnerProblem: "Every phrase uses different notes, so nothing is memorable.",
    category: "improvisation",
    skillType: "creative-application",
    difficulty: 2,
    coach: "bocchi",
    prerequisiteIds: ["improvisation:phrase-endings"],
    termsIntroduced: ["motif"],
    assumedTerms: ["phrase", "rest"],
    estimatedMinutes: 9,
    experience:
      "Hear A–C–D twice, then hear A–C–E. Notice what stays recognisable.",
    plainEnglishExplanation:
      "A motif is a small recognisable musical idea. Repeat it accurately first, then change one feature—such as the final note—while keeping rhythm and beginning stable.",
    analogy:
      "It is a short catchphrase that can return with one word changed.",
    whyItMatters:
      "Motifs give a solo identity and make development audible to a listener.",
    visual: {
      kind: "phrase-timeline",
      beats: 8,
      events: [
        { beat: 1, duration: 0.5, label: "A", role: "root" },
        { beat: 1.5, duration: 0.5, label: "C", role: "motif" },
        { beat: 2, duration: 1, label: "D", role: "motif" },
        { beat: 3, duration: 2, label: "Rest", role: "rest" },
        { beat: 5, duration: 0.5, label: "A", role: "root" },
        { beat: 5.5, duration: 0.5, label: "C", role: "motif" },
        { beat: 6, duration: 1, label: "E · one change", role: "motif" },
        { beat: 7, duration: 2, label: "Rest", role: "rest" },
      ],
    },
    visualPrompt: "Repeat the first three-note idea, then change only its final note.",
    visualObservationGuide: [
      "Keep the first two notes and their timing identical.",
      "Keep the rest in the same location.",
      "Change only D to E on the second pass.",
    ],
    visualSuccess: "A listener recognises the repeat and can identify the single change.",
    audio: {
      body: "Compare repeat-with-variation against two unrelated phrases.",
      correctLabel: "A–C–D, then A–C–E",
      incorrectLabel: "Two unrelated ideas",
      correctPattern: { kind: "notes", midiNotes: [57, 60, 62, 57, 60, 64], beatSeconds: 0.45 },
      incorrectPattern: { kind: "notes", midiNotes: [57, 60, 62, 67, 64, 60], beatSeconds: 0.45 },
      listenFor: "The shared beginning makes the changed ending meaningful.",
    },
    guidedPractice: {
      body: "Earn variation by proving the original first.",
      steps: [
        "Create one three-note idea and repeat it exactly three times.",
        "Change only the final note on the fourth repeat.",
        "Return to the original and check that it remains recognisable.",
      ],
      success: "Three accurate repeats surround one clearly audible variation.",
    },
    objectiveCheck: {
      prompt: "What must remain for the second idea to sound like a motif variation?",
      options: ["Enough recognisable rhythm or notes", "Nothing at all", "Every available scale note"],
      correctIndex: 0,
      explanation: "Variation needs a stable feature that lets the listener recognise the source.",
    },
    checkpoint: {
      prompt: "Which is the safest first variation?",
      options: ["Change only the final note", "Change rhythm, notes, register, and tempo together", "Play faster"],
      correctIndex: 0,
      explanation: "One change makes cause and effect easy to hear.",
    },
    commonMistakes: [
      { mistake: "Varying the motif before it has been repeated accurately.", fix: "Repeat it three times first so both you and the listener know the source." },
    ],
    musicalApplication: {
      body: "Build an A–A–B–A sequence where B changes only the ending.",
      prompt: "Was the return to A recognisable?",
      options: ["Immediately", "After another listen", "Not yet"],
      outcomes: ["achieved", "partial", "not_yet"],
      completionMessage: "One tiny idea now creates structure through repetition and variation.",
    },
    alternativeExplanation:
      "Make one tiny phrase worth remembering, prove it twice, then let the listener notice one controlled change.",
    toolPresetId: "scales:a-minor-pentatonic-three-notes",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "improvisation:call-and-response",
    pathId: "improvisation",
    title: "Create call and response",
    learnerProblem: "My solo feels like one long statement with no conversation.",
    category: "application",
    skillType: "project",
    difficulty: 2,
    coach: "bocchi",
    prerequisiteIds: ["improvisation:motif-development"],
    termsIntroduced: [],
    assumedTerms: ["phrase", "motif", "rest", "root"],
    estimatedMinutes: 15,
    experience:
      "Hear a one-bar call, one-bar answer, then a second answer with a more settled A ending.",
    plainEnglishExplanation:
      "A call presents a short idea. A response preserves one recognisable feature while changing direction or ending. The rest between them makes the two roles clear.",
    analogy:
      "One voice asks “really?” and the second replies “yes, here.”",
    whyItMatters:
      "Call and response creates form from a few notes and leaves space for vocals or other instruments.",
    visual: {
      kind: "phrase-timeline",
      beats: 8,
      events: [
        { beat: 1, duration: 0.5, label: "A", role: "root" },
        { beat: 1.5, duration: 0.5, label: "C", role: "motif" },
        { beat: 2, duration: 1, label: "D · open call", role: "motif" },
        { beat: 3, duration: 2, label: "Rest", role: "rest" },
        { beat: 5, duration: 0.5, label: "C", role: "motif" },
        { beat: 5.5, duration: 0.5, label: "D", role: "motif" },
        { beat: 6, duration: 1, label: "A · settled answer", role: "root" },
        { beat: 7, duration: 2, label: "Rest", role: "rest" },
      ],
    },
    visualPrompt: "Play a call that ends open, leave space, then answer by ending on A.",
    visualObservationGuide: [
      "Keep both phrases short enough to remember.",
      "Preserve the three-note vocabulary across call and answer.",
      "Use D for the open call and A for the settled answer.",
    ],
    visualSuccess: "A listener can label the first bar “question” and the second bar “answer”.",
    audio: {
      body: "Compare a clear call-and-answer pair with one uninterrupted note stream.",
      correctLabel: "Question, space, answer",
      incorrectLabel: "Continuous scale run",
      correctPattern: { kind: "notes", midiNotes: [57, 60, 62, 60, 62, 57], beatSeconds: 0.55 },
      incorrectPattern: { kind: "notes", midiNotes: [57, 60, 62, 64, 67, 69, 67, 64], beatSeconds: 0.25 },
      listenFor: "The space separates two roles and the answer settles more strongly.",
    },
    guidedPractice: {
      body: "Build the final project one role at a time.",
      steps: [
        "Create a one-bar call using A, C, and D that ends on D.",
        "Leave one full bar of counted space.",
        "Answer with the same rhythm and finish on A.",
        "Repeat the full call–space–response form three times.",
      ],
      success: "Three repeats preserve the form while call and answer remain distinct.",
    },
    objectiveCheck: {
      prompt: "What makes the response connected to the call?",
      options: ["It preserves one recognisable feature", "It uses every different note", "It removes all space"],
      correctIndex: 0,
      explanation: "A shared rhythm, motif, or contour makes the reply sound related.",
    },
    checkpoint: {
      prompt: "Which ending best completes this A-minor response?",
      options: ["A home note", "A random chromatic note", "No chosen ending"],
      correctIndex: 0,
      explanation: "A gives the response a stable arrival in this context.",
    },
    commonMistakes: [
      { mistake: "Making the response longer and busier than the call.", fix: "Keep the same phrase length and change only direction or ending." },
      { mistake: "Skipping the space.", fix: "Count the full rest as part of the form." },
    ],
    musicalApplication: {
      body: "Perform an original four-bar call-and-response over Am: call, space, answer, space.",
      prompt: "Which project evidence did you achieve?",
      options: ["Recognisable call", "Settled response", "Both"],
      outcomes: ["partial", "partial", "achieved"],
      completionMessage: "You completed a short original solo form using home, three notes, rest, ending, and motif.",
    },
    alternativeExplanation:
      "Make one tiny musical statement, listen to the silence, then reply using enough of the original that the conversation is obvious.",
    toolPresetId: "scales:a-minor-pentatonic-three-notes",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "improvisation:bend-to-a-heard-target",
    pathId: "improvisation",
    title: "Bend to a note you heard first",
    learnerProblem:
      "My bends stop at a random pitch instead of sounding deliberate and in tune.",
    category: "lead",
    skillType: "physical-technique",
    difficulty: 2,
    coach: "kita",
    prerequisiteIds: ["improvisation:phrase-endings"],
    termsIntroduced: ["articulation"],
    assumedTerms: ["root", "phrase"],
    estimatedMinutes: 12,
    experience:
      "Play A at the fifth fret of string 1, sing it, then bend G at the third fret until it reaches the same A.",
    plainEnglishExplanation:
      "A bend is not simply a string pushed upward. It is a moving pitch with a destination. Hear the destination normally before trying to reach it from below.",
    analogy:
      "Aim at a named floor in a lift instead of pressing the button and stopping wherever the doors open.",
    whyItMatters:
      "Targeted bends sound vocal and intentional; untargeted bends make an otherwise clear phrase sound out of tune.",
    visual: {
      kind: "fretboard",
      fretCount: 7,
      root: "A",
      notes: [
        {
          string: 1,
          fret: 3,
          label: "G · bend from",
          role: "scale",
          finger: 3,
        },
        {
          string: 1,
          fret: 5,
          label: "A · target",
          role: "target",
          finger: 4,
        },
      ],
      showNoteNames: true,
    },
    visualPrompt:
      "Play fret 5 first, then return to fret 3 and bend until both pitches match.",
    visualObservationGuide: [
      "Hear and sing A before beginning the bend.",
      "Support the third finger with the first and second fingers behind it.",
      "Stop pushing when the tuner centres on A4; do not add extra height.",
    ],
    visualSuccess:
      "Three bends arrive within ±5 cents of A4 and hold there without overshooting.",
    audio: {
      body:
        "Compare a G that reaches the intended A with a bend that stops one semitone flat.",
      correctLabel: "Whole-step target · G to A",
      incorrectLabel: "Stops flat · G to A♭",
      correctPattern: {
        kind: "notes",
        midiNotes: [69, 67, 69],
        beatSeconds: 0.75,
      },
      incorrectPattern: {
        kind: "notes",
        midiNotes: [69, 67, 68],
        beatSeconds: 0.75,
      },
      listenFor:
        "The final note in the correct example matches the reference A exactly.",
    },
    guidedPractice: {
      body: "Separate hearing the target from the physical bend.",
      steps: [
        "Play A4 at string 1, fret 5 and sing the pitch.",
        "Fret G4 at string 1, fret 3 with the third finger supported by two fingers.",
        "Push the string upward slowly while watching the bend-target tuner.",
        "Hold the centred A for one second, release, and repeat three times.",
      ],
      success:
        "Three controlled bends reach and hold A4 without passing above it.",
    },
    objectiveCheck: {
      prompt: "What should happen before you bend the G?",
      options: [
        "Hear the target A normally",
        "Push as far as possible",
        "Increase the tempo",
      ],
      correctIndex: 0,
      explanation:
        "A heard target gives the hand a pitch destination instead of a guessed distance.",
    },
    checkpoint: {
      prompt: "What proves that the whole-step bend is in tune?",
      options: [
        "It matches A4, the note two frets above",
        "The string moved visibly",
        "The bend was loud",
      ],
      correctIndex: 0,
      explanation:
        "A whole-step bend raises G by two semitones to the heard A target.",
    },
    commonMistakes: [
      {
        mistake: "Bending without hearing the target first.",
        fix: "Alternate one normal target note with one bend until the pitches match.",
      },
      {
        mistake: "Using one unsupported fingertip.",
        fix: "Place two fingers behind the third finger and rotate the wrist as one unit.",
      },
    ],
    musicalApplication: {
      body:
        "End a short three-note phrase by bending G into the A home note.",
      prompt: "What happened when the phrase arrived?",
      options: ["The bend centred on A", "It was close", "It needs another slow pass"],
      outcomes: ["achieved", "partial", "not_yet"],
      completionMessage:
        "You used a measured bend as a pitched phrase ending rather than a random effect.",
    },
    alternativeExplanation:
      "The fret-5 A is the answer key. Memorise its sound, then make the fret-3 G travel upward until the answer and the bend become the same note.",
    toolPresetId: "tuner:bend-target-a4",
    reviewSchedule: [1, 3, 7, 14],
  },
] satisfies AuthoredLessonDefinition[];

export const SCALE_TO_PHRASE_COURSE: AuthoredCourseDefinition = {
  id: "improvisation",
  title: "From Scale Box to Musical Phrase",
  description:
    "Turn an A-minor pentatonic shape into home-note awareness, three-note phrases, deliberate rests, endings, motifs, and call-and-response.",
  coach: "bocchi",
  learnerPromise:
    "You will stop running the box automatically and start making short ideas with audible beginnings and endings.",
  lessonIds: SCALE_TO_PHRASE_LESSONS
    .filter((lesson) => lesson.id !== "improvisation:bend-to-a-heard-target")
    .map((lesson) => lesson.id),
};
