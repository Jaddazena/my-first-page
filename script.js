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
  "INPEX": "日本のエネルギー会社。石油や天然ガスの開発・生産を行っています。",
  "AI": "人間のように学習したり、考えたりするコンピューター技術です。",
  "テック": "テクノロジー、特にコンピューターやインターネットに関わる分野のことです。",
  "原油": "地下から採掘したままの、加工前の石油です。",
  "外交官": "国を代表して、外国との交渉や連絡を担当する人です。",
  "株式": "会社が資金を集めるために発行する証明書のようなものです。",
  "続落": "株価などが、前の日に続いて下がることです。",
  "インフレ": "物価が全体的に上がり、お金の価値が下がることです。",
  "GDP": "国内総生産。国内で一定期間に生み出されたモノやサービスの合計額です。",
  "中央銀行": "国のお金や金利を管理する銀行です。日本では日本銀行が担当します。",
  "NATO": "北大西洋条約機構。ヨーロッパや北米の国々が、みんなで守り合うための組織です。",
  "G7": "日本、米国、英国、フランス、ドイツ、イタリア、カナダの7か国による枠組みです。",
  "G20": "世界の主要な国と地域が、経済などを話し合う集まりです。",
  "国連": "国際問題を話し合い、平和や協力を進めるための組織です。",
  "安保理": "国連安全保障理事会。国際平和と安全を守る役割を持つ国連の機関です。",
  "ICC": "国際刑事裁判所。戦争犯罪などを犯した個人を裁く国際的な裁判所です。",
  "外交": "国と国が話し合い、関係を調整することです。",
  "安全保障": "国や人々を、戦争や攻撃などの危険から守ることです。",
  "株価": "会社の株式が市場で売買される値段です。",
  "経済制裁": "相手の国との貿易や金融を制限し、行動を変えさせようとすることです。",
  "制裁": "相手の国に経済的な制限をかけ、行動を変えさせようとすることです。",
  "停戦": "戦争や戦闘をいったん止めることです。",
  "関税": "外国から商品を輸入するときにかかる税金です。",
  "非核三原則": "核兵器を持たない、作らない、持ち込ませないという日本の方針です。",
  "集団的自衛権": "仲のよい国が攻撃されたとき、自分の国が攻撃されていなくても一緒に守る権利です。",
  "難民": "戦争や迫害から逃れるため、自分の国を離れた人です。",
  "亡命": "政治的な理由などで、自分の国から別の国へ逃げて暮らすことです。",
  "ミサイル": "遠くの目標へ飛ばして攻撃する兵器です。",
  "軍事演習": "実際の戦闘に備えて、軍隊が行う訓練です。",
  "防衛": "攻撃を受けたときに、自分の国や人々を守ることです。",
  "武力衝突": "国や集団の間で、武器を使った争いが起きることです。",
  "和平": "戦争や争いを終わらせ、平和な状態にすることです。",
  "首脳": "国や組織のトップのことです。",
  "首脳会談": "国のトップ同士が直接会って話し合うことです。",
  "有事": "戦争や大きな武力衝突など、国の安全が脅かされる緊急事態です。",
  "選挙": "政治を任せる代表者を、国民が投票で選ぶことです。",
  "政権": "国の政治を担当する政府のことです。",
  "法案": "法律にするために国会へ提出された案です。"
};

function explainTermsWithoutAi(event) {
  event.preventDefault();
  const button = event.currentTarget;
  const modal = document.querySelector("#term-modal");
  const content = document.querySelector("#term-dialog-content");
  const normalizedTitle = button.dataset.title.normalize("NFKC");
  const terms = Object.entries(simpleTermDictionary).filter(([term]) => normalizedTitle.includes(term));

  if (!modal || !content) {
    return;
  }

  content.innerHTML = terms.length
    ? terms.map(([term, explanation]) => `<article class="term-item"><h3>${escapeHtml(term)}</h3><p>${escapeHtml(explanation)}</p></article>`).join("")
    : "<p class=\"term-empty\">この見出しには、登録済みの基本用語はありません。</p>";
  modal.hidden = false;
  document.querySelector(".term-close")?.focus();
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

  if (event.target.closest("[data-close-terms]")) {
    const modal = document.querySelector("#term-modal");
    if (modal) {
      modal.hidden = true;
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const modal = document.querySelector("#term-modal");
    if (modal) {
      modal.hidden = true;
    }
  }
});

if (document.querySelector("#news-list")) {
  loadWorldNews();
  setInterval(loadWorldNews, 30 * 60 * 1000);
}