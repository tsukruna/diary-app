'use client'
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "@/lib/supabase";

/* ✅ UI箱 */
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

  // ✅ データ取得
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("diary")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("取得エラー", error);
    }

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

  // ✅ AI
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

  // ✅ 保存（エラー表示付き）
  const saveData = async () => {

    console.log("送信データ", form);

    // ✅ 保存
    const { data, error } = await supabase
      .from("diary")
      .insert([
        {
          date: form.date,
          emotion: form.emotion,
          event: form.event,
          action: form.action,
          honest: form.honest,
          relied: form.relied,
          reason: form.reason,
          shortcomment: "生成中..." // ⚠ DBに合わせる
        }
      ])
      .select();

    if (error) {
      console.error("保存エラー", error);
      alert("保存失敗：" + error.message);
      return;
    }

    fetchData();

    // ✅ AI生成
    const summary = await generateAI(form);

    // ✅ 更新
    if (data?.[0]) {
      await supabase
        .from("diary")
        .update({ shortcomment: summary }) // ⚠ DBに合わせる
        .eq("id", data[0].id);
    }

    fetchData();

    // ✅ リセット
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

  // ✅ グラフ
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
        <div className="fill" style={{ width: `${rate}%` }} />
      </div>

      {/* ✅ 一覧 */}
      <h2>記録一覧</h2>

      {entries.length === 0 && <p>まだデータがありません</p>}

      {entries.map(entry => (
        <div key={entry.id} className="card">
          <strong>{entry.date}</strong>
          <p><b>{entry.shortcomment}</b></p>
          <p>{entry.emotion}</p>
          <p>{entry.event}</p>
        </div>
      ))}

      {/* ✅ CSS */}
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
          padding: 10px;
          margin-top: 10px;
          border-radius: 8px;
        }

      `}</style>
    </div>
  );
}
