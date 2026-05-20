import OpenAI from "openai";

export async function POST(req: Request) {
  const { data } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
あなたはユーザー専用の成長パートナーAIです。

【過去の傾向】
${data.history}

【今日の内容】
感情: ${data.emotion}
出来事: ${data.event}
行動: ${data.action}
本音: ${data.honest}
頼れたか: ${data.relied}
理由: ${data.reason}

条件：
・否定しない
・その人の傾向に少し触れる
・優しく励ます
・最後に小さな一歩を提案する
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return new Response(JSON.stringify({
    result: response.choices[0].message.content
  }));
}
