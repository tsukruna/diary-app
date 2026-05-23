export async function POST(req: Request) {
    try {
      const { data } = await req.json();
  
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `${data.emotion} ${data.event} ${data.action}`
            }
          ]
        })
      });
  
      const json = await res.json();
  
      // ✅ ★これが超重要（全部見せる）
      return Response.json({
        result: JSON.stringify(json)
      });
  
    } catch (e) {
      return Response.json({
        result: "完全エラー：" + String(e)
      });
    }
  }
  