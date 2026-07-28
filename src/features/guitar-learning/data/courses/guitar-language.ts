import type {
  AuthoredCourseDefinition,
  AuthoredLessonDefinition,
} from "@/features/guitar-learning/data/courses/types";

export const GUITAR_LANGUAGE_LESSONS = [
  {
    id: "guitar-language:guitar-orientation",
    pathId: "guitar-language",
    title: "Meet the guitar without jargon",
    learnerProblem: "I do not know which guitar part an instruction is pointing to.",
    category: "fretboard",
    skillType: "knowledge",
    difficulty: 1,
    coach: "kita",
    prerequisiteIds: [],
    termsIntroduced: [],
    assumedTerms: [],
    estimatedMinutes: 6,
    experience:
      "Place the guitar in playing position and touch each highlighted area before reading its name.",
    plainEnglishExplanation:
      "The neck holds the frets and strings. The body supports the picking area. Your fretting hand shortens a string on the neck; your picking hand starts the sound near the body.",
    analogy:
      "Think of the neck as the note-selection lane and the body as the sound-starting station.",
    whyItMatters:
      "Later instructions become physical and unambiguous when you can locate the nut, frets, bridge, and both hands.",
    visual: {
      kind: "guitar-orientation",
      labels: [
        { name: "Headstock + tuners", plainEnglish: "Adjust string pitch", position: "left" },
        { name: "Nut + frets", plainEnglish: "Start and shorten strings", position: "middle" },
        { name: "Pickups + bridge", plainEnglish: "Start and anchor sound", position: "right" },
      ],
    },
    visualPrompt: "Point to the nut, one fret, and the bridge on your own guitar.",
    visualObservationGuide: [
      "Find where the strings leave the headstock and cross the nut.",
      "Notice that a fret is the metal strip, not the wooden space.",
      "Match your fretting and picking hands to the two working areas.",
    ],
    visualSuccess: "You can follow “fret near the third fret” and “pick near the bridge” without guessing.",
    audio: {
      body: "Hear an open string, then the same string shortened at a fret.",
      correctLabel: "Open, then fretted",
      incorrectLabel: "Two unrelated strings",
      correctPattern: { kind: "notes", midiNotes: [40, 43], beatSeconds: 0.7 },
      incorrectPattern: { kind: "notes", midiNotes: [40, 45], beatSeconds: 0.7 },
      listenFor: "The fretted note is higher because the vibrating string became shorter.",
    },
    guidedPractice: {
      body: "Make the vocabulary physical before trying to memorise it.",
      steps: [
        "Touch the headstock, nut, fifth fret, pickups, and bridge in that order.",
        "Place the fretting hand around the neck without squeezing.",
        "Float the picking hand above the strings near the pickups.",
      ],
      success: "You can name and touch all five locations in under 15 seconds.",
    },
    objectiveCheck: {
      prompt: "Which part marks the beginning of the playable fretboard?",
      options: ["The nut", "The bridge", "A pickup"],
      correctIndex: 0,
      explanation: "The nut supports the open strings at fret 0.",
    },
    checkpoint: {
      prompt: "Where should the fretting hand work?",
      options: ["Along the neck behind the frets", "On the bridge", "On the tuning pegs while playing"],
      correctIndex: 0,
      explanation: "The fretting hand shortens strings along the neck.",
    },
    commonMistakes: [
      { mistake: "Calling the wooden space itself a fret.", fix: "The metal strip is the fret; press in the space just behind it." },
    ],
    musicalApplication: {
      body: "Give yourself three spoken directions and follow them on the guitar.",
      prompt: "Which instruction could you follow confidently?",
      options: ["Pick near the bridge", "Touch the nut", "Both"],
      completionMessage: "The guitar now has a physical map you can use in every later lesson.",
    },
    alternativeExplanation:
      "You do not need to memorise guitar engineering. Learn only the places your hands touch and the landmarks instructions use.",
    toolPresetId: "fretboard:a-home",
    reviewSchedule: [1, 7],
  },
  {
    id: "guitar-language:string-numbers-and-names",
    pathId: "guitar-language",
    title: "String numbers versus string names",
    learnerProblem: "I confuse string 1 with the thickest string.",
    category: "fretboard",
    skillType: "knowledge",
    difficulty: 1,
    coach: "ryo",
    prerequisiteIds: ["guitar-language:guitar-orientation"],
    termsIntroduced: [],
    assumedTerms: [],
    estimatedMinutes: 7,
    experience:
      "Hold the guitar and touch the thinnest string first, then the thickest.",
    plainEnglishExplanation:
      "String 1 is the thinnest, highest-sounding E string. String 6 is the thickest, lowest-sounding E string. The open-string names from thick to thin are E A D G B E.",
    analogy:
      "String numbers count upward from the floor-facing thin string when the guitar is held normally.",
    whyItMatters:
      "Tabs, chord diagrams, and fretboard instructions all depend on consistent string numbers.",
    visual: {
      kind: "fretboard",
      fretCount: 0,
      notes: [
        { string: 6, fret: 0, label: "6 · low E" },
        { string: 5, fret: 0, label: "5 · A" },
        { string: 4, fret: 0, label: "4 · D" },
        { string: 3, fret: 0, label: "3 · G" },
        { string: 2, fret: 0, label: "2 · B" },
        { string: 1, fret: 0, label: "1 · high E" },
      ],
      showStringThickness: true,
      showNoteNames: true,
    },
    visualPrompt: "Find string 6 by thickness, then find string 1 without counting from the wrong edge.",
    visualObservationGuide: [
      "Compare the visible thickness of strings 6 and 1.",
      "Notice that both outside strings are named E but sound in different ranges.",
      "Read the sequence E A D G B E from thick to thin.",
    ],
    visualSuccess: "You can touch any requested string number without counting for more than two seconds.",
    audio: {
      body: "Compare the two open E strings at opposite ends of the guitar.",
      correctLabel: "Low E, then high E",
      incorrectLabel: "High E, then low E",
      correctPattern: { kind: "notes", midiNotes: [40, 64], beatSeconds: 0.8 },
      incorrectPattern: { kind: "notes", midiNotes: [64, 40], beatSeconds: 0.8 },
      listenFor: "Both are E, but string 1 sounds much higher than string 6.",
    },
    guidedPractice: {
      body: "Use touch, sight, and sound together.",
      steps: [
        "Touch strings 6, 5, 4, 3, 2, 1 while saying E A D G B E.",
        "Reverse the route and say 1 through 6.",
        "Close your eyes, touch the thickest string, then verify it is string 6.",
      ],
      success: "You identify all six strings correctly twice in a row.",
    },
    objectiveCheck: {
      prompt: "Which string is string 1?",
      options: ["The thinnest high E", "The thickest low E", "The B string"],
      correctIndex: 0,
      explanation: "Guitar string numbering begins at the thinnest string.",
    },
    checkpoint: {
      prompt: "What are the open-string names from thick to thin?",
      options: ["E A D G B E", "E B G D A E", "A D G C E A"],
      correctIndex: 0,
      explanation: "Standard tuning from string 6 to string 1 is E A D G B E.",
    },
    commonMistakes: [
      { mistake: "Assuming the thickest string must be number 1.", fix: "Use the fixed rule: thin high E is 1; thick low E is 6." },
    ],
    musicalApplication: {
      body: "Play strings 6, 4, 2, then 1 as separate open notes.",
      prompt: "Could you reach the requested strings without brushing neighbours?",
      options: ["Yes, cleanly", "Mostly", "I need a slower repeat"],
      completionMessage: "String numbers and names now point to the same physical strings.",
    },
    alternativeExplanation:
      "If numbers feel reversed, memorise only the two edges first: thick low E is 6 and thin high E is 1.",
    toolPresetId: "fretboard:a-home",
    reviewSchedule: [1, 3, 7],
  },
  {
    id: "guitar-language:standard-tuning-and-tuner",
    pathId: "guitar-language",
    title: "Standard tuning and the tuner",
    learnerProblem: "I can copy a shape but do not know whether the guitar starts in tune.",
    category: "ear",
    skillType: "ear",
    difficulty: 1,
    coach: "nijika",
    prerequisiteIds: ["guitar-language:string-numbers-and-names"],
    termsIntroduced: [],
    assumedTerms: [],
    estimatedMinutes: 8,
    experience:
      "Play one open string and watch whether the tuner asks you to move lower, higher, or stay centred.",
    plainEnglishExplanation:
      "Standard tuning is E A D G B E from thick to thin. A tuner listens to one string, names the nearest note, and shows whether the pitch is too low or too high.",
    analogy:
      "The tuner is a parking guide: turn slowly until the indicator sits in the centre.",
    whyItMatters:
      "A perfectly copied chord still sounds wrong when one string starts at the wrong pitch.",
    visual: {
      kind: "fretboard",
      fretCount: 0,
      notes: [
        { string: 6, fret: 0, label: "E2", role: "target" },
        { string: 5, fret: 0, label: "A2", role: "target" },
        { string: 4, fret: 0, label: "D3", role: "target" },
        { string: 3, fret: 0, label: "G3", role: "target" },
        { string: 2, fret: 0, label: "B3", role: "target" },
        { string: 1, fret: 0, label: "E4", role: "target" },
      ],
      showStringThickness: true,
      showNoteNames: true,
    },
    visualPrompt: "Match each open string to its target letter before turning a tuning peg.",
    visualObservationGuide: [
      "Tune one string at a time and mute the other five.",
      "Turn the peg in very small amounts while the note rings.",
      "Recheck earlier strings because neck tension can shift slightly.",
    ],
    visualSuccess: "All six strings show the correct letter and remain close to the centre.",
    audio: {
      body: "Hear the correct low E beside a slightly sharp version.",
      correctLabel: "Centred E",
      incorrectLabel: "Too-high E",
      correctPattern: { kind: "notes", midiNotes: [40], beatSeconds: 1 },
      incorrectPattern: { kind: "notes", midiNotes: [41], beatSeconds: 1 },
      listenFor: "The incorrect example is clearly higher; a tuner shows smaller differences in cents.",
    },
    guidedPractice: {
      body: "Tune slowly and protect your hearing.",
      steps: [
        "Lower the device and guitar volume before starting.",
        "Select string 6, play it alone, and turn slowly toward E.",
        "Repeat for A D G B E, then recheck all six.",
      ],
      success: "Each string holds the target note near the centre for one second.",
    },
    objectiveCheck: {
      prompt: "If the tuner says the note is too high, what should happen?",
      options: ["Lower the pitch slowly", "Tighten rapidly", "Play every string together"],
      correctIndex: 0,
      explanation: "A too-high note must move downward; small adjustments are safer.",
    },
    checkpoint: {
      prompt: "Which tuning is standard from string 6 to string 1?",
      options: ["E A D G B E", "E A D F B E", "D A D G A D"],
      correctIndex: 0,
      explanation: "Standard guitar tuning is E A D G B E.",
    },
    commonMistakes: [
      { mistake: "Turning a peg quickly without checking which string it controls.", fix: "Trace the string to its peg and use tiny turns." },
    ],
    musicalApplication: {
      body: "Play an open E chord before and after tuning and compare the stability.",
      prompt: "What improved after tuning?",
      options: ["The chord sounded settled", "Beating between strings reduced", "Both"],
      completionMessage: "You established a reliable starting sound before practising.",
    },
    alternativeExplanation:
      "The tuner does not grade your playing. It only helps each open string begin at its agreed pitch.",
    toolPresetId: "tuner:standard",
    reviewSchedule: [1, 7, 14],
  },
  {
    id: "guitar-language:fret-one-clean-note",
    pathId: "guitar-language",
    title: "Fret one clean note",
    learnerProblem: "A single fretted note buzzes or disappears.",
    category: "lead",
    skillType: "physical-technique",
    difficulty: 1,
    coach: "bocchi",
    prerequisiteIds: ["guitar-language:guitar-orientation"],
    termsIntroduced: [],
    assumedTerms: [],
    estimatedMinutes: 7,
    experience:
      "Play string 3 open, then place finger 1 just behind fret 2 and compare the ring.",
    plainEnglishExplanation:
      "Press with the fingertip just behind the metal fret, not on top of it and not far back in the space. Use only enough pressure for a clear note.",
    analogy:
      "The fret is the clean cutting edge; your finger holds the string against it.",
    whyItMatters:
      "Every chord, scale, bend, and phrase depends on producing one controllable note first.",
    visual: {
      kind: "fretboard",
      fretCount: 4,
      notes: [{ string: 3, fret: 2, label: "A · finger 1", role: "target", finger: 1 }],
      showStringThickness: true,
      showNoteNames: true,
    },
    visualPrompt: "Place finger 1 close behind fret 2 on string 3 and leave nearby strings untouched.",
    visualObservationGuide: [
      "Curve the fingertip so its pad does not flatten across another string.",
      "Place it immediately behind the fret wire.",
      "Reduce pressure gradually until buzzing begins, then add only a little back.",
    ],
    visualSuccess: "The note starts clearly, rings, and does not require painful squeezing.",
    audio: {
      body: "Compare a stable fretted note with a buzzing, unstable sound.",
      correctLabel: "Clean A",
      incorrectLabel: "Unstable contact",
      correctPattern: { kind: "notes", midiNotes: [57], beatSeconds: 1 },
      incorrectPattern: { kind: "notes", midiNotes: [56, 57], beatSeconds: 0.25 },
      listenFor: "The clean note has one steady pitch instead of a rattling start.",
    },
    guidedPractice: {
      body: "Use the smallest reliable amount of pressure.",
      steps: [
        "Fret string 3 at fret 2 with finger 1 and play once.",
        "Move the finger closer to the fret if it buzzes.",
        "Repeat five clean starts, relaxing the thumb between repetitions.",
      ],
      success: "Five notes begin clearly with no pain and no neighbouring string contact.",
    },
    objectiveCheck: {
      prompt: "Where should the fingertip press?",
      options: ["Just behind the fret", "Directly on the metal fret", "In the middle of the space with maximum force"],
      correctIndex: 0,
      explanation: "Just behind the fret gives a clean note with less pressure.",
    },
    checkpoint: {
      prompt: "What should you change first when a note buzzes?",
      options: ["Check placement near the fret", "Squeeze as hard as possible", "Increase tempo"],
      correctIndex: 0,
      explanation: "Position often solves buzzing before more pressure is needed.",
    },
    commonMistakes: [
      { mistake: "Collapsing the fingertip into the next string.", fix: "Curve the last finger joint and approach from above." },
      { mistake: "Clamping with the thumb.", fix: "Release after each note and rebuild with less force." },
    ],
    musicalApplication: {
      body: "Play open G, fretted A, then open G as a three-note answer.",
      prompt: "Did every A begin and end cleanly?",
      options: ["Yes", "One buzzed", "I need to reposition"],
      completionMessage: "You used one clean fretted note inside a musical idea.",
    },
    alternativeExplanation:
      "Treat buzzing as information about contact and position, not a demand to squeeze harder.",
    toolPresetId: "fretboard:a-home",
    reviewSchedule: [1, 3, 7],
  },
  {
    id: "guitar-language:pick-grip-and-depth",
    pathId: "guitar-language",
    title: "Hold the pick and control its depth",
    learnerProblem: "My pick catches between the strings.",
    category: "lead",
    skillType: "physical-technique",
    difficulty: 1,
    coach: "bocchi",
    prerequisiteIds: ["guitar-language:guitar-orientation"],
    termsIntroduced: ["downstroke", "upstroke"],
    assumedTerms: [],
    estimatedMinutes: 7,
    experience:
      "Brush one muted string with only the tip of the pick, then compare with pushing half the pick through.",
    plainEnglishExplanation:
      "Rest the pick on the side of a curled index finger, hold it with the thumb, and expose only a small tip. Down ↓ moves toward the floor; Up ↑ returns toward the ceiling.",
    analogy:
      "The pick skims the surface like a card through bicycle spokes; it should not dig like a shovel.",
    whyItMatters:
      "A relaxed shallow grip makes rhythm smoother and prevents the pick from getting trapped.",
    visual: {
      kind: "picking",
      steps: [
        { label: "Small tip", direction: "D", contact: "played" },
        { label: "Relax", direction: "none", contact: "missed" },
        { label: "Return", direction: "U", contact: "played" },
      ],
    },
    visualPrompt: "Show only a few millimetres of pick and trace one small down-up path.",
    visualObservationGuide: [
      "Keep the thumb flat rather than bent into a clamp.",
      "Let the pick tilt slightly so it glides across the string.",
      "Compare the tiny useful movement with a large arm swing.",
    ],
    visualSuccess: "The pick crosses the string without snagging and stays secure in the hand.",
    audio: {
      body: "Compare a light controlled attack with an unnecessarily hard attack.",
      correctLabel: "Shallow, relaxed stroke",
      incorrectLabel: "Deep, harsh stroke",
      correctPattern: { kind: "notes", midiNotes: [52, 52], beatSeconds: 0.6 },
      incorrectPattern: { kind: "chord", midiNotes: [40, 45, 50], durationSeconds: 0.2 },
      listenFor: "The controlled stroke speaks clearly without an explosive scrape.",
    },
    guidedPractice: {
      body: "Practise the path on muted strings before using pitch.",
      steps: [
        "Mute all strings with the fretting hand.",
        "Make five shallow Down ↓ strokes on string 4.",
        "Alternate Down ↓ and Up ↑ ten times without changing grip.",
      ],
      success: "The pick never catches and the shoulder stays relaxed.",
    },
    objectiveCheck: {
      prompt: "Which movement is a downstroke?",
      options: ["Pick toward the floor ↓", "Pick toward the ceiling ↑", "Press harder with the fretting hand"],
      correctIndex: 0,
      explanation: "Downstroke names the pick’s direction toward the floor.",
    },
    checkpoint: {
      prompt: "Why expose only a small pick tip?",
      options: ["It crosses the string with less resistance", "It makes every note higher", "It replaces tuning"],
      correctIndex: 0,
      explanation: "Shallow depth reduces resistance and excess motion.",
    },
    commonMistakes: [
      { mistake: "Pinching until the wrist locks.", fix: "Hold firmly enough not to drop the pick, then release extra pressure." },
    ],
    musicalApplication: {
      body: "Play four muted Down-Up pairs at an even walking speed.",
      prompt: "What remained stable?",
      options: ["Grip", "Small movement", "Both"],
      completionMessage: "You controlled both pick direction and depth.",
    },
    alternativeExplanation:
      "If the pick catches, first make less of it touch the string before trying to move faster.",
    toolPresetId: "picking:pick-depth",
    reviewSchedule: [1, 3],
  },
  {
    id: "guitar-language:read-a-chord-diagram",
    pathId: "guitar-language",
    title: "Read a chord diagram",
    learnerProblem: "I can copy a chord picture but do not know what its symbols mean.",
    category: "chords",
    skillType: "knowledge",
    difficulty: 1,
    coach: "kita",
    prerequisiteIds: ["guitar-language:string-numbers-and-names", "guitar-language:fret-one-clean-note"],
    termsIntroduced: [],
    assumedTerms: [],
    estimatedMinutes: 8,
    experience:
      "Match each dot in the C-major diagram to one finger and one physical string.",
    plainEnglishExplanation:
      "Vertical lines represent strings from thick low E on the left to thin high E on the right. Horizontal spaces represent frets. A dot tells you where to press; O means open; X means do not play that string.",
    analogy:
      "The diagram is the guitar neck standing upright in front of you.",
    whyItMatters:
      "Understanding the diagram lets you diagnose a grip instead of blindly copying dots.",
    visual: {
      kind: "chord-diagram",
      chordName: "C major",
      startingFret: 1,
      strings: [
        { string: 6, fret: "muted" },
        { string: 5, fret: 3, finger: 3, role: "root" },
        { string: 4, fret: 2, finger: 2, role: "third" },
        { string: 3, fret: "open", role: "fifth" },
        { string: 2, fret: 1, finger: 1, role: "root" },
        { string: 1, fret: "open", role: "third" },
      ],
    },
    visualPrompt: "State what happens on all six strings before forming the C-major grip.",
    visualObservationGuide: [
      "Start at string 6 and read X, 3, 2, O, 1, O.",
      "Match finger numbers 1, 2, and 3 to index, middle, and ring fingers.",
      "Check that each open string remains untouched.",
    ],
    visualSuccess: "You can build C major from the diagram and explain every X, O, dot, and finger number.",
    audio: {
      body: "Compare a complete C major with one that includes the unwanted low E.",
      correctLabel: "C from string 5",
      incorrectLabel: "Low E added",
      correctPattern: { kind: "chord", midiNotes: [48, 52, 55, 60, 64], durationSeconds: 1.4 },
      incorrectPattern: { kind: "chord", midiNotes: [40, 48, 52, 55, 60, 64], durationSeconds: 1.4 },
      listenFor: "The unwanted low E makes the bass less clearly centred on C.",
    },
    guidedPractice: {
      body: "Build the diagram one string at a time.",
      steps: [
        "Read the six string symbols aloud from 6 to 1.",
        "Place fingers 3, 2, and 1, then test strings 5 through 1 separately.",
        "Strum from string 5 and stop before string 6.",
      ],
      success: "Five intended strings sound and string 6 remains silent.",
    },
    objectiveCheck: {
      prompt: "What does X above a string mean?",
      options: ["Do not play that string", "Play it open", "Press the tenth fret"],
      correctIndex: 0,
      explanation: "X marks an intentionally muted or avoided string.",
    },
    checkpoint: {
      prompt: "In a first-position chord diagram, what do horizontal spaces show?",
      options: ["Fret positions", "String thickness", "Tempo"],
      correctIndex: 0,
      explanation: "Horizontal spaces correspond to fret positions.",
    },
    commonMistakes: [
      { mistake: "Reading the left line as string 1.", fix: "In a standard chord diagram, thick string 6 is on the left." },
    ],
    musicalApplication: {
      body: "Play C once as a block, then pick each intended string separately.",
      prompt: "How many intended strings rang?",
      options: ["Five", "Four", "Fewer; I will diagnose them"],
      completionMessage: "The diagram became a playable and testable set of instructions.",
    },
    alternativeExplanation:
      "Read a chord diagram as six independent string instructions, then combine them.",
    toolPresetId: "chords:g-to-c-change",
    reviewSchedule: [1, 3, 7],
  },
  {
    id: "guitar-language:read-basic-tab",
    pathId: "guitar-language",
    title: "Read basic tablature",
    learnerProblem: "Tab looks upside down and I lose which string a number belongs to.",
    category: "fretboard",
    skillType: "knowledge",
    difficulty: 1,
    coach: "ryo",
    prerequisiteIds: ["guitar-language:string-numbers-and-names"],
    termsIntroduced: [],
    assumedTerms: [],
    estimatedMinutes: 7,
    experience:
      "Read three tab numbers left to right before placing any finger.",
    plainEnglishExplanation:
      "Tab uses six horizontal lines. The top line is the thin high E string and the bottom line is the thick low E string. A number tells you the fret; left-to-right position tells you when to play it.",
    analogy:
      "Tab is a timeline laid across six string lanes.",
    whyItMatters:
      "Reading the lanes accurately prevents correct numbers from being played on the wrong strings.",
    visual: {
      kind: "tab",
      strings: ["e", "B", "G", "D", "A", "E"],
      events: [
        { string: 3, fret: 0, beat: 1, label: "G" },
        { string: 3, fret: 2, beat: 2, label: "A" },
        { string: 2, fret: 1, beat: 3, label: "C" },
      ],
    },
    visualPrompt: "Say “string 3 open, string 3 fret 2, string 2 fret 1” before playing.",
    visualObservationGuide: [
      "Confirm that the top tab line maps to physical string 1.",
      "Read each number as a fret, not a finger number.",
      "Move left to right and allow each note to finish clearly.",
    ],
    visualSuccess: "You play all three events on the correct strings and frets in order.",
    audio: {
      body: "Hear the written three-note tab beside a version with the middle note shifted.",
      correctLabel: "G–A–C",
      incorrectLabel: "G–B♭–C",
      correctPattern: { kind: "notes", midiNotes: [55, 57, 60], beatSeconds: 0.55 },
      incorrectPattern: { kind: "notes", midiNotes: [55, 58, 60], beatSeconds: 0.55 },
      listenFor: "The middle note in the correct version rises by two frets from open G to A.",
    },
    guidedPractice: {
      body: "Separate reading from finger movement.",
      steps: [
        "Point to each tab event and say its string and fret.",
        "Locate all three positions silently.",
        "Play the line slowly from left to right three times.",
      ],
      success: "All three repetitions use the same strings, frets, and order.",
    },
    objectiveCheck: {
      prompt: "What does the number 2 on a tab line mean?",
      options: ["Play fret 2 on that string", "Use finger 2 anywhere", "Play two strings"],
      correctIndex: 0,
      explanation: "Tab numbers show fret positions.",
    },
    checkpoint: {
      prompt: "Which physical string does the top tab line represent?",
      options: ["Thin high E, string 1", "Thick low E, string 6", "A string"],
      correctIndex: 0,
      explanation: "Tab’s top line is the physically thinnest high E string.",
    },
    commonMistakes: [
      { mistake: "Turning the guitar neck picture and tab into the same orientation.", fix: "Use the fixed tab rule: high E is top, low E is bottom." },
    ],
    musicalApplication: {
      body: "Play the three-note line, leave one beat, then repeat it.",
      prompt: "Could you restart on the same string without searching?",
      options: ["Yes", "After one check", "Not yet"],
      completionMessage: "You read a short tab as a timed string-and-fret route.",
    },
    alternativeExplanation:
      "Treat every tab number as an appointment: which string lane, which fret, and when from left to right.",
    toolPresetId: "fretboard:a-home",
    reviewSchedule: [1, 3, 7],
  },
  {
    id: "guitar-language:du-x-and-blank-spaces",
    pathId: "guitar-language",
    title: "What D, U, X, and blank spaces mean",
    learnerProblem: "A strumming pattern shows symbols but not what my hand should physically do.",
    category: "rhythm",
    skillType: "rhythm",
    difficulty: 1,
    coach: "nijika",
    prerequisiteIds: ["guitar-language:pick-grip-and-depth"],
    termsIntroduced: ["downstroke", "upstroke", "muted-stroke"],
    assumedTerms: [],
    estimatedMinutes: 8,
    experience:
      "Air-strum the four symbols before touching the strings: D, U, X, and a blank timing space.",
    plainEnglishExplanation:
      "D means Down ↓ toward the floor. U means Up ↑ toward the ceiling. X means contact the strings while they are muted. A blank only says there is no attack at that position: it may later mean a missed pass, a held sound, a gap, or a true rest depending on context.",
    analogy:
      "The letters describe movement and contact like stage directions.",
    whyItMatters:
      "Symbol meaning must be physical before a written pattern can become steady sound.",
    visual: {
      kind: "picking",
      steps: [
        { label: "Down ↓", direction: "D", contact: "played" },
        { label: "Up ↑", direction: "U", contact: "played" },
        { label: "X · muted", direction: "D", contact: "muted" },
        { label: "Blank · no sound", direction: "U", contact: "missed" },
      ],
    },
    visualPrompt: "Say the full word and direction before performing each symbol.",
    visualObservationGuide: [
      "Separate direction from whether the strings sound.",
      "Notice that X still contacts the strings.",
      "Notice that a blank can contain a timed hand movement without contact.",
    ],
    visualSuccess: "You can demonstrate all four symbols without reading their definitions.",
    audio: {
      body: "Compare a ringing stroke with a dry muted X.",
      correctLabel: "Ring, then muted X",
      incorrectLabel: "Two ringing strokes",
      correctPattern: { kind: "rhythm", subdivisions: 4, activeSteps: [0, 1], mutedSteps: [1], bpm: 60 },
      incorrectPattern: { kind: "rhythm", subdivisions: 4, activeSteps: [0, 1], bpm: 60 },
      listenFor: "X has a short percussive contact but no sustained chord.",
    },
    guidedPractice: {
      body: "Perform the symbol sequence on muted strings at walking speed.",
      steps: [
        "Air-strum D and U while saying “Down, Up”.",
        "Touch the strings lightly and perform one dry X.",
        "Perform D, U, X, blank twice without speeding up.",
      ],
      success: "Every symbol produces the intended direction and amount of contact.",
    },
    objectiveCheck: {
      prompt: "Which symbol means a dry percussive contact?",
      options: ["X", "U", "A blank"],
      correctIndex: 0,
      explanation: "X represents a muted stroke that contacts non-ringing strings.",
    },
    checkpoint: {
      prompt: "What does U describe?",
      options: ["The pick moves toward the ceiling", "The note must be loud", "The hand stops"],
      correctIndex: 0,
      explanation: "U names the physical upstroke direction.",
    },
    commonMistakes: [
      { mistake: "Treating X and blank as the same silence.", fix: "X contacts muted strings; blank has no sounding contact." },
    ],
    musicalApplication: {
      body: "Create a four-step texture: ringing D, ringing U, muted X, silent return.",
      prompt: "Could a listener distinguish X from the blank?",
      options: ["Clearly", "Sometimes", "Not yet"],
      completionMessage: "Written strumming symbols now correspond to exact hand actions.",
    },
    alternativeExplanation:
      "Read every mark using two questions: which way does the hand move, and do the strings ring, click, or stay silent?",
    toolPresetId: "rhythm:continuous-hand",
    reviewSchedule: [1, 3, 7],
  },
  {
    id: "guitar-language:pulse-beat-tempo-and-bar",
    pathId: "guitar-language",
    title: "Pulse, beat, tempo, and one bar",
    learnerProblem: "I can copy a pattern but do not know what the count is organising.",
    category: "rhythm",
    skillType: "rhythm",
    difficulty: 1,
    coach: "nijika",
    prerequisiteIds: [],
    termsIntroduced: ["pulse", "beat", "tempo", "bar"],
    assumedTerms: [],
    estimatedMinutes: 9,
    experience:
      "Tap with one flashing circle, then count the flashes 1, 2, 3, 4 and restart.",
    plainEnglishExplanation:
      "The steady repeating tap is the pulse. Each counted tap is a beat. Tempo is how fast those taps move. One repeating group of four beats is a bar.",
    analogy:
      "The pulse is walking, beats are individual steps, tempo is walking speed, and a bar is one four-step group.",
    whyItMatters:
      "These four ideas explain where a strumming pattern lives without requiring notation.",
    visual: {
      kind: "rhythm-grid",
      beats: 4,
      slotsPerBeat: 1,
      countLabels: ["1", "2", "3", "4"],
      handDirections: ["D", "D", "D", "D"],
      events: [
        { slot: 0, type: "played", accented: true },
        { slot: 1, type: "played" },
        { slot: 2, type: "played" },
        { slot: 3, type: "played" },
      ],
      pulseOnly: true,
    },
    visualPrompt: "Tap all four circles evenly and make beat 1 feel like the start of a new group.",
    visualObservationGuide: [
      "Follow the flash before trying to play guitar.",
      "Count one number on every flash.",
      "Notice that the speed stays constant when the count returns to 1.",
    ],
    visualSuccess: "You can explain pulse, beat, tempo, and bar using the same four flashes.",
    audio: {
      body: "Compare an even four-beat bar with one rushed beat.",
      correctLabel: "Even 1–2–3–4",
      incorrectLabel: "Beat 3 arrives early",
      correctPattern: { kind: "rhythm", subdivisions: 4, activeSteps: [0, 1, 2, 3], accentedSteps: [0], bpm: 60 },
      incorrectPattern: {
        kind: "timed-rhythm",
        events: [
          { timeBeats: 0, accented: true },
          { timeBeats: 1 },
          { timeBeats: 1.72 },
          { timeBeats: 3 },
        ],
        bpm: 60,
      },
      listenFor: "In the even example, every beat has equal space around it.",
    },
    guidedPractice: {
      body: "Learn the count away from the guitar first.",
      steps: [
        "Tap 12 even pulses while saying nothing.",
        "Count three bars of 1, 2, 3, 4.",
        "Add one muted downstroke on each beat at 60 BPM.",
      ],
      success: "Three bars restart on 1 without an extra pause.",
    },
    objectiveCheck: {
      prompt: "What is tempo?",
      options: ["How fast the pulse moves", "One counted beat", "A chord shape"],
      correctIndex: 0,
      explanation: "Tempo measures pulse speed in beats per minute.",
    },
    checkpoint: {
      prompt: "In this lesson, what is one bar?",
      options: ["One group of four beats", "One upstroke", "Every note in a song"],
      correctIndex: 0,
      explanation: "The bar groups the repeating count 1, 2, 3, 4.",
    },
    commonMistakes: [
      { mistake: "Calling every fast note a faster tempo.", fix: "Tempo is pulse speed; more notes can fit inside the same pulse." },
    ],
    musicalApplication: {
      body: "Play one muted downstroke on each beat for two bars, then change chord on the next beat 1.",
      prompt: "Where did the chord change land?",
      options: ["On the next beat 1", "Between counts", "I lost the restart"],
      completionMessage: "The count now organises a real guitar change.",
    },
    alternativeExplanation:
      "Use one foot tap as the shared clock. Name each tap, group four, and only then add the guitar.",
    toolPresetId: "rhythm:four-count",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "guitar-language:first-two-chord-groove",
    pathId: "guitar-language",
    title: "Your first complete two-chord groove",
    learnerProblem: "My hand stops when I change chords.",
    category: "application",
    skillType: "project",
    difficulty: 2,
    coach: "kita",
    prerequisiteIds: [
      "guitar-language:read-a-chord-diagram",
      "guitar-language:pulse-beat-tempo-and-bar",
      "guitar-language:du-x-and-blank-spaces",
    ],
    termsIntroduced: ["rhythm"],
    assumedTerms: ["pulse", "beat", "bar", "downstroke"],
    estimatedMinutes: 15,
    experience:
      "Hear two bars of G and two bars of C while the four-count never stops.",
    plainEnglishExplanation:
      "A groove is a repeating rhythm that feels settled. Keep one downstroke per beat, prepare the next chord during beat 4, and let the new chord arrive on beat 1.",
    analogy:
      "The count is a moving walkway; the chord change must happen while it keeps moving.",
    whyItMatters:
      "This combines tuning, chord reading, clean notes, pulse, bars, and a real transition into playable music.",
    visual: {
      kind: "rhythm-grid",
      beats: 8,
      slotsPerBeat: 1,
      countLabels: ["1", "2", "3", "4", "1", "2", "3", "4"],
      handDirections: ["D", "D", "D", "D", "D", "D", "D", "D"],
      events: [
        { slot: 0, type: "played", chord: "G", accented: true },
        { slot: 1, type: "played", chord: "G" },
        { slot: 2, type: "played", chord: "G" },
        { slot: 3, type: "played", chord: "G" },
        { slot: 4, type: "played", chord: "C", accented: true },
        { slot: 5, type: "played", chord: "C" },
        { slot: 6, type: "played", chord: "C" },
        { slot: 7, type: "played", chord: "C" },
      ],
    },
    visualPrompt: "Keep eight equal downstrokes and change from G to C exactly on the second beat 1.",
    visualObservationGuide: [
      "Count through the change instead of waiting for the fingers.",
      "Begin releasing G after its beat-4 stroke.",
      "Accept a simplified C if it keeps the next beat 1 on time.",
    ],
    visualSuccess: "The pulse remains audible through five G-to-C and C-to-G changes.",
    audio: {
      body: "Compare an on-time two-chord groove with one that pauses at the change.",
      correctLabel: "Change lands on 1",
      incorrectLabel: "Count pauses for fingers",
      correctPattern: { kind: "rhythm", subdivisions: 8, activeSteps: [0, 1, 2, 3, 4, 5, 6, 7], accentedSteps: [0, 4], bpm: 60 },
      incorrectPattern: { kind: "rhythm", subdivisions: 8, activeSteps: [0, 1, 2, 3, 5, 6, 7], accentedSteps: [0, 5], bpm: 60 },
      listenFor: "The correct change preserves equal spacing and a clear new beat 1.",
    },
    guidedPractice: {
      body: "Build the project in layers.",
      steps: [
        "Mute the strings and count two bars with one downstroke per beat.",
        "Hold G for one bar and stop; then hold C for one bar and stop.",
        "Loop G for four beats and C for four beats at 60 BPM.",
        "Count five clean changes without increasing grip pressure.",
      ],
      success: "Five changes land on beat 1 and the count never waits for the fingers.",
    },
    objectiveCheck: {
      prompt: "When should the new chord sound?",
      options: ["On the next beat 1", "Whenever every finger feels perfect", "After stopping the count"],
      correctIndex: 0,
      explanation: "Prepare during beat 4 so the new chord arrives on beat 1.",
    },
    checkpoint: {
      prompt: "What should you simplify first if the change is late?",
      options: ["The chord grip or tempo", "The pulse", "The definition of a bar"],
      correctIndex: 0,
      explanation: "A slower tempo or easier voicing protects the musical time.",
    },
    commonMistakes: [
      { mistake: "Freezing the strumming hand while placing every finger.", fix: "Keep the count and accept a lighter or partial first stroke." },
      { mistake: "Squeezing harder before the change.", fix: "Release pressure after beat 4 and move with relaxed fingers." },
    ],
    musicalApplication: {
      body: "Perform four bars: G, C, G, C. Use one downstroke per beat and finish cleanly.",
      prompt: "Which evidence did you achieve?",
      options: ["Four complete bars", "Five clean timed changes", "Both"],
      outcomes: ["partial", "partial", "achieved"],
      completionMessage: "You completed a real two-chord groove with musical time.",
    },
    alternativeExplanation:
      "A slightly imperfect chord on time is more musical than a perfect chord after the beat has stopped.",
    toolPresetId: "chords:g-to-c-change",
    reviewSchedule: [1, 3, 7, 14],
  },
] satisfies AuthoredLessonDefinition[];

export const GUITAR_LANGUAGE_COURSE: AuthoredCourseDefinition = {
  id: "guitar-language",
  title: "Guitar Language Without Jargon",
  description:
    "Learn the physical map, diagrams, tab, timing symbols, and first complete groove before advanced vocabulary appears.",
  coach: "kita",
  learnerPromise:
    "You will understand the instructions that later lessons use instead of copying them blindly.",
  lessonIds: GUITAR_LANGUAGE_LESSONS.map((lesson) => lesson.id),
};
