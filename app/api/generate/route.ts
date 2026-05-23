export async function POST(req: Request) {
    try {
      const { data } = await req.json();
  
      const prompt = `
  以下を優しく短くまとめてください：
  
  ${JSON.stringify(data)}
  `;
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
  
      const json = await response.json();
  
      // ✅ デバッグ表示（重要）
      console.log("OpenAI full:", JSON.stringify(json));
  
      // ✅ 安全取得
      let text = "生成失敗";
  
      if (json.choices && json.choices.length > 0) {
        text = json.choices[0].message?.content || "生成失敗";
      }
  
      return new Response(JSON.stringify({
        result: text
      }), { status: 200 });
  
    } catch (err) {
      console.error("APIエラー:", err);
  
      return new Response(JSON.stringify({
        result: "AI生成エラー"
      }), { status: 200 }); // ←ここ重要（UI止めない）
    }
  }