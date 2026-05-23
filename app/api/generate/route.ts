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
  
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });
  
      const json = await res.json();
  
      console.log("=== OpenAI 生データ ===");
      console.log(JSON.stringify(json, null, 2));
  
      let text = "生成失敗";
  
      // ✅ パターン①（通常）
      if (json?.choices?.[0]?.message?.content) {
        text = json.choices[0].message.content;
      }
  
      // ✅ パターン②（新形式）
      else if (json?.output?.[0]?.content?.[0]?.text) {
        text = json.output[0].content[0].text;
      }
  
      return Response.json({
        result: text
      });
  
    } catch (err) {
      console.error("AIエラー:", err);
  
      return Response.json({
        result: "AIエラー"
      });
    }
  }
  ``