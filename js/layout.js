/* 共享布局组件 */
const NAV = [
  { href: "/", label: "首页" },
  { href: "/news.html", label: "每日新闻" },
  { href: "/tutorials.html", label: "教程" },
  { href: "/tools.html", label: "工具箱" },
];

function isCurrent(href) {
  const path = location.pathname.replace(/\\/g, "/");
  if (href === "/") return path === "/" || path.endsWith("/index.html");
  return path.endsWith(href);
}

export function renderHeader() {
  const links = NAV.map((item) => {
    const current = isCurrent(item.href) ? ' aria-current="page"' : "";
    return `<li><a href="${item.href}"${current}>${item.label}</a></li>`;
  }).join("");
  return `
    <header class="site-header">
      <div class="container">
        <a href="/" class="site-logo">DevUtils <em>小报</em></a>
        <nav>
          <ul class="nav-links" id="navLinks">
            ${links}
          </ul>
        </nav>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="菜单">菜单</button>
      </div>
    </header>
  `;
}

export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container">
        <p>© ${new Date().getFullYear()} DevUtils 小报</p>
        <div class="footer-links">
          <a href="/news.html">每日新闻</a>
          <a href="/tutorials.html">教程</a>
          <a href="/tools.html">工具箱</a>
          <a href="/about.html">关于</a>
          <a href="/privacy.html">隐私</a>
          <a href="https://github.com/zhangshuw" target="_blank">GitHub</a>
        </div>
      </div>
    </footer>
  `;
}

export function renderBreadcrumb(current) {
  return `
    <nav class="breadcrumb" aria-label="面包屑">
      <a href="/">首页</a>
      <span class="breadcrumb-sep">/</span>
      <span>${current}</span>
    </nav>
  `;
}

export function showToast(msg, isError = false) {
  const el = document.createElement("div");
  el.className = `toast ${isError ? "toast-error" : ""}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 2000);
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("已复制到剪贴板");
  }).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("已复制到剪贴板");
  });
}

export function initLayout() {
  // Header/Footer
  const headerEl = document.getElementById("siteHeader");
  if (headerEl) headerEl.innerHTML = renderHeader();
  const footerEl = document.getElementById("siteFooter");
  if (footerEl) footerEl.innerHTML = renderFooter();

  // Mobile menu
  const btn = document.getElementById("mobileMenuBtn");
  const nav = document.getElementById("navLinks");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }
}