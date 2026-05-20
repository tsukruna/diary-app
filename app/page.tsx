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
  const [loading, setLoading] = useState(false);
  const [weekSummary, setWeekSummary] = useState("");

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

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateAI = async (data: any) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        data: {
          ...data,
          history: JSON.stringify(entries.slice(0, 10))
        }
      })
    });

    const result = await res.json();
    return result.result;
  };

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

  const saveData = async () => {
    setLoading(true);

    let summary = form.shortComment;
    if (!summary) summary = await generateAI(form);

    const newEntry = { ...form, shortComment: summary };

    await supabase.from("diary").insert([newEntry]);

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

    setLoading(false);
  };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    const d =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');

    setForm(prev => ({ ...prev, date: d }));
  };

  const isSunday = selectedDate.getDay() === 0;

  const total = entries.length;
  const success = entries.filter(e => e.relied === "yes").length;
  const rate = total ? Math.round((success / total) * 100) : 0;

  return (
    <div className="container">
      <h1>自己改善日記</h1>

      <Calendar onChange={handleDateChange} value={selectedDate} />

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
          {/* ✅ 修正ここ */}
          <button type="button" onClick={() => setForm(p => ({ ...p, relied: "yes" }))}>
            はい
          </button>

          <button type="button" onClick={() => setForm(p => ({ ...p, relied: "no" }))}>
            いいえ
          </button>
        </div>
      </FormBox>

      <FormBox label="理由">
        <textarea name="reason" value={form.reason} onChange={handleChange}/>
      </FormBox>

      <FormBox label="AI一言">
        <textarea name="shortComment" value={form.shortComment} onChange={handleChange}/>
      </FormBox>

      {/* ✅ 修正ここ */}
      <button type="button" onClick={saveData}>
        {loading ? "生成中..." : "保存"}
      </button>

      {/* ✅ 頼れ率 */}
      <h2>頼れ率</h2>
      <div className="graph">
        <p>{rate}%</p>
        <div className="bar">
          <div className="barFill" style={{ width: `${rate}%` }} />
        </div>
      </div>

      {/* ✅ 日曜まとめ */}
      {isSunday && (
        <div className="weekly">
          <h2>週間まとめAI</h2>
          <button type="button" onClick={generateWeeklySummary}>
            生成
          </button>
          {weekSummary && <p>{weekSummary}</p>}
        </div>
      )}

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

        button {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }

        .graph {
          border: 1px solid gray;
          padding: 10px;
        }

        .bar {
          background: #ddd;
          height: 10px;
        }

        .barFill {
          height: 100%;
          background: green;
        }

        @media (prefers-color-scheme: dark) {
          .bar {
            background: #444;
          }
        }

        .weekly {
          margin-top: 15px;
          padding: 10px;
          border: 2px solid gray;
        }

        /* ✅ カレンダー */
        @media (prefers-color-scheme: dark) {
          .react-calendar {
            background: #222 !important;
            color: white !important;
          }
        }
      `}</style>
    </div>
  );
}
