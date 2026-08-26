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

const simpleTermDictionary = {
  "NATO": "北大西洋条約機構。ヨーロッパや北米の国々が、みんなで守り合うための組織です。",
  "ICC": "国際刑事裁判所。戦争犯罪などを犯した個人を裁く国際的な裁判所です。",
  "外交": "国と国が話し合い、関係を調整することです。",
  "制裁": "相手の国に経済的な制限をかけ、行動を変えさせようとすることです。",
  "停戦": "戦争や戦闘をいったん止めることです。",
  "関税": "外国から商品を輸入するときにかかる税金です。",
  "非核三原則": "核兵器を持たない、作らない、持ち込ませないという日本の方針です。",
  "集団的自衛権": "仲のよい国が攻撃されたとき、自分の国が攻撃されていなくても一緒に守る権利です。",
  "難民": "戦争や迫害から逃れるため、自分の国を離れた人です。",
  "亡命": "政治的な理由などで、自分の国から別の国へ逃げて暮らすことです。",
  "ミサイル": "遠くの目標へ飛ばして攻撃する兵器です。",
  "軍事演習": "実際の戦闘に備えて、軍隊が行う訓練です。",
  "有事": "戦争や大きな武力衝突など、国の安全が脅かされる緊急事態です。",
  "首脳会談": "国のトップ同士が直接会って話し合うことです。"
};

function explainTermsWithoutAi(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const normalizedTitle = button.dataset.title.normalize("NFKC");
  const terms = Object.entries(simpleTermDictionary).filter(([term]) => normalizedTitle.includes(term));
  const message = terms.length
    ? terms.map(([term, explanation]) => `${term}\n${explanation}`).join("\n\n")
    : "この見出しには、登録済みの基本用語はありません。";
  alert(message);
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
        ${article.description ? `<p class="news-excerpt">${escapeHtml(article.description)}</p>` : ""}
        <div class="news-actions">
          <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">続きを読む</a>
          <button class="claude-button" type="button" data-title="${escapeHtml(article.title)}" data-url="${escapeHtml(article.url)}">Claudeで要約</button>
          <button class="terms-button" type="button" data-title="${escapeHtml(article.title)}">用語をやさしく説明</button>
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
    explainTermsWithoutAi({ currentTarget: termsButton, preventDefault: () => {} });
  }
});

if (document.querySelector("#news-list")) {
  loadWorldNews();
  setInterval(loadWorldNews, 30 * 60 * 1000);
}