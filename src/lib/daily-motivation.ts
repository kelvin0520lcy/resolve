export type MotivationMember = "bocchi" | "nijika" | "ryo" | "kita";

export type MotivationQuote = {
  id: string;
  member: MotivationMember;
  memberName: string;
  trait: string;
  text: string;
};

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    id: "bocchi-01",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "quiet courage",
    text: "You do not need to stop shaking before you begin; let the first small action shake with you.",
  },
  {
    id: "bocchi-02",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "private practice",
    text: "Invisible practice is still building the version of you that will eventually surprise the room.",
  },
  {
    id: "bocchi-03",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "imperfect starts",
    text: "A rough first take is not proof that you failed; it is proof that silence finally became a take.",
  },
  {
    id: "bocchi-04",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "anxious momentum",
    text: "When the whole semester feels too loud, turn down the future and play only the next bar.",
  },
  {
    id: "bocchi-05",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "showing up",
    text: "Courage can look extremely unimpressive from the outside: sometimes it is just arriving and not escaping.",
  },
  {
    id: "bocchi-06",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "recovery",
    text: "A social-error blue screen is not the end of the episode. Reboot gently and try one smaller interaction.",
  },
  {
    id: "bocchi-07",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "self-belief",
    text: "Your fear is a noisy audience member, not the director. It does not get to choose the next scene.",
  },
  {
    id: "bocchi-08",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "steady craft",
    text: "Talent becomes trustworthy when you return on the ordinary days nobody would put in a montage.",
  },
  {
    id: "bocchi-09",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "gentle exposure",
    text: "Do one thing today that future-you will remember as the moment the hiding place became a doorway.",
  },
  {
    id: "bocchi-10",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "comparison",
    text: "Someone else being brilliant does not erase your sound. The band needs parts, not four copies of one person.",
  },
  {
    id: "bocchi-11",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "small wins",
    text: "If all you can manage is five focused minutes, make those five minutes honest enough to count.",
  },
  {
    id: "bocchi-12",
    member: "bocchi",
    memberName: "Bocchi",
    trait: "expression",
    text: "What feels impossible to say directly may still become clear through the work you choose to make.",
  },
  {
    id: "nijika-01",
    member: "nijika",
    memberName: "Nijika",
    trait: "rhythm",
    text: "A good week does not need constant speed; it needs a count you can return to after every pause.",
  },
  {
    id: "nijika-02",
    member: "nijika",
    memberName: "Nijika",
    trait: "leadership",
    text: "Set the tempo with the action you repeat, because people trust a rhythm more than a speech.",
  },
  {
    id: "nijika-03",
    member: "nijika",
    memberName: "Nijika",
    trait: "encouragement",
    text: "Progress grows faster when the plan leaves room for people to be human, including you.",
  },
  {
    id: "nijika-04",
    member: "nijika",
    memberName: "Nijika",
    trait: "count-in",
    text: "Do not negotiate with the entire task. Count yourself in and complete the first beat.",
  },
  {
    id: "nijika-05",
    member: "nijika",
    memberName: "Nijika",
    trait: "teamwork",
    text: "The strongest plan is not the one you carry alone; it is the one every part of your life can actually play.",
  },
  {
    id: "nijika-06",
    member: "nijika",
    memberName: "Nijika",
    trait: "resilience",
    text: "Missing yesterday’s beat does not ruin the song. Listen, find today’s count, and come back in.",
  },
  {
    id: "nijika-07",
    member: "nijika",
    memberName: "Nijika",
    trait: "practical hope",
    text: "Optimism works best with a calendar: give the thing you believe in a real hour to happen.",
  },
  {
    id: "nijika-08",
    member: "nijika",
    memberName: "Nijika",
    trait: "balance",
    text: "Rest is not an empty measure. It protects the timing of everything that follows.",
  },
  {
    id: "nijika-09",
    member: "nijika",
    memberName: "Nijika",
    trait: "consistency",
    text: "Make the useful action easy to repeat, then let repetition become louder than motivation.",
  },
  {
    id: "nijika-10",
    member: "nijika",
    memberName: "Nijika",
    trait: "kind standards",
    text: "Hold the goal firmly and the person pursuing it gently. You need both to finish the season.",
  },
  {
    id: "nijika-11",
    member: "nijika",
    memberName: "Nijika",
    trait: "priorities",
    text: "If everything gets the downbeat, nothing has one. Choose the three outcomes that deserve the strongest count.",
  },
  {
    id: "nijika-12",
    member: "nijika",
    memberName: "Nijika",
    trait: "celebration",
    text: "Mark the small wins out loud. A team keeps its energy when effort gets noticed before the finale.",
  },
  {
    id: "ryo-01",
    member: "ryo",
    memberName: "Ryo",
    trait: "systems thinking",
    text: "Do not ask whether you feel organised. Build a system that still works when you are not.",
  },
  {
    id: "ryo-02",
    member: "ryo",
    memberName: "Ryo",
    trait: "independence",
    text: "A strange path is not automatically the wrong path; check the evidence before copying the crowd.",
  },
  {
    id: "ryo-03",
    member: "ryo",
    memberName: "Ryo",
    trait: "essentials",
    text: "Remove the decorative effort. Keep the bassline: the few actions without which the result falls apart.",
  },
  {
    id: "ryo-04",
    member: "ryo",
    memberName: "Ryo",
    trait: "experimentation",
    text: "Treat a bad result as data with dramatic lighting. Change one variable and run the next attempt.",
  },
  {
    id: "ryo-05",
    member: "ryo",
    memberName: "Ryo",
    trait: "focus",
    text: "Boredom is sometimes the entrance fee for mastery. Pay it before buying another productivity tool.",
  },
  {
    id: "ryo-06",
    member: "ryo",
    memberName: "Ryo",
    trait: "resourcefulness",
    text: "When time is scarce, spend it like your last meal budget: on what keeps the whole plan alive.",
  },
  {
    id: "ryo-07",
    member: "ryo",
    memberName: "Ryo",
    trait: "clarity",
    text: "If a goal cannot survive a precise question, it was probably a mood wearing a deadline.",
  },
  {
    id: "ryo-08",
    member: "ryo",
    memberName: "Ryo",
    trait: "deep work",
    text: "One uninterrupted hour can carry more melody than a day of checking whether you look productive.",
  },
  {
    id: "ryo-09",
    member: "ryo",
    memberName: "Ryo",
    trait: "originality",
    text: "Learn the standard form well enough to know exactly which rule you are breaking on purpose.",
  },
  {
    id: "ryo-10",
    member: "ryo",
    memberName: "Ryo",
    trait: "measurement",
    text: "Track enough to make a decision, not so much that recording the journey replaces taking it.",
  },
  {
    id: "ryo-11",
    member: "ryo",
    memberName: "Ryo",
    trait: "patience",
    text: "The foundational part is rarely glamorous, but everything impressive sounds empty without it.",
  },
  {
    id: "ryo-12",
    member: "ryo",
    memberName: "Ryo",
    trait: "decisiveness",
    text: "Choose the next test, define what success means, and stop holding meetings with your uncertainty.",
  },
  {
    id: "kita-01",
    member: "kita",
    memberName: "Kita",
    trait: "bright momentum",
    text: "Confidence often arrives after you step into the light, so give it somewhere to meet you.",
  },
  {
    id: "kita-02",
    member: "kita",
    memberName: "Kita",
    trait: "connection",
    text: "Ask for help before the struggle becomes a secret project. People cannot join a song they cannot hear.",
  },
  {
    id: "kita-03",
    member: "kita",
    memberName: "Kita",
    trait: "earnest practice",
    text: "Enthusiasm opens the door; patient repetition is what lets you stay in the room.",
  },
  {
    id: "kita-04",
    member: "kita",
    memberName: "Kita",
    trait: "visibility",
    text: "Let the work be seen before it feels flawless. Feedback needs something real to stand beside.",
  },
  {
    id: "kita-05",
    member: "kita",
    memberName: "Kita",
    trait: "social courage",
    text: "The message you are overthinking may become someone else’s easiest reason to say yes.",
  },
  {
    id: "kita-06",
    member: "kita",
    memberName: "Kita",
    trait: "energy",
    text: "Use your excitement as a spark, then hand the flame to a schedule before it disappears.",
  },
  {
    id: "kita-07",
    member: "kita",
    memberName: "Kita",
    trait: "learning",
    text: "Being a beginner in public is not embarrassing; pretending you never need practice is.",
  },
  {
    id: "kita-08",
    member: "kita",
    memberName: "Kita",
    trait: "generosity",
    text: "Make the room brighter, but remember that your own progress deserves some of that light too.",
  },
  {
    id: "kita-09",
    member: "kita",
    memberName: "Kita",
    trait: "follow-through",
    text: "A sparkling announcement is only the opening scene. Put the quiet follow-through on the calendar.",
  },
  {
    id: "kita-10",
    member: "kita",
    memberName: "Kita",
    trait: "reframing",
    text: "Nerves and excitement use similar electricity. Point it toward the first action and call it stage power.",
  },
  {
    id: "kita-11",
    member: "kita",
    memberName: "Kita",
    trait: "community",
    text: "Share the goal with someone who wants you to succeed; accountability feels lighter when it sounds like support.",
  },
  {
    id: "kita-12",
    member: "kita",
    memberName: "Kita",
    trait: "joyful effort",
    text: "The work can be serious without making every day grim. Joy is allowed to be part of the method.",
  },
];

function hashSeed(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dateOrdinal(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return 0;
  const [, year, month, day] = match;
  return Math.floor(
    Date.UTC(Number(year), Number(month) - 1, Number(day)) / 86_400_000,
  );
}

export function getDailyMotivation(
  dateKey: string,
  personalSeed = "resolve",
) {
  const length = MOTIVATION_QUOTES.length;
  const seedOffset = hashSeed(personalSeed) % length;
  const dailyStep = 17;
  const index =
    (seedOffset + (dateOrdinal(dateKey) % length) * dailyStep) % length;
  return MOTIVATION_QUOTES[index];
}
