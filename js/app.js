/* 首页逻辑 */
import { renderHeader, renderFooter } from "./layout.js";

const TOOLS = [
  { id: "json-formatter", name: "JSON 格式化", desc: "格式化、压缩、校验 JSON 数据", icon: "{}", cat: "encoding" },
  { id: "base64", name: "Base64 编解码", desc: "文本与 Base64 互转，支持文件", icon: "🔤", cat: "encoding" },
  { id: "url-encode", name: "URL 编解码", desc: "URL 编码与解码转换", icon: "🔗", cat: "encoding" },
  { id: "color-converter", name: "颜色转换器", desc: "HEX/RGB/HSL 颜色格式互转", icon: "🎨", cat: "generate" },
  { id: "regex-tester", name: "正则测试器", desc: "实时测试正则表达式匹配", icon: "🔍", cat: "encoding" },
  { id: "hash-generator", name: "哈希生成器", desc: "MD5/SHA-1/SHA-256 哈希计算", icon: "#️⃣", cat: "security" },
  { id: "uuid-generator", name: "UUID 生成器", desc: "批量生成 UUID v4", icon: "🔑", cat: "generate" },
  { id: "timestamp-converter", name: "时间戳转换", desc: "时间戳与日期时间互转", icon: "🕐", cat: "generate" },
  { id: "css-gradient", name: "CSS 渐变生成器", desc: "可视化编辑 CSS 渐变效果", icon: "🌈", cat: "generate" },
  { id: "qrcode-generator", name: "二维码生成器", desc: "生成可下载的二维码", icon: "📷", cat: "generate" },
  { id: "text-diff", name: "文本差异对比", desc: "逐行比较文本增删改", icon: "📊", cat: "encoding" },
  { id: "markdown-preview", name: "Markdown 预览", desc: "实时渲染Markdown为HTML", icon: "📝", cat: "encoding" },
];

function renderCards(filter = "") {
  const grid = document.getElementById("toolGrid");
  if (!grid) return;
  const kw = filter.toLowerCase();
  const filtered = TOOLS.filter(t =>
    t.name.toLowerCase().includes(kw) || t.desc.toLowerCase().includes(kw)
  );
  grid.innerHTML = filtered.map(t => `
    <a href="tools/${t.id}.html" class="card card-hover" data-cat="${t.cat}">
      <div class="card-icon">${t.icon}</div>
      <div class="card-title">${t.name}</div>
      <div class="card-desc">${t.desc}</div>
    </a>
  `).join("");
}

function init() {
  // 布局
  document.getElementById("siteHeader").innerHTML = renderHeader();
  document.getElementById("siteFooter").innerHTML = renderFooter();

  // 渲染卡片
  renderCards();

  // 搜索
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let timer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => renderCards(e.target.value), 150);
    });
  }

  // 快捷键 / 聚焦搜索
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // 移动端菜单
  const btn = document.getElementById("mobileMenuBtn");
  const nav = document.getElementById("navLinks");
  if (btn && nav) btn.addEventListener("click", () => nav.classList.toggle("open"));
}

document.addEventListener("DOMContentLoaded", init);