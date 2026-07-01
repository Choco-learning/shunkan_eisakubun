import { useState, useRef, useEffect, useCallback } from "react";
import {
  Flame, Mic, Square, Volume2, Repeat, CheckCircle2,
  AlertCircle, Sparkles, Settings2, X, ChevronRight,
  Lightbulb,
} from "lucide-react";

const LEVELS = {
  "初級": { label: "初級", desc: "Present / past tense, can / will" },
  "中級": { label: "中級", desc: "Perfect tense, relative clauses" },
  "上級": { label: "上級", desc: "Subjunctive, participial phrases, business topics" },
};
const TOPICS = ["日常会話", "旅行", "ビジネス", "フリートーク"];

const SCENARIOS = {
  greeting: {
    label: "挨拶・雑談",
    desc: "レッスン開始時のあいさつ、アイスブレイク",
    color: "#D97757",
    seedPhrases: [
      "今週の調子はどうですか、と聞く",
      "前回の内容を復習したか尋ねる",
      "今日は何について学びますか、と伝える",
      "質問はありますか、と聞く",
      "始める前に少し雑談する",
    ],
  },
  grammar: {
    label: "文法説明",
    desc: "文法・語彙の説明、意味の解説",
    color: "#1F2A37",
    seedPhrases: [
      "この単語はこういう意味です、と説明する",
      "AとBの違いはここです、と伝える",
      "この動詞がどう変化するか気づかせる",
      "こう考えるとわかりやすいですよ、と伝える",
      "これはよく使うパターンです、と伝える",
    ],
  },
  instruction: {
    label: "指示・練習",
    desc: "ロールプレイの指示、練習の進め方",
    color: "#7A8B6F",
    seedPhrases: [
      "この文を声に出して読んでみて、と指示する",
      "役割を交代しましょう、と伝える",
      "私の後について繰り返してください、と言う",
      "焦らなくて大丈夫ですよ、と伝える",
      "このパターンを使って文を作ってみて、と指示する",
    ],
  },
  feedback: {
    label: "訂正・フィードバック",
    desc: "生徒の間違いを直す、褒める",
    color: "#C2691F",
    seedPhrases: [
      "惜しい、小さな間違いがあります、と伝える",
      "もっと自然な言い方はこうです、と直す",
      "とても自然でした、と褒める",
      "よくある間違いなので気にしないで、と伝える",
      "その調子で続けましょう、と励ます",
    ],
  },
  filler: {
    label: "つなぎ・間つなぎ",
    desc: "言葉に詰まった時のつなぎ表現",
    color: "#8A6FB0",
    seedPhrases: [
      "少し考える時間が欲しい、と間をつなぐ",
      "質問に答える前に一呼吸置く",
      "言い直したい、と切り出す",
      "うまく言葉が出てこない時につなぐ",
      "沈黙せずに何か声を出してつなぐ",
    ],
  },
};

const SCORE_META = {
  perfect: { label: "Perfect", color: "#7A8B6F", Icon: CheckCircle2 },
  good: { label: "Good", color: "#C9A04A", Icon: CheckCircle2 },
  needs_improvement: { label: "Almost", color: "#C9694F", Icon: AlertCircle },
};
const DATA_KEY = "shunkan_coach_data_v2";
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

function similarity(a, b) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9' ]/g, "").trim().split(/\s+/).filter(Boolean);
  const wa = norm(a), wb = norm(b);
  if (!wa.length || !wb.length) return 0;
  const setB = new Set(wb);
  const overlap = wa.filter((w) => setB.has(w)).length;
  return overlap / Math.max(wa.length, wb.length);
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

// --- Speech recognition ---
function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recogRef = useRef(null);

  useEffect(() => {
    const Impl = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!Impl);
  }, []);

  const start = useCallback((lang) => {
    const Impl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Impl) { setSupported(false); return; }
    setTranscript("");
    const recog = new Impl();
    recog.lang = lang;
    recog.interimResults = true;
    recog.continuous = false;
    recog.maxAlternatives = 1;
    recog.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    recog.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setSupported(false);
      setListening(false);
    };
    recog.onend = () => setListening(false);
    recogRef.current = recog;
    setListening(true);
    try { recog.start(); } catch { setListening(false); }
  }, []);

  const stop = useCallback(() => { recogRef.current?.stop(); }, []);

  return { listening, transcript, supported, start, stop };
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

export default function ShunkanEisakubunCoach() {
  const [stage, setStage] = useState("onboarding");
  const [mode, setMode] = useState("practice"); // "practice" | "scenario"
  const [scenarioKey, setScenarioKey] = useState("greeting");
  const [settings, setSettings] = useState({ level: "中級", topic: "日常会話" });
  const [deck, setDeck] = useState([]);
  const [stats, setStats] = useState({ totalReviewed: 0, streak: 0, lastDate: null });
  const [loaded, setLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
  const failedStepRef = useRef(null);

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
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [phase, evalResult, repeatNote]);

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
          setPhase("prompt");
          await speak(item.card.japanese, "ja-JP");
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

    setCurrentCard(item.card);
    setCurrentType(item.type);
    setPhase("prompt");
    await speak(item.card.japanese, "ja-JP");
    setPhase("await_answer");
  };

  const beginListening = () => { setPhase("listening"); speech.start("en-US"); };

  const submitAnswer = async (answer) => {
    setLastAnswer(answer);
    setPhase("evaluating");
    const attempt = async () => {
      try {
        const result = mode === "scenario"
          ? await evaluateScenarioAnswer(currentCard.japanese, currentCard.english_correct, answer, scenarioKey)
          : await evaluateAnswer(currentCard.japanese, currentCard.english_correct, answer);
        setEvalResult(result);
        setPhase("result");
        await speak(result.feedback, "en-US");
        await speak(result.corrected_sentence || currentCard.english_correct, "en-US");
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
    const finalAnswer = speech.transcript.trim();
    if (finalAnswer) submitAnswer(finalAnswer);
  };

  const beginRepeat = () => { setPhase("repeating"); speech.start("en-US"); };

  const recordResult = (note) => {
    setRepeatNote(note);
    setLessonResults((prev) => [...prev, { card: currentCard, type: currentType, userAnswer: lastAnswer, ...evalResult }]);
    setPhase("repeat_ack");
  };

  const finishRepeatWithSpeech = () => {
    speech.stop();
    const said = speech.transcript.trim();
    const target = evalResult.corrected_sentence || currentCard.english_correct;
    const sim = said ? similarity(said, target) : 0;
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

    if (mode === "scenario") {
      // シナリオモードはSRSデッキに保存せず、その場の集計のみ表示
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
    const queue = mode === "scenario" ? buildScenarioQueue() : buildLessonQueue(deck);
    queueRef.current = queue;
    setLessonResults([]);
    let text;
    if (mode === "scenario") {
      text = `Let's practice English for "${SCENARIOS[scenarioKey].label}" today. ${queue.length} phrases coming up — let's dive in!`;
    } else {
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
    }
    setGreetingText(text);
    setStage("greeting");
    speak(text, "en-US");
  };

  const beginLesson = () => { setStage("lesson"); startQuestion(0); };

  if (!loaded) return <div style={{ background: "#FBF7F0", minHeight: "100vh" }} />;

  // ---- Onboarding ----
  if (stage === "onboarding") {
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
              : "オンラインレッスンの場面を選んで、実際に教室で使う英語を瞬間英作文で練習します。1回5問。"}
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#F0EAD9", padding: 4, borderRadius: 14 }}>
            <button onClick={() => setMode("practice")}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: mode === "practice" ? "#1F2A37" : "transparent", color: mode === "practice" ? "#FBF7F0" : "#6B7280" }}>
              瞬間英作文
            </button>
            <button onClick={() => setMode("scenario")}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: mode === "scenario" ? "#1F2A37" : "transparent", color: mode === "scenario" ? "#FBF7F0" : "#6B7280" }}>
              レッスンシナリオ
            </button>
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
          ) : (
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
          )}

          <button onClick={startGreeting}
            style={{ width: "100%", padding: "16px", borderRadius: 14, background: "#D97757", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(217,119,87,0.35)" }}>
            Start Lesson
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
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>{correct} / {summaries.length} nailed it</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {summaries.map((s, i) => {
              const meta = SCORE_META[s.score] || SCORE_META.good;
              return (
                <div key={i} style={{ background: "#fff", border: "1px solid #E5DFD3", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <meta.Icon size={14} color={meta.color} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                    </div>
                    {s.dueInDays != null && <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>next review in {s.dueInDays}d</span>}
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 14.5, marginBottom: 3 }}>{s.card.japanese}</div>
                  <div style={{ fontSize: 12.5, color: "#6B7280" }}>{s.corrected_sentence || s.card.english_correct}</div>
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
              {mode === "scenario" ? SCENARIOS[scenarioKey].label : `${currentType === "review" ? "🔁 Review" : "✨ New"} · ${settings.level}`}
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
                <span style={{ fontSize: 11, fontWeight: 700, color: "#D97757", letterSpacing: "0.05em" }}>JAPANESE PROMPT</span>
                {phase === "prompt"
                  ? <span style={{ display: "inline-flex", alignItems: "center", height: 18 }}>
                      {[0,1,2,3].map((i) => <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}
                    </span>
                  : <button onClick={() => speak(currentCard.japanese, "ja-JP")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><Volume2 size={16} /></button>
                }
              </div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 21, lineHeight: 1.5, fontWeight: 600 }}>{currentCard.japanese}</div>

              {phase === "await_answer" && (
                <>
                  <button onClick={() => setShowHint((s) => !s)}
                    style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12, background: "none", border: "none", padding: 0, cursor: "pointer", color: "#C9A04A", fontSize: 12.5, fontWeight: 600 }}>
                    <Lightbulb size={14} /> {showHint ? currentCard.hint : "Show hint"}
                  </button>
                  {speech.supported ? (
                    <div style={{ textAlign: "center", marginTop: 22 }}>
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
                  <button onClick={finishListening} disabled={!speech.transcript.trim()}
                    style={{ width: 64, height: 64, borderRadius: "50%", background: speech.transcript.trim() ? "#1F2A37" : "#E5DFD3", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: speech.transcript.trim() ? "pointer" : "default" }}>
                    <Square size={20} color="#fff" fill="#fff" />
                  </button>
                  <div style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 8 }}>Tap when you're done</div>
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
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", marginBottom: 10 }}>{evalResult.feedback}</div>
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
