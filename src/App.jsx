import { useState, useEffect, useCallback, useMemo } from "react";
import { FOODS_DB } from "./foods.js";

// ─── УТИЛИТЫ ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];
const todayLabel = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
};
const weekdayIndex = () => new Date().getDay();
const DAYS = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
const DAYS_FULL = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const WEEKDAYS_FULL = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
const MEAL_TYPES = ["Завтрак","Обед","Перекус","Ужин"];

function todayWeekdayKey() {
  const d = new Date().getDay();
  const map = [6,0,1,2,3,4,5];
  return map[d];
}

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch { return initial; }
  });
  const set = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, set];
}

function uid() { return Math.random().toString(36).slice(2, 9); }

const DEFAULT_ROUTINE = [
  { id: uid(), title: "Подъём", time: "07:00", type: "generic", notes: "" },
  { id: uid(), title: "Выпить воды", time: "07:10", type: "generic", notes: "500 мл" },
  { id: uid(), title: "Завтрак", time: "09:00", type: "meal", mealType: "Завтрак", notes: "" },
  { id: uid(), title: "Обед", time: "13:00", type: "meal", mealType: "Обед", notes: "" },
  { id: uid(), title: "Перекус", time: "16:00", type: "meal", mealType: "Перекус", notes: "" },
  { id: uid(), title: "Тренировка", time: "18:00", type: "workout", notes: "" },
  { id: uid(), title: "Ужин", time: "20:00", type: "meal", mealType: "Ужин", notes: "" },
  { id: uid(), title: "Сон", time: "23:00", type: "generic", notes: "" },
];

const DEFAULT_NUTRITION = WEEKDAYS_FULL.reduce((acc, day) => {
  acc[day] = {
    "Завтрак": { items: [
      { id: uid(), name: "Овсянка (варёная)",   grams: 80,  calories: 71,  protein: 2.5, fat: 1.5, carbs: 12 },
      { id: uid(), name: "Молоко 1.5%",         grams: 200, calories: 44,  protein: 3,   fat: 1.5, carbs: 5  },
    ]},
    "Обед": { items: [
      { id: uid(), name: "Куриная грудка (варёная)", grams: 250, calories: 165, protein: 31,  fat: 3.6, carbs: 0  },
      { id: uid(), name: "Рис белый (варёный)",      grams: 150, calories: 130, protein: 2.7, fat: 0.3, carbs: 28 },
      { id: uid(), name: "Брокколи",                 grams: 150, calories: 34,  protein: 2.8, fat: 0.4, carbs: 7  },
    ]},
    "Перекус": { items: [
      { id: uid(), name: "Творог 5%", grams: 200, calories: 121, protein: 17,  fat: 5,   carbs: 1.8 },
    ]},
    "Ужин": { items: [
      { id: uid(), name: "Лосось (запечённый)", grams: 200, calories: 206, protein: 20, fat: 13, carbs: 0 },
      { id: uid(), name: "Брокколи",            grams: 150, calories: 34,  protein: 2.8, fat: 0.4, carbs: 7 },
    ]},
  };
  return acc;
}, {});

const DEFAULT_WORKOUTS = {
  "Понедельник": { name: "Грудь + Трицепс", notes: "", exercises: [{ id: uid(), name: "Жим лёжа", sets: 4, reps: 10 }, { id: uid(), name: "Наклонный жим", sets: 4, reps: 10 }, { id: uid(), name: "Разводка", sets: 3, reps: 12 }, { id: uid(), name: "Отжимания на брусьях", sets: 3, reps: 15 }, { id: uid(), name: "Трицепс на блоке", sets: 3, reps: 12 }] },
  "Среда": { name: "Спина + Бицепс", notes: "", exercises: [{ id: uid(), name: "Подтягивания", sets: 4, reps: 8 }, { id: uid(), name: "Тяга штанги", sets: 4, reps: 10 }, { id: uid(), name: "Тяга блока", sets: 3, reps: 12 }, { id: uid(), name: "Сгибания на бицепс", sets: 3, reps: 12 }] },
  "Пятница": { name: "Ноги + Плечи", notes: "", exercises: [{ id: uid(), name: "Приседания", sets: 4, reps: 10 }, { id: uid(), name: "Жим ногами", sets: 4, reps: 12 }, { id: uid(), name: "Жим гантелей вверх", sets: 3, reps: 12 }, { id: uid(), name: "Разводка плеч", sets: 3, reps: 15 }] },
  "Вторник": null, "Четверг": null, "Суббота": null, "Воскресенье": null,
};

function calcMealCal(items) {
  return Math.round(items.reduce((s, i) => {
    if (i.calories !== undefined) return s + (i.grams * i.calories / 100);
    return s + (i.grams * (i.caloriesPer100g || 0) / 100);
  }, 0));
}

function calcMealMacros(items) {
  const result = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  for (const i of items) {
    const k = i.grams / 100;
    result.calories += (i.calories ?? i.caloriesPer100g ?? 0) * k;
    result.protein  += (i.protein ?? 0) * k;
    result.fat      += (i.fat ?? 0) * k;
    result.carbs    += (i.carbs ?? 0) * k;
  }
  return {
    calories: Math.round(result.calories),
    protein:  Math.round(result.protein * 10) / 10,
    fat:      Math.round(result.fat * 10) / 10,
    carbs:    Math.round(result.carbs * 10) / 10,
  };
}

// ─── ИКОНКИ ───────────────────────────────────────────────────────────────────

const Icons = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Food: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  Dumbbell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M5 3v18"/><path d="M19 3v18"/><path d="M3 5v14"/><path d="M21 5v14"/></svg>,
  Scale: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2.5"/></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{width:18,height:18}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="18 15 12 9 6 15"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  TrendUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Minus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{width:16,height:16}}><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{width:16,height:16}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Flame: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>,
  Zap: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

// ─── ГЛОБАЛЬНЫЕ СТИЛИ ─────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0a0a0f;
    --bg2:     #111118;
    --bg3:     #16161f;
    --card:    #13131a;
    --card2:   #1a1a24;
    --border:  rgba(255,255,255,0.06);
    --border2: rgba(255,255,255,0.11);
    --text:    #ededf5;
    --text2:   #8888a0;
    --text3:   #44445a;
    --accent:  #5b8dee;
    --accent2: #7aa3f5;
    --accent-bg: rgba(91,141,238,0.12);
    --green:   #3ecf8e;
    --green-bg: rgba(62,207,142,0.1);
    --red:     #f06060;
    --red-bg:  rgba(240,96,96,0.1);
    --amber:   #f5a623;
    --amber-bg: rgba(245,166,35,0.1);
    --blue:    #60a5fa;
    --blue-bg: rgba(96,165,250,0.1);
    --r:  12px;
    --r2: 8px;
    --font: 'Manrope', sans-serif;
    --nav-h: 68px;
  }

  body, #root {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 15px;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  button { cursor: pointer; font-family: var(--font); }

  input, textarea, select {
    font-family: var(--font);
    background: var(--bg3);
    border: 1.5px solid var(--border2);
    color: var(--text);
    border-radius: var(--r2);
    padding: 11px 14px;
    font-size: 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s;
  }
  input:focus, textarea:focus, select:focus { border-color: var(--accent); }
  select option { background: var(--bg2); }

  .scroll-hide::-webkit-scrollbar { display: none; }
  .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideSheet {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { transform: scale(0.6); opacity: 0; }
    65%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shimmer {
    from { background-position: -200% center; }
    to   { background-position: 200% center; }
  }

  .fade-up  { animation: fadeUp 0.28s cubic-bezier(.22,.9,.42,1) both; }
  .slide-sh { animation: slideSheet 0.32s cubic-bezier(.22,.9,.42,1) both; }
  .pop-in   { animation: popIn 0.22s cubic-bezier(.22,.9,.42,1) both; }

  /* Stagger children */
  .stagger > * { animation: fadeUp 0.3s cubic-bezier(.22,.9,.42,1) both; }
  .stagger > *:nth-child(1)  { animation-delay: 0.04s; }
  .stagger > *:nth-child(2)  { animation-delay: 0.08s; }
  .stagger > *:nth-child(3)  { animation-delay: 0.12s; }
  .stagger > *:nth-child(4)  { animation-delay: 0.16s; }
  .stagger > *:nth-child(5)  { animation-delay: 0.20s; }
  .stagger > *:nth-child(6)  { animation-delay: 0.24s; }
  .stagger > *:nth-child(7)  { animation-delay: 0.28s; }
  .stagger > *:nth-child(8)  { animation-delay: 0.32s; }
`;

// ─── ПЕРЕМЕННЫЕ ТЕМЫ ──────────────────────────────────────────────────────────

function applyTheme(theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const r = document.documentElement.style;
  if (dark) {
    r.setProperty("--bg","#0a0a0f"); r.setProperty("--bg2","#111118"); r.setProperty("--bg3","#16161f");
    r.setProperty("--card","#13131a"); r.setProperty("--card2","#1a1a24");
    r.setProperty("--border","rgba(255,255,255,0.06)"); r.setProperty("--border2","rgba(255,255,255,0.11)");
    r.setProperty("--text","#ededf5"); r.setProperty("--text2","#8888a0"); r.setProperty("--text3","#44445a");
  } else {
    r.setProperty("--bg","#f4f4f8"); r.setProperty("--bg2","#ebebf2"); r.setProperty("--bg3","#e2e2ec");
    r.setProperty("--card","#ffffff"); r.setProperty("--card2","#f0f0f8");
    r.setProperty("--border","rgba(0,0,0,0.07)"); r.setProperty("--border2","rgba(0,0,0,0.12)");
    r.setProperty("--text","#0f0f18"); r.setProperty("--text2","#50506a"); r.setProperty("--text3","#9090aa");
  }
}

// ─── UI КОМПОНЕНТЫ ────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="slide-sh" style={{ background:"var(--bg2)", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:500, maxHeight:"92vh", overflowY:"auto", paddingBottom:"env(safe-area-inset-bottom,20px)" }}>
        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", paddingTop:12 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"var(--border2)" }}/>
        </div>
        <div style={{ padding:"16px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <span style={{ fontWeight:700, fontSize:17 }}>{title}</span>
          <button onClick={onClose} style={{ background:"var(--card2)", border:"none", borderRadius:8, padding:"6px 8px", color:"var(--text2)", display:"flex", lineHeight:0 }}><Icons.X/></button>
        </div>
        <div style={{ padding:"0 20px 28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant="primary", style:s={}, small=false, disabled=false }) {
  const base = {
    border:"none", borderRadius: small ? 8 : 10, fontWeight:600, cursor: disabled ? "not-allowed" : "pointer",
    display:"inline-flex", alignItems:"center", gap:6, transition:"all 0.15s",
    fontFamily:"var(--font)", fontSize: small ? 13 : 14,
    padding: small ? "7px 13px" : "11px 18px",
    opacity: disabled ? 0.45 : 1,
  };
  const variants = {
    primary:   { background:"var(--accent)", color:"#fff" },
    secondary: { background:"var(--card2)", color:"var(--text2)", border:"1px solid var(--border2)" },
    ghost:     { background:"transparent", color:"var(--text2)" },
    danger:    { background:"var(--red-bg)", color:"var(--red)", border:"1px solid rgba(240,96,96,0.2)" },
    green:     { background:"var(--green-bg)", color:"var(--green)", border:"1px solid rgba(62,207,142,0.2)" },
  };
  return <button style={{...base,...variants[variant],...s}} onClick={disabled ? undefined : onClick}>{children}</button>;
}

// Пилюля-тег
function Pill({ color="accent", children }) {
  const map = {
    accent: ["var(--accent-bg)","var(--accent2)"],
    green:  ["var(--green-bg)","var(--green)"],
    red:    ["var(--red-bg)","var(--red)"],
    amber:  ["var(--amber-bg)","var(--amber)"],
    blue:   ["var(--blue-bg)","var(--blue)"],
  };
  const [bg,col] = map[color]||map.accent;
  return <span style={{ background:bg, color:col, borderRadius:6, padding:"2px 8px", fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>{children}</span>;
}

// Карточка-секция
function Card({ children, style:s={} }) {
  return (
    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--r)", ...s }}>
      {children}
    </div>
  );
}

// Горизонтальный скролл с табами дней
function DayTabs({ active, onChange }) {
  return (
    <div style={{ overflowX:"auto", padding:"14px 16px 0" }} className="scroll-hide">
      <div style={{ display:"flex", gap:6, width:"max-content" }}>
        {WEEKDAYS.map((d,i) => {
          const isToday = i === todayWeekdayKey();
          const isActive = active === i;
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              style={{
                background: isActive ? "var(--accent)" : "var(--card)",
                border: isActive ? "none" : "1px solid var(--border2)",
                borderRadius:10, padding:"8px 16px",
                color: isActive ? "#fff" : isToday ? "var(--accent2)" : "var(--text2)",
                fontWeight: isActive || isToday ? 700 : 500,
                fontSize:13, cursor:"pointer",
                transition:"all 0.15s", flexShrink:0, position:"relative",
                fontFamily:"var(--font)",
              }}
            >
              {d}
              {isToday && !isActive && (
                <span style={{ position:"absolute", top:5, right:5, width:4, height:4, borderRadius:"50%", background:"var(--accent)" }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Прогресс-бар с лейблом
function MacroBar({ label, current, goal, color }) {
  const pct = goal > 0 ? Math.min(100, Math.round(current / goal * 100)) : 0;
  const colors = { green:"var(--green)", accent:"var(--accent)", amber:"var(--amber)", blue:"var(--blue)" };
  const c = colors[color] || colors.accent;
  return (
    <div style={{ flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:12, color:"var(--text2)", fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color: c }}>
          {current}<span style={{ color:"var(--text3)", fontWeight:400 }}>{goal > 0 ? `/${goal}г` : "г"}</span>
        </span>
      </div>
      <div style={{ background:"var(--bg3)", borderRadius:4, height:5, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background: c, borderRadius:4, transition:"width 0.5s ease" }}/>
      </div>
    </div>
  );
}

// Шапка страницы
function PageHeader({ subtitle, title, right }) {
  return (
    <div style={{ padding:"22px 16px 0", display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
      <div>
        {subtitle && <p style={{ color:"var(--text3)", fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:3 }}>{subtitle}</p>}
        <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.5px" }}>{title}</h1>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ─── СТРАНИЦА: СЕГОДНЯ ────────────────────────────────────────────────────────

function TodayPage({ routine, weightHistory, nutrition, workouts, completions, setCompletions, goals }) {
  const [expanded, setExpanded] = useState({});
  const todayKey = today();
  const wdKey = todayWeekdayKey();
  const wdName = WEEKDAYS_FULL[wdKey];
  const todayNutrition = nutrition[wdName] || {};
  const todayWorkout = workouts[wdName] || null;
  const todayCompletions = completions[todayKey] || {};

  const sortedTasks = useMemo(() => [...routine].sort((a,b) => a.time.localeCompare(b.time)), [routine]);
  const completed = sortedTasks.filter(t => todayCompletions[t.id]).length;
  const progress = sortedTasks.length ? Math.round(completed / sortedTasks.length * 100) : 0;

  const lastWeight = weightHistory.length ? weightHistory[weightHistory.length-1] : null;
  const prevWeight = weightHistory.length > 1 ? weightHistory[weightHistory.length-2] : null;
  const diff = lastWeight && prevWeight ? (lastWeight.weight - prevWeight.weight).toFixed(1) : null;

  const mealCals = MEAL_TYPES.reduce((acc, mt) => {
    acc[mt] = todayNutrition[mt] ? calcMealCal(todayNutrition[mt].items) : 0;
    return acc;
  }, {});
  const totalCal = Object.values(mealCals).reduce((s,v)=>s+v,0);

  const totalMacros = MEAL_TYPES.reduce((acc, mt) => {
    const m = todayNutrition[mt];
    if (!m) return acc;
    const macro = calcMealMacros(m.items);
    acc.protein += macro.protein; acc.fat += macro.fat; acc.carbs += macro.carbs;
    return acc;
  }, { protein: 0, fat: 0, carbs: 0 });
  totalMacros.protein = Math.round(totalMacros.protein * 10) / 10;
  totalMacros.fat     = Math.round(totalMacros.fat * 10) / 10;
  totalMacros.carbs   = Math.round(totalMacros.carbs * 10) / 10;

  function toggleDone(id) {
    setCompletions(prev => ({
      ...prev,
      [todayKey]: { ...(prev[todayKey]||{}), [id]: !((prev[todayKey]||{})[id]) }
    }));
  }

  function taskContent(task) {
    if (task.type === "meal") {
      const meal = todayNutrition[task.mealType];
      const cal = meal ? calcMealCal(meal.items) : 0;
      return {
        subtitle: `${cal} ккал`,
        detail: meal?.items?.map(i => `${i.name} — ${i.grams}г`).join("\n") || "Нет данных"
      };
    }
    if (task.type === "workout") {
      if (!todayWorkout) return { subtitle: "Выходной", detail: "Тренировка не запланирована" };
      return {
        subtitle: `${todayWorkout.name} · ${todayWorkout.exercises.length} упр.`,
        detail: todayWorkout.exercises.map(e => `${e.name} — ${e.sets}×${e.reps}`).join("\n")
      };
    }
    return { subtitle: task.notes || "", detail: task.notes || "" };
  }

  const typeIcons = { meal:"🍽", workout:"💪", generic:"✓" };
  const typeColors = { meal:"green", workout:"accent", generic:"blue" };

  const calPct = goals.calories > 0 ? Math.min(100, Math.round(totalCal / goals.calories * 100)) : 0;
  const calOver = goals.calories > 0 && totalCal > goals.calories;

  return (
    <div style={{ padding:"0 0 calc(var(--nav-h) + 20px)" }}>
      <PageHeader subtitle={todayLabel()} title={`${DAYS_FULL[new Date().getDay()]} 👋`} />

      {/* ─ Топ-статы ─ */}
      <div style={{ padding:"16px 16px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }} className="stagger">
        {/* Вес */}
        <Card style={{ padding:"14px 16px" }}>
          <p style={{ color:"var(--text3)", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Вес</p>
          <p style={{ fontSize:30, fontWeight:800, letterSpacing:"-1px", lineHeight:1 }}>
            {lastWeight ? lastWeight.weight : "—"}
            <span style={{ fontSize:14, color:"var(--text2)", fontWeight:500 }}> кг</span>
          </p>
          {diff !== null && (
            <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:8 }}>
              {diff < 0
                ? <span style={{color:"var(--green)", display:"flex"}}><Icons.TrendDown/></span>
                : diff > 0
                ? <span style={{color:"var(--red)", display:"flex"}}><Icons.TrendUp/></span>
                : <span style={{color:"var(--amber)", display:"flex"}}><Icons.Minus/></span>
              }
              <span style={{ fontSize:13, fontWeight:700, color: diff < 0 ? "var(--green)" : diff > 0 ? "var(--red)" : "var(--amber)" }}>
                {diff > 0 ? "+" : ""}{diff} кг
              </span>
            </div>
          )}
        </Card>

        {/* Прогресс задач */}
        <Card style={{ padding:"14px 16px" }}>
          <p style={{ color:"var(--text3)", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Задачи</p>
          <p style={{ fontSize:30, fontWeight:800, letterSpacing:"-1px", lineHeight:1 }}>
            {completed}
            <span style={{ fontSize:14, color:"var(--text3)", fontWeight:400 }}>/{sortedTasks.length}</span>
          </p>
          <div style={{ marginTop:10 }}>
            <div style={{ background:"var(--bg3)", borderRadius:4, height:5, overflow:"hidden" }}>
              <div style={{ width:`${progress}%`, height:"100%", background:"var(--accent)", borderRadius:4, transition:"width 0.5s ease" }}/>
            </div>
            <p style={{ color:"var(--text3)", fontSize:12, marginTop:5, fontWeight:600 }}>{progress}%</p>
          </div>
        </Card>
      </div>

      {/* ─ Калории ─ */}
      <div style={{ padding:"10px 16px 0" }}>
        <Card style={{ padding:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <p style={{ color:"var(--text3)", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Питание</p>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ color: calOver ? "var(--red)" : "var(--amber)" }}><Icons.Flame/></span>
              <span style={{ fontWeight:800, fontSize:20, letterSpacing:"-0.5px" }}>{totalCal}</span>
              {goals.calories > 0 && (
                <span style={{ fontSize:13, color:"var(--text3)" }}>/ {goals.calories}</span>
              )}
              <span style={{ fontSize:13, color:"var(--text2)" }}>ккал</span>
            </div>
          </div>

          {goals.calories > 0 && (
            <div style={{ background:"var(--bg3)", borderRadius:4, height:5, overflow:"hidden", marginBottom:14 }}>
              <div style={{ width:`${calPct}%`, height:"100%", background: calOver ? "var(--red)" : "var(--accent)", borderRadius:4, transition:"width 0.5s ease" }}/>
            </div>
          )}

          {/* Приёмы */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:14 }}>
            {[["🌅","Завт.","Завтрак"],["☀️","Обед","Обед"],["🍎","Перекус","Перекус"],["🌙","Ужин","Ужин"]].map(([em,sh,mt]) => (
              <div key={mt} style={{ textAlign:"center", background:"var(--bg3)", borderRadius:8, padding:"8px 4px" }}>
                <p style={{ fontSize:16, lineHeight:1, marginBottom:3 }}>{em}</p>
                <p style={{ fontSize:10, color:"var(--text3)", marginBottom:2 }}>{sh}</p>
                <p style={{ fontWeight:700, fontSize:13 }}>{mealCals[mt]}</p>
              </div>
            ))}
          </div>

          {/* БЖУ */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, borderTop:"1px solid var(--border)", paddingTop:12 }}>
            <MacroBar label="Белки"     current={totalMacros.protein} goal={goals.protein} color="green"/>
            <MacroBar label="Жиры"      current={totalMacros.fat}     goal={goals.fat}     color="amber"/>
            <MacroBar label="Углеводы"  current={totalMacros.carbs}   goal={goals.carbs}   color="blue"/>
          </div>
        </Card>
      </div>

      {/* ─ Тренировка ─ */}
      {todayWorkout && (
        <div style={{ padding:"10px 16px 0" }}>
          <Card style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:"var(--accent-bg)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icons.Dumbbell/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:15 }}>{todayWorkout.name}</p>
                <p style={{ color:"var(--text2)", fontSize:13, marginTop:1 }}>{todayWorkout.exercises.length} упражнений</p>
              </div>
              <Pill color="accent">Сегодня</Pill>
            </div>
          </Card>
        </div>
      )}

      {/* ─ Расписание ─ */}
      <div style={{ padding:"20px 16px 0" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"var(--text3)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:12 }}>Расписание</p>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }} className="stagger">
          {sortedTasks.map((task) => {
            const done = todayCompletions[task.id];
            const exp = expanded[task.id];
            const { subtitle, detail } = taskContent(task);
            const hasDetail = task.type !== "generic" || !!detail;

            return (
              <div
                key={task.id}
                style={{
                  background: done ? "rgba(62,207,142,0.06)" : "var(--card)",
                  borderRadius:"var(--r)",
                  border:`1px solid ${done ? "rgba(62,207,142,0.18)" : "var(--border)"}`,
                  overflow:"hidden", transition:"all 0.2s",
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px" }}>
                  {/* Чекбокс */}
                  <button
                    onClick={() => toggleDone(task.id)}
                    style={{
                      width:28, height:28, borderRadius:8, flexShrink:0,
                      border: done ? "none" : "1.5px solid var(--border2)",
                      background: done ? "var(--green)" : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      cursor:"pointer", transition:"all 0.2s",
                    }}
                  >
                    {done && <span className="pop-in" style={{color:"#0a0a0f", display:"flex"}}><Icons.Check/></span>}
                  </button>

                  <div style={{ flex:1, minWidth:0 }}>
                    <span style={{ fontWeight:600, fontSize:14, opacity: done ? 0.45 : 1, transition:"opacity 0.2s" }}>{task.title}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:2 }}>
                      <span style={{ fontSize:12, color:"var(--accent2)", fontWeight:700 }}>{task.time}</span>
                      {subtitle && <span style={{ fontSize:12, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{subtitle}</span>}
                    </div>
                  </div>

                  {hasDetail && (
                    <button
                      onClick={() => setExpanded(p=>({...p,[task.id]:!p[task.id]}))}
                      style={{ background:"var(--bg3)", border:"none", borderRadius:6, padding:"5px 6px", color:"var(--text2)", display:"flex", cursor:"pointer" }}
                    >
                      {exp ? <Icons.ChevronUp/> : <Icons.ChevronDown/>}
                    </button>
                  )}
                </div>

                {exp && detail && (
                  <div style={{ borderTop:"1px solid var(--border)", padding:"10px 14px 12px", background:"var(--bg3)" }}>
                    {detail.split("\n").map((l,i) => (
                      <p key={i} style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7 }}>{l}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {sortedTasks.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--text3)" }}>
              <p style={{ fontSize:32, marginBottom:10 }}>📋</p>
              <p style={{ fontWeight:600 }}>Нет задач</p>
              <p style={{ fontSize:13, marginTop:4 }}>Настройте расписание в разделе Настройки</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── СТРАНИЦА: ПИТАНИЕ ────────────────────────────────────────────────────────

function NutritionPage({ nutrition, setNutrition }) {
  const [activeDay, setActiveDay] = useState(todayWeekdayKey());
  const [editModal, setEditModal] = useState(null);
  const [foodSearch, setFoodSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [gramsInput, setGramsInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState({});

  const dayName = WEEKDAYS_FULL[activeDay];
  const dayData = nutrition[dayName] || {};

  const searchResults = useMemo(() => {
    if (!foodSearch.trim()) return [];
    const q = foodSearch.toLowerCase();
    return FOODS_DB.filter(f => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [foodSearch]);

  const preview = useMemo(() => {
    if (!selectedFood || !gramsInput) return null;
    const g = parseFloat(gramsInput);
    if (!g || g <= 0) return null;
    const k = g / 100;
    return {
      calories: Math.round(selectedFood.calories * k),
      protein:  Math.round(selectedFood.protein * k * 10) / 10,
      fat:      Math.round(selectedFood.fat * k * 10) / 10,
      carbs:    Math.round(selectedFood.carbs * k * 10) / 10,
    };
  }, [selectedFood, gramsInput]);

  function openAddItem(mealType) {
    setSelectedFood(null); setFoodSearch(""); setGramsInput(""); setShowDropdown(false);
    setEditModal({ day: dayName, mealType, itemIndex: null });
  }

  function openEditItem(mealType, idx) {
    const item = dayData[mealType].items[idx];
    const food = FOODS_DB.find(f => f.name === item.name) || {
      name: item.name, calories: item.calories ?? item.caloriesPer100g ?? 0,
      protein: item.protein ?? 0, fat: item.fat ?? 0, carbs: item.carbs ?? 0,
    };
    setSelectedFood(food); setFoodSearch(item.name); setGramsInput(String(item.grams)); setShowDropdown(false);
    setEditModal({ day: dayName, mealType, itemIndex: idx });
  }

  function saveItem() {
    if (!selectedFood || !gramsInput) return;
    const g = parseFloat(gramsInput);
    if (!g || g <= 0) return;
    const newItem = {
      id: uid(), name: selectedFood.name, grams: g,
      calories: selectedFood.calories, protein: selectedFood.protein,
      fat: selectedFood.fat, carbs: selectedFood.carbs,
      caloriesPer100g: selectedFood.calories,
    };
    setNutrition(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[editModal.day]) updated[editModal.day] = {};
      if (!updated[editModal.day][editModal.mealType]) updated[editModal.day][editModal.mealType] = { items: [] };
      if (editModal.itemIndex !== null) updated[editModal.day][editModal.mealType].items[editModal.itemIndex] = newItem;
      else updated[editModal.day][editModal.mealType].items.push(newItem);
      return updated;
    });
    setEditModal(null);
  }

  function deleteItem(mealType, idx) {
    setNutrition(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[editModal?.day || dayName][mealType].items.splice(idx, 1);
      return updated;
    });
    setEditModal(null);
  }

  const mealConfig = {
    "Завтрак": { emoji:"🌅", color:"blue" },
    "Обед":    { emoji:"☀️", color:"green" },
    "Перекус": { emoji:"🍎", color:"amber" },
    "Ужин":    { emoji:"🌙", color:"accent" },
  };

  const dayTotals = useMemo(() => MEAL_TYPES.reduce((acc, mt) => {
    const m = dayData[mt];
    if (!m) return acc;
    const macro = calcMealMacros(m.items);
    acc.calories += macro.calories; acc.protein += macro.protein;
    acc.fat += macro.fat; acc.carbs += macro.carbs;
    return acc;
  }, { calories:0, protein:0, fat:0, carbs:0 }), [dayData]);

  return (
    <div style={{ padding:"0 0 calc(var(--nav-h) + 20px)" }}>
      <PageHeader subtitle="Недельный план" title="Питание" />
      <DayTabs active={activeDay} onChange={setActiveDay} />

      {/* Итого */}
      <div style={{ padding:"12px 16px 0" }}>
        <Card style={{ padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--text2)" }}>{WEEKDAYS_FULL[activeDay]}</span>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ color:"var(--amber)" }}><Icons.Flame/></span>
              <span style={{ fontWeight:800, fontSize:18 }}>{Math.round(dayTotals.calories)}</span>
              <span style={{ color:"var(--text2)", fontSize:13 }}>ккал</span>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {[["Белки",dayTotals.protein,"var(--green)"],["Жиры",dayTotals.fat,"var(--amber)"],["Углев.",dayTotals.carbs,"var(--blue)"]].map(([l,v,c]) => (
              <div key={l} style={{ textAlign:"center", background:"var(--bg3)", borderRadius:8, padding:"8px 4px" }}>
                <p style={{ fontSize:11, color:"var(--text2)", marginBottom:2 }}>{l}</p>
                <p style={{ fontWeight:800, fontSize:17, color:c }}>{Math.round(v*10)/10}</p>
                <p style={{ fontSize:10, color:"var(--text3)" }}>г</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Приёмы пищи */}
      <div style={{ padding:"10px 16px 0", display:"flex", flexDirection:"column", gap:8 }}>
        {MEAL_TYPES.map(mt => {
          const meal = dayData[mt] || { items: [] };
          const macros = calcMealMacros(meal.items);
          const exp = expandedMeal[mt];
          const cfg = mealConfig[mt];
          return (
            <Card key={mt} style={{ overflow:"hidden" }}>
              <div
                style={{ display:"flex", alignItems:"center", padding:"13px 16px", cursor:"pointer", gap:12 }}
                onClick={() => setExpandedMeal(p=>({...p,[mt]:!p[mt]}))}
              >
                <div style={{ width:38, height:38, borderRadius:10, background:"var(--bg3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                  {cfg.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>{mt}</span>
                  <p style={{ color:"var(--text2)", fontSize:12, marginTop:1 }}>
                    {meal.items.length} продукт{meal.items.length === 1 ? "" : meal.items.length < 5 ? "а" : "ов"}
                  </p>
                </div>
                <Pill color={cfg.color}>{macros.calories} ккал</Pill>
                <span style={{ color:"var(--text3)", display:"flex" }}>{exp ? <Icons.ChevronUp/> : <Icons.ChevronDown/>}</span>
              </div>

              {exp && (
                <div style={{ borderTop:"1px solid var(--border)", background:"var(--bg3)" }}>
                  {meal.items.map((item, idx) => {
                    const cal = Math.round(item.grams * (item.calories ?? item.caloriesPer100g ?? 0) / 100);
                    const prot = Math.round(item.grams * (item.protein ?? 0) / 100 * 10) / 10;
                    const fat  = Math.round(item.grams * (item.fat ?? 0) / 100 * 10) / 10;
                    const carb = Math.round(item.grams * (item.carbs ?? 0) / 100 * 10) / 10;
                    return (
                      <div key={item.id} style={{ display:"flex", alignItems:"center", padding:"10px 16px", borderBottom:"1px solid var(--border)" }}>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:600, fontSize:13 }}>{item.name}</p>
                          <p style={{ color:"var(--text3)", fontSize:11, marginTop:2 }}>{item.grams}г · Б{prot} Ж{fat} У{carb}</p>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontWeight:700, fontSize:13, color:"var(--accent2)" }}>{cal}</span>
                          <button onClick={() => openEditItem(mt, idx)} style={{ background:"var(--card2)", border:"none", borderRadius:6, padding:"5px 7px", color:"var(--text2)", cursor:"pointer", display:"flex", lineHeight:0 }}><Icons.Edit/></button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ padding:"10px 16px" }}>
                    <Btn variant="ghost" small onClick={() => openAddItem(mt)} style={{ color:"var(--accent2)", padding:"6px 0" }}>
                      <Icons.Plus/> Добавить
                    </Btn>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Модал */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal?.itemIndex !== null ? "Редактировать" : "Добавить продукт"}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ position:"relative" }}>
            <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase" }}>Продукт</label>
            <input
              value={foodSearch}
              onChange={e => { setFoodSearch(e.target.value); setShowDropdown(true); if (!e.target.value) setSelectedFood(null); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Начните вводить название..."
            />
            {showDropdown && searchResults.length > 0 && (
              <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--r2)", zIndex:200, maxHeight:220, overflowY:"auto", marginTop:4, boxShadow:"0 8px 24px rgba(0,0,0,0.3)" }} className="scroll-hide">
                {searchResults.map(food => (
                  <div
                    key={food.name}
                    onClick={() => { setSelectedFood(food); setFoodSearch(food.name); setShowDropdown(false); }}
                    style={{ padding:"10px 14px", cursor:"pointer", borderBottom:"1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--card2)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <p style={{ fontWeight:600, fontSize:13 }}>{food.name}</p>
                    <p style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>
                      {food.calories} ккал · Б{food.protein} Ж{food.fat} У{food.carbs} /100г
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase" }}>Граммы</label>
            <input type="number" value={gramsInput} onChange={e=>setGramsInput(e.target.value)} placeholder="250" min="1"/>
          </div>

          {selectedFood && preview && (
            <div style={{ background:"var(--bg3)", borderRadius:"var(--r2)", padding:"12px", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
              {[["Ккал",preview.calories,"var(--accent2)"],["Белки",preview.protein+"г","var(--green)"],["Жиры",preview.fat+"г","var(--amber)"],["Угл.",preview.carbs+"г","var(--blue)"]].map(([l,v,c]) => (
                <div key={l} style={{ textAlign:"center", background:"var(--card)", borderRadius:8, padding:"8px 4px" }}>
                  <p style={{ fontSize:10, color:"var(--text3)", marginBottom:2 }}>{l}</p>
                  <p style={{ fontWeight:800, fontSize:14, color:c }}>{v}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:2 }}>
            {editModal?.itemIndex !== null && (
              <Btn variant="danger" small onClick={() => deleteItem(editModal.mealType, editModal.itemIndex)}><Icons.Trash/></Btn>
            )}
            <Btn onClick={saveItem} style={{ flex:1, justifyContent:"center" }} disabled={!selectedFood || !gramsInput}>
              Сохранить
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── СТРАНИЦА: ТРЕНИРОВКИ ─────────────────────────────────────────────────────

function WorkoutsPage({ workouts, setWorkouts }) {
  const [activeDay, setActiveDay] = useState(todayWeekdayKey());
  const [editModal, setEditModal] = useState(null);
  const [workoutForm, setWorkoutForm] = useState({ name:"", notes:"", exercises:[] });
  const [exForm, setExForm] = useState({ name:"", sets:"", reps:"" });

  const dayName = WEEKDAYS_FULL[activeDay];
  const workout = workouts[dayName];

  function openEdit() {
    setWorkoutForm(workout ? JSON.parse(JSON.stringify(workout)) : { name:"", notes:"", exercises:[] });
    setEditModal(dayName);
  }
  function saveWorkout() {
    setWorkouts(p => ({ ...p, [editModal]: workoutForm.name ? workoutForm : null }));
    setEditModal(null);
  }
  function addEx() {
    if (!exForm.name) return;
    setWorkoutForm(p => ({ ...p, exercises: [...p.exercises, { id:uid(), ...exForm, sets:parseInt(exForm.sets)||3, reps:parseInt(exForm.reps)||10 }] }));
    setExForm({ name:"", sets:"", reps:"" });
  }
  function removeEx(id) { setWorkoutForm(p => ({...p, exercises: p.exercises.filter(e=>e.id!==id)})); }

  const totalExercises = WEEKDAYS_FULL.reduce((n,d) => n + (workouts[d]?.exercises?.length || 0), 0);
  const trainingDays   = WEEKDAYS_FULL.filter(d => workouts[d]).length;

  return (
    <div style={{ padding:"0 0 calc(var(--nav-h) + 20px)" }}>
      <PageHeader subtitle="Недельный план" title="Тренировки" />

      {/* Статы */}
      <div style={{ padding:"16px 16px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Card style={{ padding:"13px 16px" }}>
          <p style={{ color:"var(--text3)", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4 }}>Тренировок</p>
          <p style={{ fontWeight:800, fontSize:24 }}>{trainingDays}<span style={{ color:"var(--text3)", fontSize:14, fontWeight:400 }}>/нед</span></p>
        </Card>
        <Card style={{ padding:"13px 16px" }}>
          <p style={{ color:"var(--text3)", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4 }}>Упражнений</p>
          <p style={{ fontWeight:800, fontSize:24 }}>{totalExercises}<span style={{ color:"var(--text3)", fontSize:14, fontWeight:400 }}>/нед</span></p>
        </Card>
      </div>

      <DayTabs active={activeDay} onChange={setActiveDay} />

      {/* Текущий день */}
      <div style={{ padding:"12px 16px 0" }}>
        {workout ? (
          <Card style={{ overflow:"hidden" }}>
            <div style={{ padding:"16px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <Pill color="accent">Тренировка</Pill>
                  <h2 style={{ fontWeight:800, fontSize:19, marginTop:8, letterSpacing:"-0.3px" }}>{workout.name}</h2>
                  {workout.notes && <p style={{ color:"var(--text2)", fontSize:13, marginTop:4 }}>{workout.notes}</p>}
                </div>
                <Btn variant="secondary" small onClick={openEdit}><Icons.Edit/></Btn>
              </div>
              <p style={{ color:"var(--text3)", fontSize:12, marginTop:8, fontWeight:600 }}>
                {workout.exercises.length} УПРАЖНЕНИЙ
              </p>
            </div>

            <div style={{ borderTop:"1px solid var(--border)" }}>
              {workout.exercises.map((ex, i) => (
                <div key={ex.id} style={{ display:"flex", alignItems:"center", padding:"11px 16px", borderBottom: i<workout.exercises.length-1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:"var(--accent-bg)", display:"flex", alignItems:"center", justifyContent:"center", marginRight:12, fontSize:12, fontWeight:800, color:"var(--accent2)", flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:14 }}>{ex.name}</p>
                    <p style={{ color:"var(--text2)", fontSize:12 }}>{ex.sets} подх. × {ex.reps} повт.</p>
                  </div>
                  <span style={{ fontWeight:700, fontSize:13, color:"var(--text3)" }}>{ex.sets}×{ex.reps}</span>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card style={{ padding:"36px 20px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🛋️</div>
            <p style={{ fontWeight:700, fontSize:16 }}>День отдыха</p>
            <p style={{ color:"var(--text2)", fontSize:13, marginTop:4, marginBottom:18 }}>{WEEKDAYS_FULL[activeDay]}</p>
            <Btn onClick={openEdit}><Icons.Plus/> Добавить тренировку</Btn>
          </Card>
        )}
      </div>

      {/* Обзор недели */}
      <div style={{ padding:"20px 16px 0" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"var(--text3)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10 }}>Неделя</p>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }} className="stagger">
          {WEEKDAYS.map((d,i) => {
            const w = workouts[WEEKDAYS_FULL[i]];
            const isActive = activeDay === i;
            const isToday  = i === todayWeekdayKey();
            return (
              <div
                key={i}
                onClick={() => setActiveDay(i)}
                style={{
                  display:"flex", alignItems:"center", padding:"11px 14px",
                  background: isActive ? "var(--accent-bg)" : "var(--card)",
                  borderRadius:"var(--r)",
                  border:`1px solid ${isActive ? "rgba(91,141,238,0.3)" : "var(--border)"}`,
                  cursor:"pointer", transition:"all 0.15s",
                }}
              >
                <span style={{ minWidth:28, fontWeight:700, fontSize:13, color: isActive ? "var(--accent2)" : isToday ? "var(--accent2)" : "var(--text3)" }}>{d}</span>
                {w ? (
                  <>
                    <span style={{ flex:1, fontWeight:600, fontSize:14 }}>{w.name}</span>
                    <Pill color="accent">{w.exercises.length} упр.</Pill>
                  </>
                ) : (
                  <span style={{ color:"var(--text3)", fontSize:13 }}>Отдых</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Модал */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`${editModal} — тренировка`}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase" }}>Название</label>
            <input value={workoutForm.name} onChange={e=>setWorkoutForm(p=>({...p,name:e.target.value}))} placeholder="Грудь + Трицепс"/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase" }}>Заметки</label>
            <input value={workoutForm.notes} onChange={e=>setWorkoutForm(p=>({...p,notes:e.target.value}))} placeholder="Необязательно"/>
          </div>

          <div style={{ borderTop:"1px solid var(--border)", paddingTop:14 }}>
            <p style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>Упражнения</p>
            {workoutForm.exercises.map((ex) => (
              <div key={ex.id} style={{ display:"flex", alignItems:"center", padding:"9px 12px", background:"var(--bg3)", borderRadius:"var(--r2)", marginBottom:6, gap:8 }}>
                <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{ex.name}</span>
                <span style={{ color:"var(--text2)", fontSize:13, fontWeight:600 }}>{ex.sets}×{ex.reps}</span>
                <button onClick={() => removeEx(ex.id)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", display:"flex", lineHeight:0 }}><Icons.X/></button>
              </div>
            ))}

            <div style={{ background:"var(--bg3)", borderRadius:"var(--r)", padding:"12px", display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
              <p style={{ fontSize:12, color:"var(--text2)", fontWeight:700, textTransform:"uppercase" }}>Новое упражнение</p>
              <input value={exForm.name} onChange={e=>setExForm(p=>({...p,name:e.target.value}))} placeholder="Жим лёжа"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <input type="number" value={exForm.sets} onChange={e=>setExForm(p=>({...p,sets:e.target.value}))} placeholder="4 подхода"/>
                <input type="number" value={exForm.reps} onChange={e=>setExForm(p=>({...p,reps:e.target.value}))} placeholder="10 повт."/>
              </div>
              <Btn variant="secondary" small onClick={addEx}><Icons.Plus/> Добавить</Btn>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            {workout && (
              <Btn variant="danger" small onClick={() => { setWorkouts(p=>({...p,[editModal]:null})); setEditModal(null); }}>
                <Icons.Trash/>
              </Btn>
            )}
            <Btn onClick={saveWorkout} style={{ flex:1, justifyContent:"center" }}>Сохранить</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── СТРАНИЦА: ВЕС ────────────────────────────────────────────────────────────

function WeightPage({ weightHistory, setWeightHistory }) {
  const [weightInput, setWeightInput] = useState("");
  const [filter, setFilter] = useState("30");
  const todayKey = today();
  const sorted = [...weightHistory].sort((a,b) => a.date.localeCompare(b.date));
  const todayEntry = weightHistory.find(e => e.date === todayKey);

  const last = sorted.length ? sorted[sorted.length-1] : null;
  const prev = sorted.length > 1 ? sorted[sorted.length-2] : null;
  const diff = last && prev ? parseFloat((last.weight - prev.weight).toFixed(1)) : null;

  function saveWeight() {
    const w = parseFloat(weightInput);
    if (!w || w < 20 || w > 400) return;
    setWeightHistory(prev => {
      const filtered = prev.filter(e => e.date !== todayKey);
      return [...filtered, { id:uid(), date:todayKey, weight:w }].sort((a,b)=>a.date.localeCompare(b.date));
    });
    setWeightInput("");
  }
  function deleteEntry(id) { setWeightHistory(p => p.filter(e=>e.id!==id)); }

  const now = new Date();
  const filtered = sorted.filter(e => {
    const d = new Date(e.date);
    const days = (now-d)/(1000*60*60*24);
    if (filter==="7") return days<=7;
    if (filter==="30") return days<=30;
    return true;
  });

  const chartW=320, chartH=160, padX=40, padY=16;
  const innerW=chartW-padX*2, innerH=chartH-padY*2;
  let path="", points=[];
  if (filtered.length > 1) {
    const min=Math.min(...filtered.map(e=>e.weight))-0.5;
    const max=Math.max(...filtered.map(e=>e.weight))+0.5;
    const range=max-min||1;
    const dates=filtered.map(e=>new Date(e.date).getTime());
    const minD=Math.min(...dates), maxD=Math.max(...dates);
    const dateRange=maxD-minD||1;
    points=filtered.map(e=>{
      const x=padX+((new Date(e.date).getTime()-minD)/dateRange)*innerW;
      const y=padY+innerH-((e.weight-min)/range)*innerH;
      return {x,y,w:e.weight,date:e.date};
    });
    path=points.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }

  const trendLabel = diff===null ? "—" : diff<-0.1 ? "Снижение ↓" : diff>0.1 ? "Набор ↑" : "Стабильно →";
  const trendColor = diff===null ? "var(--text2)" : diff<-0.1 ? "var(--green)" : diff>0.1 ? "var(--red)" : "var(--amber)";

  return (
    <div style={{ padding:"0 0 calc(var(--nav-h) + 20px)" }}>
      <PageHeader subtitle="История и прогресс" title="Вес" />

      {/* Карточки */}
      <div style={{ padding:"16px 16px 0", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }} className="stagger">
        <Card style={{ padding:"12px 14px", textAlign:"center" }}>
          <p style={{ color:"var(--text3)", fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Текущий</p>
          <p style={{ fontWeight:800, fontSize:22 }}>{last?.weight || "—"}</p>
          <p style={{ color:"var(--text3)", fontSize:12 }}>кг</p>
        </Card>
        <Card style={{ padding:"12px 14px", textAlign:"center" }}>
          <p style={{ color:"var(--text3)", fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Изменение</p>
          <p style={{ fontWeight:800, fontSize:22, color: diff===null?"var(--text)":diff<0?"var(--green)":diff>0?"var(--red)":"var(--amber)" }}>
            {diff===null ? "—" : (diff>0?"+":"")+diff}
          </p>
          <p style={{ color:"var(--text3)", fontSize:12 }}>кг</p>
        </Card>
        <Card style={{ padding:"12px 14px", textAlign:"center" }}>
          <p style={{ color:"var(--text3)", fontSize:10, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>Тренд</p>
          <p style={{ fontWeight:700, fontSize:13, color:trendColor, marginTop:6 }}>{trendLabel}</p>
        </Card>
      </div>

      {/* Ввод */}
      <div style={{ padding:"10px 16px 0" }}>
        <Card style={{ padding:"16px" }}>
          <p style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>
            {todayEntry ? "✏️ Обновить вес" : "➕ Записать вес"}
          </p>
          {todayEntry && (
            <p style={{ color:"var(--text2)", fontSize:13, marginBottom:10 }}>
              Сегодня: <strong style={{ color:"var(--text)" }}>{todayEntry.weight} кг</strong>
            </p>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <input
              type="number" value={weightInput}
              onChange={e=>setWeightInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&saveWeight()}
              placeholder="95.4" style={{ flex:1 }} step="0.1" min="20" max="400"
            />
            <Btn onClick={saveWeight} style={{ flexShrink:0 }}>Сохранить</Btn>
          </div>
        </Card>
      </div>

      {/* График */}
      {filtered.length > 1 && (
        <div style={{ padding:"10px 16px 0" }}>
          <Card style={{ padding:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <p style={{ fontWeight:700, fontSize:14 }}>График</p>
              <div style={{ display:"flex", gap:4 }}>
                {[["7","7д"],["30","30д"],["all","Всё"]].map(([v,l]) => (
                  <button
                    key={v} onClick={()=>setFilter(v)}
                    style={{ background:filter===v?"var(--accent)":"var(--bg3)", border:"none", borderRadius:6, padding:"4px 10px", color:filter===v?"#fff":"var(--text2)", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"var(--font)" }}
                  >{l}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX:"auto" }} className="scroll-hide">
              <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{ display:"block", margin:"0 auto" }}>
                {[0,1,2,3,4].map(i=>(
                  <line key={i} x1={padX} x2={chartW-padX} y1={padY+(innerH/4)*i} y2={padY+(innerH/4)*i} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                ))}
                {points.length > 1 && (
                  <path d={`${path} L${points[points.length-1].x},${padY+innerH} L${points[0].x},${padY+innerH} Z`} fill="rgba(91,141,238,0.07)"/>
                )}
                <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {points.map((p,i)=>(
                  <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--accent)" stroke="var(--card)" strokeWidth="2"/>
                ))}
              </svg>
            </div>
          </Card>
        </div>
      )}

      {/* История */}
      <div style={{ padding:"10px 16px 0" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"var(--text3)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10 }}>История</p>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }} className="stagger">
          {[...sorted].reverse().map(e => (
            <Card key={e.id} style={{ display:"flex", alignItems:"center", padding:"12px 16px" }}>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, fontSize:13 }}>{new Date(e.date).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})}</p>
                {e.date === todayKey && <Pill color="accent" style={{ marginTop:2 }}>Сегодня</Pill>}
              </div>
              <span style={{ fontWeight:800, fontSize:18, marginRight:12 }}>{e.weight} кг</span>
              <button onClick={()=>deleteEntry(e.id)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", display:"flex", lineHeight:0 }}><Icons.Trash/></button>
            </Card>
          ))}
          {sorted.length === 0 && (
            <div style={{ textAlign:"center", padding:"36px 20px", color:"var(--text3)" }}>
              <p style={{ fontSize:28, marginBottom:8 }}>📊</p>
              <p style={{ fontWeight:600 }}>Нет записей</p>
              <p style={{ fontSize:13, marginTop:4 }}>Добавьте первую запись веса</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── СТРАНИЦА: НАСТРОЙКИ ──────────────────────────────────────────────────────

function SettingsPage({ routine, setRoutine, theme, setTheme, weightHistory, nutrition, workouts, goals, setGoals }) {
  const [addModal, setAddModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title:"", time:"08:00", type:"generic", mealType:"Завтрак", notes:"" });
  const [confirmReset, setConfirmReset] = useState(false);

  function openAdd() { setForm({ title:"", time:"08:00", type:"generic", mealType:"Завтрак", notes:"" }); setEditTask(null); setAddModal(true); }
  function openEdit(task) { setForm({...task}); setEditTask(task.id); setAddModal(true); }
  function saveTask() {
    if (!form.title && form.type==="generic") return;
    if (editTask) setRoutine(p => p.map(t => t.id===editTask ? {...t,...form} : t));
    else setRoutine(p => [...p, { ...form, id:uid() }]);
    setAddModal(false);
  }
  function deleteTask(id) { setRoutine(p=>p.filter(t=>t.id!==id)); }

  function exportData() {
    const data = { weightHistory, nutrition, workouts, routine, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data,null,2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="fitness-backup.json"; a.click();
  }

  const sorted = [...routine].sort((a,b)=>a.time.localeCompare(b.time));
  const typeColor = { generic:"blue", meal:"green", workout:"accent" };
  const typeLabel = { generic:"Задача", meal:"Питание", workout:"Тренировка" };

  const sections = [
    {
      title: "Расписание",
      action: <Btn small onClick={openAdd}><Icons.Plus/> Добавить</Btn>,
      content: (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }} className="stagger">
          {sorted.map(task => (
            <Card key={task.id} style={{ display:"flex", alignItems:"center", padding:"11px 14px" }}>
              <span style={{ minWidth:44, fontSize:12, fontWeight:700, color:"var(--accent2)" }}>{task.time}</span>
              <div style={{ flex:1, marginLeft:8 }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{task.title || (task.type==="meal" ? task.mealType : "Тренировка")}</span>
                <div style={{ marginTop:3 }}><Pill color={typeColor[task.type]}>{typeLabel[task.type]}</Pill></div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>openEdit(task)} style={{ background:"var(--card2)", border:"none", borderRadius:6, padding:"5px 7px", color:"var(--text2)", cursor:"pointer", display:"flex" }}><Icons.Edit/></button>
                <button onClick={()=>deleteTask(task.id)} style={{ background:"var(--red-bg)", border:"none", borderRadius:6, padding:"5px 7px", color:"var(--red)", cursor:"pointer", display:"flex" }}><Icons.Trash/></button>
              </div>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding:"0 0 calc(var(--nav-h) + 20px)" }}>
      <PageHeader title="Настройки" />

      {/* Расписание */}
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <p style={{ fontWeight:700, fontSize:15 }}>Расписание</p>
          <Btn small onClick={openAdd}><Icons.Plus/> Добавить</Btn>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }} className="stagger">
          {sorted.map(task => (
            <Card key={task.id} style={{ display:"flex", alignItems:"center", padding:"11px 14px" }}>
              <span style={{ minWidth:44, fontSize:12, fontWeight:700, color:"var(--accent2)" }}>{task.time}</span>
              <div style={{ flex:1, marginLeft:8 }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{task.title || (task.type==="meal" ? task.mealType : "Тренировка")}</span>
                <div style={{ marginTop:3 }}><Pill color={typeColor[task.type]}>{typeLabel[task.type]}</Pill></div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>openEdit(task)} style={{ background:"var(--card2)", border:"none", borderRadius:6, padding:"5px 7px", color:"var(--text2)", cursor:"pointer", display:"flex", lineHeight:0 }}><Icons.Edit/></button>
                <button onClick={()=>deleteTask(task.id)} style={{ background:"var(--red-bg)", border:"none", borderRadius:6, padding:"5px 7px", color:"var(--red)", cursor:"pointer", display:"flex", lineHeight:0 }}><Icons.Trash/></button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Тема */}
      <div style={{ padding:"24px 16px 0" }}>
        <p style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Тема</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {[["dark","🌙","Тёмная"],["light","☀️","Светлая"],["system","💻","Системная"]].map(([v,em,l]) => (
            <button
              key={v} onClick={()=>setTheme(v)}
              style={{
                background:theme===v?"var(--accent)":"var(--card)",
                border:theme===v?"none":"1px solid var(--border2)",
                borderRadius:10, padding:"12px 8px", cursor:"pointer",
                color:theme===v?"#fff":"var(--text2)",
                fontFamily:"var(--font)", fontWeight:600, fontSize:13,
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                transition:"all 0.15s",
              }}
            >
              <span style={{ fontSize:20 }}>{em}</span>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Цели */}
      <div style={{ padding:"24px 16px 0" }}>
        <p style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Цели по питанию</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            ["calories","Калории","ккал/день","2000"],
            ["protein","Белки","г/день","150"],
            ["fat","Жиры","г/день","70"],
            ["carbs","Углеводы","г/день","250"],
          ].map(([key,label,unit,ph]) => (
            <Card key={key} style={{ padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, fontSize:13 }}>{label}</p>
                <p style={{ color:"var(--text3)", fontSize:12 }}>{unit}</p>
              </div>
              <input
                type="number"
                value={goals[key] || ""}
                onChange={e => setGoals(p => ({ ...p, [key]: parseInt(e.target.value)||0 }))}
                placeholder={ph}
                min="0"
                style={{ width:90, textAlign:"right" }}
              />
            </Card>
          ))}
        </div>
      </div>

      {/* Данные */}
      <div style={{ padding:"24px 16px 0" }}>
        <p style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Данные</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <Card style={{ padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontWeight:600, fontSize:14 }}>Экспорт JSON</p>
              <p style={{ color:"var(--text2)", fontSize:12, marginTop:1 }}>Резервная копия</p>
            </div>
            <Btn variant="secondary" small onClick={exportData}>Скачать</Btn>
          </Card>
          <div style={{ background:"var(--red-bg)", borderRadius:"var(--r)", padding:"14px 16px", border:"1px solid rgba(240,96,96,0.2)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontWeight:600, fontSize:14, color:"var(--red)" }}>Сбросить данные</p>
              <p style={{ color:"var(--text2)", fontSize:12, marginTop:1 }}>Удалить без восстановления</p>
            </div>
            <Btn variant="danger" small onClick={()=>setConfirmReset(true)}>Сброс</Btn>
          </div>
        </div>
      </div>

      {/* Подтверждение сброса */}
      <Modal open={confirmReset} onClose={()=>setConfirmReset(false)} title="⚠️ Сброс данных">
        <p style={{ color:"var(--text2)", marginBottom:20, lineHeight:1.6 }}>Все данные будут удалены безвозвратно. Вы уверены?</p>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="secondary" onClick={()=>setConfirmReset(false)} style={{ flex:1, justifyContent:"center" }}>Отмена</Btn>
          <Btn variant="danger" onClick={()=>{ localStorage.clear(); window.location.reload(); }} style={{ flex:1, justifyContent:"center" }}>Удалить всё</Btn>
        </div>
      </Modal>

      {/* Задача */}
      <Modal open={addModal} onClose={()=>setAddModal(false)} title={editTask?"Редактировать задачу":"Новая задача"}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase" }}>Тип</label>
            <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
              <option value="generic">📌 Задача</option>
              <option value="meal">🍽 Приём пищи</option>
              <option value="workout">💪 Тренировка</option>
            </select>
          </div>
          {form.type==="generic" && (
            <div>
              <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase" }}>Название</label>
              <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Выпить воду"/>
            </div>
          )}
          {form.type==="meal" && (
            <div>
              <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase" }}>Приём пищи</label>
              <select value={form.mealType} onChange={e=>setForm(p=>({...p,mealType:e.target.value,title:e.target.value}))}>
                {MEAL_TYPES.map(mt => <option key={mt}>{mt}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase" }}>Время</label>
            <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))}/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--text2)", display:"block", marginBottom:6, fontWeight:600, textTransform:"uppercase" }}>Заметки</label>
            <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Необязательно"/>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            {editTask && <Btn variant="danger" small onClick={()=>{ deleteTask(editTask); setAddModal(false); }}><Icons.Trash/></Btn>}
            <Btn onClick={saveTask} style={{ flex:1, justifyContent:"center" }}>Сохранить</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── НАВИГАЦИЯ ────────────────────────────────────────────────────────────────

const NAV = [
  { id:"today",     label:"Сегодня",    Icon: Icons.Home },
  { id:"nutrition", label:"Питание",    Icon: Icons.Food },
  { id:"workouts",  label:"Тренировки", Icon: Icons.Dumbbell },
  { id:"weight",    label:"Вес",        Icon: Icons.Scale },
  { id:"settings",  label:"Настройки",  Icon: Icons.Settings },
];

// ─── ПРИЛОЖЕНИЕ ───────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("today");
  const [theme, setTheme]                     = useLocalStorage("fitness_theme",       "dark");
  const [routine, setRoutine]                 = useLocalStorage("fitness_routine",     DEFAULT_ROUTINE);
  const [nutrition, setNutrition]             = useLocalStorage("fitness_nutrition",   DEFAULT_NUTRITION);
  const [workouts, setWorkouts]               = useLocalStorage("fitness_workouts",    DEFAULT_WORKOUTS);
  const [weightHistory, setWeightHistory]     = useLocalStorage("fitness_weight",      []);
  const [completions, setCompletions]         = useLocalStorage("fitness_completions", {});
  const [goals, setGoals]                     = useLocalStorage("fitness_goals",       { calories:2000, protein:150, fat:70, carbs:250 });

  useEffect(() => { applyTheme(theme); }, [theme]);

  const pages = { today: TodayPage, nutrition: NutritionPage, workouts: WorkoutsPage, weight: WeightPage, settings: SettingsPage };
  const PageComp = pages[tab];

  return (
    <>
      <style>{css}</style>
      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", position:"relative", background:"var(--bg)" }}>
        {/* Контент */}
        <div style={{ overflowY:"auto", height:"100vh" }} className="scroll-hide">
          <PageComp
            key={tab}
            routine={routine}         setRoutine={setRoutine}
            nutrition={nutrition}     setNutrition={setNutrition}
            workouts={workouts}       setWorkouts={setWorkouts}
            weightHistory={weightHistory} setWeightHistory={setWeightHistory}
            completions={completions} setCompletions={setCompletions}
            theme={theme}             setTheme={setTheme}
            goals={goals}             setGoals={setGoals}
          />
        </div>

        {/* Нижняя навигация */}
        <nav style={{
          position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
          width:"100%", maxWidth:480,
          background:"var(--bg2)",
          borderTop:"1px solid var(--border)",
          display:"flex", zIndex:100,
          paddingBottom:"env(safe-area-inset-bottom,0)",
          backdropFilter:"blur(12px)",
        }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex:1, display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", gap:4, padding:"10px 4px 12px",
                  background:"none", border:"none",
                  color: active ? "var(--accent2)" : "var(--text3)",
                  cursor:"pointer", transition:"color 0.15s", position:"relative",
                  fontFamily:"var(--font)",
                }}
              >
                {active && (
                  <span style={{
                    position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
                    width:24, height:2.5, borderRadius:2, background:"var(--accent)",
                  }}/>
                )}
                <span style={{ display:"flex", transform: active ? "scale(1.1)" : "scale(1)", transition:"transform 0.2s" }}>
                  <Icon/>
                </span>
                <span style={{ fontSize:10, fontWeight: active ? 700 : 500, lineHeight:1, letterSpacing:"0.02em" }}>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
