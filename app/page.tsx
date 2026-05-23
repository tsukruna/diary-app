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
  const [loading, setLoading] = useState(false);

  // ✅ データ取得
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("diary")
      .select("*")
      .order("date", { ascending: false });

    if (error) console.error(error);
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
      return json.result || "AI生成に失敗しました";
    } catch {
      return "AIエラー";
    }
  };

  // ✅ 保存（重複防止・安定版）
  const saveData = async () => {

    if (!form.date) {
      alert("日付を選択してください");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("diary")
      .insert([{
        date: form.date,
        emotion: form.emotion,
        event: form.event,
        action: form.action,
        honest: form.honest,
        relied: form.relied,
        reason: form.reason,
        shortComment: "生成中..."
      }])
      .select();

    if (error) {
      console.error(error);
      alert("保存エラー：" + error.message);
      setLoading(false);
      return;
    }

    await fetchData();

    // ✅ AI更新
    const summary = await generateAI(form);

    if (data?.[0]) {
      await supabase
        .from("diary")
        .update({ shortComment: summary })
        .eq("id", data[0].id);
    }

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

    setLoading(false);
  };

  // ✅ 削除
  const deleteEntry = async (id: string) => {
    await supabase.from("diary").delete().eq("id", id);
    fetchData();
  };

  // ✅ カレンダー
  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    const d =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');

    setForm(prev => ({ ...prev, date: d }));
  };

  // ✅ グラフ
  const total = entries.length;
  const success = entries.filter(e => e.relied === "yes").length;
  const rate = total ? Math.round((success / total) * 100) : 0;

  // ✅ 週間AI
  const isSunday = selectedDate.getDay() === 0;

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
          <button
            type="button"
            className={`btn ${form.relied === "yes" ? "yes active" : ""}`}
            onClick={() => setForm(p => ({ ...p, relied: "yes" }))}
          >
            はい
          </button>

          <button
            type="button"
            className={`btn ${form.relied === "no" ? "no active" : ""}`}
            onClick={() => setForm(p => ({ ...p, relied: "no" }))}
          >
            いいえ
          </button>
        </div>
      </FormBox>

      <FormBox label="理由">
        <textarea name="reason" value={form.reason} onChange={handleChange}/>
      </FormBox>

      <button type="button" className="save" onClick={saveData}>
        {loading ? "保存中..." : "保存"}
      </button>

      {/* ✅ グラフ */}
      <h2>頼れ率 {rate}%</h2>
      <div className="bar">
        <div className="fill" style={{ width: `${rate}%` }} />
      </div>

      {/* ✅ 週間AI */}
      {isSunday && (
        <div className="weekly">
          <h2>週間まとめAI</h2>
          <button type="button" onClick={generateWeeklySummary}>
            生成
          </button>
          {weekSummary && <p>{weekSummary}</p>}
        </div>
      )}

      {/* ✅ 一覧 */}
      <h2>記録一覧</h2>

      {entries.map(entry => (
        <div key={entry.id} className="card">
          <strong>{entry.date}</strong>

          <p><b>🧠 {entry.shortComment}</b></p>
          <p>😊 {entry.emotion}</p>
          <p>📌 {entry.event}</p>

          <button onClick={() => deleteEntry(entry.id)}>
            削除
          </button>
        </div>
      ))}

      {/* ✅ style */}
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
          color: white;
          opacity: 0.5;
        }

        .active { opacity: 1; }
        .yes.active { background: green; }
        .no.active { background: red; }

        .save {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
        }

        .bar {
          background: #ccc;
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
      `}</style>
    </div>
  );
}