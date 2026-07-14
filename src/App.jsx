import { useState, useRef, useEffect, useCallback } from "react";
import {
  Flame, Mic, Square, Volume2, Repeat, CheckCircle2,
  AlertCircle, Sparkles, Settings2, X, ChevronRight,
  Lightbulb, RotateCcw, SkipForward, BookOpen,
} from "lucide-react";
import { LESSONS } from "./lessonData";

const LEVELS = {
  "初級": { label: "初級", desc: "Present / past tense, can / will" },
  "中級": { label: "中級", desc: "Perfect tense, relative clauses" },
  "上級": { label: "上級", desc: "Subjunctive, participial phrases, business topics" },
};
const TOPICS = ["日常会話", "旅行", "ビジネス", "フリートーク"];

const SCENARIOS = {
  greeting: {
    label: "挨拶・雑談",
    desc: "レッスン開始のあいさつ、アイスブレイク、話題を広げる雑談",
    color: "#D97757",
    seedPhrases: [
      "今週の調子はどうですか、と聞く",
      "前回の内容を復習してきたか尋ねる",
      "今日はこのトピックに集中しましょう、と伝える",
      "始める前に質問はあるか聞く",
      "そろそろ始めましょうか、と軽く切り出す",
      "週末はどう過ごしていますか、と雑談する",
      "日本に来たことがあるか、旅行の予定を聞く",
      "日本語学習で一番楽しいのは何か聞く",
      "ところで、このトピック試したことある?と話を広げる",
    ],
  },
  grammar: {
    label: "文法説明",
    desc: "文法・語彙の説明、意味の解説",
    color: "#1F2A37",
    seedPhrases: [
      "この単語・表現の意味を説明する",
      "嚙み砕いて説明しますね、と前置きする",
      "AとBの違いはここです、と伝える",
      "こう考えると理解しやすいですよ、と説明する",
      "これはよく使うパターンです、と伝える",
      "この動詞がどう変化するか気づかせる",
      "この文の中でこの語がどんな役割をしているかに注目させる",
      "最初は難しく感じるけど、慣れれば身につくよ、と励ます",
      "ふたつの例文を並べて比べさせる",
      "日常会話でよく耳にするパターンです、と紹介する",
    ],
  },
  instruction: {
    label: "指示・練習",
    desc: "ロールプレイやドリルの指示、練習の進め方",
    color: "#7A8B6F",
    seedPhrases: [
      "この文を声に出して読んでみて、と指示する",
      "この単語を使って文を作ってみて、と指示する",
      "このパターンを何回か練習しましょう、と伝える",
      "ロールプレイをしましょう、私が店員であなたが客、と役を割り振る",
      "役割を交代して逆でやってみましょう、と伝える",
      "私の後について繰り返して、と指示する",
      "私が英語で言うから日本語に訳してみて、と指示する",
      "焦らなくて大丈夫ですよ、と伝える",
      "変換ドリルをしましょう、この動詞を〜形に変えてみて、と指示する",
      "代入ドリルをしましょう、例文のこの部分を入れ替えてみて、と指示する",
      "完全な文で答えてみて、と促す",
      "短い会話を始めましょう、私がこう言うから続けて、と切り出す",
    ],
  },
  feedback: {
    label: "訂正・フィードバック",
    desc: "生徒の発言に対する訂正、褒め、励まし",
    color: "#C2691F",
    seedPhrases: [
      "惜しい、小さな間違いがあります、と伝える",
      "惜しい、もう一度やってみよう、と促す",
      "とても自然な言い方でした、と褒める",
      "もっと自然な言い方はこうです、と直す",
      "正しくは A で、B ではありません、と訂正する",
      "よくある間違いだから気にしないで、と伝える",
      "このパターン、だいぶ上達してきましたね、と伝える",
      "定着させるためにもう一回練習しましょう、と促す",
      "その調子、よくできています、と励ます",
    ],
  },
  prompt: {
    label: "発言を促す・相槌",
    desc: "生徒の発言を引き出す質問、相槌、共感",
    color: "#C9A04A",
    seedPhrases: [
      "これはどういう意味だと思いますか、と聞く",
      "日本語ではどう言いますか、と聞く",
      "例文を作ってみてくれる?と促す",
      "こういう場面ではどう言いますか、と聞く",
      "説明する前に予想してみて、と促す",
      "ここまで大丈夫ですか、と確認する",
      "なるほど、そういうことね、と相槌を打つ",
      "いい質問ですね、と受け止める",
      "そのとおり、ばっちりです、と反応する",
      "面白いですね、もう少し詳しく聞かせて、と続きを促す",
    ],
  },
  trouble: {
    label: "トラブル対応",
    desc: "通信不良や聞き取れない時の対応",
    color: "#6B7A8F",
    seedPhrases: [
      "通信が途切れたので、もう一度言ってもらう",
      "声がちゃんと聞こえるか確認する",
      "はっきり聞こえていますか、と確認する",
      "画面を共有します、少し待ってください、と伝える",
      "チャットに書き込みますね、と伝える",
      "少し遅延があるみたい、と伝える",
      "遅くなってごめんなさい、続けましょう、と切り替える",
    ],
  },
  closing: {
    label: "まとめ・締め",
    desc: "レッスンの締めくくり、宿題の案内、次回への繋ぎ",
    color: "#A85A6E",
    seedPhrases: [
      "今日やった内容をさっと復習しましょう、と伝える",
      "今日のパターン、よく身についていました、と褒める",
      "宿題として次回までにこのパターンを3回使ってみて、と伝える",
      "次回も同じ時間でいいですか、と確認する",
      "何かあればいつでもメッセージしてね、と伝える",
      "また次回!とレッスンを締める",
    ],
  },
  filler: {
    label: "つなぎ・間つなぎ",
    desc: "言葉に詰まった時のつなぎ、話題転換のつなぎ",
    color: "#8A6FB0",
    seedPhrases: [
      "少し考える時間が欲しい、と間をつなぐ",
      "いい質問ですね、少し考えさせて、と間をとる",
      "言い直したい、と切り出す",
      "ちょっと言葉が出てこないので待ってて、と伝える",
      "沈黙せずに何か声を出してつなぐ",
      "それは次のレッスンで習いますよ、と伝える",
      "次のポイントに進みましょう、と話題を切り替える",
      "少し話を変えて〜について話しましょう、と切り替える",
      "今の話に関連して、と話をつなげる",
      "念のため確認しますが、と補足する",
      "言い換えると、と別の言い方で説明する",
    ],
  },
};

// --- Pronunciation practice content ---
const PRONUNCIATION_CATEGORIES = {
  v_b: {
    label: "v / b",
    desc: "唇を閉じて出すbと、上の前歯を下唇に当てて出すvの区別",
    color: "#2F7A78",
    items: [
      { word: "verb", ipa: "/vɜːrb/", note: "動詞" },
      { word: "very", ipa: "/ˈveri/", note: "とても" },
      { word: "vote", ipa: "/voʊt/", note: "投票する" },
      { word: "voice", ipa: "/vɔɪs/", note: "声" },
      { word: "move", ipa: "/muːv/", note: "動く" },
      { word: "believe", ipa: "/bɪˈliːv/", note: "信じる" },
      { word: "favorite", ipa: "/ˈfeɪvərɪt/", note: "お気に入りの" },
      { word: "invite", ipa: "/ɪnˈvaɪt/", note: "招待する" },
    ],
  },
  r_l: {
    label: "r / l",
    desc: "舌をどこにも触れさせないrと、舌先を上あごに当てるlの区別",
    color: "#3B5FA0",
    items: [
      { word: "right", ipa: "/raɪt/", note: "正しい" },
      { word: "light", ipa: "/laɪt/", note: "光・軽い" },
      { word: "road", ipa: "/roʊd/", note: "道" },
      { word: "load", ipa: "/loʊd/", note: "積み荷" },
      { word: "free", ipa: "/friː/", note: "自由な" },
      { word: "fly", ipa: "/flaɪ/", note: "飛ぶ" },
      { word: "world", ipa: "/wɜːrld/", note: "世界" },
      { word: "really", ipa: "/ˈriːəli/", note: "本当に" },
    ],
  },
  th: {
    label: "th",
    desc: "舌を上下の歯の間に軽く挟んで出すthの音(this / think)",
    color: "#A8546B",
    items: [
      { word: "think", ipa: "/θɪŋk/", note: "考える" },
      { word: "this", ipa: "/ðɪs/", note: "これ" },
      { word: "three", ipa: "/θriː/", note: "3" },
      { word: "mother", ipa: "/ˈmʌðər/", note: "母" },
      { word: "both", ipa: "/boʊθ/", note: "両方" },
      { word: "though", ipa: "/ðoʊ/", note: "だけれど" },
      { word: "birthday", ipa: "/ˈbɜːrθdeɪ/", note: "誕生日" },
      { word: "without", ipa: "/wɪˈðaʊt/", note: "〜なしで" },
    ],
  },
  phrases: {
    label: "つながる音",
    desc: "単語同士がつながって聞こえる、決まり文句のリズム",
    color: "#8C6B3E",
    items: [
      { word: "part ways", ipa: "/pɑːrt weɪz/", note: "決別する、別々の道を行く" },
      { word: "kind of", ipa: "/kaɪnd əv/", note: "なんとなく" },
      { word: "a lot of", ipa: "/ə lɒt əv/", note: "たくさんの" },
      { word: "first of all", ipa: "/fɜːrst əv ɔːl/", note: "まず最初に" },
      { word: "used to", ipa: "/juːst tə/", note: "以前は〜だった" },
      { word: "next to", ipa: "/nekst tə/", note: "〜の隣に" },
      { word: "sort of", ipa: "/sɔːrt əv/", note: "ある意味" },
    ],
  },
};

const SCORE_META = {
  perfect: { label: "Perfect", color: "#7A8B6F", Icon: CheckCircle2 },
  good: { label: "Good", color: "#C9A04A", Icon: CheckCircle2 },
  needs_improvement: { label: "Almost", color: "#C9694F", Icon: AlertCircle },
};
const DATA_KEY = "shunkan_coach_data_v2";
const PRON_DATA_KEY = "shunkan_coach_pron_v1";
const QUESTIONS_PER_LESSON = 5;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// --- Spaced repetition (SM-2) ---
function scheduleCard(card, quality) {
  let { reps = 0, intervalDays = 0, ease = 2.5 } = card;
  if (quality < 3) {
    reps = 0;
    intervalDays = 1;
  } else {
    if (reps === 0) intervalDays = 1;
    else if (reps === 1) intervalDays = 3;
    else intervalDays = Math.max(1, Math.round(intervalDays * ease));
    reps += 1;
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return {
    ...card, reps, intervalDays, ease,
    dueAt: Date.now() + intervalDays * 86400000,
    lastReviewedAt: Date.now(),
  };
}

function buildLessonQueue(deck) {
  const now = Date.now();
  const due = deck.filter((c) => c.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
  const reviewCards = due.slice(0, QUESTIONS_PER_LESSON);
  const newCount = QUESTIONS_PER_LESSON - reviewCards.length;
  return [
    ...reviewCards.map((c) => ({ type: "review", card: c })),
    ...Array.from({ length: newCount }, () => ({ type: "new", card: null })),
  ];
}

function buildScenarioQueue() {
  return Array.from({ length: QUESTIONS_PER_LESSON }, () => ({ type: "new", card: null }));
}

// --- 課別レッスンの出題キューを組み立てる(データ駆動) ---
// lesson: LESSONS[lessonId] のオブジェクト
// activity: "explain"(文法説明) | "run"(授業運営)
// pointId: 文法ポイントのid、または "all"(全ポイントからまとめて)
function buildLessonModeQueue(lesson, activity, pointId) {
  const points = pointId === "all" ? lesson.points : lesson.points.filter((p) => p.id === pointId);
  const tasks = [];
  points.forEach((p) => {
    const list = activity === "explain" ? p.explain : p.run;
    (list || []).forEach((t) => tasks.push({ ...t, pointLabel: p.label }));
  });
  const shuffled = [...tasks].sort(() => Math.random() - 0.5);
  // 単一ポイントならそのポイントの全問、「まとめて」なら6問に絞る
  const cap = pointId === "all" ? 6 : shuffled.length;
  const chosen = shuffled.slice(0, Math.max(1, Math.min(cap, shuffled.length)));
  return chosen.map((t, i) => ({
    type: "new",
    card: {
      id: `l_${Date.now()}_${i}`,
      japanese: t.ja,
      english_correct: t.en,
      hint: t.hint,
      pointLabel: t.pointLabel,
      lesson: lesson.id,
      activity,
    },
  }));
}

// --- あいまい一致ヘルパー ---
// 音声認識の軽微な聞き間違い(1〜2文字の違い)を許容するための編集距離
function editDistance(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array(n + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

// 単語同士が「ほぼ同じ」とみなせるか(長い単語ほど許容度を広げる)
function wordsAlike(a, b) {
  if (a === b) return true;
  const len = Math.max(a.length, b.length);
  if (len >= 7) return editDistance(a, b) <= 2;
  if (len >= 4) return editDistance(a, b) <= 1;
  return false;
}

function similarity(a, b) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9' ]/g, "").trim().split(/\s+/).filter(Boolean);
  const wa = norm(a), wb = norm(b);
  if (!wa.length || !wb.length) return 0;
  const used = new Array(wb.length).fill(false);
  let overlap = 0;
  for (const w of wa) {
    const idx = wb.findIndex((x, i) => !used[i] && wordsAlike(w, x));
    if (idx >= 0) { used[idx] = true; overlap += 1; }
  }
  return overlap / Math.max(wa.length, wb.length);
}

// 認識候補の中から模範解答に最も近いものを選ぶ
function pickBestCandidate(candidates, target) {
  const cands = [...new Set(candidates.map((c) => (c || "").trim()).filter(Boolean))];
  if (!cands.length) return "";
  if (!target) return cands[0];
  let best = cands[0], bestScore = -1;
  for (const c of cands) {
    const s = similarity(c, target);
    if (s > bestScore) { bestScore = s; best = c; }
  }
  return best;
}

// --- Pronunciation matching helpers ---
function normalizeWords(s) {
  return s.toLowerCase().replace(/[^a-z0-9' ]/g, "").trim().split(/\s+/).filter(Boolean);
}
function checkPronunciation(transcript, target) {
  const heard = normalizeWords(transcript);
  const want = normalizeWords(target);
  if (!heard.length || !want.length) return false;
  if (want.length === 1) return heard.includes(want[0]);
  const heardSet = new Set(heard);
  const matched = want.filter((w) => heardSet.has(w)).length;
  return matched / want.length >= 0.8;
}
function categoryAccuracy(key, data) {
  const items = PRONUNCIATION_CATEGORIES[key].items;
  let attempts = 0, correct = 0;
  items.forEach((it) => {
    const r = data[it.word];
    if (r) { attempts += r.attempts; correct += r.correct; }
  });
  return attempts > 0 ? correct / attempts : null;
}

function speak(text, lang) {
  return new Promise((resolve) => {
    if (!text || !window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = lang.startsWith("ja") ? 0.92 : 0.98;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

// APIキーはサーバー側(Netlify Function)に隠れているので
// ここからは /api/claude に投げるだけでOK
async function callClaude(system, userMsg) {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!response.ok) throw new Error("API request failed");
  const data = await response.json();
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

function generateNewCard(level, topic, avoidList) {
  const system = `You are an English conversation coach running a "sokuji eisakubun" (instant English composition) drill for a Japanese learner.
Generate ONE new Japanese sentence suitable for level ${level} (${LEVELS[level].desc}) and topic ${topic === "フリートーク" ? "any everyday topic, your choice" : topic}, plus one natural, idiomatic English reference translation, plus a short hint in English (a grammar point or key phrase) that does not give away the full answer.
Sentence length guide: 初級 ~6-10 English words, 中級 ~10-16 words, 上級 ~14-22 words.
Avoid repeating or closely resembling any of these already-used Japanese sentences: ${avoidList.join(" / ") || "(none yet)"}
Respond with ONLY this JSON, nothing else: {"japanese": "...", "english_correct": "...", "hint": "..."}`;
  return callClaude(system, "Generate the next card now.");
}

function generateScenarioCard(scenarioKey, avoidList) {
  const s = SCENARIOS[scenarioKey];
  const seed = s.seedPhrases[Math.floor(Math.random() * s.seedPhrases.length)];
  const system = `You are an English coach helping a Japanese-language tutor build the specific English she needs while teaching her own lessons in English.
Scenario: "${s.label}" (${s.desc}).
Base intent for this sentence (in Japanese, describing what the tutor wants to say in class): ${seed}
Generate ONE natural Japanese instruction line describing that intent (as something to be translated into English), plus one natural, idiomatic English sentence a real online tutor would actually say in that exact classroom moment, plus a short hint in English (a key phrase or structure) that does not give away the full answer.
Keep the English reference sentence short and speakable (roughly 6-14 words), the kind of line said live during a lesson.
Avoid repeating or closely resembling any of these already-used Japanese sentences: ${avoidList.join(" / ") || "(none yet)"}
Respond with ONLY this JSON, nothing else: {"japanese": "...", "english_correct": "...", "hint": "..."}`;
  return callClaude(system, "Generate the next card now.");
}

function evaluateAnswer(japanese, reference, userAnswer) {
  const system = `You are a warm, encouraging English conversation coach speaking live with a Japanese learner during a speaking drill. The learner heard a Japanese sentence and tried to say its English translation out loud; their answer was captured by speech-to-text, so minor transcription glitches (missing articles, homophones, punctuation) may not reflect a real mistake — use judgment.
Always respond in English, in a natural SPOKEN style (1-2 short sentences, like a real coach talking, not written notes or bullet points), since your feedback will be read aloud by text-to-speech.
The reference translation is a guide, not the only acceptable answer — accept valid natural alternatives as correct.
Japanese sentence: "${japanese}"
Reference translation: "${reference}"
Respond with ONLY this JSON, nothing else:
{"score": "perfect" | "good" | "needs_improvement", "feedback": "short spoken-style coaching feedback", "corrected_sentence": "the best natural English version", "encouragement": "a short upbeat phrase"}`;
  return callClaude(system, `The learner's spoken answer was: "${userAnswer}"`);
}

function evaluateScenarioAnswer(japanese, reference, userAnswer, scenarioKey) {
  const s = SCENARIOS[scenarioKey];
  const system = `You are a warm, encouraging English coach helping a Japanese-language tutor rehearse the English she'll use live while teaching her own students, in the scenario "${s.label}" (${s.desc}). She heard a Japanese instruction line and tried to say its English classroom-appropriate version out loud; her answer was captured by speech-to-text, so minor transcription glitches (missing articles, homophones, punctuation) may not reflect a real mistake — use judgment.
Always respond in English, in a natural SPOKEN style (1-2 short sentences, like a real coach talking, not written notes or bullet points), since your feedback will be read aloud by text-to-speech.
Judge naturalness for an actual live teaching moment, not just grammatical correctness — the reference translation is a guide, not the only acceptable answer.
Japanese instruction line: "${japanese}"
Reference translation: "${reference}"
Respond with ONLY this JSON, nothing else:
{"score": "perfect" | "good" | "needs_improvement", "feedback": "short spoken-style coaching feedback", "corrected_sentence": "the best natural classroom English version", "encouragement": "a short upbeat phrase"}`;
  return callClaude(system, `The learner's spoken answer was: "${userAnswer}"`);
}

// 課別レッスン用の評価。activity で「文法説明」か「授業運営」かを切り替える。
function evaluateLessonAnswer(japanese, reference, userAnswer, activity, pointLabel) {
  const context = activity === "explain"
    ? `She is practicing how to EXPLAIN a Japanese grammar point ("${pointLabel}") in clear, simple English to a beginner student. Judge whether her explanation is clear, accurate, and easy for a learner to follow — not whether it matches the reference word-for-word.`
    : `She is practicing the spoken English she'll use to RUN a class activity and manage the lesson (giving instructions, starting a drill, asking a question, correcting, encouraging) for the grammar point "${pointLabel}". Judge whether it sounds like natural, friendly classroom English a real tutor would actually say live.`;
  const system = `You are a warm, encouraging English coach helping a Japanese-language tutor rehearse the English she uses while teaching her own students in English. ${context}
She heard a Japanese line describing what she wants to say or explain, and tried to say the English version out loud; her answer was captured by speech-to-text, so minor transcription glitches (missing articles, homophones, punctuation) may not reflect a real mistake — use judgment.
Always respond in English, in a natural SPOKEN style (1-2 short sentences, like a real coach talking, not written notes or bullet points), since your feedback will be read aloud by text-to-speech.
The reference is a guide, not the only acceptable answer — accept valid natural alternatives. If she referenced the Japanese example words in romaji, that's fine and natural for a tutor.
Japanese line: "${japanese}"
Reference English: "${reference}"
Respond with ONLY this JSON, nothing else:
{"score": "perfect" | "good" | "needs_improvement", "feedback": "short spoken-style coaching feedback", "corrected_sentence": "the best natural English version", "encouragement": "a short upbeat phrase"}`;
  return callClaude(system, `The learner's spoken answer was: "${userAnswer}"`);
}

// --- Speech recognition ---
// Some browsers occasionally never fire onend/onerror after recog.start(),
// leaving the UI stuck on "listening" forever. A hard timeout guarantees
// we always recover, even if the browser's event never arrives.
const SPEECH_TIMEOUT_MS = 9000;

function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [alternatives, setAlternatives] = useState([]);
  const [supported, setSupported] = useState(true);
  const recogRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const Impl = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!Impl);
  }, []);

  const clearSafetyTimeout = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  const start = useCallback((lang) => {
    const Impl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Impl) { setSupported(false); return; }
    setTranscript("");
    setAlternatives([]);
    const recog = new Impl();
    recog.lang = lang;
    recog.interimResults = true;
    recog.continuous = false;
    recog.maxAlternatives = 5;
    recog.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
      // 認識エンジンが返す第2〜第5候補も収集する。
      // 各セグメントで候補jが無ければ第1候補で埋めて文をつなぐ。
      const cands = new Set();
      for (let j = 0; j < 5; j++) {
        let t = "";
        let found = j === 0;
        for (let i = 0; i < e.results.length; i++) {
          const alt = e.results[i][j];
          if (alt) { t += alt.transcript; found = true; }
          else t += e.results[i][0].transcript;
        }
        if (found && t.trim()) cands.add(t.trim());
      }
      setAlternatives([...cands]);
    };
    recog.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setSupported(false);
      clearSafetyTimeout();
      setListening(false);
    };
    recog.onend = () => {
      clearSafetyTimeout();
      setListening(false);
    };
    recogRef.current = recog;
    setListening(true);
    try { recog.start(); } catch { setListening(false); return; }
    clearSafetyTimeout();
    timeoutRef.current = setTimeout(() => {
      try { recog.stop(); } catch { /* ignore */ }
      // Force the UI to unstick even if the browser never calls onend at all.
      setListening(false);
    }, SPEECH_TIMEOUT_MS);
  }, []);

  const stop = useCallback(() => {
    clearSafetyTimeout();
    try { recogRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  return { listening, transcript, alternatives, supported, start, stop };
}

// --- localStorage helpers (Netlify版はwindow.storageが使えないのでlocalStorageを使う) ---
function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveData(deck, stats, settings) {
  try { localStorage.setItem(DATA_KEY, JSON.stringify({ deck, stats, settings })); } catch { /* ignore */ }
}
function loadPronData() {
  try {
    const raw = localStorage.getItem(PRON_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function savePronData(data) {
  try { localStorage.setItem(PRON_DATA_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export default function ShunkanEisakubunCoach() {
  const [stage, setStage] = useState("onboarding");
  const [mode, setMode] = useState("practice"); // "practice" | "lesson" | "scenario" | "pronunciation"
  const [scenarioKey, setScenarioKey] = useState("greeting");
  const [settings, setSettings] = useState({ level: "中級", topic: "日常会話" });
  const [deck, setDeck] = useState([]);
  const [stats, setStats] = useState({ totalReviewed: 0, streak: 0, lastDate: null });
  const [loaded, setLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 課別レッスンモードの選択状態
  const [lessonId, setLessonId] = useState("lesson13");
  const [lessonActivity, setLessonActivity] = useState("explain"); // "explain" | "run"
  const [lessonPointId, setLessonPointId] = useState("all");

  const [greetingText, setGreetingText] = useState("");
  const queueRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [currentType, setCurrentType] = useState(null);
  const [phase, setPhase] = useState("prompt");
  const [showHint, setShowHint] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [lastAnswer, setLastAnswer] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [repeatNote, setRepeatNote] = useState(null);
  const [lessonResults, setLessonResults] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState(null);
  const [micHint, setMicHint] = useState(null);
  const failedStepRef = useRef(null);
  const wasListeningRef = useRef(false);

  // Pronunciation practice state
  const [pronCategory, setPronCategory] = useState("v_b");
  const [pronQueue, setPronQueue] = useState([]);
  const [pronIndex, setPronIndex] = useState(0);
  const [pronPhase, setPronPhase] = useState("ready"); // "ready" | "listening" | "result"
  const [pronResults, setPronResults] = useState([]);
  const [pronData, setPronData] = useState({});

  const speech = useSpeechInput();
  const scrollRef = useRef(null);

  useEffect(() => {
    const saved = loadData();
    if (saved) {
      setDeck(saved.deck || []);
      setSettings(saved.settings || { level: "中級", topic: "日常会話" });
      let streak = saved.stats?.streak || 0;
      if (saved.stats?.lastDate) {
        const diff = Math.round((new Date(todayStr()) - new Date(saved.stats.lastDate)) / 86400000);
        if (diff >= 2) streak = 0;
      }
      setStats({ ...(saved.stats || {}), streak, totalReviewed: saved.stats?.totalReviewed || 0 });
    }
    const savedPron = loadPronData();
    if (savedPron) setPronData(savedPron);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [phase, evalResult, repeatNote]);

  // Whenever speech recognition transitions from listening -> not listening
  // (normal end, error, or the hard safety timeout), automatically move the
  // UI forward instead of leaving it stuck on "listening…".
  useEffect(() => {
    const wasListening = wasListeningRef.current;
    wasListeningRef.current = speech.listening;
    if (!wasListening || speech.listening) return;

    if (stage === "lesson") {
      if (phase === "listening") finishListening();
      else if (phase === "repeating") finishRepeatWithSpeech();
    } else if (stage === "pron_session" && pronPhase === "listening") {
      finishPronListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.listening]);

  const dueCount = deck.filter((c) => c.dueAt <= Date.now()).length;

  const startQuestion = async (idx) => {
    setError(null);
    setCurrentIndex(idx);
    setEvalResult(null);
    setAnswerText("");
    setLastAnswer("");
    setRepeatNote(null);
    setShowHint(false);
    const item = queueRef.current[idx];

    if (item.type === "new" && !item.card) {
      setPhase("generating");
      const attempt = async () => {
        try {
          const used = queueRef.current.filter((q) => q.card).map((q) => q.card.japanese)
            .concat(mode === "practice" ? deck.map((c) => c.japanese) : []);
          const card = mode === "scenario"
            ? await generateScenarioCard(scenarioKey, used)
            : await generateNewCard(settings.level, settings.topic, used);
          item.card = {
            id: `c_${Date.now()}_${idx}`,
            japanese: card.japanese,
            english_correct: card.english_correct,
            hint: card.hint,
            level: mode === "scenario" ? scenarioKey : settings.level,
            topic: mode === "scenario" ? "scenario" : settings.topic,
            reps: 0, intervalDays: 0, ease: 2.5,
            dueAt: Date.now(), createdAt: Date.now(),
          };
          setCurrentCard(item.card);
          setCurrentType(item.type);
          setPhase("await_answer");
        } catch {
          failedStepRef.current = attempt;
          setError("Couldn't reach the coach. Let's try again.");
          setPhase("error");
        }
      };
      await attempt();
      return;
    }

    // 事前に用意されたカード(レッスン/復習)はそのまま提示
    setCurrentCard(item.card);
    setCurrentType(item.type);
    if (mode === "lesson") {
      // 課別レッスンは問題文を文字で見せるだけ。日本語の読み上げはしない。
      setPhase("await_answer");
      return;
    }
    setPhase("await_answer");
  };

  const beginListening = () => { setMicHint(null); setPhase("listening"); speech.start("en-US"); };

  const submitAnswer = async (answer) => {
    setLastAnswer(answer);

    if (mode === "lesson") {
      // 課別レッスンはAIの解説・採点なし。
      // 聞き取り結果と模範解答だけを見せて、模範解答を読み上げる。
      const result = {
        score: null,
        feedback: null,
        corrected_sentence: currentCard.english_correct,
      };
      setEvalResult(result);
      setPhase("result");
      await speak(currentCard.english_correct, "en-US");
      return;
    }

    setPhase("evaluating");
    const attempt = async () => {
      try {
        const result = mode === "scenario"
          ? await evaluateScenarioAnswer(currentCard.japanese, currentCard.english_correct, answer, scenarioKey)
          : await evaluateAnswer(currentCard.japanese, currentCard.english_correct, answer);
        setEvalResult(result);
        setPhase("result");
        if (mode !== "scenario") {
          await speak(result.feedback, "en-US");
          await speak(result.corrected_sentence || currentCard.english_correct, "en-US");
        }
      } catch {
        failedStepRef.current = attempt;
        setError("The coach had trouble checking that. Let's retry.");
        setPhase("error");
      }
    };
    await attempt();
  };

  const finishListening = () => {
    speech.stop();
    // 第1候補だけでなく全候補の中から、模範解答に最も近いものを採用する。
    // 正しく言えたのに聞き間違いで減点される事故を減らす。
    const finalAnswer = pickBestCandidate(
      [speech.transcript, ...speech.alternatives],
      currentCard?.english_correct
    );
    if (finalAnswer) {
      submitAnswer(finalAnswer);
    } else {
      setMicHint("うまく聞き取れませんでした。もう一度タップして話してみてください。");
      setPhase("await_answer");
    }
  };

  const beginRepeat = () => { setMicHint(null); setPhase("repeating"); speech.start("en-US"); };

  const recordResult = (note) => {
    setRepeatNote(note);
    setLessonResults((prev) => [...prev, { card: currentCard, type: currentType, userAnswer: lastAnswer, ...evalResult }]);
    setPhase("repeat_ack");
  };

  const finishRepeatWithSpeech = () => {
    speech.stop();
    const target = evalResult.corrected_sentence || currentCard.english_correct;
    const candidates = [speech.transcript, ...speech.alternatives]
      .map((c) => (c || "").trim()).filter(Boolean);
    const sim = candidates.reduce((m, c) => Math.max(m, similarity(c, target)), 0);
    recordResult(sim > 0.55 ? "Nice, well said! 👏" : "Good effort — keep repeating and it'll come naturally.");
  };

  const skipRepeat = () => recordResult(null);

  const goNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= queueRef.current.length) finishLesson();
    else startQuestion(nextIdx);
  };

  const finishLesson = () => {
    const today = todayStr();
    const diff = stats.lastDate ? Math.round((new Date(today) - new Date(stats.lastDate)) / 86400000) : null;
    const streak = stats.lastDate === today ? stats.streak : (diff === 1 || stats.lastDate === null ? stats.streak + 1 : 1);
    const nextStats = { totalReviewed: stats.totalReviewed + lessonResults.length, streak, lastDate: today };

    // practice以外(課別レッスン/シナリオ)はSRSデッキに保存せず、その場の集計だけ表示
    if (mode !== "practice") {
      const updatedSummaries = lessonResults.map((r) => ({ ...r, dueInDays: null }));
      setStats(nextStats);
      setSummaries(updatedSummaries);
      saveData(deck, nextStats, settings);
      setStage("summary");
      return;
    }

    let nextDeck = [...deck];
    const updatedSummaries = [];
    for (const r of lessonResults) {
      const quality = r.score === "perfect" ? 5 : r.score === "good" ? 4 : 2;
      const idx = nextDeck.findIndex((c) => c.id === r.card.id);
      const base = idx >= 0 ? nextDeck[idx] : r.card;
      const scheduled = scheduleCard(base, quality);
      if (idx >= 0) nextDeck[idx] = scheduled; else nextDeck.push(scheduled);
      updatedSummaries.push({ ...r, dueInDays: scheduled.intervalDays });
    }

    setDeck(nextDeck);
    setStats(nextStats);
    setSummaries(updatedSummaries);
    saveData(nextDeck, nextStats, settings);
    setStage("summary");
  };

  const startGreeting = async () => {
    const queue = mode === "scenario" ? buildScenarioQueue()
      : mode === "lesson" ? buildLessonModeQueue(LESSONS[lessonId], lessonActivity, lessonPointId)
      : buildLessonQueue(deck);
    queueRef.current = queue;
    setLessonResults([]);

    // 課別レッスン・レッスンシナリオは、あいさつナレーションなしで直接1問目へ
    if (mode === "lesson" || mode === "scenario") {
      setStage("lesson");
      startQuestion(0);
      return;
    }

    let text;
    const reviewCount = queue.filter((q) => q.type === "review").length;
    const newCount = queue.length - reviewCount;
    if (stats.totalReviewed === 0)
      text = "Hi! I'm your English coach. Today we'll start with five brand-new sentences. Let's dive in!";
    else if (reviewCount === 0)
      text = "Welcome back! Today's lesson is five new sentences. Ready? Let's go!";
    else if (newCount === 0)
      text = `Welcome back! Today we're reviewing ${reviewCount} sentence${reviewCount > 1 ? "s" : ""} from before. Let's refresh your memory!`;
    else
      text = `Welcome back! Today: ${reviewCount} review${reviewCount > 1 ? "s" : ""} and ${newCount} new sentence${newCount > 1 ? "s" : ""}. Let's get started!`;

    setGreetingText(text);
    setStage("greeting");
    speak(text, "en-US");
  };

  const beginLesson = () => { setStage("lesson"); startQuestion(0); };

  // ---- Pronunciation practice ----
  const pickPronQueue = (categoryKey, data) => {
    const items = PRONUNCIATION_CATEGORIES[categoryKey].items;
    const scored = items.map((it) => {
      const rec = data[it.word];
      const acc = rec && rec.attempts > 0 ? rec.correct / rec.attempts : 0.4;
      return { it, score: acc + Math.random() * 0.35 };
    });
    scored.sort((a, b) => a.score - b.score);
    const count = Math.min(8, items.length);
    return scored.slice(0, count).map((s) => s.it);
  };

  const startPronSession = () => {
    setPronQueue(pickPronQueue(pronCategory, pronData));
    setPronIndex(0);
    setPronResults([]);
    setPronPhase("ready");
    setStage("pron_session");
  };

  const beginPronListening = () => {
    setPronPhase("listening");
    speech.start("en-US");
  };

  const finishPronListening = () => {
    speech.stop();
    const transcript = speech.transcript.trim();
    const target = pronQueue[pronIndex].word;
    // 発音練習は「その単語として認識されたか」自体がテストなので、
    // 単語の照合は完全一致のまま。ただし第2〜第5候補のどれかに
    // ターゲット語が含まれていれば合格にする(取りこぼし対策)。
    const candidates = [transcript, ...speech.alternatives]
      .map((c) => (c || "").trim()).filter(Boolean);
    const passed = candidates.some((c) => checkPronunciation(c, target));
    setPronResults((prev) => [...prev, { word: target, transcript, passed }]);
    setPronPhase("result");
  };

  const retryPronItem = () => {
    setPronResults((prev) => prev.slice(0, -1));
    setPronPhase("ready");
  };

  const finishPronSession = () => {
    const nextData = { ...pronData };
    for (const r of pronResults) {
      const rec = nextData[r.word] || { attempts: 0, correct: 0 };
      rec.attempts += 1;
      if (r.passed) rec.correct += 1;
      nextData[r.word] = rec;
    }
    setPronData(nextData);
    savePronData(nextData);
    setStage("pron_summary");
  };

  const nextPronItem = () => {
    const next = pronIndex + 1;
    if (next >= pronQueue.length) finishPronSession();
    else { setPronIndex(next); setPronPhase("ready"); }
  };

  const handleStart = () => {
    if (mode === "pronunciation") startPronSession();
    else startGreeting();
  };

  if (!loaded) return <div style={{ background: "#FBF7F0", minHeight: "100vh" }} />;

  // ---- Onboarding ----
  if (stage === "onboarding") {
    const lesson = LESSONS[lessonId];
    return (
      <div style={{ background: "#FBF7F0", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#1F2A37" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Sparkles size={18} color="#D97757" />
            <span style={{ fontSize: 13, letterSpacing: "0.08em", color: "#D97757", fontWeight: 600, textTransform: "uppercase" }}>AI Conversation Coach</span>
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, lineHeight: 1.25, margin: "0 0 10px", fontWeight: 700 }}>
            瞬間英作文<br />コーチ
          </h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#4B5563", margin: "0 0 22px" }}>
            {mode === "practice"
              ? "Coach says a Japanese sentence out loud → you answer in English by voice → coach gives feedback → you repeat it. 5 sentences per lesson, with spaced-repetition review."
              : mode === "lesson"
              ? "教科書の課を題材に、①文法を初級者に英語で説明する練習と、②練習B・Cを英語で進行する(授業運営)練習ができます。日本語で「何を説明するか／何を言うか」が出るので、英語で声に出して答えましょう。"
              : mode === "scenario"
              ? "オンラインレッスンの場面を選んで、実際に教室で使う英語を瞬間英作文で練習します。1回5問。"
              : "苦手な音を選んで、単語やフレーズを声に出して発音チェック。その場で聞き取り結果がわかります。"}
          </p>

          {/* モード切り替え(2×2) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, background: "#F0EAD9", padding: 4, borderRadius: 14 }}>
            {[
              ["practice", "瞬間英作文"],
              ["lesson", "課別レッスン"],
              ["scenario", "レッスンシナリオ"],
              ["pronunciation", "発音チェック"],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setMode(key)}
                style={{ padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: mode === key ? "#1F2A37" : "transparent", color: mode === key ? "#FBF7F0" : "#6B7280" }}>
                {label}
              </button>
            ))}
          </div>

          {mode === "practice" ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>Level</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.keys(LEVELS).map((key) => (
                    <button key={key} onClick={() => setSettings((s) => ({ ...s, level: key }))}
                      style={{ textAlign: "left", padding: "13px 16px", borderRadius: 12, border: settings.level === key ? "2px solid #D97757" : "1px solid #E5DFD3", background: settings.level === key ? "#FBEFE6" : "#FFFFFF", cursor: "pointer" }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{LEVELS[key].label}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{LEVELS[key].desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>Topic</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TOPICS.map((t) => (
                    <button key={t} onClick={() => setSettings((s) => ({ ...s, topic: t }))}
                      style={{ padding: "9px 16px", borderRadius: 20, border: settings.topic === t ? "2px solid #1F2A37" : "1px solid #E5DFD3", background: settings.topic === t ? "#1F2A37" : "#FFFFFF", color: settings.topic === t ? "#FBF7F0" : "#1F2A37", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {deck.length > 0 && (
                <div style={{ display: "flex", gap: 16, marginBottom: 24, padding: "12px 16px", background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5DFD3", fontSize: 13, color: "#6B7280" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Flame size={15} color="#C9A04A" />
                    <span style={{ fontWeight: 700, color: "#1F2A37" }}>{stats.streak}</span> day streak
                  </div>
                  <div>{deck.length} cards learned</div>
                  <div>{dueCount} due today</div>
                </div>
              )}
            </>
          ) : mode === "lesson" ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>課を選択</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.values(LESSONS).map((l) => (
                    <button key={l.id} onClick={() => { setLessonId(l.id); setLessonPointId("all"); }}
                      style={{ textAlign: "left", padding: "13px 16px", borderRadius: 12, border: lessonId === l.id ? "2px solid #D97757" : "1px solid #E5DFD3", background: lessonId === l.id ? "#FBEFE6" : "#FFFFFF", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <BookOpen size={15} color={lessonId === l.id ? "#D97757" : "#9CA3AF"} />
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{l.label}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 3 }}>{l.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>練習の種類</div>
                <div style={{ display: "flex", gap: 8, background: "#F0EAD9", padding: 4, borderRadius: 14 }}>
                  {[["explain", "① 文法説明"], ["run", "② 授業運営"]].map(([key, label]) => (
                    <button key={key} onClick={() => setLessonActivity(key)}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: lessonActivity === key ? "#1F2A37" : "transparent", color: lessonActivity === key ? "#FBF7F0" : "#6B7280" }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 8, lineHeight: 1.6 }}>
                  {lessonActivity === "explain"
                    ? "文法ポイントを、初級者にわかるように英語で説明する練習です。"
                    : "練習B・Cを英語で進行する練習です（指示・質問・訂正・励まし）。"}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>文法ポイント</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...lesson.points, { id: "all", label: "全ポイント まとめて練習", subtitle: "各ポイントからランダムに出題" }].map((p) => (
                    <button key={p.id} onClick={() => setLessonPointId(p.id)}
                      style={{ textAlign: "left", padding: "12px 16px", borderRadius: 12, border: lessonPointId === p.id ? "2px solid #1F2A37" : "1px solid #E5DFD3", background: lessonPointId === p.id ? "#1F2A37" : "#FFFFFF", color: lessonPointId === p.id ? "#FBF7F0" : "#1F2A37", cursor: "pointer" }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.label}</div>
                      {p.subtitle && <div style={{ fontSize: 11.5, color: lessonPointId === p.id ? "#C9BBA8" : "#9CA3AF", marginTop: 2 }}>{p.subtitle}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : mode === "scenario" ? (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>場面を選択</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(SCENARIOS).map(([key, s]) => (
                  <button key={key} onClick={() => setScenarioKey(key)}
                    style={{ textAlign: "left", padding: "13px 16px", borderRadius: 12, border: scenarioKey === key ? `2px solid ${s.color}` : "1px solid #E5DFD3", background: scenarioKey === key ? `${s.color}14` : "#FFFFFF", cursor: "pointer" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>練習する音を選択</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(PRONUNCIATION_CATEGORIES).map(([key, c]) => {
                  const acc = categoryAccuracy(key, pronData);
                  return (
                    <button key={key} onClick={() => setPronCategory(key)}
                      style={{ textAlign: "left", padding: "13px 16px", borderRadius: 12, border: pronCategory === key ? `2px solid ${c.color}` : "1px solid #E5DFD3", background: pronCategory === key ? `${c.color}14` : "#FFFFFF", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{c.label}</div>
                        {acc != null && <div style={{ fontSize: 11, color: "#9CA3AF" }}>正答率 {Math.round(acc * 100)}%</div>}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{c.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={handleStart}
            style={{ width: "100%", padding: "16px", borderRadius: 14, background: "#D97757", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(217,119,87,0.35)" }}>
            {mode === "pronunciation" ? "練習をはじめる" : mode === "lesson" ? "レッスンを始める" : "Start Lesson"}
          </button>
        </div>
      </div>
    );
  }

  // ---- Greeting ----
  if (stage === "greeting") {
    return (
      <div style={{ background: "#FBF7F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", color: "#1F2A37" }}>
        <div style={{ maxWidth: 420, padding: 32, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "#D97757", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Volume2 size={28} color="#fff" />
          </div>
          <p style={{ fontSize: 18, lineHeight: 1.6, fontWeight: 600, marginBottom: 28 }}>{greetingText}</p>
          <button onClick={beginLesson}
            style={{ padding: "14px 28px", borderRadius: 14, background: "#1F2A37", color: "#FBF7F0", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Begin Lesson <ChevronRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  // ---- Summary ----
  if (stage === "summary") {
    const correct = summaries.filter((s) => s.score !== "needs_improvement").length;
    return (
      <div style={{ background: "#FBF7F0", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#1F2A37" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Sparkles size={26} color="#D97757" />
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, margin: "8px 0 4px" }}>Lesson Complete</h2>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>
              {mode === "lesson" ? `${summaries.length}問 練習しました` : `${correct} / ${summaries.length} nailed it`}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {summaries.map((s, i) => {
              const meta = SCORE_META[s.score];
              return (
                <div key={i} style={{ background: "#fff", border: "1px solid #E5DFD3", borderRadius: 12, padding: "12px 14px" }}>
                  {(meta || s.dueInDays != null) && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      {meta ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <meta.Icon size={14} color={meta.color} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                        </div>
                      ) : <span />}
                      {s.dueInDays != null && <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>next review in {s.dueInDays}d</span>}
                    </div>
                  )}
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14.5, marginBottom: 3 }}>{s.card.japanese}</div>
                  <div style={{ fontSize: 12.5, color: "#6B7280" }}>{s.corrected_sentence || s.card.english_correct}</div>
                  {s.userAnswer && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>あなたの発話: 「{s.userAnswer}」</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 24, padding: "12px 16px", background: "#fff", borderRadius: 12, border: "1px solid #E5DFD3", fontSize: 13, color: "#6B7280", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Flame size={15} color="#C9A04A" />
              <span style={{ fontWeight: 700, color: "#1F2A37" }}>{stats.streak}</span> day streak
            </div>
            {mode === "practice" && <div>{deck.length} cards in deck</div>}
          </div>
          <button onClick={() => setStage("onboarding")}
            style={{ width: "100%", padding: "15px", borderRadius: 14, background: "#1F2A37", color: "#FBF7F0", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // ---- Pronunciation session ----
  if (stage === "pron_session") {
    const cat = PRONUNCIATION_CATEGORIES[pronCategory];
    const item = pronQueue[pronIndex];
    const lastResult = pronResults[pronResults.length - 1];
    return (
      <div style={{ background: "#FBF7F0", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", color: "#1F2A37" }}>
        <style>{`
          @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(217,119,87,0.45)} 70%{box-shadow:0 0 0 14px rgba(217,119,87,0)} 100%{box-shadow:0 0 0 0 rgba(217,119,87,0)} }
          .mic-pulse{animation:pulseRing 1.6s infinite}
        `}</style>

        <div style={{ position: "sticky", top: 0, background: "#FBF7F0", borderBottom: "1px solid #E5DFD3", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: cat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mic size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{pronIndex + 1} / {pronQueue.length}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{cat.label} の発音チェック</div>
            </div>
          </div>
          <button onClick={() => setStage("onboarding")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: "#6B7280", fontWeight: 600 }}>
            終了
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 24px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 440 }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E5DFD3", borderRadius: 18, padding: "24px 20px", boxShadow: "0 2px 10px rgba(31,42,55,0.06)", textAlign: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, letterSpacing: "0.05em" }}>{cat.label.toUpperCase()}</span>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, margin: "10px 0 4px" }}>{item.word}</div>
              {item.ipa && <div style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 4 }}>{item.ipa}</div>}
              {item.note && <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 8 }}>{item.note}</div>}

              <button onClick={() => speak(item.word, "en-US")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${cat.color}`, color: cat.color, borderRadius: 20, padding: "7px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
                <Volume2 size={14} /> お手本を聞く
              </button>

              {pronPhase === "ready" && (
                speech.supported ? (
                  <div style={{ marginTop: 22 }}>
                    <button onClick={beginPronListening} className="mic-pulse"
                      style={{ width: 60, height: 60, borderRadius: "50%", background: cat.color, border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Mic size={24} color="#fff" />
                    </button>
                    <div style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 8 }}>タップして発音してみましょう</div>
                  </div>
                ) : (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 12.5, color: "#C9694F", marginBottom: 12 }}>このブラウザでは音声認識が使えないため、自動チェックはできません。お手本を聞いて発音を練習してから次へ進みましょう。</p>
                    <button onClick={nextPronItem}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1F2A37", color: "#fff", border: "none", borderRadius: 20, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <SkipForward size={14} /> 次へ
                    </button>
                  </div>
                )
              )}

              {pronPhase === "listening" && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ minHeight: 24, fontSize: 15, marginBottom: 12, fontStyle: speech.transcript ? "normal" : "italic", color: speech.transcript ? "#1F2A37" : "#9CA3AF" }}>
                    {speech.transcript || "聞き取り中…"}
                  </div>
                  <button onClick={finishPronListening}
                    style={{ width: 56, height: 56, borderRadius: "50%", background: "#1F2A37", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Square size={18} color="#fff" fill="#fff" />
                  </button>
                  <div style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 8 }}>言い終わったらタップ(反応がない場合も自動で先に進みます)</div>
                </div>
              )}

              {pronPhase === "result" && lastResult && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    {lastResult.passed
                      ? <><CheckCircle2 size={16} color="#7A8B6F" /><span style={{ color: "#7A8B6F", fontWeight: 700, fontSize: 13 }}>聞き取れました!</span></>
                      : <><AlertCircle size={16} color="#C9694F" /><span style={{ color: "#C9694F", fontWeight: 700, fontSize: 13 }}>もう少し</span></>}
                  </div>
                  <div style={{ padding: "10px 12px", background: "#F7F4EC", borderRadius: 10, fontSize: 13.5, color: "#374151", marginBottom: 16 }}>
                    認識された発音: 「{lastResult.transcript || "(聞き取れませんでした)"}」
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button onClick={retryPronItem}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid #E5DFD3", color: "#1F2A37", borderRadius: 20, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <RotateCcw size={14} /> もう一度
                    </button>
                    <button onClick={nextPronItem}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: cat.color, color: "#fff", border: "none", borderRadius: 20, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {pronIndex + 1 >= pronQueue.length ? "完了" : "次へ"} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Pronunciation summary ----
  if (stage === "pron_summary") {
    const cat = PRONUNCIATION_CATEGORIES[pronCategory];
    const passedCount = pronResults.filter((r) => r.passed).length;
    return (
      <div style={{ background: "#FBF7F0", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#1F2A37" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Sparkles size={26} color={cat.color} />
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, margin: "8px 0 4px" }}>発音チェック完了</h2>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>{cat.label} · {passedCount} / {pronResults.length} 正解</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {pronResults.map((r, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #E5DFD3", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700 }}>{r.word}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>聞き取り: 「{r.transcript || "(なし)"}」</div>
                </div>
                {r.passed
                  ? <CheckCircle2 size={18} color="#7A8B6F" />
                  : <AlertCircle size={18} color="#C9694F" />}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={startPronSession}
              style={{ flex: 1, padding: "15px", borderRadius: 14, background: cat.color, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              もう一度練習
            </button>
            <button onClick={() => setStage("onboarding")}
              style={{ flex: 1, padding: "15px", borderRadius: 14, background: "#1F2A37", color: "#FBF7F0", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              終わる
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Lesson ----
  return (
    <div style={{ background: "#FBF7F0", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", color: "#1F2A37" }}>
      <style>{`
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(217,119,87,0.45)} 70%{box-shadow:0 0 0 14px rgba(217,119,87,0)} 100%{box-shadow:0 0 0 0 rgba(217,119,87,0)} }
        .mic-pulse{animation:pulseRing 1.6s infinite}
        @keyframes bar{0%,100%{height:6px}50%{height:18px}}
        .wave-bar{display:inline-block;width:3px;background:#D97757;border-radius:2px;margin:0 1.5px;animation:bar 0.9s infinite ease-in-out}
      `}</style>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, background: "#FBF7F0", borderBottom: "1px solid #E5DFD3", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#D97757", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Question {currentIndex + 1} of {queueRef.current.length}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>
              {mode === "scenario"
                ? SCENARIOS[scenarioKey].label
                : mode === "lesson"
                ? `${LESSONS[lessonId].label} · ${lessonActivity === "explain" ? "文法説明" : "授業運営"}`
                : `${currentType === "review" ? "🔁 Review" : "✨ New"} · ${settings.level}`}
            </div>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <Settings2 size={18} color="#6B7280" />
        </button>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(31,42,55,0.4)", display: "flex", alignItems: "flex-end", zIndex: 50 }} onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#FBF7F0", width: "100%", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "20px 20px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Lesson in progress</span>
              <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            {!speech.supported && (
              <p style={{ fontSize: 12.5, color: "#C9694F", marginBottom: 16 }}>🎤 Voice input isn't available in this browser. Text input is used instead.</p>
            )}
            <button onClick={() => { setShowSettings(false); setStage("onboarding"); }}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #E5DFD3", background: "#FFFFFF", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
              Exit lesson
            </button>
          </div>
        </div>
      )}

      {/* Main area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px 24px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {phase === "generating" && (
            <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>Coach is preparing a new sentence…</div>
          )}

          {phase === "error" && (
            <div style={{ textAlign: "center", padding: 24 }}>
              <p style={{ color: "#C9694F", fontSize: 13.5, marginBottom: 12 }}>{error}</p>
              <button onClick={() => failedStepRef.current?.()}
                style={{ background: "#1F2A37", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Retry</button>
            </div>
          )}

          {currentCard && phase !== "generating" && phase !== "error" && (
            <div style={{ background: "#FFFFFF", border: "1px solid #E5DFD3", borderRadius: 18, padding: "20px", boxShadow: "0 2px 10px rgba(31,42,55,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#D97757", letterSpacing: "0.05em" }}>
                  {mode === "lesson"
                    ? (lessonActivity === "explain" ? "英語で説明してみよう" : "英語で言ってみよう")
                    : "JAPANESE PROMPT"}
                </span>
                {mode === "lesson"
                  ? null
                  : phase === "prompt"
                  ? <span style={{ display: "inline-flex", alignItems: "center", height: 18 }}>
                      {[0,1,2,3].map((i) => <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}
                    </span>
                  : <button onClick={() => speak(currentCard.japanese, "ja-JP")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><Volume2 size={16} /></button>
                }
              </div>
              {mode === "lesson" && currentCard.pointLabel && (
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 6 }}>{currentCard.pointLabel}</div>
              )}
              <div style={{ fontFamily: "Georgia, serif", fontSize: mode === "lesson" ? 18 : 21, lineHeight: 1.5, fontWeight: 600 }}>{currentCard.japanese}</div>

              {phase === "await_answer" && (
                <>
                  <button onClick={() => setShowHint((s) => !s)}
                    style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12, background: "none", border: "none", padding: 0, cursor: "pointer", color: "#C9A04A", fontSize: 12.5, fontWeight: 600 }}>
                    <Lightbulb size={14} /> {showHint ? currentCard.hint : "Show hint"}
                  </button>
                  {speech.supported ? (
                    <div style={{ textAlign: "center", marginTop: 22 }}>
                      {micHint && (
                        <div style={{ fontSize: 12.5, color: "#C9694F", marginBottom: 10 }}>{micHint}</div>
                      )}
                      <button onClick={beginListening} className="mic-pulse"
                        style={{ width: 64, height: 64, borderRadius: "50%", background: "#D97757", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Mic size={26} color="#fff" />
                      </button>
                      <div style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 8 }}>Tap and answer in English</div>
                    </div>
                  ) : (
                    <TypedInput value={answerText} onChange={setAnswerText}
                      onSubmit={() => answerText.trim() && submitAnswer(answerText.trim())}
                      placeholder="Type your English answer…" />
                  )}
                </>
              )}

              {phase === "listening" && (
                <div style={{ textAlign: "center", marginTop: 22 }}>
                  <div style={{ minHeight: 28, fontSize: 16, marginBottom: 14, fontStyle: speech.transcript ? "normal" : "italic", color: speech.transcript ? "#1F2A37" : "#9CA3AF" }}>
                    {speech.transcript || "Listening…"}
                  </div>
                  <button onClick={finishListening}
                    style={{ width: 64, height: 64, borderRadius: "50%", background: "#1F2A37", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Square size={20} color="#fff" fill="#fff" />
                  </button>
                  <div style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 8 }}>Tap when you're done (auto-advances if nothing is heard)</div>
                </div>
              )}
            </div>
          )}

          {phase === "evaluating" && (
            <div style={{ textAlign: "center", padding: 28, color: "#9CA3AF", fontSize: 14 }}>Coach is checking your answer…</div>
          )}

          {["result", "repeating", "repeat_ack"].includes(phase) && evalResult && (
            <div style={{ marginTop: 14, background: "#FFFFFF", border: "1px solid #E5DFD3", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 8px rgba(31,42,55,0.05)" }}>
              {SCORE_META[evalResult.score] && (() => {
                const M = SCORE_META[evalResult.score];
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <M.Icon size={15} color={M.color} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: M.color }}>{M.label}</span>
                  </div>
                );
              })()}
              {lastAnswer && (
                <div style={{ padding: "9px 12px", background: "#FBF7F0", border: "1px dashed #E5DFD3", borderRadius: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 2 }}>あなたの発話(聞き取り結果)</div>
                  <div style={{ fontSize: 13.5, color: "#1F2A37" }}>{lastAnswer}</div>
                </div>
              )}
              {evalResult.feedback && (
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", marginBottom: 10 }}>{evalResult.feedback}</div>
              )}
              <div style={{ padding: "10px 12px", background: "#F7F4EC", borderRadius: 10, fontSize: 14, fontStyle: "italic", color: "#1F2A37", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span>{evalResult.corrected_sentence || currentCard.english_correct}</span>
                <button onClick={() => speak(evalResult.corrected_sentence || currentCard.english_correct, "en-US")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", flexShrink: 0 }}>
                  <Volume2 size={15} />
                </button>
              </div>

              {phase === "result" && (
                speech.supported ? (
                  <div style={{ textAlign: "center", marginTop: 18 }}>
                    <button onClick={beginRepeat}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1F2A37", color: "#fff", border: "none", borderRadius: 24, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                      <Repeat size={15} /> Repeat it
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", marginTop: 18 }}>
                    <button onClick={skipRepeat}
                      style={{ background: "#1F2A37", color: "#fff", border: "none", borderRadius: 24, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                      Continue
                    </button>
                  </div>
                )
              )}

              {phase === "repeating" && (
                <div style={{ textAlign: "center", marginTop: 18 }}>
                  <div style={{ minHeight: 24, fontSize: 14.5, color: speech.transcript ? "#1F2A37" : "#9CA3AF", marginBottom: 12, fontStyle: speech.transcript ? "normal" : "italic" }}>
                    {speech.transcript || "Say it out loud…"}
                  </div>
                  <button onClick={finishRepeatWithSpeech} className="mic-pulse"
                    style={{ width: 54, height: 54, borderRadius: "50%", background: "#D97757", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Square size={17} color="#fff" fill="#fff" />
                  </button>
                </div>
              )}

              {phase === "repeat_ack" && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  {repeatNote && <div style={{ fontSize: 13.5, color: "#6B7280", marginBottom: 12 }}>{repeatNote}</div>}
                  <button onClick={goNext}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#D97757", color: "#fff", border: "none", borderRadius: 24, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    {currentIndex + 1 >= queueRef.current.length ? "Finish lesson" : "Next question"} <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypedInput({ value, onChange, onSubmit, placeholder }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        placeholder={placeholder}
        style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "1px solid #E5DFD3", fontSize: 15, outline: "none" }} />
      <button onClick={onSubmit}
        style={{ background: "#1F2A37", color: "#fff", border: "none", borderRadius: 12, padding: "0 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Go</button>
    </div>
  );
}
