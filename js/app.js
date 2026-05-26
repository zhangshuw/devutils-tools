/* 首页逻辑 v2 */
import { renderHeader, renderFooter } from "./layout.js";

const TOOLS = [
  { id: "json-to-typescript", name: "json → ts", desc: "粘贴 JSON 自动推导 TypeScript interface", cat: "encoding", badge: "新" },
  { id: "curl-converter", name: "curl → code", desc: "DevTools 的 curl 一键转 fetch/axios/Python/Go", cat: "encoding", badge: "新" },
  { id: "jwt-editor", name: "jwt edit", desc: "解码 + 本地验签 + 重签，比单纯解码强一档", cat: "security", badge: "新" },
  { id: "jsonpath-query", name: "jsonpath", desc: "用 JSONPath 从大 JSON 里精确提取数据", cat: "encoding", badge: "新" },
  { id: "json-formatter", name: "json fmt", desc: "格式化、压缩、校验 JSON", cat: "encoding" },
  { id: "jwt-decoder", name: "jwt decode", desc: "解析 JWT Token 的 Header 和 Payload", cat: "security" },
  { id: "password-generator", name: "passwd", desc: "生成高强度随机密码", cat: "security" },
  { id: "base64", name: "base64", desc: "文本与 Base64 互转", cat: "encoding" },
  { id: "url-encode", name: "url-enc", desc: "URL 编码与解码", cat: "encoding" },
  { id: "color-converter", name: "color", desc: "HEX / RGB / HSL 互转", cat: "generate" },
  { id: "regex-tester", name: "regex", desc: "实时测试正则表达式", cat: "encoding" },
  { id: "hash-generator", name: "hash", desc: "MD5 / SHA-1 / SHA-256", cat: "security" },
  { id: "uuid-generator", name: "uuid", desc: "批量生成 UUID v4", cat: "generate" },
  { id: "timestamp-converter", name: "ts conv", desc: "时间戳与日期互转", cat: "generate" },
  { id: "css-gradient", name: "gradient", desc: "可视化 CSS 渐变", cat: "generate" },
  { id: "box-shadow", name: "shadow", desc: "可视化 CSS box-shadow", cat: "generate" },
  { id: "qrcode-generator", name: "qrcode", desc: "生成可下载的二维码", cat: "generate" },
  { id: "sql-formatter", name: "sql fmt", desc: "美化/压缩/验证 SQL，支持多种方言", cat: "encoding" },
  { id: "image-compressor", name: "img zip", desc: "本地压缩 PNG/JPG/WebP", cat: "generate" },
  { id: "text-diff", name: "diff", desc: "逐行比较文本增删改", cat: "encoding" },
  { id: "code-minifier", name: "minify", desc: "CSS/JS/HTML 压缩与美化", cat: "encoding" },
  { id: "lorem-ipsum", name: "lorem", desc: "生成占位文本", cat: "generate" },
  { id: "case-converter", name: "camel↔snake", desc: "大小写/命名风格互转", cat: "encoding" },
  { id: "cron-generator", name: "cron", desc: "可视化编辑 Cron 表达式", cat: "generate" },
  { id: "html-entity", name: "html-ent", desc: "HTML 实体编解码", cat: "encoding" },
  { id: "markdown-preview", name: "md view", desc: "实时渲染 Markdown", cat: "encoding" },
  { id: "number-base", name: "radix", desc: "二/八/十/十六进制互转", cat: "encoding" },
  { id: "word-counter", name: "wc", desc: "字符/词数/句数/阅读时间", cat: "encoding" },
];

const CATS = [
  { key: "encoding", label: "编码转换" },
  { key: "generate", label: "生成器" },
  { key: "security", label: "安全" },
];

function renderSpotlight() {
  const grid = document.getElementById("spotlightGrid");
  if (!grid) return;
  const featured = TOOLS.filter(t => t.badge);
  grid.innerHTML = featured.map((t, i) => `
    <a href="tools/${t.id}.html" class="spotlight-card" style="animation-delay:${i * 60}ms">
      <div class="spotlight-glyph">$</div>
      <div class="spotlight-body">
        <div class="name"><span class="new-chip">${t.badge}</span>${t.name}</div>
        <div class="desc">${t.desc}</div>
      </div>
    </a>
  `).join("");
}

function renderSections(filter = "") {
  const container = document.getElementById("toolSections");
  if (!container) return;
  const kw = filter.toLowerCase();

  let html = "";
  let delay = 0;

  for (const cat of CATS) {
    let tools = TOOLS.filter(t => t.cat === cat.key);
    if (filter && !filter.startsWith("cat:")) {
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(kw) || t.desc.toLowerCase().includes(kw)
      );
    } else if (filter === `cat:${cat.key}`) {
      // show all in this cat
    } else if (filter.startsWith("cat:")) {
      continue; // different category
    }

    if (tools.length === 0) continue;

    html += `<section class="tool-section">
      <div class="section-head">
        <span class="section-name">${cat.label}</span>
        <span class="section-count">${tools.length}</span>
      </div>
      <div class="tool-grid">`;

    for (const t of tools) {
      html += `<a href="tools/${t.id}.html" class="tool-link" style="animation-delay:${delay}ms">
        ${t.badge ? `<span class="t-badge">${t.badge}</span>` : ""}
        <span class="t-name">${t.name}</span>
        <span class="t-desc">${t.desc}</span>
      </a>`;
      delay += 15;
    }

    html += `</div></section>`;
  }

  container.innerHTML = html;

  // Show/hide spotlight based on filter
  const spotlight = document.getElementById("spotlightSection");
  if (spotlight) {
    spotlight.style.display = filter ? "none" : "";
  }

  // Filter message
  const msg = document.getElementById("filterMsg");
  if (msg) {
    if (filter.startsWith("cat:")) {
      const catKey = filter.slice(4);
      const catObj = CATS.find(c => c.key === catKey);
      if (catObj) {
        const count = TOOLS.filter(t => t.cat === catKey).length;
        msg.innerHTML = `筛选 <strong>${catObj.label}</strong>（${count} 个） — <a href="/" style="color:var(--color-accent);text-decoration:none">查看全部</a>`;
        msg.style.display = "";
      }
    } else {
      msg.style.display = "none";
    }
  }

  return html ? 1 : 0;
}

function init() {
  // Layout
  document.getElementById("siteHeader").innerHTML = renderHeader();
  document.getElementById("siteFooter").innerHTML = renderFooter();

  // Render
  renderSpotlight();
  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    const catMap = { encoding: "encoding", generate: "generate", security: "security" };
    if (catMap[hash]) {
      renderSections("cat:" + catMap[hash]);
    } else {
      renderSections();
    }
  } else {
    renderSections();
  }

  // Hash change
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    const catMap = { encoding: "encoding", generate: "generate", security: "security" };
    if (catMap[hash]) {
      renderSections("cat:" + catMap[hash]);
    } else if (!hash) {
      renderSections();
    }
  });

  // Search
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let timer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      const val = e.target.value.trim();
      timer = setTimeout(() => {
        if (!val) {
          renderSections();
        } else {
          renderSections(val);
        }
      }, 150);
    });
  }

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // Mobile menu
  const btn = document.getElementById("mobileMenuBtn");
  const nav = document.getElementById("navLinks");
  if (btn && nav) btn.addEventListener("click", () => nav.classList.toggle("open"));
}

document.addEventListener("DOMContentLoaded", init);