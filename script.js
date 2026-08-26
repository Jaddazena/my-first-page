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

const newsApiUrl = "/.netlify/functions/news";
let isNewsLoading = false;

function formatNewsDate(dateText) {
  if (!dateText) {
    return "日時不明";
  }

  const date = dateText.length >= 14 && /^\d{14}$/.test(dateText)
    ? new Date(`${dateText.slice(0, 4)}-${dateText.slice(4, 6)}-${dateText.slice(6, 8)}T${dateText.slice(8, 10)}:${dateText.slice(10, 12)}:${dateText.slice(12, 14)}Z`)
    : new Date(dateText);
  return Number.isNaN(date.getTime()) ? "日時不明" : date.toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function summarizeWithClaude(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const prompt = `次の記事を日本語で、事実関係を変えずに要約してください。\n\nタイトル: ${button.dataset.title}\nURL: ${button.dataset.url}`;
  const openClaude = () => window.open("https://claude.ai/new", "_blank", "noopener,noreferrer");

  if (navigator.clipboard) {
    navigator.clipboard.writeText(prompt).then(() => {
      alert("要約依頼文をコピーしました。Claudeに貼り付けてください。");
      openClaude();
    }).catch(openClaude);
  } else {
    window.prompt("この依頼文をClaudeに貼り付けてください:", prompt);
    openClaude();
  }
}

function explainTermsWithClaude(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const prompt = `次のニュースに出てくる専門用語を、ニュースを初めて読む人にもわかるように説明してください。難しい言葉を避け、各用語を「用語：やさしい説明」の形式で整理してください。\n\n記事タイトル: ${button.dataset.title}\n記事URL: ${button.dataset.url}`;
  const openClaude = () => window.open("https://claude.ai/new", "_blank", "noopener,noreferrer");

  if (navigator.clipboard) {
    navigator.clipboard.writeText(prompt).then(() => {
      alert("専門用語の説明依頼をコピーしました。Claudeに貼り付けてください。");
      openClaude();
    }).catch(openClaude);
  } else {
    window.prompt("この依頼文をClaudeに貼り付けてください:", prompt);
    openClaude();
  }
}

async function loadWorldNews() {
  const status = document.querySelector("#news-status");
  const newsList = document.querySelector("#news-list");

  if (!status || !newsList) {
    return;
  }

  if (isNewsLoading) {
    return;
  }

  isNewsLoading = true;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  status.textContent = "ニュースを読み込んでいます...";

  try {
    const response = await fetch(newsApiUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("ニュースの取得に失敗しました");
    }

    const data = await response.json();
    const articles = (data.articles || []).slice(0, 12);

    if (!articles.length) {
      throw new Error("表示できるニュースがありません");
    }

    newsList.innerHTML = articles.map((article) => `
      <article class="news-card">
        <p class="news-meta">${article.domain || "海外メディア"} ・ ${formatNewsDate(article.seendate)}</p>
        <h2>${escapeHtml(article.title)}</h2>
        <div class="news-actions">
          <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">記事を読む</a>
          <button class="claude-button" type="button" data-title="${escapeHtml(article.title)}" data-url="${escapeHtml(article.url)}">Claudeで要約</button>
          <button class="terms-button" type="button" data-title="${escapeHtml(article.title)}" data-url="${escapeHtml(article.url)}">専門用語をやさしく説明</button>
        </div>
      </article>
    `).join("");
    status.textContent = `最終更新: ${new Date().toLocaleString("ja-JP")}（30分ごとに自動更新）`;
  } catch (error) {
    const message = error.name === "AbortError"
      ? "ニュース配信元から10秒以内に応答がありませんでした。再読み込みしてください。"
      : "ニュースを取得できませんでした。時間をおいて再読み込みしてください。";
    status.textContent = message;
    if (!newsList.children.length) {
      newsList.innerHTML = `<p class="news-error">${message}</p>`;
    }
  } finally {
    clearTimeout(timeoutId);
    isNewsLoading = false;
  }
}

document.addEventListener("click", (event) => {
  const claudeButton = event.target.closest(".claude-button");
  const termsButton = event.target.closest(".terms-button");

  if (claudeButton) {
    summarizeWithClaude({ currentTarget: claudeButton, preventDefault: () => {} });
  } else if (termsButton) {
    explainTermsWithClaude({ currentTarget: termsButton, preventDefault: () => {} });
  }
});

if (document.querySelector("#news-list")) {
  loadWorldNews();
  setInterval(loadWorldNews, 30 * 60 * 1000);
}