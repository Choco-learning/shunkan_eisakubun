import { useState, useRef, useEffect } from "react";

/*
  黒猫AI対話モード「くろとおはなし」
  ------------------------------------------------------------
  ・大人版と同じ /api/claude 関数を利用します（Netlify の環境変数
    ANTHROPIC_API_KEY を設定しておくこと）。
  ・5〜7歳向けなので、①返事を読み上げ ②タップできる定型ボタン
    ③音声入力（マイク）を用意しています。字が読めなくても遊べます。
  ・送受信の形は あなたの netlify/functions/claude.js に合致済み（調整不要）。
    { model, max_tokens, system, messages } を送り、Anthropicの生レスポンス
    (content:[{type:"text",text}]) を受け取ります。
  ・App.jsx には import・state・ボタン・モーダルの4か所を追加済み。
  ・もし猫が固定のフォールバック文しか言わないときは、ブラウザの開発者ツール
    (F12) の Console に出るエラーを確認してください。多いのは「キー未設定/
    再デプロイ忘れ」か「モデル名」。その場合は下の model を "claude-sonnet-4-6"
    (claude.js の既定・実績あり) に変えて試すと切り分けできます。
*/

// ▼ ここを書き換えれば猫の性格・名前を自由に変えられます
const CAT_NAME = "くろ";
const SYSTEM_PROMPT = `あなたは「${CAT_NAME}」という名前の、やさしい黒ねこです。
ゲーム「えいごバトル」の相棒として、5〜7さいの子どもとおはなしします。

まもること：
- ひらがなちゅうしんの、みじかくてやさしい日本語で、1〜2文で返す。
- あかるく、やさしく、たくさんほめる。
- こわいこと・ぼうりょくてきなこと・むずかしいことは言わない。
- ときどき、かんたんな英単語を1つだけ「よみがな」つきで教える。
  れい：ねこは えいごで cat（キャット）だよ🐾
- えいご作文バトルのヒントを聞かれたら、こたえは丸ごと言わずヒントだけ。
- 名前や住所などのこじんじょうほうは聞かない・言わない。
- へんな話題になったら、そっとゲームや英語の話にもどす。
- 絵文字はすこしだけ使ってよい（🐾😺✨ など）。`;

// タップだけで話しかけられる定型文（字が読めない子でもOK）
const QUICK_CHIPS = [
  "こんにちは！",
  "えいご おしえて",
  "バトルの コツは？",
  "たのしい ことば おしえて",
  "きょうも がんばる！",
];

const FALLBACK_LINE = "うーん、いまおみみが とおいみたい😿 もういちど はなしかけてね！";

// 会話履歴は直近だけ送る（トークン節約）
const MAX_HISTORY = 10;

export default function CatChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `やあ！ぼく ${CAT_NAME}🐾 きょうは なにして あそぶ？` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const listRef = useRef(null);

  // 新しいメッセージが来たら一番下までスクロール
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  // ねこの返事を声で読み上げる（字が読めない子のため）
  function speak(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 1.0;
      u.pitch = 1.4; // ねこっぽく高め
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }

  // netlify/functions/claude.js に合致。困ったら model を下記コメント参照
  async function callCat(history) {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // 子供向けの軽い返答なら Haiku で十分＆安い。
        // 猫がフォールバック文しか言わないときは "claude-sonnet-4-6" に変えて切り分け。
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();

    // Anthropicの生レスポンス: { content: [{type:"text", text}] }
    if (Array.isArray(data?.content)) {
      const txt = data.content
        .filter((b) => b.type === "text" || typeof b.text === "string")
        .map((b) => b.text)
        .join("")
        .trim();
      if (txt) return txt;
    }
    // うまくいかないときは中身をConsoleに出す(設定切り分け用)
    console.error("[CatChat] 想定外のレスポンス:", res.status, data);
    return FALLBACK_LINE;
  }

  async function send(text) {
    const clean = (text ?? input).trim();
    if (!clean || loading) return;
    setInput("");

    const next = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setLoading(true);

    try {
      const history = next.slice(-MAX_HISTORY);
      const reply = (await callCat(history)) || FALLBACK_LINE;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: FALLBACK_LINE }]);
      speak(FALLBACK_LINE);
    } finally {
      setLoading(false);
    }
  }

  // マイクで話しかける（日本語）
  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "ja-JP";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setListening(false);
      send(t);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.panel} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <span style={S.title}>🐾 {CAT_NAME} とおはなし</span>
          <button style={S.close} onClick={onClose} aria-label="とじる">✕</button>
        </div>

        <div ref={listRef} style={S.list}>
          {messages.map((m, i) => (
            <div key={i} style={m.role === "user" ? S.rowUser : S.rowCat}>
              {m.role === "assistant" && <span style={S.face}>😺</span>}
              <div style={m.role === "user" ? S.bubbleUser : S.bubbleCat}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={S.rowCat}>
              <span style={S.face}>😺</span>
              <div style={S.bubbleCat}>…考えてるニャ</div>
            </div>
          )}
        </div>

        <div style={S.chips}>
          {QUICK_CHIPS.map((c) => (
            <button key={c} style={S.chip} disabled={loading} onClick={() => send(c)}>
              {c}
            </button>
          ))}
        </div>

        <div style={S.inputRow}>
          <button
            style={{ ...S.mic, background: listening ? "#e05555" : "#5b8c3e" }}
            onClick={startListening}
            disabled={loading}
            aria-label="こえではなす"
          >
            {listening ? "きいてるよ…" : "🎤 こえ"}
          </button>
          <input
            style={S.input}
            value={input}
            placeholder="かいてもOK"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={loading}
          />
          <button style={S.send} onClick={() => send()} disabled={loading}>おくる</button>
        </div>
      </div>
    </div>
  );
}

// マイクラっぽい暗めのブロック調（既存ゲームに馴染むよう控えめに）
const S = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  },
  panel: {
    width: "min(440px, 94vw)", height: "min(620px, 90vh)",
    background: "#2b2b33", border: "4px solid #6b6b73", borderRadius: 8,
    display: "flex", flexDirection: "column", overflow: "hidden",
    fontFamily: "system-ui, sans-serif", boxShadow: "0 0 0 4px #1a1a1f",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 14px", background: "#3c3c46", color: "#fff",
  },
  title: { fontWeight: 700, fontSize: 16 },
  close: { background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" },
  list: { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 },
  rowCat: { display: "flex", alignItems: "flex-end", gap: 6 },
  rowUser: { display: "flex", justifyContent: "flex-end" },
  face: { fontSize: 22 },
  bubbleCat: {
    background: "#4a5a3a", color: "#fff", padding: "8px 12px",
    borderRadius: "2px 12px 12px 12px", maxWidth: "78%", fontSize: 15, lineHeight: 1.5,
  },
  bubbleUser: {
    background: "#6b8ab5", color: "#fff", padding: "8px 12px",
    borderRadius: "12px 2px 12px 12px", maxWidth: "78%", fontSize: 15, lineHeight: 1.5,
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 6, padding: "6px 10px", background: "#26262d" },
  chip: {
    background: "#3c3c46", color: "#ffe08a", border: "1px solid #55555f",
    borderRadius: 14, padding: "6px 10px", fontSize: 13, cursor: "pointer",
  },
  inputRow: { display: "flex", gap: 6, padding: 10, background: "#26262d" },
  mic: { color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  input: { flex: 1, borderRadius: 6, border: "1px solid #55555f", padding: "10px", fontSize: 15, background: "#1f1f25", color: "#fff" },
  send: { background: "#c9772f", color: "#fff", border: "none", borderRadius: 6, padding: "0 14px", fontSize: 15, fontWeight: 700, cursor: "pointer" },
};
