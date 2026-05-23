export async function POST(req: Request) {
    try {
      const { data } = await req.json();
  
      const prompt = `
  今日の出来事を一言でまとめてください：
  
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
  
      console.log("=== OpenAIレスポンス ===");
      console.log(JSON.stringify(json, null, 2));
  
      // ✅ 安全に取り出す（これが重要）
      let text = "生成失敗";
  
      if (
        json &&
        typeof json === "object" &&
        Array.isArray(json.choices) &&
        json.choices.length > 0 &&
        json.choices[0].message &&
        typeof json.choices[0].message.content === "string"
      ) {
        text = json.choices[0].message.content;
      }
  
      return Response.json({ result: text });
  
    } catch (err) {
      console.error("=== APIエラー ===", err);
  
      return Response.json({
        result: "AIエラー"
      });
    }
  }