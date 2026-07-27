export type MotivationMember = "bocchi" | "nijika" | "ryo" | "kita";

export type MotivationQuote = {
  id: string;
  member: MotivationMember;
  memberName: string;
  memberNameEn: string;
  trait: string;
  traitJa: string;
  text: string;
  textJa: string;
};

const MEMBER_NAMES: Record<
  MotivationMember,
  { japanese: string; english: string }
> = {
  bocchi: {
    japanese: "後藤ひとり（ぼっち）",
    english: "Hitori Gotoh · Bocchi",
  },
  nijika: {
    japanese: "伊地知虹夏",
    english: "Nijika Ijichi",
  },
  ryo: {
    japanese: "山田リョウ",
    english: "Ryo Yamada",
  },
  kita: {
    japanese: "喜多郁代",
    english: "Ikuyo Kita",
  },
};

function quote(
  member: MotivationMember,
  number: string,
  traitJa: string,
  trait: string,
  textJa: string,
  text: string,
): MotivationQuote {
  return {
    id: `${member}-${number}`,
    member,
    memberName: MEMBER_NAMES[member].japanese,
    memberNameEn: MEMBER_NAMES[member].english,
    trait,
    traitJa,
    text,
    textJa,
  };
}

export const MOTIVATION_QUOTES: MotivationQuote[] = [
  quote(
    "bocchi",
    "01",
    "静かな勇気",
    "quiet courage",
    "あっ……手が震えてても、その……最初の一歩まで止めなくていい、と思います。",
    "U-um… even if your hands are shaking, you do not have to stop the first step from shaking with you.",
  ),
  quote(
    "bocchi",
    "02",
    "見えない練習",
    "private practice",
    "あ、誰にも見えない練習でも……いつか部屋を驚かせる自分を作ってるので……た、多分。",
    "Ah, even practice nobody sees is building the version of you that might surprise the room someday… p-probably.",
  ),
  quote(
    "bocchi",
    "03",
    "不完全な始まり",
    "imperfect starts",
    "あっ、最初のテイクがボロボロでも……無音よりは、ちゃんと一曲に近づいてます……！",
    "A-awful first take still means you made sound. That is closer to a song than silence is…!",
  ),
  quote(
    "bocchi",
    "04",
    "不安の中の前進",
    "anxious momentum",
    "み、未来がうるさすぎる日は……次の一小節だけ、小さく弾けば大丈夫です。",
    "I-if the whole semester gets too loud, turn down the future and play only the next bar.",
  ),
  quote(
    "bocchi",
    "05",
    "逃げずに来る",
    "showing up",
    "あっ……来て、逃げないだけでも……それ、かなり勇者ムーブでは……？",
    "U-um… just arriving and not escaping is already a surprisingly heroic move, isn't it…?",
  ),
  quote(
    "bocchi",
    "06",
    "やさしく再起動",
    "gentle recovery",
    "しゃ、社会性がフリーズしても人生は強制終了しないので……小さい会話から再起動を……。",
    "If your social software freezes, life does not force-quit. R-reboot with one smaller interaction.",
  ),
  quote(
    "bocchi",
    "07",
    "不安より自分",
    "self-belief",
    "不安の声、すごく大きいですけど……監督じゃないので、次の場面は自分で決めていいです。",
    "Anxiety is very loud, b-but it is not the director. You still get to choose the next scene.",
  ),
  quote(
    "bocchi",
    "08",
    "地道な技術",
    "steady craft",
    "だ、誰も見ない普通の日に戻れる人が……本番で信じられる人になる、と思います。",
    "I think the person who returns on ordinary, invisible days becomes the person they can trust onstage.",
  ),
  quote(
    "bocchi",
    "09",
    "小さな挑戦",
    "gentle exposure",
    "あっ……今日は隠れ場所を、出口に一センチだけ近づけてみませんか……？",
    "C-could we move the hiding place just one centimetre closer to becoming a doorway today…?",
  ),
  quote(
    "bocchi",
    "10",
    "比べない音",
    "comparison",
    "ほかの人が眩しくても……自分の音が消えるわけじゃないです。バンドに同じ音は四ついらないので……。",
    "Other people can be blinding, but they do not erase your sound. A band does not need four copies of one part.",
  ),
  quote(
    "bocchi",
    "11",
    "小さな勝ち",
    "small wins",
    "ご、五分しか無理なら……その五分だけ本気でやれば、「ゼロ」じゃないです……！",
    "I-if five minutes is all you have, make those five honest. Then today is not zero…!",
  ),
  quote(
    "bocchi",
    "12",
    "作品で伝える",
    "expression",
    "口では言えないことも……作ったものなら、少しだけ代わりに話してくれます。",
    "What I cannot say out loud can sometimes be said by the thing I was brave enough to make.",
  ),

  quote(
    "nijika",
    "01",
    "戻れるテンポ",
    "rhythm",
    "よしっ、今日は速さより戻れるテンポ！止まっても、次のカウントから入ればいいよ。",
    "Okay! Today we choose a tempo you can return to. If you stop, come back in on the next count!",
  ),
  quote(
    "nijika",
    "02",
    "行動で導く",
    "leadership",
    "リーダーっぽい長話より、毎日同じ一歩！そのリズムがいちばん信用できるよ。",
    "A repeated step beats a leader-like speech. Set the tempo with the action you actually do!",
  ),
  quote(
    "nijika",
    "03",
    "人にやさしい計画",
    "encouragement",
    "計画には、人間らしく揺れる余白も必要！もちろん、自分の分もね。",
    "Plans need room for people to be human—including you. That is how progress keeps its rhythm!",
  ),
  quote(
    "nijika",
    "04",
    "最初のカウント",
    "count-in",
    "全部と交渉しなくていいよ。ワン、ツー、スリー、フォー！まず最初の一拍！",
    "Do not negotiate with the entire task. One, two, three, four—just land the first beat!",
  ),
  quote(
    "nijika",
    "05",
    "続けられる合奏",
    "teamwork",
    "一人で抱える完璧な計画より、生活の全部が参加できる計画にしよう！",
    "A plan your whole life can actually play is stronger than a perfect one you carry alone!",
  ),
  quote(
    "nijika",
    "06",
    "今日から復帰",
    "resilience",
    "昨日の一拍を外しても曲は終わらないよ。今日のカウントを聴いて、ここから入ろう！",
    "Missing yesterday's beat did not ruin the song. Listen for today's count and come back in!",
  ),
  quote(
    "nijika",
    "07",
    "予定にする希望",
    "practical hope",
    "信じてるなら、ちゃんと一時間あげよう！希望はカレンダーに入れると動き出すよ。",
    "If you believe in it, give it a real hour. Hope starts moving when it reaches the calendar!",
  ),
  quote(
    "nijika",
    "08",
    "休符もリズム",
    "balance",
    "休みは空っぽの小節じゃないよ。次の音をちゃんと鳴らすための休符！",
    "Rest is not an empty measure. It is the rest that protects every note that follows!",
  ),
  quote(
    "nijika",
    "09",
    "続く仕組み",
    "consistency",
    "役に立つ行動を、もう一回やりやすくしよう！その繰り返しがやる気より強くなるよ。",
    "Make the useful action easy to repeat. Soon that rhythm will be louder than motivation!",
  ),
  quote(
    "nijika",
    "10",
    "やさしい基準",
    "kind standards",
    "目標はしっかり持つ。でも追いかける自分にはやさしく！両方あって完走できるんだから。",
    "Hold the goal firmly and the person pursuing it gently. You need both to reach the finale!",
  ),
  quote(
    "nijika",
    "11",
    "大事な三拍",
    "priorities",
    "全部を一拍目にはできないよ！今週いちばん強く鳴らしたい三つを決めよう。",
    "Everything cannot get the downbeat! Pick the three outcomes that deserve the strongest count this week.",
  ),
  quote(
    "nijika",
    "12",
    "小さなアンコール",
    "celebration",
    "小さな成功もちゃんと拍手！フィナーレ前に努力が見えると、バンドは元気になるよ。",
    "Applaud the small wins too! A band keeps its energy when effort is noticed before the finale.",
  ),

  quote(
    "ryo",
    "01",
    "仕組み優先",
    "systems thinking",
    "やる気は信用しない。やる気がなくても動く仕組みを作ればいい。",
    "Do not trust motivation. Build a system that still works when motivation leaves.",
  ),
  quote(
    "ryo",
    "02",
    "自分のルート",
    "independence",
    "変な道でも、データが合ってるなら進めばいい。普通は評価指標じゃない。",
    "A strange path is fine if the evidence holds. Normal is not a useful metric.",
  ),
  quote(
    "ryo",
    "03",
    "本質だけ",
    "essentials",
    "飾りの努力は削る。ベースラインだけ残せば、曲はまだ立ってる。",
    "Remove the decorative effort. Keep the bassline—the few actions holding the result together.",
  ),
  quote(
    "ryo",
    "04",
    "失敗はデータ",
    "experimentation",
    "悪い結果も、照明を当てればデータ。変数を一つだけ変えて、もう一回。",
    "A bad result is still data with dramatic lighting. Change one variable and run it again.",
  ),
  quote(
    "ryo",
    "05",
    "退屈の入場料",
    "focus",
    "退屈は上達の入場料。新しい管理アプリを買う前に払って。",
    "Boredom is sometimes the entrance fee for mastery. Pay it before buying another productivity tool.",
  ),
  quote(
    "ryo",
    "06",
    "時間の節約",
    "resourcefulness",
    "時間がないなら、最後の食費みたいに使う。計画を生かすものだけに。",
    "When time is scarce, spend it like the last of the food budget: only on what keeps the plan alive.",
  ),
  quote(
    "ryo",
    "07",
    "正確な問い",
    "clarity",
    "正確な質問で壊れる目標は、たぶん締切を着た気分。",
    "If a precise question destroys the goal, it was probably a mood wearing a deadline.",
  ),
  quote(
    "ryo",
    "08",
    "深く潜る",
    "deep work",
    "中断されない一時間は、忙しそうに見える一日より音が多い。",
    "One uninterrupted hour carries more music than a whole day spent looking productive.",
  ),
  quote(
    "ryo",
    "09",
    "意図ある個性",
    "originality",
    "型を覚える。どのルールを、なぜ壊すのか説明できるくらいまで。",
    "Learn the standard form well enough to know exactly which rule you are breaking on purpose.",
  ),
  quote(
    "ryo",
    "10",
    "測りすぎない",
    "measurement",
    "決めるために測る。測ることを旅にしたら、目的地には着かない。",
    "Track enough to make a decision. If measurement becomes the journey, you will not reach the destination.",
  ),
  quote(
    "ryo",
    "11",
    "地味な土台",
    "patience",
    "基礎は映えない。でも基礎のない派手さは、だいたい音が薄い。",
    "Foundations are not glamorous. Without them, impressive things usually sound hollow.",
  ),
  quote(
    "ryo",
    "12",
    "次の実験",
    "decisiveness",
    "次のテストを決めて、成功条件を書く。不安との会議は終了。",
    "Choose the next test and define success. The meeting with uncertainty is over.",
  ),

  quote(
    "kita",
    "01",
    "先に光へ",
    "bright momentum",
    "よーし、先に光の中へ！自信はあとから追いついてくることもあるよ！",
    "Okay, step into the light first! Confidence can catch up once it knows where to find you!",
  ),
  quote(
    "kita",
    "02",
    "助けを呼ぶ",
    "connection",
    "悩みが秘密の個人プロジェクトになる前に声をかけよう！一緒なら次の音が出せるよ。",
    "Ask for help before the struggle becomes a secret solo project. We can find the next note together!",
  ),
  quote(
    "kita",
    "03",
    "まっすぐ練習",
    "earnest practice",
    "好き！で扉は開くよ。そこに居続ける力は、今日の地道な一回から！",
    "Excitement opens the door! Patient repetition is what lets you stay in the room!",
  ),
  quote(
    "kita",
    "04",
    "見せる勇気",
    "visibility",
    "完璧になる前に見せてみよう！フィードバックだって、本物の一歩がないと応援できないから。",
    "Let the work be seen before it is flawless! Feedback needs one real step to stand beside.",
  ),
  quote(
    "kita",
    "05",
    "つながる一言",
    "social courage",
    "考えすぎてるそのメッセージ、誰かにとっては「もちろん！」のきっかけかも。送ってみよう！",
    "That message you are overthinking might be someone's easiest reason to say yes. Send it!",
  ),
  quote(
    "kita",
    "06",
    "予定に渡す情熱",
    "energy",
    "わくわくは最高の火花！消える前に、カレンダーへバトンタッチしよう！",
    "Excitement is a brilliant spark! Hand it to the calendar before it disappears!",
  ),
  quote(
    "kita",
    "07",
    "初心者も堂々と",
    "learning",
    "初心者って、伸びしろが見えるってことだよ！堂々と練習しよう！",
    "Being a beginner means your room to grow is visible! Practice proudly!",
  ),
  quote(
    "kita",
    "08",
    "自分にも光を",
    "generosity",
    "みんなを明るくするのは素敵！でも自分の成長にも、その光を少し残してね。",
    "Making the room brighter is wonderful! Save some of that light for your own progress too.",
  ),
  quote(
    "kita",
    "09",
    "発表のその先",
    "follow-through",
    "キラキラの宣言はオープニング！本編のコツコツも、ちゃんと予定に入れよう！",
    "The sparkling announcement is only the opening! Put the quiet follow-through on the calendar too!",
  ),
  quote(
    "kita",
    "10",
    "緊張をステージ力に",
    "reframing",
    "緊張とわくわくって、電気がちょっと似てるよね。最初の一歩へ流して、ステージ力にしよう！",
    "Nerves and excitement use similar electricity. Point it at the first step and call it stage power!",
  ),
  quote(
    "kita",
    "11",
    "応援を共有",
    "community",
    "目標を応援してくれる人に話そう！見張られるより、一緒に喜べるほうが続くよ！",
    "Share the goal with someone rooting for you! Accountability lasts longer when it sounds like support.",
  ),
  quote(
    "kita",
    "12",
    "楽しむ努力",
    "joyful effort",
    "本気でも、毎日まで暗くしなくていいよ！楽しいって気持ちも、立派な方法だから！",
    "Serious work does not require grim days! Joy is allowed to be part of the method!",
  ),
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
