'use client'
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from "@/lib/supabase";

// フォームの箱
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
  const [loading, setLoading] = useState(false);

  // データ取得
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

  // 入力処理
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ ランダム応援メッセージ（AI代わり）
  const generateMessage = () => {

    if (form.relied === "yes") {
      const good = [
        "ちゃんと頼れていてすごいね",
        "自分を大切にできてるのが素晴らしい",
        "いい判断ができてるよ",
        "周りに頼れるのは強さだよ"
      ];
      return good[Math.floor(Math.random() * good.length)];
    }

    const messages = [
      "今日もちゃんと頑張れていてすごいよ",
      "小さくても前進してるのがえらい",
      "無理せず続けてるのが一番強い",
      "少しずつでいい、そのペースが大事",
      "今日もよくやったね",
      "ちゃんと向き合ってるだけで価値ある",
      "その積み重ねが未来を変えるよ",
      "疲れてても行動したのがすごい"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  // 保存
  const saveData = async () => {

    if (!form.date) {
      alert("日付を選択してください");
      return;
    }

    setLoading(true);

    const summary = generateMessage();

    const { error } = await supabase
      .from("diary")
      .insert([{
        ...form,
        shortComment: summary
      }]);

    if (error) {
      console.error(error);
      alert("保存失敗：" + error.message);
      setLoading(false);
      return;
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

  // 削除
  const deleteEntry = async (id: string) => {
    await supabase.from("diary").delete().eq("id", id);
    fetchData();
  };

  // 日付変更
  const handleDateChange = (date: any) => {
    setSelectedDate(date);

    const d =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, '0') + "-" +
      String(date.getDate()).padStart(2, '0');

    setForm(prev => ({ ...prev, date: d }));
  };

  // グラフ
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

      {/* グラフ */}
      <h2>頼れ率 {rate}%</h2>
      <div className="bar">
        <div className="fill" style={{ width: `${rate}%` }} />
      </div>

      {/* 一覧 */}
      <h2>記録一覧</h2>

      {entries.map(entry => (
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

      {/* スタイル */}
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
``