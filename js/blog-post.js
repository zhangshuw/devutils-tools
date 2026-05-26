// 博客文章页交互：阅读进度 / TOC scrollspy / 代码复制 / 轻量语法高亮
import { initLayout } from "/js/layout.js";

initLayout();

// ---------- 1. 阅读进度条 ----------
function initProgressBar() {
  const bar = document.createElement("div");
  bar.className = "reading-progress";
  document.body.appendChild(bar);

  const post = document.querySelector(".post");
  if (!post) return;

  let raf;
  function update() {
    const start = post.offsetTop;
    const end = start + post.offsetHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const pct = Math.max(0, Math.min(100, ((scrolled - start) / (end - start)) * 100));
    bar.style.setProperty("--progress", pct + "%");
  }
  window.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }, { passive: true });
  update();
}

// ---------- 2. TOC 自动生成 + scrollspy ----------
function initTOC() {
  const tocEl = document.querySelector("[data-toc]");
  if (!tocEl) return;

  // 只索引顶层标题，跳过嵌入卡片(.tool-row / .related-card / .callout 等)里的 h3
  const headings = Array.from(document.querySelectorAll(".post h2, .post h3"))
    .filter(h => !h.closest(".tool-row, .related-card, .callout, .cta, .author-card"));
  if (!headings.length) {
    tocEl.style.display = "none";
    return;
  }

  // 生成 slug + 注入 id
  const items = [];
  headings.forEach((h, i) => {
    if (!h.id) {
      h.id = "h-" + (h.textContent.toLowerCase()
        .replace(/[^\w一-龥]+/g, "-")
        .replace(/^-|-$/g, "") || ("section-" + i));
    }
    items.push({ id: h.id, text: h.textContent, level: h.tagName === "H3" ? 3 : 2 });
  });

  tocEl.innerHTML = `
    <div class="toc-title">本文目录</div>
    <ul>
      ${items.map(it => `<li><a href="#${it.id}" class="level-${it.level}">${it.text}</a></li>`).join("")}
    </ul>
  `;

  // ScrollSpy
  const links = tocEl.querySelectorAll("a");
  const map = new Map();
  links.forEach(a => map.set(a.getAttribute("href").slice(1), a));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const link = map.get(e.target.id);
      if (!link) return;
      if (e.isIntersecting) {
        links.forEach(a => a.classList.remove("active"));
        link.classList.add("active");
      }
    });
  }, { rootMargin: "-80px 0px -70% 0px", threshold: 0 });

  headings.forEach(h => observer.observe(h));
}

// ---------- 3. 代码块装饰 + 复制按钮 + 简易高亮 ----------
const JS_KW = /\b(const|let|var|function|return|if|else|for|while|class|new|import|export|from|async|await|try|catch|throw|typeof|instanceof)\b/g;
const JS_BOOL = /\b(true|false|null|undefined)\b/g;
const BASH_KW = /\b(cd|ls|cat|grep|curl|wget|jq|echo|sudo|apt|brew|npm|pnpm|yarn|git|docker|kubectl)\b/g;

function escapeHTML(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(code, lang) {
  let html = escapeHTML(code);
  if (lang === "json") {
    html = html.replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span class="tk-key">$1</span>:')
               .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="tk-str">$1</span>')
               .replace(/\b(true|false)\b/g, '<span class="tk-bool">$1</span>')
               .replace(/\bnull\b/g, '<span class="tk-null">null</span>')
               .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="tk-num">$1</span>');
  } else if (lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript") {
    // 注释先处理避免污染
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="tk-com">$1</span>')
               .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, '<span class="tk-str">$1</span>')
               .replace(JS_KW, '<span class="tk-kw">$1</span>')
               .replace(JS_BOOL, '<span class="tk-bool">$1</span>')
               .replace(/\b(\d+\.?\d*)\b/g, '<span class="tk-num">$1</span>');
  } else if (lang === "bash" || lang === "sh" || lang === "shell") {
    html = html.replace(/(#[^\n]*)/g, '<span class="tk-com">$1</span>')
               .replace(/("(?:\\.|[^"\\])*"|'[^']*')/g, '<span class="tk-str">$1</span>')
               .replace(BASH_KW, '<span class="tk-fn">$1</span>')
               .replace(/(--?[\w-]+)/g, '<span class="tk-key">$1</span>');
  }
  return html;
}

function initCodeBlocks() {
  document.querySelectorAll(".post pre").forEach(pre => {
    let code = pre.querySelector("code");
    if (!code) {
      // 把裸 <pre> 内容包到 <code> 里
      const txt = pre.textContent;
      pre.textContent = "";
      code = document.createElement("code");
      code.textContent = txt;
      pre.appendChild(code);
    }

    // 提取语言
    const lang = (code.className.match(/language-(\w+)/) || pre.dataset.lang ? [, pre.dataset.lang] : [, ""])[1] || "";

    // 高亮
    const raw = code.textContent;
    if (lang) code.innerHTML = highlight(raw, lang);

    // 注入窗口头
    const header = document.createElement("div");
    header.className = "code-window-header";
    header.innerHTML = `
      <span class="dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></span>
      <span class="lang">${lang || "text"}</span>
      <button class="copy-code" type="button">复制</button>
    `;
    pre.insertBefore(header, code);

    header.querySelector(".copy-code").addEventListener("click", e => {
      const btn = e.currentTarget;
      navigator.clipboard.writeText(raw).then(() => {
        btn.textContent = "已复制";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "复制"; btn.classList.remove("copied"); }, 1500);
      });
    });
  });
}

// ---------- 4. 分享 ----------
function initShare() {
  document.querySelectorAll("[data-share]").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.share;
      const url = window.location.href;
      const title = document.title;
      if (type === "copy") {
        navigator.clipboard.writeText(url).then(() => {
          const t = btn.textContent;
          btn.textContent = "已复制链接 ✓";
          setTimeout(() => btn.textContent = t, 1500);
        });
      } else if (type === "twitter") {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank");
      } else if (type === "weibo") {
        window.open(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, "_blank");
      }
    });
  });
}

initProgressBar();
initTOC();
initCodeBlocks();
initShare();
