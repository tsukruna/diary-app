'use client'
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "@/lib/supabase";

/* UI */
const FormBox = ({ label, children }: any) => (
  <div className="box">
    <label>{label}</label>
    {children}
  </div>
);

export default function Home() {

  const [form, setForm] = useState({
    date: "",
    emotion: "",
    event: "",
    action: "",
    honest: "",
    relied: "",
    reason: "",
    shortComment: ""
  });

  // ✅ 習慣分析
  const [habit, setHabit] = useState({
    awareness: "",
    done: "",
    nextGoal: "",
    minimum: "",
    tomorrow: ""
  });

  const [entries, setEntries] = useState<any[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // データ取得
  const fetchData = async () => {
    const { data } = await supabase
      .from("diary")
      .select("*")
      .order("date", { ascending: false });

    setEntries(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 入力
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  // ✅ ランダム応援
  const generateMessage = () => {

    if (form.relied === "yes") {
      const good = [
        "ちゃんと頼れていてすごいね",
        "自分を大切にできているよ",
        "いい判断ができている",
        "素晴らしい成長だよ"
      ];
      return good[Math.floor(Math.random() * good.length)];
    }

    const normal = [
      "今日も頑張れていてえらい",
      "少しずつ前進しているよ",
      "無理せず続けていてすごい",
      "今日もお疲れさま",
      "その積み重ねが未来を作る"
    ];

    return normal[Math.floor(Math.random() * normal.length)];
  };

  // 保存
  const saveData = async () => {

    if (!form.date) return alert("日付を選択してください");

    setLoading(true);

    const summary = generateMessage();

    await supabase.from("diary").insert([{
      ...form,
      shortComment: summary,

      // ✅ 習慣分析
      awareness: habit.awareness,
      done: habit.done,
      nextGoal: habit.nextGoal,
      minimum: habit.minimum,
      tomorrow: habit.tomorrow
    }]);

    await fetchData();

    setForm({
      date: "",
      emotion: "",
      event: "",
      action: "",
      honest: "",
      relied: "",
      reason: "",
      shortComment: ""
    });

    setHabit({
      awareness: "",
      done: "",
      nextGoal: "",
      minimum: "",
      tomorrow: ""
    });

    setLoading(false);
  };

  // 削除
  const deleteEntry = async (id: string) => {
    await supabase.from("diary").delete().eq("id", id);
    fetchData();
  };

  // カレンダークリック
  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    const d =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');

    setForm(p => ({ ...p, date: d }));

    const filtered = entries.filter(e => e.date === d);
    setFilteredEntries(filtered);
  };

  const displayEntries =
    filteredEntries.length > 0 ? filteredEntries : entries;

  // グラフ
  const total = entries.length;
  const success = entries.filter(e => e.relied === "yes").length;
  const rate = total ? Math.round((success / total) * 100) : 0;

  return (
    <div className="container">
      <h1>自己改善日記</h1>

      {/* ✅ カレンダー */}
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={({ date }) => {

          const d =
            date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, '0') + "-" +
            String(date.getDate()).padStart(2, '0');

          const dayEntries = entries.filter(e => e.date === d);

          if (dayEntries.length === 0) return "";

          if (dayEntries.some(e => e.relied === "yes")) return "day-yes";
          if (dayEntries.some(e => e.relied === "no")) return "day-no";

          return "";
        }}
      />

      <button onClick={() => setFilteredEntries([])}>全て表示</button>

      {/* ✅ 入力 */}
      <FormBox label="今日の気分">
        <textarea name="emotion" value={form.emotion} onChange={handleChange}/>
      </FormBox>

      <FormBox label="出来事">
        <textarea name="event" value={form.event} onChange={handleChange}/>
      </FormBox>

      <FormBox label="行動">
        <textarea name="action" value={form.action} onChange={handleChange}/>
      </FormBox>

      <FormBox label="本音">
        <textarea name="honest" value={form.honest} onChange={handleChange}/>
      </FormBox>

      <FormBox label="頼れた？">
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className={`btn ${form.relied === "yes" ? "yes active" : ""}`}
            onClick={() => setForm(p => ({ ...p, relied: "yes" }))}
          >はい</button>

          <button
            type="button"
            className={`btn ${form.relied === "no" ? "no active" : ""}`}
            onClick={() => setForm(p => ({ ...p, relied: "no" }))}
          >いいえ</button>
        </div>
      </FormBox>

      <FormBox label="理由">
        <textarea name="reason" value={form.reason} onChange={handleChange}/>
      </FormBox>

      {/* ✅ 習慣分析 */}
      <h2>習慣分析</h2>

      <FormBox label="意識したこと">
        <textarea value={habit.awareness}
          onChange={(e) => setHabit(p => ({ ...p, awareness: e.target.value }))}/>
      </FormBox>

      <FormBox label="できていたか">
        <textarea value={habit.done}
          onChange={(e) => setHabit(p => ({ ...p, done: e.target.value }))}/>
      </FormBox>

      <FormBox label="来週の目標">
        <textarea value={habit.nextGoal}
          onChange={(e) => setHabit(p => ({ ...p, nextGoal: e.target.value }))}/>
      </FormBox>

      <FormBox label="最低限すること">
        <textarea value={habit.minimum}
          onChange={(e) => setHabit(p => ({ ...p, minimum: e.target.value }))}/>
      </FormBox>

      <FormBox label="明日すること">
        <textarea value={habit.tomorrow}
          onChange={(e) => setHabit(p => ({ ...p, tomorrow: e.target.value }))}/>
      </FormBox>

      <button className="save" onClick={saveData}>
        {loading ? "保存中..." : "保存"}
      </button>

      {/* ✅ グラフ */}
      <h2>頼れ率 {rate}%</h2>
      <div className="bar">
        <div className="fill" style={{ width: `${rate}%` }} />
      </div>

      {/* ✅ 一覧 */}
      <h2>記録一覧</h2>

      {displayEntries.map(entry => (
        <div key={entry.id} className="card">
          <strong>{entry.date}</strong>

          <p><b>🧠 {entry.shortComment}</b></p>

          <p>😊 {entry.emotion}</p>
          <p>📌 {entry.event}</p>
          <p>🏃 {entry.action}</p>

          <p>
            🤝 頼れた？
            {entry.relied === "yes" ? " ✅ はい" : " ❌ いいえ"}
          </p>

          <p>💡 理由：{entry.reason}</p>

          {/* ✅ 習慣分析表示 */}
          <p>🎯 意識：{entry.awareness}</p>
          <p>✅ できた？：{entry.done}</p>
          <p>🚀 来週：{entry.nextGoal}</p>
          <p>🧱 最低限：{entry.minimum}</p>
          <p>📅 明日：{entry.tomorrow}</p>

          <button onClick={() => deleteEntry(entry.id)}>削除</button>
        </div>
      ))}

      {/* ✅ CSS */}
      <style jsx global>{`

        body {
          background: #111;
          color: white;
        }

        .container {
          max-width: 600px;
          margin: auto;
          padding: 15px;
        }

        textarea {
          width: 100%;
          min-height: 60px;
        }

        .box {
          margin-top: 10px;
          border: 1px solid gray;
          padding: 10px;
          border-radius: 8px;
        }

        .btn {
          padding: 8px;
          border-radius: 6px;
          background: gray;
          opacity: 0.5;
        }

        .yes.active { background: #00c853; opacity:1; }
        .no.active { background: #d50000; opacity:1; }

        .save {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
        }

        .bar {
          background: #444;
          height: 10px;
        }

        .fill {
          background: green;
          height: 100%;
        }

        .card {
          border: 1px solid gray;
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
        }

        /* ✅ カレンダー */
        .react-calendar {
          background: #222 !important;
        }

        .react-calendar__tile.day-yes {
          background: rgba(0,200,83,0.25) !important;
          color: #00e676 !important;
        }

        .react-calendar__tile.day-no {
          background: rgba(213,0,0,0.25) !important;
          color: #ff5252 !important;
        }

      `}</style>
    </div>
  );
}
``