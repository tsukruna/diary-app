'use client'
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "@/lib/supabase";

/* UI箱 */
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
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  // ✅ 入力
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ ランダムコメント
  const generateMessage = () => {

    if (form.relied === "yes") {
      const good = [
        "ちゃんと頼れていてすごいね",
        "自分を大切にできているよ",
        "いい選択ができている",
        "それはすごい成長だよ"
      ];
      return good[Math.floor(Math.random() * good.length)];
    }

    const normal = [
      "今日も頑張れていてえらい",
      "小さくても前進してるよ",
      "その積み重ねが未来を作る",
      "無理せず続けるのが一番強い",
      "今日もお疲れさま"
    ];

    return normal[Math.floor(Math.random() * normal.length)];
  };

  // ✅ 保存
  const saveData = async () => {

    if (!form.date) {
      alert("日付を選択してください");
      return;
    }

    setLoading(true);

    const summary = generateMessage();

    await supabase.from("diary").insert([{
      ...form,
      shortComment: summary
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

    setLoading(false);
  };

  // ✅ 削除
  const deleteEntry = async (id: string) => {
    await supabase.from("diary").delete().eq("id", id);
    fetchData();
  };

  // ✅ カレンダークリック
  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    const d =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');

    setForm(prev => ({ ...prev, date: d }));

    // ✅ 日付フィルター
    const filtered = entries.filter(e => e.date === d);
    setFilteredEntries(filtered);
  };

  // ✅ 表示切替
  const displayEntries =
    filteredEntries.length > 0 ? filteredEntries : entries;

  // ✅ グラフ
  const total = entries.length;
  const success = entries.filter(e => e.relied === "yes").length;
  const rate = total ? Math.round((success / total) * 100) : 0;

  return (
    <div className="container">
      <h1>自己改善日記</h1>

      {/* ✅ カレンダー（色分け） */}
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

          if (dayEntries.some(e => e.relied === "yes")) {
            return "day-yes";
          }

          if (dayEntries.some(e => e.relied === "no")) {
            return "day-no";
          }

          return "";
        }}
      />

      <button onClick={() => setFilteredEntries([])}>
        全て表示
      </button>

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

      {/* ✅ 一覧 */}
      <h2>記録一覧</h2>

      {displayEntries.map(entry => (
        <div key={entry.id} className="card">
          <strong>{entry.date}</strong>

          <p><b>🧠 {entry.shortComment}</b></p>
          <p>😊 {entry.emotion}</p>
          <p>📌 {entry.event}</p>
          <p>🏃 {entry.action}</p>

          <button onClick={() => deleteEntry(entry.id)}>
            削除
          </button>
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
          background: gray;
          color: white;
          opacity: 0.5;
        }

        .yes.active { background: green; opacity: 1; }
        .no.active { background: red; opacity: 1; }

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

        /* ✅ カレンダー色分け */
        .day-yes {
          background: #00c853 !important;
          color: white !important;
          border-radius: 50%;
        }

        .day-no {
          background: #d50000 !important;
          color: white !important;
          border-radius: 50%;
        }

      `}</style>
    </div>
  );
}
``