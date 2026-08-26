exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 503, body: JSON.stringify({ error: "OPENAI_API_KEY is not configured" }) };
  }

  try {
    const { headline, language } = JSON.parse(event.body || "{}");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      body: JSON.stringify({
        messages: [
          {
            content: "あなたは国際ニュースの編集者です。入力された見出しを、事実関係を変えず、日本の読者に自然で分かりやすいニュース見出しへ翻訳してください。煽りや意訳を加えず、固有名詞は一般的な日本語表記にします。見出しだけを返してください。",
            role: "system"
          },
          { content: `原文言語: ${language || "不明"}\n見出し: ${headline}`, role: "user" }
        ],
        model: "gpt-4o-mini",
        temperature: 0.2
      }),
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const result = await response.json();
    const translation = result.choices?.[0]?.message?.content?.trim();

    return translation
      ? { statusCode: 200, body: JSON.stringify({ translation }) }
      : { statusCode: 502, body: JSON.stringify({ error: "Translation unavailable" }) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: "Translation failed" }) };
  }
};