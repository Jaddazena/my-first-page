const feedUrl = "https://news.google.com/rss/search?q=%28%E6%94%BF%E6%B2%BB+OR+%E5%A4%96%E4%BA%A4+OR+%E8%BB%8D%E4%BA%8B%29+%28site%3Anh k.or.jp+OR+site%3Areuters.com+OR+site%3Abbc.com+OR+site%3Anikkei.com+OR+site%3Aasahi.com+OR+site%3Ayomiuri.co.jp+OR+site%3Amainichi.jp+OR+site%3Akyodonews.jp%29&hl=ja&gl=JP&ceid=JP%3Aja".replace("nh k", "nhk");

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1].trim()) : "";
}

exports.handler = async () => {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: "ニュース配信元に接続できません" }) };
    }

    const xml = await response.text();
    const articles = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
      const item = match[1];
      return {
        domain: getTag(item, "source") || "主要メディア",
        seendate: getTag(item, "pubDate"),
        title: getTag(item, "title"),
        url: getTag(item, "link")
      };
    });

    return {
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=1800" },
      statusCode: 200,
      body: JSON.stringify({ articles })
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: "ニュースの取得に失敗しました" }) };
  }
};