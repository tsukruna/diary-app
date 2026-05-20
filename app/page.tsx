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
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const deleteEntry = async (entry: any) => {
    await supabase.from("diary").delete().eq("id", entry.id);
    fetchData();
  };

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

  // ✅ ボックスUI
  const FormBox = ({ label, children }: any) => (
    <div className="box">
      <label>{label}</label>
      {children}
    </div>
  );

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
            onClick={() => setForm({ ...form, relied: "yes" })}
            className={form.relied === "yes" ? "btn active yes" : "btn"}
          >
            はい
          </button>
          <button
            onClick={() => setForm({ ...form, relied: "no" })}
            className={form.relied === "no" ? "btn active no" : "btn"}
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
          <p>{entry.emotion}</p>
          <p>{entry.event}</p>

          <button onClick={() => setForm(entry)}>編集</button>
          <button onClick={() => deleteEntry(entry)}>削除</button>
        </div>
      ))}

      {/* ✅ ダーク/ライト対応CSS */}
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
          border: 1px solid #aaa;
        }

        textarea {
          width: 100%;
          min-height: 60px;
          border-radius: 5px;
          padding: 5px;
        }

        .btn {
          padding: 6px 12px;
          background: gray;
          color: white;
          border-radius: 6px;
        }

        .yes {
          background: green;
        }

        .no {
          background: red;
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
          margin-top: 10px;
          border-radius: 8px;
        }

        .main {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
