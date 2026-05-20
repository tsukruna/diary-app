'use client'
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "@/lib/supabase";

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
        <button onClick={() => setForm(p => ({ ...p, relied: "yes" }))}>はい</button>
        <button onClick={() => setForm(p => ({ ...p, relied: "no" }))}>いいえ</button>
      </FormBox>

      <FormBox label="理由">
        <textarea name="reason" value={form.reason} onChange={handleChange}/>
      </FormBox>

      <FormBox label="AI一言">
        <textarea name="shortComment" value={form.shortComment} onChange={handleChange}/>
      </FormBox>

      <button onClick={saveData}>保存</button>

      {/* ✅ 頼れ率 */}
      <h2>頼れ率 {rate}%</h2>
      <div className="bar">
        <div className="fill" style={{ width: `${rate}%` }} />
      </div>

      {/* ✅ 日曜 */}
      {isSunday && (
        <div>
          <h2>週間まとめ</h2>
          <button onClick={generateWeeklySummary}>生成</button>
          <p>{weekSummary}</p>
        </div>
      )}

      {/* ✅ スタイル（ここが超重要） */}
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

        /* ===== カレンダー完全修正 ===== */

        .react-calendar {
          border-radius: 8px;
        }

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
            color: black !important;
          }

          .react-calendar__tile--active {
            background: #2196f3 !important;
            color: white !important;
          }

          .react-calendar__month-view__weekdays {
            color: #ccc !important;
          }

          .react-calendar__month-view__days__day--neighboringMonth {
            color: #777 !important;
          }
        }

        @media (prefers-color-scheme: light) {
          .react-calendar {
            background: white !important;
            color: black !important;
          }

          .react-calendar__tile {
            color: black !important;
          }

          .react-calendar__tile--now {
            background: #ffe082 !important;
          }
        }

        /* ===== グラフ ===== */

        .bar {
          background: #ddd;
          height: 10px;
          margin-bottom: 10px;
        }

        .fill {
          height: 100%;
          background: green;
        }

        @media (prefers-color-scheme: dark) {
          .bar {
            background: #444;
          }
        }

      `}</style>
    </div>
  );
}