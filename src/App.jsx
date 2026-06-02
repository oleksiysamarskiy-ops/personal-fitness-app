import { useState, useEffect, useCallback, useMemo } from "react";
import { FOODS_DB } from "./foods.js";

// ─── УТИЛИТЫ ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];
const todayLabel = () => {
  const d = new Date();
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
};
const weekdayIndex = () => new Date().getDay(); // 0=Sun
const DAYS = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
const DAYS_FULL = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const WEEKDAYS_FULL = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
const MEAL_TYPES = ["Завтрак","Обед","Перекус","Ужин"];

function todayWeekdayKey() {
  const d = new Date().getDay();
  const map = [6,0,1,2,3,4,5]; // Sun=6, Mon=0...
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

// Считает калории приёма пищи (поддерживает новый и старый формат)
function calcMealCal(items) {
  return Math.round(items.reduce((s, i) => {
    if (i.calories !== undefined) return s + (i.grams * i.calories / 100);
    return s + (i.grams * (i.caloriesPer100g || 0) / 100); // backward compat
  }, 0));
}

// Считает БЖУ + калории приёма пищи
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

// ─── ИКОНКИ (inline SVG) ──────────────────────────────────────────────────────

const Icons = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Food: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  Dumbbell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M5 3v18"/><path d="M19 3v18"/><path d="M3 5v14"/><path d="M21 5v14"/></svg>,
  Scale: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z"/><path d="M12 8v4l3 3"/></svg>,
  Settings: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{width:18,height:18}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="18 15 12 9 6 15"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:15,height:15}}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  TrendUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Minus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{width:16,height:16}}><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{width:16,height:16}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Flame: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>,
  Droplet: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
};

// ─── СТИЛИ ────────────────────────────────────────────────────────────────────

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f0f13;
    --bg2: #17171d;
    --bg3: #1e1e26;
    --card: #1a1a22;
    --card2: #22222c;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --text: #f0f0f5;
    --text2: #9090a8;
    --text3: #55556a;
    --accent: #7c6af5;
    --accent2: #a096ff;
    --accent-bg: rgba(124,106,245,0.15);
    --green: #34d399;
    --green-bg: rgba(52,211,153,0.12);
    --red: #f87171;
    --red-bg: rgba(248,113,113,0.12);
    --amber: #fbbf24;
    --amber-bg: rgba(251,191,36,0.12);
    --blue: #60a5fa;
    --blue-bg: rgba(96,165,250,0.12);
    --radius: 14px;
    --radius-sm: 8px;
    --font: 'DM Sans', sans-serif;
  }
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  body, #root { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 15px; min-height: 100vh; }
  button { cursor: pointer; font-family: var(--font); }
  input, textarea, select { font-family: var(--font); background: var(--bg3); border: 1px solid var(--border2); color: var(--text); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 14px; width: 100%; outline: none; }
  input:focus, textarea:focus, select:focus { border-color: var(--accent); }
  select option { background: var(--bg2); }
  .scroll-hide::-webkit-scrollbar { display: none; }
  .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.25s ease; }
  .slide-up { animation: slideUp 0.3s ease; }
  @keyframes checkPop { 0% { transform: scale(0.5); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
  .check-pop { animation: checkPop 0.25s ease; }

  input[type="time"] {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    -webkit-appearance: none;
    appearance: none;
    height: 40px;
    padding: 0 12px;
    line-height: 40px;
    box-sizing: border-box;
  }
  input[type="time"]::-webkit-date-and-time-value { text-align: left; }

  @keyframes expandDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .expand-down { animation: expandDown 0.2s ease; }
`;

// ─── КОМПОНЕНТЫ ───────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000, padding:"0" }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="slide-up" style={{ background:"var(--bg2)", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", padding:"24px 20px 36px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <span style={{ fontWeight:600, fontSize:17 }}>{title}</span>
          <button onClick={onClose} style={{ background:"var(--card2)", border:"none", borderRadius:8, padding:"6px 8px", color:"var(--text2)", display:"flex" }}><Icons.X/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant="primary", style:s={}, small=false }) {
  const base = { border:"none", borderRadius: small ? 8 : 12, fontWeight:600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, transition:"all 0.15s", fontFamily:"var(--font)", fontSize: small ? 13 : 14, padding: small ? "7px 12px" : "12px 18px" };
  const variants = {
    primary: { background:"var(--accent)", color:"#fff" },
    secondary: { background:"var(--card2)", color:"var(--text2)", border:"1px solid var(--border2)" },
    ghost: { background:"transparent", color:"var(--text2)" },
    danger: { background:"var(--red-bg)", color:"var(--red)", border:"1px solid rgba(248,113,113,0.2)" },
    green: { background:"var(--green-bg)", color:"var(--green)", border:"1px solid rgba(52,211,153,0.2)" },
  };
  return <button style={{...base, ...variants[variant], ...s}} onClick={onClick}>{children}</button>;
}

function Tag({ color="accent", children }) {
  const map = { accent:["var(--accent-bg)","var(--accent2)"], green:["var(--green-bg)","var(--green)"], red:["var(--red-bg)","var(--red)"], amber:["var(--amber-bg)","var(--amber)"], blue:["var(--blue-bg)","var(--blue)"] };
  const [bg,col] = map[color]||map.accent;
  return <span style={{ background:bg, color:col, borderRadius:6, padding:"2px 8px", fontSize:12, fontWeight:500 }}>{children}</span>;
}

// ─── СТРАНИЦА: СЕГОДНЯ ────────────────────────────────────────────────────────

function TodayPage({ routine, weightHistory, nutrition, workouts, completions, setCompletions, goals, waterGoal, waterData, setWaterData }) {
  const [expanded, setExpanded] = useState({});
  const [customWater, setCustomWater] = useState("");
  const [showWaterLog, setShowWaterLog] = useState(false);
  const todayKey = today();
  const wdKey = todayWeekdayKey();
  const wdName = WEEKDAYS_FULL[wdKey];
  const todayNutrition = nutrition[wdName] || {};
  const todayWorkout = workouts[wdName] || null;
  const todayCompletions = completions[todayKey] || {};

  // Вода: данные текущего дня
  const todayWater = waterData[todayKey] || { total: 0, log: [] };
  function addWater(ml) {
    const time = new Date().toLocaleTimeString("ru-RU", { hour:"2-digit", minute:"2-digit" });
    setWaterData(prev => {
      const day = prev[todayKey] || { total: 0, log: [] };
      return { ...prev, [todayKey]: { total: day.total + ml, log: [...day.log, { time, amount: ml }] } };
    });
  }
  function removeLastWater() {
    setWaterData(prev => {
      const day = prev[todayKey];
      if (!day || !day.log.length) return prev;
      const newLog = day.log.slice(0, -1);
      const newTotal = newLog.reduce((s, e) => s + e.amount, 0);
      return { ...prev, [todayKey]: { total: newTotal, log: newLog } };
    });
  }
  function addCustomWater() {
    const ml = parseInt(customWater);
    if (!ml || ml <= 0 || ml > 5000) return;
    addWater(ml);
    setCustomWater("");
  }

  const sortedTasks = useMemo(() => [...routine].sort((a,b) => a.time.localeCompare(b.time)), [routine]);
  const completed = sortedTasks.filter(t => todayCompletions[t.id]).length;

  const lastWeight = weightHistory.length ? weightHistory[weightHistory.length-1] : null;
  const prevWeight = weightHistory.length > 1 ? weightHistory[weightHistory.length-2] : null;
  const diff = lastWeight && prevWeight ? (lastWeight.weight - prevWeight.weight).toFixed(1) : null;
  const trend = diff === null ? "—" : diff < -0.1 ? "Снижение" : diff > 0.1 ? "Набор" : "Поддержание";
  const trendColor = diff === null ? "accent" : diff < -0.1 ? "green" : diff > 0.1 ? "red" : "amber";

  // Только выполненные meal-задачи учитываются в калориях и БЖУ
  const completedMealTypes = useMemo(() => {
    const types = new Set();
    sortedTasks.forEach(task => {
      if (task.type === "meal" && todayCompletions[task.id]) {
        types.add(task.mealType);
      }
    });
    return types;
  }, [sortedTasks, todayCompletions]);

  const mealCals = MEAL_TYPES.reduce((acc, mt) => {
    acc[mt] = (completedMealTypes.has(mt) && todayNutrition[mt])
      ? calcMealCal(todayNutrition[mt].items)
      : 0;
    return acc;
  }, {});
  const totalCal = Object.values(mealCals).reduce((s,v)=>s+v,0);

  // Суммарные макронутриенты — только по выполненным приёмам пищи
  const totalMacros = MEAL_TYPES.reduce((acc, mt) => {
    if (!completedMealTypes.has(mt)) return acc;
    const m = todayNutrition[mt];
    if (!m) return acc;
    const macro = calcMealMacros(m.items);
    acc.protein += macro.protein;
    acc.fat     += macro.fat;
    acc.carbs   += macro.carbs;
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
  function toggleExpand(id) { setExpanded(p => ({...p,[id]:!p[id]})); }

  function taskContent(task) {
    if (task.type === "meal") {
      const meal = todayNutrition[task.mealType];
      const cal = meal ? calcMealCal(meal.items) : 0;
      return { subtitle: `${cal} ккал`, detail: meal?.items?.map(i => `${i.name} — ${i.grams}г (${Math.round(i.grams*(i.calories??i.caloriesPer100g??0)/100)} ккал)`).join("\n") || "Нет данных" };
    }
    if (task.type === "workout") {
      if (!todayWorkout) return { subtitle: "Выходной", detail: "Тренировка не запланирована" };
      return { subtitle: `${todayWorkout.name} · ${todayWorkout.exercises.length} упр.`, detail: todayWorkout.exercises.map(e => `${e.name} — ${e.sets}×${e.reps}`).join("\n") };
    }
    return { subtitle: task.notes||"", detail: task.notes||"" };
  }

  const mealEmojis = { "Завтрак":"🌅","Обед":"☀️","Перекус":"🍎","Ужин":"🌙" };

  // Прогресс-бар
  function MacroBar({ label, current, goal, color }) {
    const pct = goal > 0 ? Math.min(100, Math.round(current / goal * 100)) : 0;
    const colors = { green: "var(--green)", accent: "var(--accent)", amber: "var(--amber)", blue: "var(--blue)" };
    return (
      <div style={{ flex: 1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:11, color:"var(--text2)", fontWeight:500 }}>{label}</span>
          <span style={{ fontSize:11, fontWeight:600 }}>{current}{goal > 0 ? <span style={{color:"var(--text3)"}}>/{goal}</span> : ""} г</span>
        </div>
        <div style={{ background:"var(--bg3)", borderRadius:4, height:5, overflow:"hidden" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:colors[color]||colors.accent, borderRadius:4, transition:"width 0.4s ease" }}/>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding:"0 0 100px" }}>
      {/* Шапка */}
      <div style={{ padding:"20px 20px 0" }}>
        <p style={{ color:"var(--text3)", fontSize:13 }}>{todayLabel()}</p>
        <h1 style={{ fontSize:24, fontWeight:700, marginTop:2 }}>Сегодня</h1>
      </div>

      {/* Виджеты сверху */}
      <div style={{ padding:"12px 20px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {/* Вес */}
        <div style={{ background:"var(--card)", borderRadius:"var(--radius)", padding:"11px 14px", border:"1px solid var(--border)" }}>
          <p style={{ color:"var(--text2)", fontSize:11, fontWeight:500, marginBottom:2 }}>ВЕС</p>
          <p style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.5px", lineHeight:1.2 }}>{lastWeight ? `${lastWeight.weight}` : "—"}<span style={{ fontSize:13, color:"var(--text2)", fontWeight:400 }}> кг</span></p>
          {diff !== null && (
            <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:3 }}>
              {diff < 0 ? <span style={{color:"var(--green)",display:"flex"}}><Icons.TrendDown/></span> : diff > 0 ? <span style={{color:"var(--red)",display:"flex"}}><Icons.TrendUp/></span> : <span style={{color:"var(--amber)",display:"flex"}}><Icons.Minus/></span>}
              <span style={{ fontSize:12, color: diff < 0 ? "var(--green)" : diff > 0 ? "var(--red)" : "var(--amber)", fontWeight:600 }}>{diff > 0 ? "+" : ""}{diff} кг</span>
            </div>
          )}
          {diff === null && <div style={{ marginTop:3 }}><Tag color={trendColor}>{trend}</Tag></div>}
          {diff !== null && <div style={{ marginTop:3 }}><Tag color={trendColor}>{trend}</Tag></div>}
        </div>

        {/* Прогресс задач */}
        <div style={{ background:"var(--card)", borderRadius:"var(--radius)", padding:"11px 14px", border:"1px solid var(--border)" }}>
          <p style={{ color:"var(--text2)", fontSize:11, fontWeight:500, marginBottom:2 }}>ЗАДАЧИ</p>
          <p style={{ fontSize:22, fontWeight:700, lineHeight:1.2 }}>{completed}<span style={{ color:"var(--text3)", fontWeight:400 }}>/{sortedTasks.length}</span></p>
          <div style={{ marginTop:6, background:"var(--bg3)", borderRadius:4, height:4, overflow:"hidden" }}>
            <div style={{ width:`${sortedTasks.length ? Math.round(completed/sortedTasks.length*100) : 0}%`, height:"100%", background:"var(--accent)", borderRadius:4, transition:"width 0.4s ease" }}/>
          </div>
          <p style={{ color:"var(--text2)", fontSize:11, marginTop:4 }}>{sortedTasks.length ? Math.round(completed/sortedTasks.length*100) : 0}% выполнено</p>
        </div>
      </div>

      {/* Калории + БЖУ */}
      <div style={{ margin:"12px 20px 0", background:"var(--card)", borderRadius:"var(--radius)", padding:"14px 16px", border:"1px solid var(--border)" }}>
        {/* Заголовок с калориями */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <p style={{ color:"var(--text2)", fontSize:12, fontWeight:500 }}>СЪЕДЕНО СЕГОДНЯ</p>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Icons.Flame/>
            <span style={{ fontWeight:700, fontSize:18 }}>{totalCal}</span>
            {goals.calories > 0 && <span style={{ color:"var(--text2)", fontSize:13 }}>/ {goals.calories} ккал</span>}
            {!goals.calories && <span style={{ color:"var(--text2)", fontSize:13 }}>ккал</span>}
          </div>
        </div>
        {/* Прогресс калорий */}
        {goals.calories > 0 && (
          <div style={{ background:"var(--bg3)", borderRadius:4, height:5, overflow:"hidden", marginBottom:12 }}>
            <div style={{ width:`${Math.min(100, Math.round(totalCal/goals.calories*100))}%`, height:"100%", background: totalCal > goals.calories ? "var(--red)" : "var(--accent)", borderRadius:4, transition:"width 0.4s ease" }}/>
          </div>
        )}
        {/* По приёмам */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
          {MEAL_TYPES.map(mt => (
            <div key={mt} style={{ textAlign:"center" }}>
              <p style={{ fontSize:11, color:"var(--text3)" }}>{mealEmojis[mt]} {mt}</p>
              <p style={{ fontWeight:600, fontSize:14 }}>{mealCals[mt]}</p>
            </div>
          ))}
        </div>
        {/* БЖУ */}
        <div style={{ borderTop:"1px solid var(--border)", paddingTop:12, display:"flex", flexDirection:"column", gap:10 }}>
          <MacroBar label="Белки" current={totalMacros.protein} goal={goals.protein} color="green"/>
          <MacroBar label="Жиры"  current={totalMacros.fat}     goal={goals.fat}     color="amber"/>
          <MacroBar label="Углеводы" current={totalMacros.carbs} goal={goals.carbs}  color="blue"/>
        </div>
        {/* Цифры БЖУ крупно */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:12 }}>
          {[["Б", totalMacros.protein, "var(--green)"], ["Ж", totalMacros.fat, "var(--amber)"], ["У", totalMacros.carbs, "var(--blue)"]].map(([l,v,c]) => (
            <div key={l} style={{ textAlign:"center", background:"var(--bg3)", borderRadius:8, padding:"8px 4px" }}>
              <p style={{ fontSize:11, color:"var(--text2)", marginBottom:2 }}>{l}</p>
              <p style={{ fontWeight:700, fontSize:18, color:c }}>{v}</p>
              <p style={{ fontSize:10, color:"var(--text3)" }}>г</p>
            </div>
          ))}
        </div>
      </div>

      {/* Тренировка */}
      {todayWorkout && (
        <div style={{ margin:"12px 20px 0", background:"var(--card)", borderRadius:"var(--radius)", padding:"14px 16px", border:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ background:"var(--accent-bg)", borderRadius:10, padding:"8px", display:"flex" }}><Icons.Dumbbell/></div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600 }}>{todayWorkout.name}</p>
              <p style={{ color:"var(--text2)", fontSize:13 }}>{todayWorkout.exercises.length} упражнений</p>
            </div>
            <Tag color="accent">Сегодня</Tag>
          </div>
        </div>
      )}

      {/* Вода */}
      <div style={{ margin:"12px 20px 0", background:"var(--card)", borderRadius:"var(--radius)", padding:"14px 16px", border:"1px solid var(--border)" }}>
        {/* Заголовок */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:"var(--blue)", display:"flex" }}><Icons.Droplet/></span>
            <p style={{ color:"var(--text2)", fontSize:12, fontWeight:500 }}>ВОДА СЕГОДНЯ</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontWeight:700, fontSize:16, color:"var(--blue)" }}>{todayWater.total}</span>
            <span style={{ color:"var(--text3)", fontSize:13 }}>/ {waterGoal} мл</span>
          </div>
        </div>
        {/* Прогресс-бар */}
        <div style={{ background:"var(--bg3)", borderRadius:6, height:8, overflow:"hidden", marginBottom:12 }}>
          <div style={{ width:`${waterGoal > 0 ? Math.min(100, Math.round(todayWater.total / waterGoal * 100)) : 0}%`, height:"100%", background:"var(--blue)", borderRadius:6, transition:"width 0.4s ease" }}/>
        </div>
        {/* Кнопки добавления */}
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          {[250, 500].map(ml => (
            <button key={ml} onClick={() => addWater(ml)} style={{ flex:1, background:"var(--blue-bg)", border:"1px solid rgba(96,165,250,0.25)", borderRadius:10, padding:"9px 0", color:"var(--blue)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"var(--font)" }}>
              +{ml} мл
            </button>
          ))}
          <div style={{ flex:1, display:"flex", gap:6 }}>
            <input
              type="number"
              value={customWater}
              onChange={e => setCustomWater(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCustomWater()}
              placeholder="мл"
              style={{ flex:1, padding:"9px 10px", fontSize:14, borderRadius:10, border:"1px solid var(--border2)", background:"var(--bg3)", color:"var(--text)", width:0 }}
            />
            <button onClick={addCustomWater} style={{ background:"var(--blue-bg)", border:"1px solid rgba(96,165,250,0.25)", borderRadius:10, padding:"9px 12px", color:"var(--blue)", fontWeight:700, cursor:"pointer", fontFamily:"var(--font)", fontSize:14 }}>+</button>
          </div>
        </div>
        {/* Лог и кнопка удалить последнее */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => setShowWaterLog(p => !p)} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:12, cursor:"pointer", fontFamily:"var(--font)", display:"flex", alignItems:"center", gap:4 }}>
            {showWaterLog ? <Icons.ChevronUp/> : <Icons.ChevronDown/>}
            {todayWater.log.length} записей
          </button>
          {todayWater.log.length > 0 && (
            <button onClick={removeLastWater} style={{ background:"var(--red-bg)", border:"none", borderRadius:6, padding:"4px 10px", color:"var(--red)", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"var(--font)" }}>
              ← Отменить
            </button>
          )}
        </div>
        {showWaterLog && todayWater.log.length > 0 && (
          <div className="fade-in" style={{ borderTop:"1px solid var(--border)", marginTop:10, paddingTop:10, display:"flex", flexDirection:"column", gap:4 }}>
            {[...todayWater.log].reverse().map((entry, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                <span style={{ color:"var(--text3)" }}>{entry.time}</span>
                <span style={{ color:"var(--blue)", fontWeight:600 }}>+{entry.amount} мл</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Таймлайн */}
      <div style={{ padding:"20px 20px 0" }}>
        <h2 style={{ fontWeight:600, fontSize:16, marginBottom:14, color:"var(--text2)" }}>РАСПИСАНИЕ</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {sortedTasks.map((task, i) => {
            const done = todayCompletions[task.id];
            const exp = expanded[task.id];
            const { subtitle, detail } = taskContent(task);
            return (
              <div key={task.id} className="fade-in" style={{ background: done ? "rgba(52,211,153,0.07)" : "var(--card)", borderRadius:"var(--radius)", border:`1px solid ${done ? "rgba(52,211,153,0.2)" : "var(--border)"}`, overflow:"hidden", transition:"all 0.2s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px" }}>
                  <button onClick={() => toggleDone(task.id)} style={{ minWidth:26, height:26, borderRadius:8, border: done ? "none" : "2px solid var(--border2)", background: done ? "var(--green)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s", flexShrink:0 }}>
                    {done && <span className="check-pop" style={{color:"#000"}}><Icons.Check/></span>}
                  </button>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontWeight:600, fontSize:14, opacity: done ? 0.5 : 1 }}>{task.title}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:2 }}>
                      <span style={{ fontSize:12, color:"var(--text3)", fontWeight:600 }}>{task.time}</span>
                      {subtitle && <span style={{ fontSize:12, color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{subtitle}</span>}
                    </div>
                  </div>
                  {(task.type !== "generic" || detail) && (
                    <button onClick={() => toggleExpand(task.id)} style={{ background:"var(--bg3)", border:"none", borderRadius:6, padding:"4px 6px", color:"var(--text2)", display:"flex", cursor:"pointer" }}>
                      {exp ? <Icons.ChevronUp/> : <Icons.ChevronDown/>}
                    </button>
                  )}
                </div>
                {exp && detail && (
                  <div className="expand-down" style={{ borderTop:"1px solid var(--border)", padding:"10px 14px 12px", background:"var(--bg3)" }}>
                    {detail.split("\n").map((l,i) => <p key={i} style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7 }}>{l}</p>)}
                  </div>
                )}
              </div>
            );
          })}
          {sortedTasks.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--text3)" }}>
              <p style={{ fontSize:15 }}>Нет задач</p>
              <p style={{ fontSize:13, marginTop:6 }}>Настройте расписание в Настройках</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function NutritionPage({ nutrition, setNutrition }) {
  const [activeDay, setActiveDay] = useState(todayWeekdayKey());
  const [editModal, setEditModal] = useState(null); // { day, mealType, itemIndex? }
  const [foodSearch, setFoodSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [gramsInput, setGramsInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState({});

  const dayName = WEEKDAYS_FULL[activeDay];
  const dayData = nutrition[dayName] || {};

  // Поиск по базе продуктов
  const searchResults = useMemo(() => {
    if (!foodSearch.trim()) return [];
    const q = foodSearch.toLowerCase();
    return FOODS_DB.filter(f => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [foodSearch]);

  // Авторасчёт макросов при выборе продукта и вводе граммов
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
    setSelectedFood(null);
    setFoodSearch("");
    setGramsInput("");
    setShowDropdown(false);
    setEditModal({ day: dayName, mealType, itemIndex: null });
  }

  function openEditItem(mealType, idx) {
    const item = dayData[mealType].items[idx];
    // При редактировании показываем существующие данные
    const food = FOODS_DB.find(f => f.name === item.name) || {
      name: item.name,
      calories: item.calories ?? item.caloriesPer100g ?? 0,
      protein: item.protein ?? 0,
      fat: item.fat ?? 0,
      carbs: item.carbs ?? 0,
    };
    setSelectedFood(food);
    setFoodSearch(item.name);
    setGramsInput(String(item.grams));
    setShowDropdown(false);
    setEditModal({ day: dayName, mealType, itemIndex: idx });
  }

  function saveItem() {
    if (!selectedFood || !gramsInput) return;
    const g = parseFloat(gramsInput);
    if (!g || g <= 0) return;
    const k = g / 100;
    const newItem = {
      id: uid(),
      name:     selectedFood.name,
      grams:    g,
      calories: selectedFood.calories,
      protein:  selectedFood.protein,
      fat:      selectedFood.fat,
      carbs:    selectedFood.carbs,
      // backward compat
      caloriesPer100g: selectedFood.calories,
    };
    setNutrition(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[editModal.day]) updated[editModal.day] = {};
      if (!updated[editModal.day][editModal.mealType]) updated[editModal.day][editModal.mealType] = { items: [] };
      if (editModal.itemIndex !== null) {
        updated[editModal.day][editModal.mealType].items[editModal.itemIndex] = newItem;
      } else {
        updated[editModal.day][editModal.mealType].items.push(newItem);
      }
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

  const mealColors = { "Завтрак":"blue","Обед":"green","Перекус":"amber","Ужин":"accent" };
  const mealEmojis = { "Завтрак":"🌅","Обед":"☀️","Перекус":"🍎","Ужин":"🌙" };

  // Итого за день
  const dayTotals = useMemo(() => {
    return MEAL_TYPES.reduce((acc, mt) => {
      const m = dayData[mt];
      if (!m) return acc;
      const macro = calcMealMacros(m.items);
      acc.calories += macro.calories;
      acc.protein  += macro.protein;
      acc.fat      += macro.fat;
      acc.carbs    += macro.carbs;
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [dayData]);

  return (
    <div className="fade-in" style={{ padding:"0 0 100px" }}>
      <div style={{ padding:"20px 20px 0" }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Питание</h1>
        <p style={{ color:"var(--text2)", fontSize:14, marginTop:2 }}>Недельный план питания</p>
      </div>

      {/* Дни недели */}
      <div style={{ overflowX:"auto", padding:"14px 20px 0" }} className="scroll-hide">
        <div style={{ display:"flex", gap:8, width:"max-content" }}>
          {WEEKDAYS.map((d,i) => (
            <button key={i} onClick={() => setActiveDay(i)} style={{ background: activeDay===i ? "var(--accent)" : "var(--card)", border: activeDay===i ? "none" : "1px solid var(--border)", borderRadius:10, padding:"8px 14px", color: activeDay===i ? "#fff" : "var(--text2)", fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.15s", flexShrink:0, position:"relative" }}>
              {d}
              {i===todayWeekdayKey() && <span style={{ position:"absolute", top:3, right:3, width:5, height:5, borderRadius:"50%", background: activeDay===i ? "#fff" : "var(--accent)" }}/>}
            </button>
          ))}
        </div>
      </div>

      {/* Итого за день */}
      <div style={{ margin:"12px 20px 0", background:"var(--card)", borderRadius:12, padding:"14px 16px", border:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ color:"var(--text2)", fontSize:13, fontWeight:500 }}>{WEEKDAYS_FULL[activeDay]}</span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Icons.Flame/>
            <span style={{ fontWeight:700, fontSize:17 }}>{Math.round(dayTotals.calories)}</span>
            <span style={{ color:"var(--text2)", fontSize:13 }}>ккал</span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          {[["Белки", dayTotals.protein, "var(--green)"], ["Жиры", dayTotals.fat, "var(--amber)"], ["Углеводы", dayTotals.carbs, "var(--blue)"]].map(([l,v,c]) => (
            <div key={l} style={{ textAlign:"center", background:"var(--bg3)", borderRadius:8, padding:"8px 4px" }}>
              <p style={{ fontSize:11, color:"var(--text2)", marginBottom:2 }}>{l}</p>
              <p style={{ fontWeight:700, fontSize:16, color:c }}>{Math.round(v*10)/10}</p>
              <p style={{ fontSize:10, color:"var(--text3)" }}>г</p>
            </div>
          ))}
        </div>
      </div>

      {/* Приёмы пищи */}
      <div style={{ padding:"12px 20px 0", display:"flex", flexDirection:"column", gap:10 }}>
        {MEAL_TYPES.map(mt => {
          const meal = dayData[mt] || { items: [] };
          const macros = calcMealMacros(meal.items);
          const exp = expandedMeal[mt];
          return (
            <div key={mt} style={{ background:"var(--card)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", padding:"14px 16px", cursor:"pointer" }} onClick={() => setExpandedMeal(p=>({...p,[mt]:!p[mt]}))}>
                <span style={{ fontSize:20, marginRight:10 }}>{mealEmojis[mt]}</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:600, fontSize:15 }}>{mt}</span>
                  <p style={{ color:"var(--text2)", fontSize:12 }}>
                    {meal.items.length} прод. · Б:{Math.round(macros.protein*10)/10} Ж:{Math.round(macros.fat*10)/10} У:{Math.round(macros.carbs*10)/10}
                  </p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Tag color={mealColors[mt]}>{macros.calories} ккал</Tag>
                  {exp ? <Icons.ChevronUp/> : <Icons.ChevronDown/>}
                </div>
              </div>
              {exp && (
                <div className="expand-down" style={{ borderTop:"1px solid var(--border)", background:"var(--bg3)" }}>
                  {meal.items.map((item, idx) => {
                    const cal = Math.round(item.grams * (item.calories ?? item.caloriesPer100g ?? 0) / 100);
                    const prot = Math.round(item.grams * (item.protein ?? 0) / 100 * 10) / 10;
                    const fat  = Math.round(item.grams * (item.fat ?? 0) / 100 * 10) / 10;
                    const carb = Math.round(item.grams * (item.carbs ?? 0) / 100 * 10) / 10;
                    return (
                      <div key={item.id} style={{ display:"flex", alignItems:"center", padding:"10px 16px", borderBottom:"1px solid var(--border)" }}>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:500, fontSize:14 }}>{item.name}</p>
                          <p style={{ color:"var(--text3)", fontSize:11 }}>{item.grams}г · Б:{prot} Ж:{fat} У:{carb}</p>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontWeight:600, fontSize:14, color:"var(--accent2)" }}>{cal} ккал</span>
                          <button onClick={() => openEditItem(mt, idx)} style={{ background:"var(--card2)", border:"none", borderRadius:6, padding:"5px 7px", color:"var(--text2)", cursor:"pointer", display:"flex" }}><Icons.Edit/></button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ padding:"10px 16px" }}>
                    <Btn variant="ghost" small onClick={() => openAddItem(mt)} style={{ color:"var(--accent2)" }}><Icons.Plus/> Добавить продукт</Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Модал добавления/редактирования */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal?.itemIndex !== null ? "Редактировать продукт" : "Добавить продукт"}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

          {/* Поиск продукта */}
          <div style={{ position:"relative" }}>
            <label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Продукт</label>
            <input
              value={foodSearch}
              onChange={e => { setFoodSearch(e.target.value); setShowDropdown(true); if (!e.target.value) setSelectedFood(null); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Введите название продукта..."
            />
            {showDropdown && searchResults.length > 0 && (
              <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--radius-sm)", zIndex:200, maxHeight:220, overflowY:"auto", marginTop:4 }} className="scroll-hide">
                {searchResults.map(food => (
                  <div
                    key={food.name}
                    onClick={() => { setSelectedFood(food); setFoodSearch(food.name); setShowDropdown(false); }}
                    style={{ padding:"10px 14px", cursor:"pointer", borderBottom:"1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--card2)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <p style={{ fontWeight:500, fontSize:14 }}>{food.name}</p>
                    <p style={{ fontSize:11, color:"var(--text3)" }}>
                      {food.calories} ккал · Б:{food.protein} Ж:{food.fat} У:{food.carbs} (на 100г)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Только граммы */}
          <div>
            <label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Количество (граммы)</label>
            <input
              type="number"
              value={gramsInput}
              onChange={e => setGramsInput(e.target.value)}
              placeholder="250"
              min="1"
            />
          </div>

          {/* Предпросмотр авторасчёта */}
          {selectedFood && (
            <div style={{ background:"var(--bg3)", borderRadius:8, padding:"10px 12px", fontSize:13 }}>
              <p style={{ color:"var(--text2)", marginBottom:6, fontWeight:500 }}>
                {selectedFood.name} — на 100г: {selectedFood.calories} ккал · Б:{selectedFood.protein} Ж:{selectedFood.fat} У:{selectedFood.carbs}
              </p>
              {preview && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                  {[["Ккал", preview.calories, "var(--accent2)"], ["Белки", preview.protein+"г", "var(--green)"], ["Жиры", preview.fat+"г", "var(--amber)"], ["Углев.", preview.carbs+"г", "var(--blue)"]].map(([l,v,c]) => (
                    <div key={l} style={{ textAlign:"center", background:"var(--card)", borderRadius:6, padding:"6px 4px" }}>
                      <p style={{ fontSize:10, color:"var(--text3)", marginBottom:2 }}>{l}</p>
                      <p style={{ fontWeight:700, fontSize:14, color:c }}>{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            {editModal?.itemIndex !== null && (
              <Btn variant="danger" onClick={() => deleteItem(editModal.mealType, editModal.itemIndex)}><Icons.Trash/> Удалить</Btn>
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
  const [expandedDay, setExpandedDay] = useState({});
  const [editModal, setEditModal] = useState(null);
  const [workoutForm, setWorkoutForm] = useState({ name:"", notes:"", exercises:[] });
  const [exForm, setExForm] = useState({ name:"", sets:"", reps:"" });

  const dayName = WEEKDAYS_FULL[activeDay];
  const workout = workouts[dayName];

  function openEdit() {
    if (workout) setWorkoutForm(JSON.parse(JSON.stringify(workout)));
    else setWorkoutForm({ name:"", notes:"", exercises:[] });
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

  return (
    <div className="fade-in" style={{ padding:"0 0 100px" }}>
      <div style={{ padding:"20px 20px 0" }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Тренировки</h1>
        <p style={{ color:"var(--text2)", fontSize:14, marginTop:2 }}>Недельный план тренировок</p>
      </div>

      {/* Дни */}
      <div style={{ overflowX:"auto", padding:"14px 20px 0" }} className="scroll-hide">
        <div style={{ display:"flex", gap:8, width:"max-content" }}>
          {WEEKDAYS.map((d,i) => (
            <button key={i} onClick={() => setActiveDay(i)} style={{ background: activeDay===i ? "var(--accent)" : "var(--card)", border: activeDay===i ? "none" : "1px solid var(--border)", borderRadius:10, padding:"8px 14px", color: activeDay===i ? "#fff" : "var(--text2)", fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.15s", flexShrink:0, position:"relative" }}>
              {d}
              {i===todayWeekdayKey() && <span style={{ position:"absolute", top:3, right:3, width:5, height:5, borderRadius:"50%", background: activeDay===i ? "#fff" : "var(--accent)" }}/>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 20px 0" }}>
        {workout ? (
          <div style={{ background:"var(--card)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden" }}>
            <div style={{ padding:"16px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <h2 style={{ fontWeight:700, fontSize:18 }}>{workout.name}</h2>
                  <p style={{ color:"var(--text2)", fontSize:14, marginTop:2 }}>{workout.exercises.length} упражнений</p>
                  {workout.notes && <p style={{ color:"var(--text3)", fontSize:13, marginTop:4 }}>{workout.notes}</p>}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="secondary" small onClick={openEdit}><Icons.Edit/></Btn>
                </div>
              </div>
            </div>
            <div style={{ borderTop:"1px solid var(--border)" }}>
              {workout.exercises.map((ex, i) => (
                <div key={ex.id} style={{ display:"flex", alignItems:"center", padding:"12px 16px", borderBottom: i<workout.exercises.length-1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ minWidth:28, height:28, borderRadius:8, background:"var(--accent-bg)", display:"flex", alignItems:"center", justifyContent:"center", marginRight:12, fontSize:13, fontWeight:700, color:"var(--accent2)" }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:500 }}>{ex.name}</p>
                    <p style={{ color:"var(--text2)", fontSize:13 }}>{ex.sets} подходов × {ex.reps} повторений</p>
                  </div>
                  <Tag color="accent">{ex.sets}×{ex.reps}</Tag>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background:"var(--card)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"40px 20px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🛋️</div>
            <p style={{ fontWeight:600, fontSize:16 }}>День отдыха</p>
            <p style={{ color:"var(--text2)", fontSize:14, marginTop:6, marginBottom:16 }}>{WEEKDAYS_FULL[activeDay]}</p>
            <Btn onClick={openEdit}><Icons.Plus/> Добавить тренировку</Btn>
          </div>
        )}
      </div>

      {/* Обзор недели */}
      <div style={{ padding:"20px 20px 0" }}>
        <h2 style={{ fontWeight:600, fontSize:15, color:"var(--text2)", marginBottom:12 }}>НЕДЕЛЯ</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {WEEKDAYS.map((d,i) => {
            const w = workouts[WEEKDAYS_FULL[i]];
            return (
              <div key={i} onClick={() => setActiveDay(i)} style={{ display:"flex", alignItems:"center", padding:"11px 14px", background: activeDay===i ? "var(--accent-bg)" : "var(--card)", borderRadius:10, border:`1px solid ${activeDay===i ? "rgba(124,106,245,0.3)" : "var(--border)"}`, cursor:"pointer", transition:"all 0.15s" }}>
                <span style={{ minWidth:28, fontWeight:700, color: activeDay===i ? "var(--accent2)" : "var(--text3)", fontSize:13 }}>{d}</span>
                {w ? (
                  <>
                    <span style={{ flex:1, fontWeight:500, fontSize:14, color: activeDay===i ? "var(--text)" : "var(--text)" }}>{w.name}</span>
                    <Tag color="accent">{w.exercises.length} упр.</Tag>
                  </>
                ) : <span style={{ color:"var(--text3)", fontSize:13 }}>Отдых</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Модал */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Тренировка — ${editModal}`}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Название</label><input value={workoutForm.name} onChange={e=>setWorkoutForm(p=>({...p,name:e.target.value}))} placeholder="Грудь + Трицепс"/></div>
          <div><label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Заметки</label><input value={workoutForm.notes} onChange={e=>setWorkoutForm(p=>({...p,notes:e.target.value}))} placeholder="Необязательно"/></div>
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:12 }}>
            <p style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>Упражнения</p>
            {workoutForm.exercises.map((ex,i) => (
              <div key={ex.id} style={{ display:"flex", alignItems:"center", padding:"8px 12px", background:"var(--bg3)", borderRadius:8, marginBottom:6, gap:8 }}>
                <span style={{ flex:1, fontSize:14 }}>{ex.name}</span>
                <span style={{ color:"var(--text2)", fontSize:13 }}>{ex.sets}×{ex.reps}</span>
                <button onClick={() => removeEx(ex.id)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", display:"flex" }}><Icons.X/></button>
              </div>
            ))}
            <div style={{ background:"var(--bg3)", borderRadius:10, padding:"12px", display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
              <p style={{ fontSize:13, color:"var(--text2)", fontWeight:500 }}>Новое упражнение</p>
              <input value={exForm.name} onChange={e=>setExForm(p=>({...p,name:e.target.value}))} placeholder="Жим лёжа"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <input type="number" value={exForm.sets} onChange={e=>setExForm(p=>({...p,sets:e.target.value}))} placeholder="4 подх."/>
                <input type="number" value={exForm.reps} onChange={e=>setExForm(p=>({...p,reps:e.target.value}))} placeholder="10 повт."/>
              </div>
              <Btn variant="secondary" small onClick={addEx}><Icons.Plus/> Добавить</Btn>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            {workout && <Btn variant="danger" small onClick={() => { setWorkouts(p=>({...p,[editModal]:null})); setEditModal(null); }}><Icons.Trash/></Btn>}
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
  const todayEntry = weightHistory.find(e => e.date === todayKey);
  const sorted = [...weightHistory].sort((a,b) => a.date.localeCompare(b.date));

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

  // График
  const now = new Date();
  const filtered = sorted.filter(e => {
    const d = new Date(e.date);
    const days = (now-d)/(1000*60*60*24);
    if (filter==="7") return days<=7;
    if (filter==="30") return days<=30;
    return true;
  });

  const chartW = 320, chartH = 160, padX = 40, padY = 20;
  const innerW = chartW - padX*2, innerH = chartH - padY*2;
  let path = "", points = [];
  if (filtered.length > 1) {
    const min = Math.min(...filtered.map(e=>e.weight)) - 0.5;
    const max = Math.max(...filtered.map(e=>e.weight)) + 0.5;
    const range = max - min || 1;
    const dates = filtered.map(e => new Date(e.date).getTime());
    const minD = Math.min(...dates), maxD = Math.max(...dates);
    const dateRange = maxD - minD || 1;
    points = filtered.map(e => {
      const x = padX + ((new Date(e.date).getTime()-minD)/dateRange)*innerW;
      const y = padY + innerH - ((e.weight-min)/range)*innerH;
      return { x, y, w: e.weight, date: e.date };
    });
    path = points.map((p,i) => `${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }

  const trend = diff === null ? { label:"—", color:"var(--text2)" } : diff < -0.1 ? { label:"Снижение ↓", color:"var(--green)" } : diff > 0.1 ? { label:"Набор ↑", color:"var(--red)" } : { label:"Стабильно →", color:"var(--amber)" };

  return (
    <div className="fade-in" style={{ padding:"0 0 100px" }}>
      <div style={{ padding:"20px 20px 0" }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Вес</h1>
        <p style={{ color:"var(--text2)", fontSize:14, marginTop:2 }}>История и прогресс</p>
      </div>

      {/* Карточки */}
      <div style={{ padding:"16px 20px 0", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        <div style={{ background:"var(--card)", borderRadius:12, padding:"12px", border:"1px solid var(--border)", textAlign:"center" }}>
          <p style={{ color:"var(--text3)", fontSize:11, fontWeight:600, marginBottom:4 }}>ТЕКУЩИЙ</p>
          <p style={{ fontWeight:700, fontSize:20 }}>{last?.weight || "—"}</p>
          <p style={{ color:"var(--text3)", fontSize:12 }}>кг</p>
        </div>
        <div style={{ background:"var(--card)", borderRadius:12, padding:"12px", border:"1px solid var(--border)", textAlign:"center" }}>
          <p style={{ color:"var(--text3)", fontSize:11, fontWeight:600, marginBottom:4 }}>ИЗМЕНЕНИЕ</p>
          <p style={{ fontWeight:700, fontSize:20, color: diff===null?"var(--text)":diff<0?"var(--green)":diff>0?"var(--red)":"var(--amber)" }}>{diff===null?"—":diff>0?`+${diff}`:diff}</p>
          <p style={{ color:"var(--text3)", fontSize:12 }}>кг</p>
        </div>
        <div style={{ background:"var(--card)", borderRadius:12, padding:"12px", border:"1px solid var(--border)", textAlign:"center" }}>
          <p style={{ color:"var(--text3)", fontSize:11, fontWeight:600, marginBottom:6 }}>ТРЕНД</p>
          <p style={{ fontWeight:600, fontSize:13, color:trend.color }}>{trend.label}</p>
        </div>
      </div>

      {/* Ввод */}
      <div style={{ margin:"12px 20px 0", background:"var(--card)", borderRadius:"var(--radius)", padding:"16px", border:"1px solid var(--border)" }}>
        <p style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>{todayEntry ? "✏️ Обновить вес" : "➕ Записать вес"}</p>
        {todayEntry && <p style={{ color:"var(--text2)", fontSize:13, marginBottom:10 }}>Сегодня: <strong>{todayEntry.weight} кг</strong></p>}
        <div style={{ display:"flex", gap:10 }}>
          <input type="number" value={weightInput} onChange={e=>setWeightInput(e.target.value)} placeholder="95.4" style={{ flex:1 }} step="0.1" min="20" max="400"/>
          <Btn onClick={saveWeight} style={{ flexShrink:0 }}>Сохранить</Btn>
        </div>
      </div>

      {/* График */}
      {filtered.length > 1 && (
        <div style={{ margin:"12px 20px 0", background:"var(--card)", borderRadius:"var(--radius)", padding:"16px", border:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <p style={{ fontWeight:600, fontSize:14 }}>График</p>
            <div style={{ display:"flex", gap:6 }}>
              {[["7","7 дней"],["30","30 дней"],["all","Всё"]].map(([v,l]) => (
                <button key={v} onClick={()=>setFilter(v)} style={{ background:filter===v?"var(--accent)":"var(--bg3)", border:"none", borderRadius:6, padding:"4px 10px", color:filter===v?"#fff":"var(--text2)", fontSize:12, fontWeight:600, cursor:"pointer" }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX:"auto" }} className="scroll-hide">
            <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{ display:"block", margin:"0 auto" }}>
              {/* Grid */}
              {[0,1,2,3,4].map(i => (
                <line key={i} x1={padX} x2={chartW-padX} y1={padY + (innerH/4)*i} y2={padY + (innerH/4)*i} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              ))}
              {/* Path */}
              <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Area */}
              {points.length > 1 && <path d={`${path} L${points[points.length-1].x},${padY+innerH} L${points[0].x},${padY+innerH} Z`} fill="rgba(124,106,245,0.08)"/>}
              {/* Points */}
              {points.map((p,i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--accent)" stroke="var(--bg2)" strokeWidth="2"/>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* История */}
      <div style={{ padding:"16px 20px 0" }}>
        <p style={{ fontWeight:600, fontSize:14, color:"var(--text2)", marginBottom:12 }}>ИСТОРИЯ</p>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {[...sorted].reverse().map(e => (
            <div key={e.id} style={{ display:"flex", alignItems:"center", padding:"11px 14px", background:"var(--card)", borderRadius:10, border:"1px solid var(--border)" }}>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:500, fontSize:14 }}>{new Date(e.date).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})}</p>
                {e.date===todayKey && <Tag color="accent">Сегодня</Tag>}
              </div>
              <span style={{ fontWeight:700, fontSize:17 }}>{e.weight} кг</span>
              <button onClick={()=>deleteEntry(e.id)} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", marginLeft:10, display:"flex" }}><Icons.Trash/></button>
            </div>
          ))}
          {sorted.length===0 && <div style={{ textAlign:"center", padding:40, color:"var(--text3)" }}>Нет записей</div>}
        </div>
      </div>
    </div>
  );
}

// ─── СТРАНИЦА: НАСТРОЙКИ ──────────────────────────────────────────────────────

function SettingsPage({ routine, setRoutine, theme, setTheme, weightHistory, nutrition, workouts, goals, setGoals, waterGoal, setWaterGoal }) {
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
  const typeLabel = { generic:"Задача", meal:"Приём пищи", workout:"Тренировка" };
  const typeColor = { generic:"blue", meal:"green", workout:"accent" };

  return (
    <div className="fade-in" style={{ padding:"0 0 100px" }}>
      <div style={{ padding:"20px 20px 0" }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Настройки</h1>
      </div>

      {/* Расписание */}
      <div style={{ padding:"16px 20px 0" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <p style={{ fontWeight:600, fontSize:15 }}>Ежедневное расписание</p>
          <Btn small onClick={openAdd}><Icons.Plus/> Добавить</Btn>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {sorted.map(task => (
            <div key={task.id} style={{ display:"flex", alignItems:"center", padding:"11px 14px", background:"var(--card)", borderRadius:10, border:"1px solid var(--border)" }}>
              <span style={{ minWidth:44, fontSize:13, fontWeight:600, color:"var(--text3)" }}>{task.time}</span>
              <div style={{ flex:1, marginLeft:8 }}>
                <span style={{ fontWeight:500, fontSize:14 }}>{task.title || (task.type==="meal" ? task.mealType : "Тренировка")}</span>
                <div style={{ marginTop:2 }}><Tag color={typeColor[task.type]}>{typeLabel[task.type]}</Tag></div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>openEdit(task)} style={{ background:"var(--card2)", border:"none", borderRadius:6, padding:"5px 7px", color:"var(--text2)", cursor:"pointer", display:"flex" }}><Icons.Edit/></button>
                <button onClick={()=>deleteTask(task.id)} style={{ background:"var(--red-bg)", border:"none", borderRadius:6, padding:"5px 7px", color:"var(--red)", cursor:"pointer", display:"flex" }}><Icons.Trash/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Тема */}
      <div style={{ padding:"20px 20px 0" }}>
        <p style={{ fontWeight:600, fontSize:15, marginBottom:12 }}>Тема</p>
        <div style={{ display:"flex", gap:8 }}>
          {[["dark","🌙 Тёмная"],["light","☀️ Светлая"],["system","💻 Системная"]].map(([v,l]) => (
            <button key={v} onClick={()=>setTheme(v)} style={{ flex:1, background:theme===v?"var(--accent)":"var(--card)", border:theme===v?"none":"1px solid var(--border)", borderRadius:10, padding:"10px 8px", color:theme===v?"#fff":"var(--text2)", fontWeight:600, fontSize:13, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Экспорт */}
      <div style={{ padding:"20px 20px 0" }}>

      {/* Цели по питанию */}
      <div style={{ padding:"20px 20px 0" }}>
        <p style={{ fontWeight:600, fontSize:15, marginBottom:12 }}>Цели по питанию</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            ["calories", "Калории (ккал/день)", "2000"],
            ["protein",  "Белки (г/день)",      "150"],
            ["fat",      "Жиры (г/день)",        "70"],
            ["carbs",    "Углеводы (г/день)",    "250"],
          ].map(([key, label, ph]) => (
            <div key={key} style={{ background:"var(--card)", borderRadius:10, padding:"12px 14px", border:"1px solid var(--border)" }}>
              <label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:6 }}>{label}</label>
              <input
                type="number"
                value={goals[key] || ""}
                onChange={e => setGoals(p => ({ ...p, [key]: parseInt(e.target.value)||0 }))}
                placeholder={ph}
                min="0"
              />
            </div>
          ))}
        </div>
      </div>

        <p style={{ fontWeight:600, fontSize:15, marginBottom:12 }}>Данные</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ background:"var(--card)", borderRadius:12, padding:"14px 16px", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div><p style={{ fontWeight:500 }}>Экспорт JSON</p><p style={{ color:"var(--text2)", fontSize:13 }}>Скачать резервную копию</p></div>
            <Btn variant="secondary" small onClick={exportData}>Скачать</Btn>
          </div>
          <div style={{ background:"var(--red-bg)", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(248,113,113,0.2)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div><p style={{ fontWeight:500, color:"var(--red)" }}>Сбросить данные</p><p style={{ color:"var(--text2)", fontSize:13 }}>Удалить всё без возможности восстановления</p></div>
            <Btn variant="danger" small onClick={()=>setConfirmReset(true)}>Сброс</Btn>
          </div>
        </div>
      </div>

      {/* Подтверждение сброса */}
      <Modal open={confirmReset} onClose={()=>setConfirmReset(false)} title="⚠️ Сброс данных">
        <p style={{ color:"var(--text2)", marginBottom:20 }}>Все данные будут удалены безвозвратно. Вы уверены?</p>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="secondary" onClick={()=>setConfirmReset(false)} style={{ flex:1, justifyContent:"center" }}>Отмена</Btn>
          <Btn variant="danger" onClick={()=>{ localStorage.clear(); window.location.reload(); }} style={{ flex:1, justifyContent:"center" }}>Удалить всё</Btn>
        </div>
      </Modal>

      {/* Добавить/редактировать задачу */}
      <Modal open={addModal} onClose={()=>setAddModal(false)} title={editTask?"Редактировать задачу":"Новая задача"}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Тип</label>
            <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
              <option value="generic">📌 Задача</option>
              <option value="meal">🍽 Приём пищи</option>
              <option value="workout">💪 Тренировка</option>
            </select>
          </div>
          {form.type==="generic" && <div><label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Название</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Выпить воду"/></div>}
          {form.type==="meal" && (
            <div>
              <label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Приём пищи</label>
              <select value={form.mealType} onChange={e=>setForm(p=>({...p,mealType:e.target.value,title:e.target.value}))}>
                {MEAL_TYPES.map(mt => <option key={mt}>{mt}</option>)}
              </select>
            </div>
          )}
          <div><label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Время</label><input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))}/></div>
          <div><label style={{ fontSize:13, color:"var(--text2)", display:"block", marginBottom:4 }}>Заметки</label><input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Необязательно"/></div>
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
  { id:"today", label:"Сегодня", Icon: Icons.Home },
  { id:"nutrition", label:"Питание", Icon: Icons.Food },
  { id:"workouts", label:"Тренировки", Icon: Icons.Dumbbell },
  { id:"weight", label:"Вес", Icon: Icons.Scale },
  { id:"settings", label:"Настройки", Icon: Icons.Settings },
];

// ─── ОСНОВНОЙ КОМПОНЕНТ ───────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("today");
  const [theme, setTheme] = useLocalStorage("fitness_theme", "dark");
  const [routine, setRoutine] = useLocalStorage("fitness_routine", DEFAULT_ROUTINE);
  const [nutrition, setNutrition] = useLocalStorage("fitness_nutrition", DEFAULT_NUTRITION);
  const [workouts, setWorkouts] = useLocalStorage("fitness_workouts", DEFAULT_WORKOUTS);
  const [weightHistory, setWeightHistory] = useLocalStorage("fitness_weight", []);
  const [completions, setCompletions] = useLocalStorage("fitness_completions", {});
  const [goals, setGoals] = useLocalStorage("fitness_goals", { calories: 2000, protein: 150, fat: 70, carbs: 250 });
  const [waterData, setWaterData] = useLocalStorage("fitness_water", {});
  const waterGoal = 2500; // мл по умолчанию

  // Применяем тему
  useEffect(() => {
    const dark = theme==="dark" || (theme==="system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (!dark) {
      document.documentElement.style.setProperty("--bg","#f5f5f8");
      document.documentElement.style.setProperty("--bg2","#ebebf0");
      document.documentElement.style.setProperty("--bg3","#e2e2e9");
      document.documentElement.style.setProperty("--card","#ffffff");
      document.documentElement.style.setProperty("--card2","#f0f0f5");
      document.documentElement.style.setProperty("--border","rgba(0,0,0,0.07)");
      document.documentElement.style.setProperty("--border2","rgba(0,0,0,0.12)");
      document.documentElement.style.setProperty("--text","#0f0f13");
      document.documentElement.style.setProperty("--text2","#555560");
      document.documentElement.style.setProperty("--text3","#9090a0");
    } else {
      document.documentElement.style.setProperty("--bg","#0f0f13");
      document.documentElement.style.setProperty("--bg2","#17171d");
      document.documentElement.style.setProperty("--bg3","#1e1e26");
      document.documentElement.style.setProperty("--card","#1a1a22");
      document.documentElement.style.setProperty("--card2","#22222c");
      document.documentElement.style.setProperty("--border","rgba(255,255,255,0.07)");
      document.documentElement.style.setProperty("--border2","rgba(255,255,255,0.12)");
      document.documentElement.style.setProperty("--text","#f0f0f5");
      document.documentElement.style.setProperty("--text2","#9090a8");
      document.documentElement.style.setProperty("--text3","#55556a");
    }
  }, [theme]);

  const pages = { today: TodayPage, nutrition: NutritionPage, workouts: WorkoutsPage, weight: WeightPage, settings: SettingsPage };
  const PageComp = pages[tab];

  return (
    <>
      <style>{css}</style>
      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", position:"relative", background:"var(--bg)" }}>
        <div style={{ overflowY:"auto", height:"100vh", paddingBottom:80 }} className="scroll-hide">
          <PageComp
            routine={routine} setRoutine={setRoutine}
            nutrition={nutrition} setNutrition={setNutrition}
            workouts={workouts} setWorkouts={setWorkouts}
            weightHistory={weightHistory} setWeightHistory={setWeightHistory}
            completions={completions} setCompletions={setCompletions}
            theme={theme} setTheme={setTheme}
            goals={goals} setGoals={setGoals}
            waterData={waterData} setWaterData={setWaterData}
            waterGoal={waterGoal}
          />
        </div>
        {/* Нижняя навигация */}
        <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"var(--bg2)", borderTop:"1px solid var(--border)", display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom,0)" }}>
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, padding:"10px 4px 12px", background:"none", border:"none", color: tab===id ? "var(--accent2)" : "var(--text3)", cursor:"pointer", transition:"color 0.15s", position:"relative" }}>
              {tab===id && <span style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:28, height:2, borderRadius:2, background:"var(--accent)" }}/>}
              <Icon/>
              <span style={{ fontSize:10, fontWeight: tab===id ? 600 : 400, lineHeight:1 }}>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
