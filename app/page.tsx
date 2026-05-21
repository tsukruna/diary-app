'use client'
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "@/lib/supabase";

/* ✅ 外に出す */
const FormBox = ({ label, children }: any) => (
  <div className="box">
    <label>{label}</label>
    {children}
  </div>
);

export default function Home() {

  const [form, setForm] = useState({
    id: "",
    date: "",
    emotion: "",
    event: "",
    action: "",
    honest: "",
    relied: "",
    reason: "",
    shortComment: ""
  });

  const [entries, setEntries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekSummary, setWeekSummary] = useState("");

  // ✅ データ取得
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

  // ✅ 入力
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ AI生成
  const generateAI = async (data: any) => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ data })
      });

      const json = await res.json();
      return json.result;

    } catch {
      return "AI生成エラー";
    }
  };

  // ✅ 保存（即保存→AI更新）
  const saveData = async () => {

    const { data } = await supabase
      .from("diary")
      .insert([{
        ...form,
        shortComment: "生成中..."
      }])
      .select();

    fetchData();

    const summary = await generateAI(form);

    if (data?.[0]) {
      await supabase
        .from("diary")
        .update({ shortComment: summary })
        .eq("id", data[0].id);
    }

    fetchData();

    setForm({
      id: "",
      date: "",
      emotion: "",
      event: "",
      action: "",
      honest: "",
      relied: "",
      reason: "",
      shortComment: ""
    });
  };

  // ✅ 日付
  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    const d =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');

    setForm(prev => ({ ...prev, date: d }));
  };

  // ✅ 日曜チェック
  const isSunday = selectedDate.getDay() === 0;

  // ✅ 週間AI
  const generateWeeklySummary = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        data: { text: JSON.stringify(entries.slice(0, 7)) }
      })
    });

    const result = await res.json();
    setWeekSummary(result.result);
  };

  // ✅ グラフ
  const total = entries.length;
  const success = entries.filter(e => e.relied === "yes").length;
  const rate = total ? Math.round((success / total) * 100) : 0;

  return (
    <div className="container">
      <h1>自己改善日記</h1>

      {/* ✅ カレンダー */}
      <Calendar onChange={handleDateChange} value={selectedDate} />

      {/* ✅ 入力欄 */}
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

      {/* ✅ ボタン */}
      <FormBox label="頼れた？">
        <div style={{ display: "flex", gap: "10px" }}>

          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, relied: "yes" }))}
            className={`btn ${form.relied === "yes" ? "yes active" : ""}`}
          >はい</button>

          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, relied: "no" }))}
            className={`btn ${form.relied === "no" ? "no active" : ""}`}
          >いいえ</button>

        </div>
      </FormBox>

      <FormBox label="理由">
        <textarea name="reason" value={form.reason} onChange={handleChange}/>
      </FormBox>

      <FormBox label="AI一言">
        <textarea name="shortComment" value={form.shortComment} onChange={handleChange}/>
      </FormBox>

      <button type="button" className="save" onClick={saveData}>
        保存
      </button>

      {/* ✅ グラフ */}
      <h2>頼れ率 {rate}%</h2>
      <div className="bar">
        <div
          className="fill"
          style={{
            width: `${rate}%`,
            background: rate > 60 ? "green" : rate > 30 ? "orange" : "red"
          }}
        />
      </div>

      {/* ✅ 日曜AI */}
      {isSunday && (
        <div className="weekly">
          <h2>週間まとめAI</h2>
          <button type="button" onClick={generateWeeklySummary}>
            生成
          </button>
          {weekSummary && <p>{weekSummary}</p>}
        </div>
      )}

      {/* ✅ ✅ ✅ 記録一覧（超重要） */}
      <h2>記録一覧</h2>

      {entries.map((entry) => (
        <div key={entry.id} className="card">
          <strong>{entry.date}</strong>

          <p><b>🧠 {entry.shortComment}</b></p>
          <p>😊 {entry.emotion}</p>
          <p>📌 {entry.event}</p>
          <p>🏃 {entry.action}</p>
        </div>
      ))}

      {/* ✅ スタイル */}
      <style jsx global>{`

        body {
          background: white;
          color: black;
        }

        @media (prefers-color-scheme: dark) {
          body {
            background: #111;
            color: white;
          }
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
          border: none;
          background: gray;
          color: white;
          opacity: 0.5;
        }

        .active { opacity: 1; }
        .yes.active { background: #00c853; }
        .no.active { background: #d50000; }

        .save {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
        }

        .bar {
          background: #ccc;
          height: 10px;
        }

        .fill { height: 100%; }

        .weekly {
          margin-top: 15px;
          padding: 10px;
          border: 2px solid gray;
        }

        .card {
          border: 1px solid gray;
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
        }

        /* ✅ カレンダー */
        @media (prefers-color-scheme: dark) {
          .react-calendar {
            background: #222 !important;
            color: white !important;
          }

          .react-calendar__tile {
            color: white !important;
          }

          .react-calendar__tile--now {
            background: orange !important;
          }
        }

      `}</style>
    </div>
  );
}
