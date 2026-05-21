export async function POST(req: Request) {
    try {
      const { data } = await req.json();
  
      const prompt = `
  あなたは自己改善をサポートするAIです。
  以下を優しく短くまとめてください：
  
  ${JSON.stringify(data)}
  `;
  
      // ✅ fetchで直接API叩く（超安定）
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
  
      console.log("OpenAIレスポンス:", json);
  
      const text = json?.choices?.[0]?.message?.content || "生成失敗";
  
      return new Response(JSON.stringify({
        result: text
      }), { status: 200 });
  
    } catch (err) {
      console.error("APIエラー:", err);
  
      return new Response(JSON.stringify({
        result: "AI生成エラー"
      }), { status: 500 });
    }
  }
  