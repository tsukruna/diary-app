'use client'
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "@/lib/supabase";

/* ✅ 重要：外に出す！！（これが1文字バグ修正の核心） */
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
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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

  // ✅ ✅ 修正済（安定版）
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ AI生成
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

  // ✅ 保存
  const saveData = async () => {
    setLoading(true);

    let summary = form.shortComment;
    if (!summary) summary = await generateAI(form);

    const newEntry = { ...form, shortComment: summary };

    if (editIndex !== null) {
      await supabase.from("diary").update(newEntry).eq("id", form.id);
      setEditIndex(null);
    } else {
      await supabase.from("diary").insert([newEntry]);
    }

    await fetchData();

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

  // ✅ 削除
  const deleteEntry = async (entry: any) => {
    await supabase.from("diary").delete().eq("id", entry.id);
    fetchData();
  };

  // ✅ カレンダー連動
  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    const d =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');

    const found = entries.find(e => e.date === d);

    if (found) {
      setForm(found);
      setEditIndex(entries.indexOf(found));
    } else {
      setForm({
        id: "",
        date: d,
        emotion: "",
        event: "",
        action: "",
        honest: "",
        relied: "",
        reason: "",
        shortComment: ""
      });
      setEditIndex(null);
    }
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
            onClick={() => setForm(prev => ({ ...prev, relied: "yes" }))}
            className={form.relied === "yes" ? "btn yes active" : "btn"}
          >
            はい
          </button>

          <button
            onClick={() => setForm(prev => ({ ...prev, relied: "no" }))}
            className={form.relied === "no" ? "btn no active" : "btn"}
          >
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

      <button className="save" onClick={saveData}>
        {loading ? "生成中..." : "保存"}
      </button>

      <hr />

      <h2>記録一覧</h2>

      {entries.map((entry) => (
        <div key={entry.id} className="card">
          <strong>{entry.date}</strong>

          <p className="main">{entry.shortComment}</p>
          <p>😊 {entry.emotion}</p>
          <p>📌 {entry.event}</p>
          <p>🏃 {entry.action}</p>

          <button onClick={() => setForm(entry)}>編集</button>
          <button onClick={() => deleteEntry(entry)}>削除</button>
        </div>
      ))}

      {/* ✅ ダーク/ライト対応 */}
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

        .box {
          margin-top: 12px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #888;
        }

        textarea {
          width: 100%;
          min-height: 60px;
          padding: 5px;
          border-radius: 5px;
          border: 1px solid #aaa;
        }

        .btn {
          padding: 6px 12px;
          border-radius: 6px;
          color: white;
          background: gray;
        }

        .yes {
          background: #00c853;
        }

        .no {
          background: #d50000;
        }

        .active {
          border: 2px solid black;
        }

        .save {
          margin-top: 10px;
          width: 100%;
          padding: 10px;
          font-size: 16px;
        }

        .card {
          border: 1px solid gray;
          padding: 10px;
          border-radius: 8px;
          margin-top: 10px;
        }

        .main {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}