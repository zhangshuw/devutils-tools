/* 共享布局组件 */
export function renderHeader() {
  return `
    <header class="site-header">
      <div class="container">
        <a href="/devutils-tools/" class="site-logo">⚡ <span>Dev</span>Utils</a>
        <nav>
          <ul class="nav-links" id="navLinks">
            <li><a href="/devutils-tools/">全部工具</a></li>
            <li><a href="/devutils-tools/#encoding">编码转换</a></li>
            <li><a href="/devutils-tools/#generate">生成器</a></li>
            <li><a href="/devutils-tools/#security">安全工具</a></li>
          </ul>
        </nav>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="菜单">☰</button>
      </div>
    </header>
  `;
}

export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container">
        <p>© ${new Date().getFullYear()} DevUtils - 在线开发者工具箱</p>
        <div class="footer-links">
          <a href="#">隐私政策</a>
          <a href="#">关于我们</a>
          <a href="https://github.com" target="_blank">GitHub</a>
        </div>
      </div>
    </footer>
  `;
}

export function renderAdSlot(id, format = "horizontal") {
  const cls = format === "sidebar" ? "ad-slot-sidebar" :
              format === "inline" ? "ad-slot-inline" : "ad-slot-banner";
  return `
    <div class="ad-slot ${cls}" id="${id}" data-ad-slot="" data-ad-format="${format}">
      <span class="ad-placeholder">广告位</span>
    </div>
  `;
}

export function renderBreadcrumb(current) {
  return `
    <nav class="breadcrumb" aria-label="面包屑">
      <a href="/devutils-tools/">首页</a>
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