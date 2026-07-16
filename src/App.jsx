import { useState, useRef, useEffect, useCallback } from "react";
import { judgeAnswer } from "./utils/judgeAnswer";
import { SENIOR_QUESTIONS, JUNIOR_QUESTIONS } from "./lessonData";
import CatChat from "./CatChat";

// ===========================================================================
// えいごバトル v4
//  - 冒険マップを じぶんで あるける(十字キー / キーボード / スワイプ)
//  - ゾンビ&ゾンビボスが うろつく → ぶつかると バトル、草むらで ランダム遭遇
//  - たおすと 宝箱 → おたから GET → 剣が つよくなる(B案)
//  - セーブ&やめる / つづきから
// ===========================================================================

const FONT = "'DotGothic16', 'Courier New', monospace";
const INK = "#23202b";
const START_HEARTS = 3;
const MAX_HEARTS = 6;
const SAVE_KEY = "kids_battle_save_v2";
const W = 9, H = 9; // マップの広さ

// --- 剣(おたからで つよくなる) ---
const SWORDS = [
  { name: "きの けん", emoji: "🪵", dmg: 22, need: 0 },
  { name: "いしの けん", emoji: "🪨", dmg: 28, need: 3 },
  { name: "てつの けん", emoji: "⚔️", dmg: 36, need: 8 },
  { name: "きんの けん", emoji: "🗡️", dmg: 46, need: 15 },
  { name: "ダイヤの けん", emoji: "💎", dmg: 60, need: 25 },
  { name: "ネザライトの けん", emoji: "🔥", dmg: 80, need: 40 },
];
function swordFor(gems) { let s = SWORDS[0]; for (const x of SWORDS) if (gems >= x.need) s = x; return s; }
function nextSword(gems) { return SWORDS.find((x) => gems < x.need) || null; }

// --- おたから(宝箱の中身) ---
const LOOT = [
  { emoji: "💎", name: "ダイヤ", gem: 3, rare: 3 },
  { emoji: "🥇", name: "きんインゴット", gem: 2, rare: 2 },
  { emoji: "⛓️", name: "てつインゴット", gem: 1, rare: 1 },
  { emoji: "💚", name: "エメラルド", gem: 2, rare: 2 },
  { emoji: "🍎", name: "まほうの リンゴ", gem: 0, rare: 2, heal: 1 },
  { emoji: "🪙", name: "コイン", gem: 1, rare: 1 },
];
function rollLoot(boss) {
  const pool = boss ? LOOT.filter((l) => l.rare >= 2) : LOOT;
  const n = boss ? 3 : Math.random() < 0.4 ? 2 : 1;
  const got = [];
  for (let i = 0; i < n; i++) got.push(pool[Math.floor(Math.random() * pool.length)]);
  return got;
}

// --- モンスター図鑑 ---
// atk = こうげきりょく(バトルで数字表示) / ranged = 弓・まほうなど とおくから こうげき
const MOBS = {
  zombie:      { name: "ゾンビ",              emoji: "🧟",    color: "#4E7A38", atk: 15 },
  drowned:     { name: "おぼれゾンビ",        emoji: "🧟‍♂️",  color: "#2f8a8a", atk: 18 },
  childZombie: { name: "こどもゾンビ",        emoji: "🧟‍♂️",  color: "#6AA84F", atk: 12 },
  rotZombie:   { name: "くさったゾンビ",      emoji: "🧟",    color: "#3f5f2f", atk: 20 },
  archer:      { name: "ゆみの わるいやつ",   emoji: "🏹",    color: "#7a5a2f", atk: 22, ranged: true },
  skeleton:    { name: "うごく がいこつ",     emoji: "💀",    color: "#c9c2aa", atk: 20 },
  wizard:      { name: "まほうつかい",        emoji: "🧙",    color: "#6b2fa0", atk: 26, ranged: true },
  // ボスきゅう
  zombieKing:  { name: "ゾンビキング",        emoji: "👹",    color: "#8446B0", atk: 30, boss: true },
  giantZombie: { name: "きょだいゾンビ",      emoji: "👺",    color: "#c0392b", atk: 34, boss: true },
  bossArcher:  { name: "ボスアーチャー",      emoji: "🏹",    color: "#a0522d", atk: 36, boss: true, ranged: true },
  boneDino:    { name: "ほねの きょうりゅう", emoji: "🦖",    color: "#d8d0b8", atk: 42, boss: true },
  dragon:      { name: "わるい ドラゴン",     emoji: "🐉",    color: "#b03030", atk: 48, boss: true },
};

// --- 場面(ステージ)モード ---
// pool = でてくる ざこモンスター / bosses = 5のばいすうステージのボス
const SCENES = {
  wasteland: {
    name: "ゾンビの あれち", emoji: "🧟",
    ground: "#7cc05a", grass: "#4e8f3a", tree: "#5a3a1f", rock: "#9a9a9a", panel: "#3f6b2a",
    pool: ["zombie", "drowned", "childZombie", "rotZombie"],
    bosses: ["zombieKing", "giantZombie"],
  },
  base: {
    name: "わるいひとの きち", emoji: "🏹",
    ground: "#9a8f76", grass: "#7a6f58", tree: "#4a3f2f", rock: "#5a5a5a", panel: "#3a3630",
    pool: ["archer", "archer", "zombie", "skeleton"],
    bosses: ["bossArcher", "giantZombie"],
  },
  temple: {
    name: "ほねの しんでん", emoji: "💀",
    ground: "#d9c7a3", grass: "#c2b184", tree: "#8a7a55", rock: "#b8a882", panel: "#6b5f45",
    pool: ["skeleton", "wizard", "skeleton", "drowned"],
    bosses: ["boneDino", "dragon"],
  },
};
const SCENE_ORDER = ["wasteland", "base", "temple"];
function sceneForStage(stage) { return SCENE_ORDER[(stage - 1) % SCENE_ORDER.length]; }

function makeEnemy(stage, boss, sceneKey) {
  const sc = SCENES[sceneKey] || SCENES.wasteland;
  if (boss) {
    const key = sc.bosses[Math.floor(stage / 5) % sc.bosses.length];
    return { ...MOBS[key], maxHp: 55 + stage * 8, boss: true };
  }
  const key = sc.pool[Math.floor(Math.random() * sc.pool.length)];
  return { ...MOBS[key], maxHp: 26 + stage * 4, boss: false };
}
const PAIN = ["💢", "💥", "😵", "⭐", "😖"];

// ===========================================================================
// 効果音
// ===========================================================================
let audioCtx = null;
let muted = false;
function getCtx() {
  if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC(); }
  return audioCtx;
}
function tone({ freq = 440, dur = 0.1, type = "square", vol = 0.2, slideTo = null, delay = 0 }) {
  if (muted) return;
  const ctx = getCtx(); if (!ctx) return;
  try {
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  } catch { /* ignore */ }
}
const sfx = {
  resume() { const c = getCtx(); if (c && c.state === "suspended") c.resume(); },
  tap() { tone({ freq: 880, dur: 0.05, type: "square", vol: 0.12 }); },
  walk() { tone({ freq: 200, dur: 0.05, type: "square", vol: 0.07 }); },
  encounter() { [300, 500, 300, 600].forEach((f, i) => tone({ freq: f, dur: 0.1, type: "sawtooth", vol: 0.22, delay: i * 0.09 })); },
  hit() { tone({ freq: 640, slideTo: 180, dur: 0.12, type: "square", vol: 0.26 }); tone({ freq: 110, dur: 0.1, type: "sawtooth", vol: 0.2, delay: 0.02 }); },
  crit() { [780, 1050, 1400].forEach((f, i) => tone({ freq: f, dur: 0.09, type: "square", vol: 0.26, delay: i * 0.05 })); tone({ freq: 80, dur: 0.2, type: "sawtooth", vol: 0.22, delay: 0.02 }); },
  close() { tone({ freq: 500, slideTo: 620, dur: 0.12, type: "triangle", vol: 0.2 }); },
  miss() { tone({ freq: 220, slideTo: 70, dur: 0.32, type: "sawtooth", vol: 0.24 }); },
  step() { tone({ freq: 120, dur: 0.13, type: "sawtooth", vol: 0.14 }); },
  defeat() { [520, 400, 300, 200].forEach((f, i) => tone({ freq: f, dur: 0.16, type: "triangle", vol: 0.26, delay: i * 0.11 })); },
  chest() { [660, 880, 1100, 1320].forEach((f, i) => tone({ freq: f, dur: 0.13, type: "square", vol: 0.24, delay: i * 0.1 })); },
  upgrade() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ freq: f, dur: 0.18, type: "square", vol: 0.24, delay: i * 0.12 })); },
  combo() { tone({ freq: 1100, dur: 0.08, type: "square", vol: 0.2 }); },
};

function speak(text, lang) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = lang.startsWith("ja") ? 0.95 : 0.92;
  window.speechSynthesis.speak(u);
}

function loadSave() { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function writeSave(d) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch { /* ignore */ } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } }

// --- 音声入力 ---
const SPEECH_TIMEOUT_MS = 9000;
function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [alternatives, setAlternatives] = useState([]);
  const [supported, setSupported] = useState(true);
  const recogRef = useRef(null); const timeoutRef = useRef(null);

  useEffect(() => {
    const Impl = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!Impl);
  }, []);
  const clearSafety = () => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; } };
  const start = (lang) => {
    const Impl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Impl) { setSupported(false); return; }
    setTranscript(""); setAlternatives([]);
    const recog = new Impl();
    recog.lang = lang; recog.interimResults = true; recog.continuous = false; recog.maxAlternatives = 5;
    recog.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
      const cands = new Set();
      for (let j = 0; j < 5; j++) {
        let t = "", found = j === 0;
        for (let i = 0; i < e.results.length; i++) {
          const alt = e.results[i][j];
          if (alt) { t += alt.transcript; found = true; } else t += e.results[i][0].transcript;
        }
        if (found && t.trim()) cands.add(t.trim());
      }
      setAlternatives([...cands]);
    };
    recog.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") setSupported(false); clearSafety(); setListening(false); };
    recog.onend = () => { clearSafety(); setListening(false); };
    recogRef.current = recog;
    setListening(true);
    try { recog.start(); } catch { setListening(false); return; }
    clearSafety();
    timeoutRef.current = setTimeout(() => { try { recog.stop(); } catch { /* ignore */ } setListening(false); }, SPEECH_TIMEOUT_MS);
  };
  const stop = () => { clearSafety(); try { recogRef.current?.stop(); } catch { /* ignore */ } };
  return { listening, transcript, alternatives, supported, start, stop };
}

function pickQuestion(mode, prev) {
  const pool = mode === "junior" ? JUNIOR_QUESTIONS : SENIOR_QUESTIONS;
  let q;
  do { q = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && q === prev);
  return q;
}

// ===========================================================================
// マップ生成
// ===========================================================================
function buildMap(stage) {
  const sceneKey = sceneForStage(stage);
  const count = Math.min(3 + Math.floor(stage / 2), 6);
  const need = count + (stage % 5 === 0 ? 1 : 0);

  // 歩ける場所が せますぎる マップは作り直す(敵が置けず 進めなくなるのを防ぐ)
  for (let attempt = 0; attempt < 40; attempt++) {
    // タイル: 0=草 1=草むら(ランダム遭遇) 2=木(通れない) 3=石(通れない)
    const tiles = [];
    for (let y = 0; y < H; y++) {
      const row = [];
      for (let x = 0; x < W; x++) {
        const r = Math.random();
        if (x === 0 && y === 0) row.push(0);
        else if (r < 0.09) row.push(2);
        else if (r < 0.12) row.push(3);
        else if (r < 0.34) row.push(1);
        else row.push(0);
      }
      tiles.push(row);
    }

    // スタートから歩いて行けるマスだけ列挙(壁に囲まれた所に敵を置くと詰むため)
    const reach = new Set(["0,0"]);
    const queue = [[0, 0]];
    while (queue.length) {
      const [x, y] = queue.shift();
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        if (tiles[ny][nx] >= 2) continue;
        const k = `${nx},${ny}`;
        if (reach.has(k)) continue;
        reach.add(k);
        queue.push([nx, ny]);
      }
    }

    const spots = [...reach]
      .map((k) => { const [x, y] = k.split(",").map(Number); return { x, y }; })
      .filter((p) => p.x + p.y > 2);

    if (spots.length < need) continue; // 敵を置ききれない → 作り直し

    const shuffled = spots.sort(() => Math.random() - 0.5).slice(0, need);
    const mobs = shuffled.map((p, i) => {
      const isBoss = stage % 5 === 0 && i === shuffled.length - 1;
      return { id: isBoss ? "boss" : `m${i}`, ...p, ...makeEnemy(stage, isBoss, sceneKey) };
    });
    return { tiles, mobs, scene: sceneKey };
  }

  // 保険:ほぼ来ないが、壁なしの平地マップにして必ず遊べるようにする
  const tiles = Array.from({ length: H }, () => Array.from({ length: W }, () => (Math.random() < 0.25 ? 1 : 0)));
  const spots = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x + y > 2) spots.push({ x, y });
  const shuffled = spots.sort(() => Math.random() - 0.5).slice(0, need);
  const mobs = shuffled.map((p, i) => {
    const isBoss = stage % 5 === 0 && i === shuffled.length - 1;
    return { id: isBoss ? "boss" : `m${i}`, ...p, ...makeEnemy(stage, isBoss, sceneKey) };
  });
  return { tiles, mobs, scene: sceneKey };
}

// ===========================================================================
// スタイル
// ===========================================================================
function blockBtn(bg, fg = "#fff") {
  return {
    fontFamily: FONT, background: bg, color: fg, border: `3px solid ${INK}`,
    boxShadow: `inset -3px -3px 0 rgba(0,0,0,0.25), inset 3px 3px 0 rgba(255,255,255,0.3), 4px 4px 0 ${INK}`,
    padding: "14px 20px", fontSize: 18, fontWeight: 700, cursor: "pointer", borderRadius: 0, lineHeight: 1.3,
  };
}
const panel = {
  background: "#cfcfcf", border: `4px solid ${INK}`,
  boxShadow: "inset -4px -4px 0 #8f8f8f, inset 4px 4px 0 #ffffffaa",
  borderRadius: 0, padding: 14,
};

function Frame({ shake, children }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(#79a6d2 0%, #a9cbe6 55%, #6aa84f 55%, #4e7a38 100%)", fontFamily: FONT, color: INK, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
        *{box-sizing:border-box}
        @keyframes shakeLight{0%,100%{transform:translate(0,0)}20%{transform:translate(-8px,3px) rotate(-1deg)}60%{transform:translate(8px,-3px) rotate(1deg)}}
        @keyframes shakeHard{0%,100%{transform:translate(0,0) rotate(0)}12%{transform:translate(-16px,6px) rotate(-2deg)}28%{transform:translate(15px,-7px) rotate(2deg)}44%{transform:translate(-13px,5px) rotate(-1.5deg)}60%{transform:translate(12px,-5px) rotate(1.5deg)}80%{transform:translate(-7px,3px) rotate(-1deg)}}
        @keyframes shakeMega{0%,100%{transform:translate(0,0) rotate(0) scale(1)}10%{transform:translate(-22px,10px) rotate(-3deg) scale(1.02)}25%{transform:translate(22px,-12px) rotate(3deg) scale(1.03)}40%{transform:translate(-20px,9px) rotate(-2.5deg)}55%{transform:translate(18px,-8px) rotate(2.5deg)}70%{transform:translate(-12px,5px) rotate(-1.5deg)}85%{transform:translate(9px,-4px) rotate(1deg)}}
        @keyframes pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes flashOut{0%{opacity:.8}100%{opacity:0}}
        @keyframes slash{0%{opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(-50deg)}35%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(2) rotate(30deg)}}
        @keyframes spark{0%{opacity:1;transform:translate(0,0) scale(1.2)}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(.2)}}
        @keyframes reactPop{0%{opacity:0;transform:translate(-50%,0) scale(.4)}40%{opacity:1;transform:translate(-50%,-26px) scale(1.3)}100%{opacity:0;transform:translate(-50%,-48px) scale(1)}}
        @keyframes menacePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes catJump{0%{transform:translateY(0) rotate(0)}25%{transform:translateY(-30px) rotate(-14deg)}55%{transform:translateY(-6px) rotate(10deg)}75%{transform:translateY(-14px) rotate(-4deg)}100%{transform:translateY(0)}}
        @keyframes catSpin{0%{transform:rotate(0) scale(1)}50%{transform:rotate(360deg) scale(1.4)}100%{transform:rotate(360deg) scale(1)}}
        @keyframes catSad{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(5px) rotate(-10deg)}75%{transform:translateY(2px) rotate(10deg)}}
        @keyframes mobIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes chestShake{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-8deg) scale(1.1)}60%{transform:rotate(8deg) scale(1.15)}}
        @keyframes punchHit{0%{opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(-15deg)}30%{opacity:1;transform:translate(-50%,14px) scale(1.5) rotate(8deg)}70%{opacity:1;transform:translate(-50%,40px) scale(1.2)}100%{opacity:0;transform:translate(-50%,70px) scale(.9)}}
        @keyframes arrowFly{0%{opacity:0;transform:translate(-50%,-46px) rotate(135deg) scale(.7)}18%{opacity:1}100%{opacity:0;transform:translate(-50%,96px) rotate(135deg) scale(1.15)}}
        .shakeLight{animation:shakeLight .4s}.shakeHard{animation:shakeHard .55s}.shakeMega{animation:shakeMega .7s}
        .float{animation:float 2.6s infinite ease-in-out}
        .catJump{animation:catJump .7s}.catSpin{animation:catSpin .8s}.catSad{animation:catSad .6s}
        .mobIdle{animation:mobIdle 1.4s infinite ease-in-out}
        .chestShake{animation:chestShake .5s infinite}
        @media (prefers-reduced-motion: reduce){ .shakeLight,.shakeHard,.shakeMega,.float,.catJump,.catSpin,.catSad,.mobIdle,.chestShake{animation:none} }
      `}</style>
      <div className={shake === "mega" ? "shakeMega" : shake === "hard" ? "shakeHard" : shake === "light" ? "shakeLight" : ""}
        style={{ width: "100%", maxWidth: 480, padding: 14 }}>
        {children}
      </div>
    </div>
  );
}

function HpBar({ hp, max, color }) {
  const pct = Math.max(0, Math.round((hp / max) * 100));
  return (
    <div style={{ background: "#3a3a3a", border: `3px solid ${INK}`, height: 22, position: "relative", boxShadow: "inset 2px 2px 0 #00000055" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: pct > 30 ? color : "#c0392b", transition: "width .35s", boxShadow: "inset 0 3px 0 #ffffff55" }} />
      <span style={{ position: "absolute", inset: 0, textAlign: "center", fontSize: 12, color: "#fff", lineHeight: "16px", textShadow: `1px 1px 0 ${INK}` }}>{hp} / {max}</span>
    </div>
  );
}

function PBadge({ n }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, verticalAlign: "middle" }}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 21, height: 21, borderRadius: "50%", background: "#e8b923", color: INK, border: `2px solid ${INK}`, fontSize: 13, fontWeight: 700, lineHeight: 1 }}>P</span>
      <b style={{ fontSize: 15 }}>{n}</b>
    </span>
  );
}

function Cat({ state }) {
  const cls = state === "cheer" ? "catSpin" : state === "happy" ? "catJump" : state === "sad" ? "catSad" : "float";
  return <div className={cls} style={{ fontSize: 44, flexShrink: 0, transformOrigin: "center bottom" }}>🐈‍⬛</div>;
}

function CatRow({ state, line }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, margin: "10px 0" }}>
      <Cat state={state} />
      <div style={{ ...panel, background: "#fffef2", flex: 1, padding: "9px 11px", minHeight: 42, fontSize: 14.5, display: "flex", alignItems: "center" }}>{line}</div>
    </div>
  );
}

// ===========================================================================
// 本体
// ===========================================================================
export default function App() {
  const [screen, setScreen] = useState("start"); // start | map | battle | chest | gameover | bag
  const [mode, setMode] = useState("senior");
  const [stage, setStage] = useState(1);
  const [hearts, setHearts] = useState(START_HEARTS);
  const [gems, setGems] = useState(0);          // 剣のレベルを決める
  const [bag, setBag] = useState({});           // {emoji: count}
  const [saved, setSaved] = useState(null);
  const [muteUI, setMuteUI] = useState(false);
  const [showCat, setShowCat] = useState(false); // 黒猫AI対話モード

  // マップ
  const [map, setMap] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mapMsg, setMapMsg] = useState("");

  // バトル
  const [enemy, setEnemy] = useState(null);
  const [enemyHp, setEnemyHp] = useState(0);
  const [enemyMobId, setEnemyMobId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [phase, setPhase] = useState("prompt");
  const [result, setResult] = useState(null);
  const [catLine, setCatLine] = useState("");
  const [catState, setCatState] = useState("idle");
  const [combo, setCombo] = useState(0);
  const [typed, setTyped] = useState("");
  const [enemyState, setEnemyState] = useState("idle");
  const [pain, setPain] = useState(null);
  const [hitId, setHitId] = useState(0);
  const [shake, setShake] = useState("");
  const [menace, setMenace] = useState(0);
  const [attackFx, setAttackFx] = useState(null); // 敵のこうげき演出 {id, ranged}

  // 宝箱
  const [chestLoot, setChestLoot] = useState([]);
  const [chestOpened, setChestOpened] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState(null);

  const answerStartRef = useRef(0);
  const wasListeningRef = useRef(false);
  const snapRef = useRef(null);
  const heardRef = useRef("");
  const speech = useSpeechInput();

  const sword = swordFor(gems);
  const nextSw = nextSword(gems);

  useEffect(() => { setSaved(loadSave()); }, []);

  const flashShake = (k) => { setShake(k); setTimeout(() => setShake(""), 700); };
  const bumpCat = (s) => { setCatState(s); setTimeout(() => setCatState("idle"), 800); };
  // 敵がこうげきしてくる演出(パンチ or 矢)。ranged=true なら弓・まほう
  const showAttack = (ranged) => {
    const id = Date.now();
    setAttackFx({ id, ranged: !!ranged });
    setTimeout(() => setAttackFx((a) => (a && a.id === id ? null : a)), 560);
  };

  // ---------------- マップ移動 ----------------
  const tryMove = useCallback((dx, dy) => {
    if (screen !== "map" || !map) return;
    const nx = pos.x + dx, ny = pos.y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
    if (map.tiles[ny][nx] >= 2) { setMapMsg("そっちは とおれないよ"); return; }
    sfx.resume(); sfx.walk();
    setPos({ x: nx, y: ny });
    setMapMsg("");

    // 敵とぶつかった?
    const mob = map.mobs.find((m) => m.x === nx && m.y === ny);
    if (mob) { startBattle(mob); return; }
    // 草むらでランダム遭遇
    if (map.tiles[ny][nx] === 1 && Math.random() < 0.25) {
      startBattle({ id: `wild_${Date.now()}`, ...makeEnemy(stage, false, map.scene), wild: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, map, pos, stage]);

  // キーボード操作
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (["ArrowUp", "w", "W"].includes(k)) { e.preventDefault(); tryMove(0, -1); }
      else if (["ArrowDown", "s", "S"].includes(k)) { e.preventDefault(); tryMove(0, 1); }
      else if (["ArrowLeft", "a", "A"].includes(k)) { e.preventDefault(); tryMove(-1, 0); }
      else if (["ArrowRight", "d", "D"].includes(k)) { e.preventDefault(); tryMove(1, 0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]);

  // スワイプ操作
  const touchRef = useRef(null);
  const onTouchStart = (e) => { const t = e.touches[0]; touchRef.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    const s = touchRef.current; if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) tryMove(dx > 0 ? 1 : -1, 0);
    else tryMove(0, dy > 0 ? 1 : -1);
    touchRef.current = null;
  };

  // ---------------- バトル ----------------
  const startBattle = (mob) => {
    sfx.encounter();
    setEnemy(mob);
    setEnemyHp(mob.maxHp);
    setEnemyMobId(mob.wild ? null : mob.id);
    setCombo(0);
    setAttackFx(null);
    setCatLine(
      mob.boss
        ? `ボスだ! ${mob.name}! きをつけて!`
        : mob.ranged
        ? `いわの むこうから ${mob.name}! とおくから 矢や まほうで こうげきしてくる! はやく こたえて けんで やっつけよう!`
        : `${mob.name} が あらわれた! えいごで こうげき!`
    );
    setScreen("battle");
    newQuestion(mode, null);
  };

  const newQuestion = (m, prev) => {
    const q = pickQuestion(m, prev);
    setQuestion(q);
    setResult(null); setTyped(""); setPain(null);
    setEnemyState("idle"); setMenace(0);
    setPhase("prompt");
    answerStartRef.current = Date.now();
    if (m === "junior") setTimeout(() => speak(q.ja, "ja-JP"), 200);
  };

  useEffect(() => {
    const was = wasListeningRef.current;
    wasListeningRef.current = speech.listening;
    if (was && !speech.listening && phase === "listening") handleAnswer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.listening]);

  // 敵の接近
  useEffect(() => {
    if (phase !== "prompt" || screen !== "battle") return;
    const limit = mode === "junior" ? 22000 : 13000;
    const t0 = Date.now(); setMenace(0);
    let played = 0;
    const id = setInterval(() => {
      const m = Math.min(1, (Date.now() - t0) / limit);
      setMenace(m);
      const steps = Math.floor(m * 6);
      if (m > 0.3 && steps > played) { played = steps; sfx.step(); }
      if (m >= 1) { clearInterval(id); enemyTimeout(); }
    }, 90);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, question, screen]);

  const beginListening = () => { sfx.resume(); sfx.tap(); setMenace(0); setPhase("listening"); speech.start("en-US"); };

  const enemyTimeout = () => {
    setEnemyState("attack"); setTimeout(() => setEnemyState("idle"), 400);
    showAttack(enemy?.ranged);
    flashShake("hard"); sfx.miss(); bumpCat("sad");
    const atkLine = enemy?.ranged ? "矢が とんできた! いわの むこうから こうげき! はやく こたえて!" : "あぶない! てきの こうげき! はやく こたえよう!";
    if (mode === "senior") {
      const nh = Math.max(0, hearts - 1);
      setHearts(nh);
      if (nh <= 0) { setCatLine("うっ…やられちゃった。"); sfx.defeat(); setTimeout(() => setScreen("gameover"), 700); return; }
      setCatLine(atkLine);
    } else {
      setCatLine(enemy?.ranged ? "矢が とんできた! がんばって こえに だそう!" : "てきが ちかづいてきた! がんばって こえに だそう!");
    }
    newQuestion(mode, question);
  };

  const handleAnswer = () => {
    const cands = [speech.transcript, ...speech.alternatives].map((s) => (s || "").trim()).filter(Boolean);
    if (!cands.length) {
      setCatLine("ん?きこえなかったよ。もういっかい ボタンを おして いってみて!");
      setPhase("prompt"); answerStartRef.current = Date.now();
      return;
    }
    const elapsed = Date.now() - answerStartRef.current;
    const j = judgeAnswer(cands, question.en, { mode });
    heardRef.current = j.heard || cands[0] || "";
    snapRef.current = { enemyHp, hearts, combo };
    applyOutcome(j.result, { crit: j.result === "correct" && elapsed < 6000, hints: j.hints });
  };

  const submitTyped = () => {
    if (!typed.trim()) return;
    sfx.resume();
    heardRef.current = typed.trim();
    snapRef.current = { enemyHp, hearts, combo };
    const j = judgeAnswer([typed.trim()], question.en, { mode });
    applyOutcome(j.result, { crit: false, hints: j.hints });
  };

  const applyOutcome = (kind, { crit = false, hints = [] } = {}) => {
    const snap = snapRef.current;
    let dmg = 0, newCombo = snap.combo, heartLoss = 0;
    if (kind === "correct") {
      dmg = crit ? Math.round(sword.dmg * 1.5) : sword.dmg;
      newCombo = snap.combo + 1;
      if (newCombo >= 2) dmg += 6;
    } else if (kind === "close") { dmg = Math.round(sword.dmg * 0.35); newCombo = 0; }
    else { newCombo = 0; heartLoss = 1; }

    const newHp = Math.max(0, snap.enemyHp - dmg);
    const newHearts = Math.max(0, snap.hearts - heartLoss);
    const defeated = newHp <= 0 && dmg > 0;

    setEnemyHp(newHp); setHearts(newHearts); setCombo(newCombo);

    setHitId((n) => n + 1);
    if (dmg > 0) {
      setPain(PAIN[Math.floor(Math.random() * PAIN.length)]);
      if (defeated) { setEnemyState("defeat"); sfx.defeat(); flashShake("mega"); bumpCat("cheer"); }
      else if (crit) { setEnemyState("crit"); sfx.crit(); flashShake("mega"); bumpCat("cheer"); }
      else { setEnemyState("hit"); sfx.hit(); flashShake("hard"); bumpCat("happy"); }
      if (newCombo >= 2 && !defeated) setTimeout(() => sfx.combo(), 130);
      if (!defeated) setTimeout(() => setEnemyState("idle"), 430);
    } else if (kind === "close") {
      setPain(null); setEnemyState("hit"); sfx.close(); flashShake("light"); bumpCat("happy");
      setTimeout(() => setEnemyState("idle"), 300);
    } else {
      setPain(null); setEnemyState("attack"); sfx.miss(); flashShake("hard"); bumpCat("sad");
      showAttack(enemy?.ranged);
      setTimeout(() => setEnemyState("idle"), 400);
    }

    let line;
    if (kind === "correct") {
      if (defeated) line = "ゾンビを たおした!🎉 たからばこが おちた!";
      else if (crit) line = "クリティカル!⚡ はやくて つよい!";
      else if (newCombo >= 2) line = `${newCombo}コンボ!すごい!`;
      else line = "ナイス!こうげき せいこう!";
      if (hints && hints.length) line += ` でも「${hints[0].word}」まで いえたら もっと つよいよ⚡`;
    } else if (kind === "close") line = "おしい!ちょっと あたった!もういっかい いえるかな?";
    else line = "ミス!ゾンビの こうげき!でも だいじょうぶ、つぎ いこう!";
    setCatLine(line);

    setResult({ result: kind, crit, defeated, dmg, hints: hints || [], heard: heardRef.current });
    setPhase("result");
    setTimeout(() => speak(question.en, "en-US"), 260);
  };

  const selfSay = (saidIt) => { sfx.tap(); applyOutcome(saidIt ? "correct" : "wrong", { crit: false, hints: result?.hints || [] }); };

  // バトル終了 → 宝箱 or 次の問題
  const onBattleContinue = () => {
    sfx.tap();
    if (hearts <= 0) { setScreen("gameover"); return; }
    if (enemyHp <= 0) {
      // 倒した敵をマップから消す
      if (enemyMobId && map) setMap({ ...map, mobs: map.mobs.filter((m) => m.id !== enemyMobId) });
      setChestLoot(rollLoot(enemy.boss));
      setChestOpened(false);
      setUpgradeMsg(null);
      setScreen("chest");
      return;
    }
    newQuestion(mode, question);
  };

  // ---------------- 宝箱 ----------------
  const openChest = () => {
    sfx.resume(); sfx.chest();
    const before = swordFor(gems).name;
    let g = gems, h = hearts;
    const nb = { ...bag };
    for (const l of chestLoot) {
      g += l.gem;
      if (l.heal) h = Math.min(MAX_HEARTS, h + l.heal);
      nb[l.emoji] = (nb[l.emoji] || 0) + 1;
    }
    setGems(g); setHearts(h); setBag(nb);
    setChestOpened(true);
    const after = swordFor(g).name;
    if (after !== before) {
      setUpgradeMsg(`けんが つよくなった!→ ${after}`);
      setTimeout(() => sfx.upgrade(), 500);
    }
  };

  const leaveChest = () => {
    sfx.tap();
    const bossDown = enemy?.boss;
    // ボスを倒したら次のステージへ
    if (bossDown) {
      const next = stage + 1;
      setStage(next);
      setMap(buildMap(next));
      setPos({ x: 0, y: 0 });
      setHearts((h) => Math.min(MAX_HEARTS, h + 1));
      setMapMsg(`ステージ ${next} に すすんだ!`);
    } else if (map && map.mobs.length === 0) {
      // このマップの敵を全部たおした → 次のステージ
      const next = stage + 1;
      setStage(next);
      setMap(buildMap(next));
      setPos({ x: 0, y: 0 });
      setMapMsg(`ぜんぶ たおした!ステージ ${next} へ!`);
    }
    setScreen("map");
  };

  // ---------------- ゲーム開始 / セーブ ----------------
  const beginGame = (m, startStage) => {
    sfx.resume(); sfx.tap();
    setMode(m); setStage(startStage);
    setHearts(START_HEARTS); setGems(0); setBag({}); setCombo(0);
    setMap(buildMap(startStage)); setPos({ x: 0, y: 0 });
    setMapMsg("モンスターを さがして たおそう!");
    setScreen("map");
  };

  const resumeGame = () => {
    const s = saved; if (!s) return;
    sfx.resume(); sfx.tap();
    setMode(s.mode); setStage(s.stage); setHearts(s.hearts);
    setGems(s.gems || 0); setBag(s.bag || {}); setCombo(0);
    setMap(buildMap(s.stage)); setPos({ x: 0, y: 0 });
    setMapMsg("つづきから!モンスターを さがそう!");
    setScreen("map");
  };

  const saveAndQuit = () => {
    writeSave({ mode, stage, hearts, gems, bag, ts: Date.now() });
    setSaved(loadSave());
    window.speechSynthesis?.cancel();
    sfx.tap();
    setScreen("start");
  };

  const toggleMute = () => { muted = !muted; setMuteUI(muted); if (!muted) { sfx.resume(); sfx.tap(); } };

  // ===================== スタート =====================
  if (screen === "start") {
    return (
      <Frame shake="">
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <div className="float" style={{ fontSize: 58 }}>🗡️🧟</div>
          <h1 style={{ fontSize: 32, margin: "6px 0 2px", textShadow: "3px 3px 0 #ffffffcc" }}>えいごバトル</h1>
          <p style={{ fontSize: 13.5, margin: "0 0 18px", color: "#1c3b1c" }}>ぼうけんして ゾンビを たおして おたからを あつめよう!</p>
        </div>

        {saved && (
          <div style={{ ...panel, marginBottom: 14, background: "#fff3d6" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              💾 まえの つづき(ステージ {saved.stage} / {"❤️".repeat(saved.hearts)} / {swordFor(saved.gems || 0).emoji}{swordFor(saved.gems || 0).name})
            </div>
            <button onClick={resumeGame} style={{ ...blockBtn("#6AA84F"), width: "100%", marginBottom: 8 }}>▶ つづきから</button>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => beginGame(saved.mode, saved.stage)} style={{ ...blockBtn("#4a90d9"), flex: 1, fontSize: 13, padding: "10px" }}>このステージを 新規で</button>
              <button onClick={() => { clearSave(); setSaved(null); sfx.tap(); }} style={{ ...blockBtn("#9A9A9A"), fontSize: 13, padding: "10px 12px" }}>けす</button>
            </div>
          </div>
        )}

        <div style={{ ...panel, marginBottom: 14 }}>
          <div style={{ fontSize: 14, marginBottom: 10, fontWeight: 700 }}>{saved ? "さいしょから あそぶ" : "だれが あそぶ?"}</div>
          <button onClick={() => beginGame("senior", 1)} style={{ ...blockBtn("#6AA84F"), width: "100%", marginBottom: 10, textAlign: "left" }}>
            👦 おにいちゃん モード<br /><span style={{ fontSize: 12, fontWeight: 400 }}>にほんご を よんで えいごで こたえる</span>
          </button>
          <button onClick={() => beginGame("junior", 1)} style={{ ...blockBtn("#4a90d9"), width: "100%", textAlign: "left" }}>
            🧒 おとうと モード<br /><span style={{ fontSize: 12, fontWeight: 400 }}>えを みて こえで こたえる(よみあげ あり)</span>
          </button>
        </div>

        {!speech.supported && (
          <div style={{ ...panel, background: "#ffe6cc", fontSize: 13 }}>
            🎤 このブラウザは こえ入力が つかえないみたい。キーボード入力で あそべます。(Chrome だと こえで あそべます)
          </div>
        )}
      </Frame>
    );
  }

  // ===================== もちもの =====================
  if (screen === "bag") {
    const items = Object.entries(bag);
    return (
      <Frame shake="">
        <h2 style={{ textAlign: "center", fontSize: 24, margin: "10px 0 12px", textShadow: "2px 2px 0 #ffffffaa" }}>🎒 もちもの</h2>
        <div style={{ ...panel, marginBottom: 12, background: "#fffef2", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>いまの けん</div>
          <div style={{ fontSize: 40 }}>{sword.emoji}</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{sword.name}</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 3 }}>こうげきりょく {sword.dmg}</div>
          {nextSw && (
            <div style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
              つぎの けん({nextSw.emoji}{nextSw.name})まで あと <b>{nextSw.need - gems}</b> P
            </div>
          )}
        </div>
        <div style={{ ...panel, marginBottom: 14, minHeight: 90 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>あつめた おたから　<PBadge n={gems} /></div>
          {items.length === 0 ? (
            <div style={{ fontSize: 13, color: "#666" }}>まだ なにも ない。ゾンビを たおそう!</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {items.map(([e, c]) => (
                <div key={e} style={{ background: "#fffef2", border: `2px solid ${INK}`, padding: "6px 10px", fontSize: 20 }}>
                  {e}<span style={{ fontSize: 13 }}>×{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => { sfx.tap(); setScreen("map"); }} style={{ ...blockBtn("#6AA84F"), width: "100%" }}>もどる</button>
      </Frame>
    );
  }

  // ===================== ゲームオーバー =====================
  if (screen === "gameover") {
    return (
      <Frame shake="">
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <div className="shakeHard" style={{ fontSize: 58 }}>💥</div>
          <h1 style={{ fontSize: 27, margin: "10px 0" }}>やられちゃった…</h1>
          <p style={{ fontSize: 16, marginBottom: 4 }}>ステージ {stage} まで すすんだ!</p>
          <p style={{ fontSize: 14, marginBottom: 4 }}>{sword.emoji} {sword.name}</p>
          <p style={{ fontSize: 14, marginBottom: 22, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>おたから　<PBadge n={gems} /></p>
        </div>
        <button onClick={() => beginGame(mode, 1)} style={{ ...blockBtn("#e8a33d"), width: "100%", marginBottom: 10 }}>さいしょから ちょうせん</button>
        <button onClick={() => { sfx.tap(); setScreen("start"); }} style={{ ...blockBtn("#9A9A9A"), width: "100%" }}>さいしょの がめんへ</button>
      </Frame>
    );
  }

  // ===================== 宝箱 =====================
  if (screen === "chest") {
    return (
      <Frame shake={shake}>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <h2 style={{ fontSize: 24, margin: "0 0 4px", textShadow: "2px 2px 0 #ffffffaa" }}>
            {enemy?.boss ? "👑 ボスを たおした!" : "ゾンビを たおした!"}
          </h2>
          <p style={{ fontSize: 14, marginBottom: 16 }}>たからばこが おちた!</p>
        </div>

        <div style={{ ...panel, textAlign: "center", background: "#fff3d6", padding: 22 }}>
          {!chestOpened ? (
            <>
              <div className="chestShake" style={{ fontSize: 80, marginBottom: 12 }}>🎁</div>
              <button onClick={openChest} style={{ ...blockBtn("#e8b923"), width: "100%", fontSize: 20 }}>たからばこを あける!</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>おたから GET!</div>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                {chestLoot.map((l, i) => (
                  <div key={i} style={{ animation: "pop .4s", animationDelay: `${i * 0.15}s`, animationFillMode: "backwards" }}>
                    <div style={{ fontSize: 44 }}>{l.emoji}</div>
                    <div style={{ fontSize: 11 }}>{l.name}</div>
                    {l.gem > 0 && <div style={{ fontSize: 11, color: "#8a6d00", fontWeight: 700 }}>＋{l.gem}P</div>}
                    {l.heal && <div style={{ fontSize: 11, color: "#c0392b" }}>❤️+{l.heal}</div>}
                  </div>
                ))}
              </div>
              {upgradeMsg && (
                <div style={{ background: "#6AA84F", color: "#fff", border: `3px solid ${INK}`, padding: "10px", fontSize: 16, fontWeight: 700, marginBottom: 12, animation: "pop .5s" }}>
                  ⚡ {upgradeMsg}
                </div>
              )}
              <div style={{ fontSize: 13, marginBottom: 12 }}>
                いまの けん: {sword.emoji}{sword.name}(こうげき {sword.dmg})
                {nextSw && <div style={{ fontSize: 11.5, color: "#666", marginTop: 3 }}>つぎまで あと {nextSw.need - gems} P</div>}
              </div>
              <button onClick={leaveChest} style={{ ...blockBtn("#6AA84F"), width: "100%" }}>ぼうけんに もどる →</button>
            </>
          )}
        </div>
        <CatRow state={catState} line={chestOpened ? "やったね!けんが つよくなると もっと かんたんに たおせるよ!" : "なにが はいってるかな?"} />
      </Frame>
    );
  }

  // ===================== マップ(あるく) =====================
  if (screen === "map" && map) {
    const sc = SCENES[map.scene] || SCENES.wasteland;
    const TILE = Math.floor(Math.min(440, (typeof window !== "undefined" ? window.innerWidth : 400) - 40) / W);
    const tileBg = (t) => (t === 0 ? sc.ground : t === 1 ? sc.grass : t === 2 ? sc.tree : sc.rock);
    const grassChar = map.scene === "temple" ? "🦴" : map.scene === "base" ? "📦" : "🌿";
    const treeChar = map.scene === "wasteland" ? "🌲" : "🪨";
    const tileChar = (t) => (t === 1 ? grassChar : t === 2 ? treeChar : t === 3 ? "🪨" : "");
    return (
      <Frame shake="">
        {/* ステータス */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 17 }}>
          <div>{"❤️".repeat(hearts)} <span style={{ fontSize: 13, fontWeight: 700 }}>{hearts}/{MAX_HEARTS}</span></div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>ステージ {stage}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => { sfx.tap(); setShowCat(true); }} style={{ ...blockBtn("#2b2b33"), padding: "5px 8px", fontSize: 12 }}>🐾</button>
            <button onClick={() => { sfx.tap(); setScreen("bag"); }} style={{ ...blockBtn("#c9a04a"), padding: "5px 8px", fontSize: 12 }}>🎒</button>
            <button onClick={toggleMute} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17 }}>{muteUI ? "🔇" : "🔊"}</button>
            <button onClick={saveAndQuit} style={{ ...blockBtn("#9A9A9A"), padding: "5px 7px", fontSize: 11 }}>💾やめる</button>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, marginBottom: 4 }}>
          {sc.emoji} {sc.name}　|　{sword.emoji}{sword.name}(こうげき {sword.dmg})
        </div>
        <div style={{ textAlign: "center", fontSize: 12, marginBottom: 6, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
          <PBadge n={gems} />　のこりモンスター {map.mobs.length}
        </div>

        {/* マップ */}
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          style={{ ...panel, padding: 6, background: sc.panel, display: "inline-block", width: "100%", touchAction: "none" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${W}, ${TILE}px)`, justifyContent: "center" }}>
            {map.tiles.map((row, y) =>
              row.map((t, x) => {
                const mob = map.mobs.find((m) => m.x === x && m.y === y);
                const here = pos.x === x && pos.y === y;
                return (
                  <div key={`${x},${y}`} style={{ width: TILE, height: TILE, background: tileBg(t), border: "1px solid #00000022", display: "flex", alignItems: "center", justifyContent: "center", fontSize: TILE * 0.62, position: "relative" }}>
                    <span style={{ opacity: 0.55, fontSize: TILE * 0.5 }}>{tileChar(t)}</span>
                    {mob && (
                      <span className="mobIdle" style={{ position: "absolute", fontSize: TILE * (mob.boss ? 0.85 : 0.7), filter: mob.boss ? "drop-shadow(0 0 4px #c0392b)" : "none" }}>
                        {mob.emoji}
                      </span>
                    )}
                    {here && <span style={{ position: "absolute", fontSize: TILE * 0.78 }}>{mode === "junior" ? "🧒" : "👦"}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <CatRow state={catState} line={mapMsg || "やじるしで あるこう!モンスターに ぶつかると バトルだ!"} />

        {/* 十字キー */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 4 }}>
          <button onClick={() => tryMove(0, -1)} style={{ ...blockBtn("#4a90d9"), width: 68, padding: "12px 0", fontSize: 22 }}>▲</button>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => tryMove(-1, 0)} style={{ ...blockBtn("#4a90d9"), width: 68, padding: "12px 0", fontSize: 22 }}>◀</button>
            <button onClick={() => tryMove(0, 1)} style={{ ...blockBtn("#4a90d9"), width: 68, padding: "12px 0", fontSize: 22 }}>▼</button>
            <button onClick={() => tryMove(1, 0)} style={{ ...blockBtn("#4a90d9"), width: 68, padding: "12px 0", fontSize: 22 }}>▶</button>
          </div>
        </div>

        {showCat && <CatChat onClose={() => setShowCat(false)} />}
      </Frame>
    );
  }

  // ===================== バトル =====================
  if (screen === "battle" && enemy) {
    const creep = phase === "prompt" ? Math.max(0, (menace - 0.25) / 0.75) : 0;
    const flinch = enemyState === "hit" || enemyState === "crit";
    const defeated = enemyState === "defeat";
    const attacking = enemyState === "attack";
    const enemyTransform = defeated
      ? "scale(0) rotate(200deg)"
      : `translateY(${creep * 52}px) translateX(${attacking ? 14 : 0}px) scale(${(1 + creep * 0.85) * (flinch ? 0.84 : 1)}) rotate(${flinch ? (enemyState === "crit" ? -16 : -10) : 0}deg)`;
    const menaceWarn = creep > 0.5;

    const sparks = [];
    if (phase === "result" && result && result.dmg > 0) {
      for (let i = 0; i < 8; i++) {
        const ang = (Math.PI * 2 * i) / 8 + (hitId % 3);
        const dist = 40 + (result.crit ? 32 : 12);
        sparks.push({ tx: Math.cos(ang) * dist, ty: Math.sin(ang) * dist });
      }
    }

    return (
      <Frame shake={shake}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 17 }}>
          <div>{"❤️".repeat(hearts)} <span style={{ fontSize: 13, fontWeight: 700 }}>{hearts}/{MAX_HEARTS}</span></div>
          <div style={{ fontSize: 13 }}>{combo >= 2 && <span style={{ color: "#e8b923", textShadow: `1px 1px 0 ${INK}` }}>🔥{combo}コンボ</span>}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>{sword.emoji}{sword.dmg}</span>
            <button onClick={toggleMute} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17 }}>{muteUI ? "🔇" : "🔊"}</button>
          </div>
        </div>

        <div style={{ ...panel, textAlign: "center", position: "relative", overflow: "hidden", background: menaceWarn ? "#f0cccc" : "#dfe7ef", transition: "background .3s", minHeight: 175 }}>
          {menaceWarn && <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 40px 12px rgba(200,40,40,${creep * 0.7})`, pointerEvents: "none" }} />}
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 6 }}>
            <span>{enemy.boss && "👑 "}{enemy.name}</span>
            <span style={{ background: "#c0392b", color: "#fff", padding: "1px 7px", border: `2px solid ${INK}`, fontSize: 11, fontWeight: 700 }}>⚔ こうげき {enemy.atk}</span>
            {enemy.ranged && <span style={{ background: "#8446B0", color: "#fff", padding: "1px 7px", border: `2px solid ${INK}`, fontSize: 11 }}>🏹 とおくから</span>}
            {menaceWarn && <span style={{ color: "#c0392b" }}>⚠ ちかづいてくる!</span>}
          </div>
          <div className="float" style={{ position: "relative", display: "inline-block" }}>
            <div style={{ position: "relative", display: "inline-block", transform: enemyTransform, transition: phase === "prompt" && !flinch ? "transform .12s linear" : "transform .4s ease-out", filter: flinch ? "brightness(1.6) saturate(.5)" : menaceWarn ? "drop-shadow(0 0 8px rgba(200,40,40,.9))" : "none", animation: menaceWarn ? "menacePulse .5s infinite" : "none" }}>
              <span style={{ fontSize: enemy.boss ? 92 : 80, display: "inline-block" }}>{enemy.emoji}</span>
              {flinch && <span style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(220,50,50,.75), transparent 70%)", animation: "flashOut .4s forwards", pointerEvents: "none" }} />}
            </div>
            {(flinch || defeated) && pain && (
              <span key={hitId} style={{ position: "absolute", top: -8, left: "50%", fontSize: result?.crit ? 36 : 28, animation: "reactPop .6s forwards", pointerEvents: "none" }}>{pain}</span>
            )}
            {phase === "result" && result && result.dmg > 0 && (
              <span key={"s" + hitId} style={{ position: "absolute", top: "45%", left: "50%", fontSize: 56, animation: "slash .5s forwards", pointerEvents: "none" }}>💥</span>
            )}
            {sparks.map((s, i) => (
              <span key={"p" + hitId + "_" + i} style={{ position: "absolute", top: "45%", left: "50%", fontSize: 15, ["--tx"]: `${s.tx}px`, ["--ty"]: `${s.ty}px`, animation: "spark .55s forwards", pointerEvents: "none" }}>✨</span>
            ))}
            {attackFx && (
              <span key={attackFx.id} style={{ position: "absolute", top: "55%", left: "50%", fontSize: enemy.boss ? 46 : 38, zIndex: 5, animation: `${attackFx.ranged ? "arrowFly" : "punchHit"} .55s forwards`, pointerEvents: "none" }}>
                {attackFx.ranged ? "🏹" : "👊"}
              </span>
            )}
          </div>
          <HpBar hp={enemyHp} max={enemy.maxHp} color={enemy.color} />
        </div>

        <CatRow state={catState} line={catLine} />

        <div style={{ ...panel, background: "#fffef2", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4E7A38", marginBottom: 4 }}>{mode === "junior" ? "これを えいごで!" : "えいごで こうげき!"}</div>
          <div style={{ fontSize: 52, lineHeight: 1.1, margin: "2px 0 4px" }}>{question?.emoji}</div>
          <div style={{ fontSize: mode === "junior" ? 23 : 21, fontWeight: 700 }}>{question?.ja}</div>
          <button onClick={() => { sfx.resume(); speak(question.ja, "ja-JP"); }} style={{ ...blockBtn("#9A9A9A"), padding: "6px 14px", fontSize: 13, marginTop: 8 }}>🔊 にほんごを きく</button>

          {phase === "prompt" && (
            <div style={{ marginTop: 14 }}>
              {speech.supported ? (
                <button onClick={beginListening} style={{ ...blockBtn("#c0392b"), width: "100%", fontSize: 21 }}>🗡️ こうげき!(タップして はなす)</button>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitTyped()} placeholder="えいごで かいてね"
                    style={{ flex: 1, fontFamily: FONT, fontSize: 16, padding: "10px 12px", border: `3px solid ${INK}`, borderRadius: 0, outline: "none" }} />
                  <button onClick={submitTyped} style={{ ...blockBtn("#c0392b"), fontSize: 16 }}>🗡️</button>
                </div>
              )}
            </div>
          )}

          {phase === "listening" && (
            <div style={{ marginTop: 14 }}>
              <div style={{ minHeight: 26, fontSize: 18, marginBottom: 10, color: speech.transcript ? INK : "#999" }}>{speech.transcript || "🎤 きいてるよ…"}</div>
              <button onClick={() => speech.stop()} style={{ ...blockBtn("#23202b"), width: "100%" }}>■ いえたら タップ</button>
            </div>
          )}

          {phase === "result" && result && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 8, color: result.result === "correct" ? "#4E7A38" : result.result === "close" ? "#e8a33d" : "#c0392b" }}>
                {result.result === "correct" ? "せいかい! ⚔️" : result.result === "close" ? "おしい!" : "ミス…"}
              </div>
              <div style={{ ...panel, background: "#f2efe0", padding: "9px 11px", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#777", marginBottom: 2 }}>こたえ</div>
                <div style={{ fontSize: 17, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  {question.en}
                  <button onClick={() => { sfx.resume(); speak(question.en, "en-US"); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }}>🔊</button>
                </div>
              </div>
              {result.heard && <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>きみの こえ: 「{result.heard}」</div>}

              <div style={{ background: "#eef3ff", border: `2px dashed ${INK}`, padding: "8px 10px", marginBottom: 10 }}>
                <div style={{ fontSize: 11.5, color: "#555", marginBottom: 6 }}>ちゃんと いえたのに ちがう はんてい だったら…</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => selfSay(true)} style={{ ...blockBtn("#6AA84F"), flex: 1, fontSize: 13, padding: "9px" }}>🙆 いえてた!</button>
                  <button onClick={() => selfSay(false)} style={{ ...blockBtn("#c99"), flex: 1, fontSize: 13, padding: "9px" }}>🙅 いえてなかった</button>
                </div>
              </div>

              <button onClick={onBattleContinue} style={{ ...blockBtn(result.defeated ? "#e8b923" : "#6AA84F"), width: "100%" }}>
                {hearts <= 0 ? "けっか を みる" : result.defeated ? "🎁 たからばこ →" : "つぎの もんだい →"}
              </button>
            </div>
          )}
        </div>
      </Frame>
    );
  }

  return <Frame shake=""><div style={{ padding: 40, textAlign: "center" }}>よみこみちゅう…</div></Frame>;
}
