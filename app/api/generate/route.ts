import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    // ✅ データ受け取り
    const { data } = await req.json();

    console.log("受信データ:", data);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ✅ シンプルにする（まず動かす）
    const prompt = `以下を優しく一言でまとめてください：
${JSON.stringify(data)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const text = completion?.choices?.[0]?.message?.content || "生成失敗";

    console.log("AI結果:", text);

    return new Response(JSON.stringify({ result: text }), {
      status: 200,
    });

  } catch (error: any) {
    console.error("APIエラー:", error);

    return new Response(JSON.stringify({
      result: "AI生成エラー"
    }), {
      status: 500,
    });
  }
}