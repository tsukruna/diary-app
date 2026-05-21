import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
あなたは自己改善をサポートするAIです。
以下を優しくまとめてください。

${JSON.stringify(data)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    return Response.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);

    return Response.json({
      result: "AI生成エラー"
    }, { status: 500 });
  }
}
