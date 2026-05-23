export async function POST(req: Request) {
    try {
      const { data } = await req.json();
  
      const prompt = `
  今日の内容を一言で優しくまとめてください：
  
  気分：${data.emotion}
  出来事：${data.event}
  行動：${data.action}
  本音：${data.honest}
  `;
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });
  
      const json = await response.json();
  
      // ✅ ここ超重要（ログで確認）
      console.log("AI完全レスポンス:", JSON.stringify(json, null, 2));
  
      let text = "生成失敗";
  
      // ✅ 安全に取り出す
      if (json && json.choices && json.choices.length > 0) {
        if (json.choices[0].message && json.choices[0].message.content) {
          text = json.choices[0].message.content;
        }
      }
  
      return new Response(JSON.stringify({
        result: text
      }), { status: 200 });
  
    } catch (e) {
      console.error("AIエラー:", e);
  
      return new Response(JSON.stringify({
        result: "AIエラー"
      }), { status: 200 });
    }
  }
  