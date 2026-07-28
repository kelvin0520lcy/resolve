import type {
  AuthoredCourseDefinition,
  AuthoredLessonDefinition,
} from "@/features/guitar-learning/data/courses/types";

const straightFour = {
  kind: "rhythm" as const,
  subdivisions: 4 as const,
  activeSteps: [0, 1, 2, 3],
  accentedSteps: [0],
  bpm: 60,
};

const eighthPattern = {
  kind: "rhythm" as const,
  subdivisions: 8 as const,
  activeSteps: [0, 2, 3, 5, 6, 7],
  bpm: 60,
};

export const RHYTHM_YOU_CAN_SEE_LESSONS = [
  {
    id: "rhythm:feeling-and-identifying-the-pulse",
    pathId: "rhythm",
    title: "Find the repeating pulse",
    learnerProblem: "I start strumming without a steady time underneath it.",
    category: "rhythm",
    skillType: "rhythm",
    difficulty: 1,
    coach: "nijika",
    prerequisiteIds: [],
    termsIntroduced: ["pulse"],
    assumedTerms: [],
    estimatedMinutes: 6,
    experience:
      "Watch one large circle flash at 60 BPM. Tap your leg with every flash before touching the guitar.",
    plainEnglishExplanation:
      "That steady repeating tap is the pulse. It continues underneath ringing chords, busy notes, and silence.",
    analogy:
      "The pulse is the band’s shared heartbeat. The surface can change while the heartbeat stays even.",
    whyItMatters:
      "If the pulse is stable, a missed stroke or difficult chord change does not move the whole song.",
    visual: {
      kind: "rhythm-grid",
      beats: 4,
      slotsPerBeat: 1,
      countLabels: ["●", "●", "●", "●"],
      handDirections: ["D", "D", "D", "D"],
      events: [
        { slot: 0, type: "played", accented: true },
        { slot: 1, type: "played" },
        { slot: 2, type: "played" },
        { slot: 3, type: "played" },
      ],
      pulseOnly: true,
    },
    visualPrompt: "Tap with every large pulse circle for three complete cycles.",
    visualObservationGuide: [
      "Let the flash lead; do not tap early to make it meet you.",
      "Keep the distance between taps equal.",
      "Continue tapping when the visual cycle returns to the first circle.",
    ],
    visualSuccess: "Twelve taps land with the flash without speeding up or waiting.",
    audio: {
      body: "Compare an even pulse with a version whose third tap arrives early.",
      correctLabel: "Four even taps",
      incorrectLabel: "One rushed tap",
      correctPattern: straightFour,
      incorrectPattern: {
        kind: "rhythm",
        subdivisions: 4,
        activeSteps: [0, 1, 2, 3],
        accentedSteps: [2],
        bpm: 72,
      },
      listenFor: "The even version leaves the same amount of time around every tap.",
    },
    guidedPractice: {
      body: "Use three body movements to prove the pulse is independent of the guitar.",
      steps: [
        "Tap one hand on your leg for eight pulses.",
        "Nod your head with the next eight pulses.",
        "Mute the strings and add one soft downstroke to the next eight.",
      ],
      success: "The change of movement does not change the pulse speed.",
    },
    objectiveCheck: {
      prompt: "Which description matches the pulse?",
      options: ["The steady repeating tap underneath the music", "Every note the guitar plays", "The loudest chord"],
      correctIndex: 0,
      explanation: "The pulse is the steady reference underneath different rhythms.",
    },
    checkpoint: {
      prompt: "What should happen to the pulse during a silent moment?",
      options: ["It continues internally", "It disappears", "It doubles automatically"],
      correctIndex: 0,
      explanation: "Silence changes the sound, not the underlying timing.",
    },
    commonMistakes: [
      { mistake: "Following each guitar note instead of the steady tap.", fix: "Remove the guitar and tap one simple repeating pulse first." },
    ],
    musicalApplication: {
      body: "Tap through eight seconds of silence, then play one muted stroke without changing speed.",
      prompt: "Did the returning stroke land where you expected?",
      options: ["Yes", "Close", "I lost the pulse"],
      completionMessage: "You maintained a pulse before adding a rhythm.",
    },
    alternativeExplanation:
      "Find the part of the music you could walk to evenly. Those imagined footsteps follow the pulse.",
    toolPresetId: "rhythm:pulse-at-60",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "rhythm:quarter-note-counting",
    pathId: "rhythm",
    title: "Count four beats",
    learnerProblem: "I feel a tap but do not know where a pattern or chord change begins.",
    category: "rhythm",
    skillType: "rhythm",
    difficulty: 1,
    coach: "nijika",
    prerequisiteIds: ["rhythm:feeling-and-identifying-the-pulse"],
    termsIntroduced: ["beat", "bar"],
    assumedTerms: ["pulse"],
    estimatedMinutes: 7,
    experience:
      "Keep the pulse and give each tap a number: 1, 2, 3, 4. Return to 1 without pausing.",
    plainEnglishExplanation:
      "Each counted point in the pulse is a beat. One repeating group of four beats is a bar. Beat 1 is the clear beginning of the next group.",
    analogy:
      "Four equal footsteps form one lap; beat 1 crosses the starting line again.",
    whyItMatters:
      "A four-count gives chords, accents, and rests exact positions instead of vague timing.",
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
    },
    visualPrompt: "Count three bars and make every new 1 sound like a calm restart.",
    visualObservationGuide: [
      "Use one number for every pulse.",
      "Keep 4-to-1 spacing equal to all other gaps.",
      "Let beat 1 feel clear without shouting or arriving early.",
    ],
    visualSuccess: "You count 1–2–3–4 three times with no extra gap before 1.",
    audio: {
      body: "Hear beat 1 slightly stronger so the four-beat group is easy to follow.",
      correctLabel: "1 begins each bar",
      incorrectLabel: "Accent moves to beat 3",
      correctPattern: straightFour,
      incorrectPattern: {
        kind: "rhythm",
        subdivisions: 4,
        activeSteps: [0, 1, 2, 3],
        accentedSteps: [2],
        bpm: 60,
      },
      listenFor: "The correct example makes the repeating start easy to predict.",
    },
    guidedPractice: {
      body: "Connect the count to one simple guitar action.",
      steps: [
        "Count three bars while tapping your foot.",
        "Add one muted downstroke to each number.",
        "Play G for one bar and C for one bar without stopping the count.",
      ],
      success: "Both chord names change on beat 1 while the four-count stays even.",
    },
    objectiveCheck: {
      prompt: "What is one beat?",
      options: ["One counted point in the pulse", "An entire song", "Any fast note"],
      correctIndex: 0,
      explanation: "A beat is one countable pulse point.",
    },
    checkpoint: {
      prompt: "When does the next four-beat bar begin?",
      options: ["When the count returns to 1", "After beat 2", "Whenever the chord is ready"],
      correctIndex: 0,
      explanation: "The repeating group begins again on beat 1.",
    },
    commonMistakes: [
      { mistake: "Pausing between 4 and the next 1.", fix: "Loop the spoken count like 1–2–3–4–1 with equal spacing." },
    ],
    musicalApplication: {
      body: "Play four muted downstrokes, then change the fretting-hand shape on the next beat 1.",
      prompt: "Where did the change happen?",
      options: ["On beat 1", "Between beats", "After the count stopped"],
      completionMessage: "You used beats and a bar to place a real change.",
    },
    alternativeExplanation:
      "The pulse gives the taps; beat numbers give each tap an address inside a repeating group.",
    toolPresetId: "rhythm:four-count",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "rhythm:eighth-note-subdivisions",
    pathId: "rhythm",
    title: "Split each beat into two",
    learnerProblem: "Upstrokes feel squeezed between the numbered beats.",
    category: "rhythm",
    skillType: "rhythm",
    difficulty: 1,
    coach: "nijika",
    prerequisiteIds: ["rhythm:quarter-note-counting"],
    termsIntroduced: ["subdivision"],
    assumedTerms: ["pulse", "beat", "bar"],
    estimatedMinutes: 8,
    experience:
      "Watch each large numbered beat open into two equal slots: the number and “and”.",
    plainEnglishExplanation:
      "You have already felt one beat. Now split that beat into two equal timing positions. Musicians call this an eighth-note subdivision: 1 and 2 and 3 and 4 and.",
    analogy:
      "Cut every beat into two equal halves without changing the size of the bar.",
    whyItMatters:
      "Equal number-and spacing gives upstrokes a reliable place and prevents rushed strumming.",
    visual: {
      kind: "rhythm-grid",
      beats: 4,
      slotsPerBeat: 2,
      countLabels: ["1", "&", "2", "&", "3", "&", "4", "&"],
      handDirections: ["D", "U", "D", "U", "D", "U", "D", "U"],
      events: Array.from({ length: 8 }, (_, slot) => ({
        slot,
        type: "played" as const,
        accented: slot % 2 === 0,
      })),
    },
    visualPrompt: "Say every number and “and” while the four large beat groups remain visible.",
    visualObservationGuide: [
      "Find the border around each number-and pair.",
      "Make number-to-and spacing equal to and-to-next-number spacing.",
      "Tap harder only on numbers without moving them earlier.",
    ],
    visualSuccess: "You count three bars of 1-and-2-and-3-and-4-and with eight equal gaps.",
    audio: {
      body: "Compare eight even positions with a rushed “and”.",
      correctLabel: "Even number-and split",
      incorrectLabel: "Late numbers, rushed ands",
      correctPattern: {
        kind: "rhythm",
        subdivisions: 8,
        activeSteps: [0, 1, 2, 3, 4, 5, 6, 7],
        accentedSteps: [0, 2, 4, 6],
        bpm: 60,
      },
      incorrectPattern: {
        kind: "rhythm",
        subdivisions: 8,
        activeSteps: [0, 2, 3, 4, 6, 7],
        accentedSteps: [0, 4],
        bpm: 60,
      },
      listenFor: "Every correct click is the same distance from the next.",
    },
    guidedPractice: {
      body: "Learn the split with voice and body before adding strings.",
      steps: [
        "Tap only the numbers while saying all eight syllables.",
        "Alternate hands: right on numbers, left on ands.",
        "Mute the strings and air-strum Down on numbers, Up on ands.",
      ],
      success: "Voice, tap, and hand direction stay aligned for three bars.",
    },
    objectiveCheck: {
      prompt: "What did subdivision do to one beat?",
      options: ["Split it into equal smaller positions", "Make the tempo faster", "Add a new chord"],
      correctIndex: 0,
      explanation: "Subdivision adds equal positions inside the existing beat.",
    },
    checkpoint: {
      prompt: "Where does “and” sit?",
      options: ["Exactly halfway between numbered beats", "At the same time as the number", "After the bar ends"],
      correctIndex: 0,
      explanation: "In an eighth-note split, “and” is the equal halfway position.",
    },
    commonMistakes: [
      { mistake: "Rushing every “and” toward the next number.", fix: "Tap alternating hands and make every gap physically equal." },
    ],
    musicalApplication: {
      body: "Strum a muted Down on numbers and Up on ands for one bar.",
      prompt: "Could you keep all eight positions even?",
      options: ["Three bars", "One bar", "Not yet"],
      completionMessage: "You turned one pulse into eight usable timing positions.",
    },
    alternativeExplanation:
      "The pulse still clicks four times; subdivision quietly places one extra equal point between each click.",
    toolPresetId: "rhythm:eighth-split",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "rhythm:continuous-strumming-hand-movement",
    pathId: "rhythm",
    title: "Keep the strumming hand moving",
    learnerProblem: "My hand resets after every stroke and loses the timing path.",
    category: "rhythm",
    skillType: "physical-technique",
    difficulty: 1,
    coach: "nijika",
    prerequisiteIds: ["rhythm:eighth-note-subdivisions"],
    termsIntroduced: ["downstroke", "upstroke"],
    assumedTerms: ["pulse", "beat", "subdivision"],
    estimatedMinutes: 8,
    experience:
      "Air-strum Down ↓ on every number and Up ↑ on every “and” without contacting the strings.",
    plainEnglishExplanation:
      "The hand traces an uninterrupted Down-Up path through all eight timing positions. A sounding stroke is a choice inside that motion; the motion itself is the clock.",
    analogy:
      "The hand is a pendulum. It keeps swinging even when one pass makes no sound.",
    whyItMatters:
      "Continuous movement makes later missed strokes and rests precise instead of hesitant.",
    visual: {
      kind: "picking",
      steps: [
        { label: "1 · Down ↓", direction: "D", contact: "played" },
        { label: "& · Up ↑", direction: "U", contact: "played" },
        { label: "2 · Down ↓", direction: "D", contact: "played" },
        { label: "& · Up ↑", direction: "U", contact: "played" },
      ],
    },
    visualPrompt: "Trace the Down-Up path in the air for three bars before touching the strings.",
    visualObservationGuide: [
      "Use a small loose wrist arc instead of a large shoulder swing.",
      "Reverse direction at every number and “and”.",
      "Keep the pick the same distance from the strings on each pass.",
    ],
    visualSuccess: "The hand completes 24 alternating movements without a reset or pause.",
    audio: {
      body: "Hear the even Down-Up result beside a version that restarts after each beat.",
      correctLabel: "Continuous motion",
      incorrectLabel: "Stop-and-reset motion",
      correctPattern: {
        kind: "rhythm",
        subdivisions: 8,
        activeSteps: [0, 1, 2, 3, 4, 5, 6, 7],
        bpm: 60,
      },
      incorrectPattern: {
        kind: "rhythm",
        subdivisions: 8,
        activeSteps: [0, 2, 4, 6],
        bpm: 60,
      },
      listenFor: "The correct example has equal number-and spacing with no rebound delay.",
    },
    guidedPractice: {
      body: "Build motion in three contact levels.",
      steps: [
        "Air-strum one bar while counting aloud.",
        "Brush muted strings very lightly for one bar.",
        "Play a chord with the same small motion for one bar.",
      ],
      success: "The hand path looks the same in air, muted contact, and chord contact.",
    },
    objectiveCheck: {
      prompt: "Where should an upstroke happen in this eighth-note motion?",
      options: ["On each “and”", "Only after a mistake", "At random"],
      correctIndex: 0,
      explanation: "Numbers travel Down and “ands” return Up.",
    },
    checkpoint: {
      prompt: "What acts as the timing clock?",
      options: ["The continuous Down-Up motion", "Only the sounding strokes", "The chord shape"],
      correctIndex: 0,
      explanation: "The uninterrupted hand path preserves every timing position.",
    },
    commonMistakes: [
      { mistake: "Making upstrokes much larger than downstrokes.", fix: "Use the same compact wrist arc in both directions." },
      { mistake: "Resetting the hand at the top.", fix: "Let the upstroke naturally become the next downstroke." },
    ],
    musicalApplication: {
      body: "Play eight quiet muted strokes, then let only the numbered downstrokes ring.",
      prompt: "Did the hidden up motion stay visible?",
      options: ["Yes for three bars", "For one bar", "It stopped"],
      completionMessage: "The strumming hand became a visible timing guide.",
    },
    alternativeExplanation:
      "Do not draw six separate strokes. Draw one repeating wave and decide which parts touch the strings.",
    toolPresetId: "rhythm:continuous-hand",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "rhythm:missed-strokes",
    pathId: "rhythm",
    title: "Move through a silent pass",
    learnerProblem: "Every blank in a pattern makes my hand freeze.",
    category: "rhythm",
    skillType: "rhythm",
    difficulty: 2,
    coach: "nijika",
    prerequisiteIds: ["rhythm:continuous-strumming-hand-movement"],
    termsIntroduced: ["missed-stroke"],
    assumedTerms: ["beat", "subdivision", "downstroke", "upstroke"],
    estimatedMinutes: 8,
    experience:
      "Keep eight Down-Up movements but lift the pick clear of the strings on two marked passes.",
    plainEnglishExplanation:
      "A missed stroke keeps the timed hand movement but removes string contact. The hand arrives on time, passes above the strings, and continues.",
    analogy:
      "The train passes the station on schedule without stopping to pick anyone up.",
    whyItMatters:
      "Missed strokes create space without making the next attack late.",
    visual: {
      kind: "rhythm-grid",
      beats: 4,
      slotsPerBeat: 2,
      countLabels: ["1", "&", "2", "&", "3", "&", "4", "&"],
      handDirections: ["D", "U", "D", "U", "D", "U", "D", "U"],
      events: [
        { slot: 0, type: "played" },
        { slot: 1, type: "missed" },
        { slot: 2, type: "played" },
        { slot: 3, type: "played" },
        { slot: 4, type: "missed" },
        { slot: 5, type: "played" },
        { slot: 6, type: "played" },
        { slot: 7, type: "played" },
      ],
    },
    visualPrompt: "Trace all eight arrows and identify the two that move without contact.",
    visualObservationGuide: [
      "Keep missed arrows full-size instead of shrinking them into pauses.",
      "Lift the pick only enough to clear the strings.",
      "Check that the stroke after each miss does not become early or loud.",
    ],
    visualSuccess: "A viewer can see all eight timed movements while hearing only six strokes.",
    audio: {
      body: "Compare deliberate missed passes with a version that loses the next attack.",
      correctLabel: "Silent passes stay in time",
      incorrectLabel: "Hand freezes in the gap",
      correctPattern: eighthPattern,
      incorrectPattern: {
        kind: "rhythm",
        subdivisions: 8,
        activeSteps: [0, 2, 3, 6, 7],
        bpm: 60,
      },
      listenFor: "The correct stroke after each gap lands without rushing or waiting.",
    },
    guidedPractice: {
      body: "Make the missing contact visible.",
      steps: [
        "Air-strum all eight positions and say “touch” or “miss”.",
        "Mute the strings and perform the six-contact pattern slowly.",
        "Play one chord and loop the bar three times at 60 BPM.",
      ],
      success: "Both missed passes remain visible and all three loops match.",
    },
    objectiveCheck: {
      prompt: "What is missing during a missed stroke?",
      options: ["Contact with the strings", "The timed hand movement", "The count"],
      correctIndex: 0,
      explanation: "The movement and count remain; only string contact is removed.",
    },
    checkpoint: {
      prompt: "Why should the hand move through the silent position?",
      options: ["So the next stroke keeps its timing", "To make the chord higher", "To change tuning"],
      correctIndex: 0,
      explanation: "Continuous motion preserves the next attack position.",
    },
    commonMistakes: [
      { mistake: "Stopping the wrist during silence.", fix: "Say the missed direction aloud and perform it in the air." },
      { mistake: "Lifting the whole arm far from the guitar.", fix: "Clear the strings by only a few millimetres." },
    ],
    musicalApplication: {
      body: "Loop the six-stroke pattern on one chord, then change chord on the next beat 1.",
      prompt: "What stayed steady?",
      options: ["The hand path", "The count", "Both"],
      completionMessage: "Silence became a controlled movement instead of a timing break.",
    },
    alternativeExplanation:
      "A missed stroke is not an empty action. It is a real Down or Up movement with zero string contact.",
    toolPresetId: "rhythm:missed-strokes",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "rhythm:constructing-strumming-patterns",
    pathId: "rhythm",
    title: "Build D D U U D U",
    learnerProblem: "I memorise D D U U D U but cannot place it on the count.",
    category: "rhythm",
    skillType: "rhythm",
    difficulty: 2,
    coach: "nijika",
    prerequisiteIds: ["rhythm:missed-strokes"],
    termsIntroduced: ["rhythm"],
    assumedTerms: ["beat", "subdivision", "downstroke", "upstroke", "missed-stroke"],
    estimatedMinutes: 10,
    experience:
      "Start with eight continuous movements, then select the six that produce D – D U – U D U.",
    plainEnglishExplanation:
      "The shorthand D D U U D U is not six evenly spaced strokes. It is six sounding choices placed on an eight-position Down-Up motion. The silent positions are the “and” after 1 and beat 3.",
    analogy:
      "Keep the full stencil of eight positions and colour only six of them.",
    whyItMatters:
      "Mapping shorthand to the count prevents the common lopsided version of this pattern.",
    visual: {
      kind: "rhythm-grid",
      beats: 4,
      slotsPerBeat: 2,
      countLabels: ["1", "&", "2", "&", "3", "&", "4", "&"],
      handDirections: ["D", "U", "D", "U", "D", "U", "D", "U"],
      events: [
        { slot: 0, type: "played", accented: true },
        { slot: 1, type: "missed" },
        { slot: 2, type: "played" },
        { slot: 3, type: "played" },
        { slot: 4, type: "missed" },
        { slot: 5, type: "played" },
        { slot: 6, type: "played" },
        { slot: 7, type: "played" },
      ],
    },
    visualPrompt: "Reconstruct the six sounding strokes by identifying both missed positions.",
    visualObservationGuide: [
      "Read the full count before reading the D/U shorthand.",
      "Point to every visible Down-Up movement.",
      "Say “miss” on the and after 1 and on beat 3.",
    ],
    visualSuccess: "You can write the pattern under 1-and-2-and-3-and-4-and from memory.",
    audio: {
      body: "Compare the correctly spaced pattern with six strokes squeezed into equal gaps.",
      correctLabel: "Six choices on eight positions",
      incorrectLabel: "Six equally spaced strokes",
      correctPattern: eighthPattern,
      incorrectPattern: {
        kind: "rhythm",
        subdivisions: 8,
        activeSteps: [0, 1, 2, 3, 4, 5],
        bpm: 60,
      },
      listenFor: "The correct version preserves the empty “and” after 1 and empty beat 3.",
    },
    guidedPractice: {
      body: "Construct rather than recite the pattern.",
      steps: [
        "Count all eight positions while air-strumming.",
        "Say “sound, miss, sound, sound, miss, sound, sound, sound”.",
        "Play on muted strings until three bars match.",
        "Add one chord while keeping the missing movements visible.",
      ],
      success: "Three loops match and you can state the two silent positions.",
    },
    objectiveCheck: {
      prompt: "Which two positions do not contact the strings?",
      options: ["The “and” after 1 and beat 3", "Beat 2 and beat 4", "Both upstrokes"],
      correctIndex: 0,
      explanation: "Those two missed positions produce D – D U – U D U.",
    },
    checkpoint: {
      prompt: "Why are the six letters not six equal time gaps?",
      options: ["They sit on selected positions of an eight-part motion", "The tempo changes every beat", "U has no timing"],
      correctIndex: 0,
      explanation: "The hidden eight-position grid determines the spacing.",
    },
    commonMistakes: [
      { mistake: "Reciting the letters without the count.", fix: "Always align them under 1-and-2-and-3-and-4-and." },
      { mistake: "Turning beat 3 into a complete hand stop.", fix: "Perform the missed downstroke over the strings." },
    ],
    musicalApplication: {
      body: "Loop the pattern on G, then move to C after a complete bar.",
      prompt: "Which evidence was strongest?",
      options: ["Three matching bars", "Visible missed strokes", "Both"],
      completionMessage: "You built the famous shorthand from its real timing structure.",
    },
    alternativeExplanation:
      "Write eight boxes first. D D U U D U only tells you which six boxes sound after directions are assigned.",
    toolPresetId: "rhythm:dduudu",
    reviewSchedule: [1, 3, 7, 14],
  },
  {
    id: "rhythm:beginner-jrock-groove-project",
    pathId: "rhythm",
    title: "Play a complete Japanese-rock groove",
    learnerProblem: "A pattern works alone but falls apart when chords and section energy change.",
    category: "application",
    skillType: "project",
    difficulty: 2,
    coach: "nijika",
    prerequisiteIds: ["rhythm:constructing-strumming-patterns"],
    termsIntroduced: ["accent"],
    assumedTerms: ["pulse", "beat", "bar", "rhythm", "missed-stroke"],
    estimatedMinutes: 18,
    experience:
      "Hear a quiet verse bar and a stronger chorus bar that share the same pulse and pattern.",
    plainEnglishExplanation:
      "Keep D – D U – U D U in both sections. Make the verse smaller and quieter; make the chorus broader and add a stronger stroke on beats 2 and 4. The timing does not change.",
    analogy:
      "The same actor speaks one line privately, then projects it across a stage.",
    whyItMatters:
      "Section contrast should come from controlled touch and dynamics, not from losing the beat.",
    visual: {
      kind: "rhythm-grid",
      beats: 8,
      slotsPerBeat: 2,
      countLabels: ["1", "&", "2", "&", "3", "&", "4", "&", "1", "&", "2", "&", "3", "&", "4", "&"],
      handDirections: ["D", "U", "D", "U", "D", "U", "D", "U", "D", "U", "D", "U", "D", "U", "D", "U"],
      events: [
        { slot: 0, type: "played", chord: "Am" },
        { slot: 1, type: "missed" },
        { slot: 2, type: "played", chord: "Am", accented: true },
        { slot: 3, type: "played", chord: "Am" },
        { slot: 4, type: "missed" },
        { slot: 5, type: "played", chord: "Am" },
        { slot: 6, type: "played", chord: "Am", accented: true },
        { slot: 7, type: "played", chord: "Am" },
        { slot: 8, type: "played", chord: "F" },
        { slot: 9, type: "missed" },
        { slot: 10, type: "played", chord: "F", accented: true },
        { slot: 11, type: "played", chord: "F" },
        { slot: 12, type: "missed" },
        { slot: 13, type: "played", chord: "F" },
        { slot: 14, type: "played", chord: "F", accented: true },
        { slot: 15, type: "played", chord: "F" },
      ],
    },
    visualPrompt: "Keep the pattern unchanged while moving from an Am verse bar to an F chorus bar.",
    visualObservationGuide: [
      "Circle the same two missed positions in both bars.",
      "Notice that accents change strength, not placement.",
      "Prepare the F shape during the final upstroke of the Am bar.",
    ],
    visualSuccess: "Four verse–chorus pairs keep identical timing while the chorus sounds intentionally larger.",
    audio: {
      body: "Compare useful section contrast with a chorus that simply rushes.",
      correctLabel: "Same time, stronger chorus",
      incorrectLabel: "Chorus becomes faster",
      correctPattern: {
        ...eighthPattern,
        accentedSteps: [2, 6],
      },
      incorrectPattern: {
        ...eighthPattern,
        bpm: 78,
      },
      listenFor: "The correct chorus changes weight but stays aligned to the same pulse.",
    },
    guidedPractice: {
      body: "Build the project from one unchanged timing skeleton.",
      steps: [
        "Loop the pattern quietly on muted strings.",
        "Play one quiet Am bar and one stronger Am bar without changing speed.",
        "Add the Am-to-F change at the bar line.",
        "Perform four bars: quiet Am, quiet F, strong Am, strong F.",
      ],
      success: "The final four bars have clear contrast, steady time, and clean bar-line changes.",
    },
    objectiveCheck: {
      prompt: "What creates the safer section contrast?",
      options: ["Stronger touch while timing stays fixed", "Rushing the chorus", "Adding random strokes"],
      correctIndex: 0,
      explanation: "Controlled dynamics change energy without damaging the groove.",
    },
    checkpoint: {
      prompt: "What is an accent?",
      options: ["One intentionally stronger stroke", "A faster bar", "A missed chord"],
      correctIndex: 0,
      explanation: "An accent changes stroke weight, not timing.",
    },
    commonMistakes: [
      { mistake: "Playing the chorus earlier instead of stronger.", fix: "Practise the same pattern on muted strings and change only stroke weight." },
      { mistake: "Stopping before the chord change.", fix: "Prepare fingers during the final upstroke and preserve the count." },
    ],
    musicalApplication: {
      body: "Perform and save one four-bar verse-to-chorus rhythm part using original chords.",
      prompt: "Which project criteria did you meet?",
      options: ["Steady pulse", "Clear section contrast", "Both"],
      completionMessage: "You completed an original, royalty-safe Japanese-rock rhythm part.",
    },
    alternativeExplanation:
      "Section energy is a volume and touch decision layered on top of the same timing map.",
    toolPresetId: "rhythm:dduudu",
    reviewSchedule: [1, 3, 7, 14],
  },
] satisfies AuthoredLessonDefinition[];

export const RHYTHM_YOU_CAN_SEE_COURSE: AuthoredCourseDefinition = {
  id: "rhythm",
  title: "Rhythm You Can See",
  description:
    "Move from one steady tap to a counted bar, an eighth-note split, continuous motion, missed strokes, and a complete groove.",
  coach: "nijika",
  learnerPromise:
    "You will know exactly where every D, U, and silent pass belongs instead of memorising a floating letter pattern.",
  lessonIds: RHYTHM_YOU_CAN_SEE_LESSONS.map((lesson) => lesson.id),
};
