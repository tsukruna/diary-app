'use client'
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "@/lib/supabase";

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

  // ✅ 入力処理
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      await supabase
        .from("diary")
        .update(newEntry)
        .eq("id", form.id);
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

  // ✅ カレンダークリック（ここが今回の核心）
  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    const d =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');

    // ✅ その日の日記を探す
    const found = entries.find(e => e.date === d);

    if (found) {
      // ✅ 過去データ表示
      setForm(found);
      setEditIndex(entries.indexOf(found));
    } else {
      // ✅ 新規入力状態
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
    <div style={{ padding: "15px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>自己改善日記</h1>

      {/* ✅ カレンダー */}
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
      />

      {/* ✅ 入力 */}
      <label>今日の気分</label>
      <textarea name="emotion" value={form.emotion} onChange={handleChange} />

      <label>出来事</label>
      <textarea name="event" value={form.event} onChange={handleChange} />

      <label>行動</label>
      <textarea name="action" value={form.action} onChange={handleChange} />

      <label>本音</label>
      <textarea name="honest" value={form.honest} onChange={handleChange} />

      <label>頼れた？</label>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setForm({ ...form, relied: "yes" })}
          style={{ background: form.relied === "yes" ? "#00c853" : "#888", color: "white" }}
        >
          はい
        </button>

        <button
          onClick={() => setForm({ ...form, relied: "no" })}
          style={{ background: form.relied === "no" ? "#d50000" : "#888", color: "white" }}
        >
          いいえ
        </button>
      </div>

      <label>理由</label>
      <textarea name="reason" value={form.reason} onChange={handleChange} />

      <label>AI一言</label>
      <textarea name="shortComment" value={form.shortComment} onChange={handleChange} />

      <button onClick={saveData}>
        {loading ? "生成中..." : "保存"}
      </button>

      <hr />

      {/* ✅ 一覧 */}
      <h2>記録一覧</h2>

      {entries.map((entry) => (
        <div key={entry.id} style={{
          border: "1px solid gray",
          marginBottom: "10px",
          padding: "10px",
          borderRadius: "8px"
        }}>
          <strong>{entry.date}</strong>

          <p><b>🧠 {entry.shortComment}</b></p>
          <p>😊 {entry.emotion}</p>
          <p>📌 {entry.event}</p>
          <p>🏃 {entry.action}</p>
          <p>💭 {entry.honest}</p>
          <p>🤝 {entry.relied}</p>
          <p>🧩 {entry.reason}</p>

          <button onClick={() => {
            setForm(entry);
          }}>
            編集
          </button>

          <button onClick={() => deleteEntry(entry)}>
            削除
          </button>
        </div>
      ))}

    </div>
  );
}
