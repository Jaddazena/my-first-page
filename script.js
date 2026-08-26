let clickCount = 0;

function sayHello() {
  clickCount += 1;

  if (clickCount === 5) {
    window.location.href = "jackpot.html";
    return;
  }

  const greetings = [
    "こんにちは！今日もいい一日になりそうですね。",
    "やあ！ページを見に来てくれてありがとう！",
    "おはようございます！元気にいきましょう！",
    "こんばんは！ゆっくり過ごしてくださいね。",
    "ようこそ！また会えてうれしいです！"
  ];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  alert(randomGreeting);
}

function shareToLine(event) {
  event.preventDefault();
  const pageUrl = window.location.href;

  if (window.location.protocol === "file:") {
    alert("このページは現在パソコン内で開いているため、LINEでは共有できません。Web上に公開してからお試しください。");
    return;
  }

  const shareText = encodeURIComponent(`はじめてのページ\n${pageUrl}`);
  window.open(`https://line.me/R/msg/text/?${shareText}`, "_blank", "noopener,noreferrer");
}

function shareToX(event) {
  event.preventDefault();
  const pageUrl = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?url=${pageUrl}`, "_blank", "noopener,noreferrer");
}

function shareToInstagram(event) {
  event.preventDefault();
  const pageUrl = window.location.href;

  const openInstagram = () => {
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(pageUrl).then(() => {
      alert("ページのURLをコピーしました。Instagramで共有してください！");
      openInstagram();
    }).catch(() => {
      window.prompt("このURLをコピーしてInstagramで共有してください:", pageUrl);
      openInstagram();
    });
  } else {
    window.prompt("このURLをコピーしてInstagramで共有してください:", pageUrl);
    openInstagram();
  }
}

const newsApiUrl = "https://api.gdeltproject.org/api/v2/doc/doc?query=(政治%20OR%20外交%20OR%20軍事)%20sourcelang%3Ajapanese%20(domain%3Anhk.or.jp%20OR%20domain%3Areuters.com%20OR%20domain%3Abbc.com%20OR%20domain%3Anikkei.com%20OR%20domain%3Aasahi.com%20OR%20domain%3Ayomiuri.co.jp%20OR%20domain%3Amainichi.jp%20OR%20domain%3Akyodonews.jp)&mode=artlist&maxrecords=20&format=json&sort=HybridRel&timespan=1d";

function formatNewsDate(dateText) {
  if (!dateText || dateText.length < 14) {
    return "日時不明";
  }

  const date = new Date(`${dateText.slice(0, 4)}-${dateText.slice(4, 6)}-${dateText.slice(6, 8)}T${dateText.slice(8, 10)}:${dateText.slice(10, 12)}:${dateText.slice(12, 14)}Z`);
  return Number.isNaN(date.getTime()) ? "日時不明" : date.toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" });
}

async function loadWorldNews() {
  const status = document.querySelector("#news-status");
  const newsList = document.querySelector("#news-list");

  if (!status || !newsList) {
    return;
  }

  try {
    const response = await fetch(newsApiUrl);
    if (!response.ok) {
      throw new Error("ニュースの取得に失敗しました");
    }

    const data = await response.json();
    const articles = (data.articles || []).filter((article) => article.language === "Japanese").slice(0, 12);

    if (!articles.length) {
      throw new Error("表示できるニュースがありません");
    }

    newsList.innerHTML = articles.map((article) => `
      <article class="news-card">
        <p class="news-meta">${article.domain || "海外メディア"} ・ ${formatNewsDate(article.seendate)}</p>
        <h2>${article.title}</h2>
        <a href="${article.url}" target="_blank" rel="noopener noreferrer">記事を読む</a>
      </article>
    `).join("");
    status.textContent = `最終更新: ${new Date().toLocaleString("ja-JP")}（30分ごとに自動更新）`;
  } catch (error) {
    status.textContent = "ニュースを取得できませんでした。時間をおいて再読み込みしてください。";
    newsList.innerHTML = `<p class="news-error">${error.message}</p>`;
  }
}

if (document.querySelector("#news-list")) {
  loadWorldNews();
  setInterval(loadWorldNews, 30 * 60 * 1000);
}